# Redis & Caching Plan for Scaling

## Current Architecture Overview

- **API**: Express.js (Node.js 20+), MongoDB (Mongoose)
- **Key endpoints**: Storefront (public), Orders, Products, Auth, Payments
- **Deployment target**: Render (single instance currently, will scale horizontally)

---

## Caching Opportunities (Priority Order)

| Priority | Target | Current Pattern | Cache Strategy |
|----------|--------|-----------------|----------------|
| **P0** | Storefront (`GET /store`) | Merchant + Products fetched on every request | Redis cache with TTL + invalidation on product/merchant updates |
| **P0** | Merchant lookup (`findSingleStore`) | Called in 6+ controllers | Cache merchant object (TTL 5m) |
| **P1** | Order status polling (`GET /orders/:code/status`) | High-frequency polling | Short TTL cache (10-30s) |
| **P1** | Admin product listing | Fetched on dashboard load | Cache with TTL + invalidation |
| **P2** | Rate limiting | In-memory `express-rate-limit` | Redis-backed distributed rate limiting |
| **P2** | Session/JWT verification | Stateless JWT decode | Optional: cache revoked tokens |
| **P3** | Stock reservation | DB atomic updates | Redis atomic counters for high-concurrency |

---

## Redis Data Model

### Key Structure
```
# Storefront (single merchant)
storefront:{merchantId}       -> JSON { merchant, products[], paymentOptions }  TTL: 60s
merchant:{merchantId}         -> JSON { businessName, slug, whatsappNumber }     TTL: 300s

# Order status (polled frequently)
order:{orderId}:status        -> JSON { status, paymentStatus, total, ... }      TTL: 15s

# Product catalog (admin)
products:{merchantId}         -> JSON [products]                                 TTL: 60s

# Rate limiting
ratelimit:{ip}:{endpoint}     -> counter + expiry                               TTL: windowMs

# Stock (future - high concurrency)
stock:{productId}             -> integer (atomic decr/incr)                     TTL: none (persist)

# Cache invalidation
pubsub:cache:invalidate       -> channel for cross-instance invalidation
```

### TTL Strategy
| Data Type | TTL | Invalidation Trigger |
|-----------|-----|---------------------|
| Storefront | 60s | Product create/update/delete, merchant update |
| Merchant | 300s | Merchant update |
| Order Status | 15s | Payment confirmation, admin status change |
| Products (admin) | 60s | Product CRUD |
| Rate Limits | per window | N/A (auto-expiry) |

---

## Implementation Plan

### Phase 1: Foundation (Week 1)
1. **Add Redis client** (`ioredis`) with connection pooling
2. **Create cache service** (`services/cache.js`) with:
   - `get(key)`, `set(key, value, ttl)`, `del(key)`, `delPattern(pattern*)`
   - Pub/sub for cross-instance invalidation
   - Health check endpoint
3. **Environment config**: `REDIS_URL`, `REDIS_TLS` (for Render/Upstash)

### Phase 2: Storefront Caching (Week 1-2)
1. **Wrap `findSingleStore`** with merchant cache
2. **Wrap `getStorefront`** with full storefront cache
3. **Invalidation hooks** in:
   - `productController.createProduct` / `updateProduct` / `deleteProduct`
   - `adminRegister` / merchant update (if added)

### Phase 3: Order Status Caching (Week 2)
1. **Cache `orderStatus` response** (15s TTL)
2. **Invalidate on**:
   - Payment callback (`stkCallback`, `submitUsdtReference`)
   - Admin status change (`updateStatus`, `markPaid`)

### Phase 4: Admin Product Caching (Week 2)
1. **Cache `listMyProducts`** (60s TTL)
2. **Invalidate on product CRUD**

### Phase 5: Distributed Rate Limiting (Week 3)
1. **Replace `express-rate-limit`** with Redis-backed implementation
2. **Configure per-endpoint limits** in `storeRpute.js` and `authRoute.js`

### Phase 6: Stock Reservation (Week 3 - Optional for high concurrency)
1. **Redis atomic stock** for `createOrder` reservation
2. **Fallback to DB** if Redis unavailable

---

## Cache Service API Design

