# Payment Method Expansion Plan - Simplified (No WhatsApp)

## Goal
Expand the digital store to support crypto payments (USDT + Alipay + Bank) while removing any WhatsApp/contact approach. The store is a simple online digital goods store where:
- Admin adds products via admin panel
- Products appear on live storefront
- Customers pay via selected payment method
- Admin manually confirms payment and delivers goods

## Current State (Already Working)
- Admin product management ✓
- Storefront product display ✓
- USDT (TRC20/BEP20) crypto payment ✓
- M-Pesa payment ✓
- Payment on Delivery ✓
- Order status tracking ✓
- Reference submission flow ✓

**What needs fixing**: Payment UI, adding Alipay/Bank methods, Binance USDT support, removing WhatsApp references.

## Payment Methods to Support

| Method | Type | Description | Reference Format |
|---|---|---|---|
| **USDT-TRC20** | Crypto | Pay USDT on TRC20 network | 64-char hex hash |
| **USDT-BEP20** | Crypto | Pay USDT on BEP20 network | 64-char hex hash |
| **USDT-BINANCE** | Crypto | Pay USDT to personal wallet (BSC) | 64-char hex hash |
| **ALIPAY** | Alternative | Pay via Alipay app | Alipay transaction ID |
| **BANK_TRANSFER** | Alternative | Bank transfer using displayed details | Confirmation code |

## Key Design Decisions

### 1. Binance USDT = USDT Network Option
- `BINANCE` is a `paymentNetwork` value, not a separate payment method
- Same reference submission flow as TRC20/BEP20
- Wallet address from `USDT_BINANCE_ADDRESS` env var
- Reuses existing USDT infrastructure

### 2. Alipay & Bank = Static Display + Reference Submission
- No third-party API integration (keeps it simple/fast)
- Display payment details statically
- Customer pays externally, submits reference
- Admin verifies reference, marks order PAID

### 3. No WhatsApp Integration
- Remove all WhatsApp references from UI
- Remove WhatsApp from admin/order views
- Payment communication happens via order system only

## Files to Modify

### Backend (`api/`)

1. **`api/config/index.js`**
   - Add `USDT_BINANCE_ADDRESS` env var
   - Add Alipay/bank display config (remove WhatsApp config)

2. **`api/models/order.js`**
   - Add `ALIPAY`, `BANK_TRANSFER` to `paymentMethod` enum
   - Add `ALIPAY`, `BANK` to `paymentNetwork` enum

3. **`api/controllers/orderController.js`**
   - Remove `method !== "USDT"` strict check
   - Add validation for: USDT networks, ALIPAY, BANK_TRANSFER
   - ALIPAY/BANK don't need wallet validation

4. **`api/controllers/paymentController.js`**
   - Add `submitAlipayReference` handler
   - Add `submitBankReference` handler
   - Keep existing USDT reference handler

5. **`api/routes/paymentRoutes.js`**
   - Keep existing USDT reference route
   - Add Alipay and bank reference routes

6. **`api/routes/storeRpute.js`**
   - Extend `getStorefront` to include Alipay/bank payment options

### Frontend (`client/customer/`)

1. **`client/customer/src/stores/storeDataStore.js`**
   - Update `paymentOptions` to include: `usdtNetworks: ["TRC20", "BEP20", "BINANCE"]`, `alipayEnabled: true`, `bankTransferEnabled: true`
   - Remove any WhatsApp-related state

2. **`client/customer/src/pages/StoreFront.jsx`** - **MAIN CHANGES**
   - **Remove all WhatsApp references**: Delete whatsappUrl, whatsapp support links
   - **Update payment display**: Show all 5 payment methods without WhatsApp
   - **USDT section**: Network selector (TRC20/BEP20/BINANCE) + wallet address display
   - **Alipay section**: Account details (from config) + "Pay via Alipay" CTA
   - **Bank section**: Bank details (from config) + "Transfer via bank" CTA
   - **Reference forms**: Allow submitting references for any payment method
   - **Footer**: Remove "Manual order fulfillment" or keep if still relevant, but remove WhatsApp

3. **`client/customer/src/api.js`**
   - May need updates for new reference submission endpoints

## UI/UX Flow (No WhatsApp)

### Storefront Payment Screen
```
[Product Grid]

Payment Options:
┌─────────────────────────────────────┐
│ USDT on:    [TRC20] [BEP20] [BINANCE] │
│                                       │
│ Alipay:     [Account ID]  Pay button  │
│                                       │
│ Bank Transfer: [Bank Name] [Account]  Pay button │
└─────────────────────────────────────┘

[Submit Payment Reference]  [Cancel]
```

### After Payment Submission
Customer submits reference → Order status updates → Admin sees order → Admin marks PAID → Goods delivered (manually, e.g., email download link)

## Admin Flow (Simplified)

1. Admin adds product → appears on storefront
2. Customer buys product → order created with UNPAID status
3. Customer pays crypto/external method → submits reference
4. Admin views order → sees payment method + reference
5. Admin verifies payment → marks order PAID
6. Goods delivered (admin sends download link/manual delivery)

## Environment Variables (`api/.env`)

Add to existing .env:
```
USDT_BINANCE_ADDRESS=0xYourPersonalWalletAddress
ALIPAY_ACCOUNT_ID=your-alipay-account
ALIPAY_ACCOUNT_NAME=Display Name
BANK_ACCOUNT_NAME=Display Name
BANK_ACCOUNT_NUMBER=Account Number
BANK_NAME=Bank Name
BANK_ROUTING=SortCode
```

## Reference Submission (Unified Endpoint)

`POST /orders/:orderCode/payment-reference`
Body: `{ reference: "transaction-id-or-hash", paymentMethod: "USDT|ALIPAY|BANK_TRANSFER" }`

Backend validates reference format based on `paymentMethod`:
- USDT: 64-char hex hash
- ALIPAY: Non-empty string
- BANK_TRANSFER: Non-empty string

Order `paymentReference` updated, `paymentStatus` can be changed to PAID by admin.

## Validation Checklist

- [ ] Remove all WhatsApp references from UI and code
- [ ] Add USDT-BINANCE network support
- [ ] Add Alipay payment method
- [ ] Add Bank Transfer payment method
- [ ] USDT TRC20/BEP20 still works unchanged
- [ ] Storefront displays 5 payment methods (USDT-3 + Alipay + Bank)
- [ ] Reference submission works for all methods
- [ ] Admin can mark orders PAID for all methods
- [ ] No broken existing functionality