```javascript
// services/cache.js
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => Math.min(times * 50, 2000),
  enableReadyCheck: true,
  lazyConnect: true,
});

const pubsub = redis.duplicate();

export const cache = {
  async get(key) { ... },
  async set(key, value, ttlSeconds) { ... },
  async del(key) { ... },
  async delPattern(pattern) { ... },
  
  // Invalidation
  async invalidateStorefront(merchantId) {
    await Promise.all([
      this.del(`storefront:${merchantId}`),
      this.del(`products:${merchantId}`),
    ]);
    pubsub.publish('cache:invalidate', JSON.stringify({ type: 'storefront', merchantId }));
  },
  
  async invalidateOrder(orderId) {
    await this.del(`order:${orderId}:status`);
    pubsub.publish('cache:invalidate', JSON.stringify({ type: 'order', orderId }));
  },
  
  // Subscribe to invalidation from other instances
  onInvalidate(callback) { ... },
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  await redis.quit();
  await pubsub.quit();
});
```

---

## Controller Integration Examples

### Storefront Controller
```javascript
// controllers/storeFrontController.js
import { cache } from '../services/cache.js';

export async function getStorefront(req, res) {
  const cacheKey = `storefront:${merchant._id}`;
  const cached = await cache.get(cacheKey);
  if (cached) return res.json(cached);

  // ... existing logic ...
  const response = { store, paymentOptions, products };
  await cache.set(cacheKey, response, 60); // 60s TTL
  res.json(response);
}

// In productController.js - after create/update/delete:
await cache.invalidateStorefront(req.merchant._id);
```

### Order Status Controller
```javascript
// controllers/paymentController.js
export async function orderStatus(req, res) {
  const cacheKey = `order:${order._id}:status`;
  const cached = await cache.get(cacheKey);
  if (cached) return res.json(cached);

  // ... existing logic ...
  await cache.set(cacheKey, response, 15); // 15s TTL
  res.json(response);
}

// Invalidate on payment confirmation:
await cache.invalidateOrder(order._id);
```

---

## Render Deployment Updates

### `render.yaml`
```yaml
services:
  - type: web
    name: aether-api
    # ...
    envVars:
      # ... existing ...
      - key: REDIS_URL
        sync: false
      - key: REDIS_TLS
        value: "true"
```

### Required Redis Provider
- **Upstash Redis** (recommended for Render): Serverless, HTTP/Redis compatible, free tier
- **Render Redis** (managed): If available in region
- **KeyDB/Redis Cloud**: Alternative

---

## Failure Modes & Mitigations

| Failure | Impact | Mitigation |
|---------|--------|------------|
| Redis down | Cache misses → DB load spike | Circuit breaker: fall back to DB, log errors |
| Stale cache | Wrong data served | Short TTLs, explicit invalidation on writes |
| Cache stampede | Thundering herd on cold start | `setnx` + recompute, or `stale-while-revalidate` |
| Cross-instance inconsistency | Different data per instance | Pub/sub invalidation + short TTL |
| Memory pressure | Eviction of hot keys | Monitor Redis `used_memory`, set `maxmemory-policy allkeys-lru` |

---

## Monitoring & Observability

1. **Cache hit rate** metric (target >80% for storefront)
2. **Redis latency** (p50, p99)
3. **Invalidation events** count
4. **Fallback to DB** counter

---

## Rollout Plan

1. **Deploy cache service** (feature flag: `CACHE_ENABLED=false`)
2. **Enable storefront caching** → monitor hit rate
3. **Enable order status caching** → monitor latency
4. **Enable admin product caching**
5. **Enable Redis rate limiting**
6. **Enable stock caching** (if needed)

---

## Out of Scope (Future)
- Redis-backed sessions (current JWT is stateless)
- Full page caching (Vercel/Edge handles frontend)
- Distributed locking (not needed yet)
- Redis Streams for event sourcing

---

## Open Questions

1. **Redis provider**: Upstash vs Render Redis vs self-hosted?
2. **Storefront TTL**: 60s OK? Or need shorter for inventory accuracy?
3. **Rate limit storage**: Migrate all rate limits to Redis, or keep auth route in-memory?
4. **Stock caching**: Expected concurrent orders per product? (determines if Phase 6 needed)

---

## Next Steps

1. Confirm Redis provider choice
2. Set `REDIS_URL` in Render environment
3. Implement Phase 1-2 (foundation + storefront)
4. Load test with cache enabled