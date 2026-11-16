import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCartStore } from "../stores/cartStore.js";
import { useStoreDataStore } from "../stores/storeDataStore.js";

const formatPrice = (price) => `KES ${Number(price).toLocaleString("en-KE")}`;
const EMPTY_CART = [];
const EMPTY_PRODUCTS = [];

function StoreMark({ name }) {
  const initials = name
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return <span className="store-mark" aria-hidden="true">{initials || "S"}</span>;
}

function WhatsAppIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <path d="M20 11.7a8 8 0 0 1-11.8 7L4 20l1.3-4A8 8 0 1 1 20 11.7Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M9 8.5c.2-.4.4-.4.7-.4h.4c.2 0 .3.1.4.4l.6 1.4c.1.2.1.4-.1.6l-.5.6c-.2.2-.2.4 0 .6.4.7 1 1.3 1.7 1.7.2.1.4.1.6-.1l.6-.7c.2-.2.4-.2.6-.1l1.4.7c.2.1.3.2.3.4 0 .3-.2 1.1-.7 1.4-.5.4-1.1.6-1.8.4-1-.2-2.2-.8-3.3-1.9-1.1-1.1-1.7-2.3-1.9-3.3-.1-.6.1-1.3.5-1.7Z" fill="currentColor" />
    </svg>
  );
}

export default function Storefront() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const normalizedSlug = slug.toLowerCase();
  const storeResult = useStoreDataStore((state) => state.stores[normalizedSlug]);
  const fetchStore = useStoreDataStore((state) => state.fetchStore);
  const cartSlug = useCartStore((state) => state.slug);
  const storedCart = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const changeCartQuantity = useCartStore((state) => state.changeQuantity);
  const cart = cartSlug === normalizedSlug ? storedCart : EMPTY_CART;
  const [searchState, setSearchState] = useState({ slug: null, value: "" });
  const search = searchState.slug === normalizedSlug ? searchState.value : "";
  const updateSearch = (value) => setSearchState({ slug: normalizedSlug, value });

  useEffect(() => {
    void fetchStore(normalizedSlug);
  }, [fetchStore, normalizedSlug]);

  const merchant = storeResult?.merchant;
  const products = storeResult?.products || EMPTY_PRODUCTS;
  const status = storeResult?.status || "loading";
  const visibleProducts = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    if (!query) return products;
    return products.filter((product) =>
      `${product.name} ${product.description || ""}`.toLocaleLowerCase().includes(query),
    );
  }, [products, search]);
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  useEffect(() => {
    if (!merchant) return undefined;
    const description = `Browse ${merchant.businessName} products and order directly on WhatsApp.`;
    const title = merchant.businessName;
    const previousTitle = document.title;
    document.title = title;

    // Client-set metadata improves in-browser sharing; full link previews require server-side rendering or prerendering.
    const updateMeta = (selector, attribute, key, content) => {
      let tag = document.head.querySelector(selector);
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute(attribute, key);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);
      return tag;
    };

    const previousDescription = document.querySelector('meta[name="description"]')?.content;
    const previousOpenGraphTitle = document.querySelector('meta[property="og:title"]')?.content;
    const previousOpenGraphDescription = document.querySelector('meta[property="og:description"]')?.content;
    updateMeta('meta[name="description"]', "name", "description", description);
    updateMeta('meta[property="og:title"]', "property", "og:title", title);
    updateMeta('meta[property="og:description"]', "property", "og:description", description);

    return () => {
      document.title = previousTitle;
      if (previousDescription !== undefined) {
        document.querySelector('meta[name="description"]')?.setAttribute("content", previousDescription);
      }
      if (previousOpenGraphTitle !== undefined) {
        document.querySelector('meta[property="og:title"]')?.setAttribute("content", previousOpenGraphTitle);
      }
      if (previousOpenGraphDescription !== undefined) {
        document.querySelector('meta[property="og:description"]')?.setAttribute("content", previousOpenGraphDescription);
      }
    };
  }, [merchant]);

  const changeQuantity = (product, amount) => {
    if (amount > 0) {
      addItem(normalizedSlug, product);
    } else {
      changeCartQuantity(normalizedSlug, product, amount);
    }
  };

  if (status === "loading") {
    return (
      <main className="storefront-loading" role="status" aria-label="Loading shop">
        <div className="storefront-loading-header"><span /><span /></div>
        <div className="storefront-loading-hero"><span /><span /><span /></div>
        <div className="storefront-loading-heading"><span /><span /></div>
        <div className="storefront-loading-products">
          {[0, 1, 2].map((item) => <div className="storefront-skeleton-card" key={item}><span /><span /><span /></div>)}
        </div>
      </main>
    );
  }
  if (status === "not-found") {
    return (
      <main className="page-message page-message-card">
        <span className="message-icon" aria-hidden="true">!</span>
        <h1>Store not found</h1>
        <p>We couldn’t find this shop.</p>
        <p>Check the link or ask the shop for a new one.</p>
      </main>
    );
  }
  if (status === "network-error" || !merchant) {
    return (
      <main className="page-message page-message-card">
        <span className="message-icon" aria-hidden="true">!</span>
        <h1>We couldn’t load this shop</h1>
        <p>Check your connection and try again.</p>
        <button className="text-button" type="button" onClick={() => {
          void fetchStore(normalizedSlug, { force: true });
        }}>Retry</button>
      </main>
    );
  }

  const whatsappUrl = `https://wa.me/${merchant.whatsappNumber}`;

  return (
    <main className="storefront">
      <div className="announcement">
        <span className="announcement-dot" />
        A little shop with a lot to love
      </div>

      <header className="site-header">
        <a className="store-identity" href="#top" aria-label={`${merchant.businessName} home`}>
          <StoreMark name={merchant.businessName} />
          <span>{merchant.businessName}</span>
        </a>
        <nav className="header-actions" aria-label="Shop links">
          <a className="contact-link" href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            <WhatsAppIcon />
            <span>Chat with us</span>
          </a>
          <a className="header-cart-link" href="#your-cart" aria-label={`Your cart, ${cartCount} items`}>
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
              <path d="M4 5h2l2 11h10l2-8H7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="10" cy="20" r="1" fill="currentColor" />
              <circle cx="17" cy="20" r="1" fill="currentColor" />
            </svg>
            <span className="cart-count">{cartCount}</span>
          </a>
        </nav>
      </header>

      <section className="store-hero" id="top">
        <div className="hero-copy">
          <p className="hero-kicker"><span /> YOUR NEIGHBORHOOD SHOP</p>
          <h1>Good things,<br /><em>picked for you.</em></h1>
          <p className="hero-description">
            Discover something lovely from {merchant.businessName}. Thoughtful finds, easy ordering, and a real person on the other end.
          </p>
          <a className="hero-link" href="#shop">
            Explore the collection <span aria-hidden="true">↓</span>
          </a>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="hero-sun" />
          <div className="hero-sticker"><span>Made for</span><strong>everyday<br />moments</strong><span>✳</span></div>
          <div className="hero-leaf hero-leaf-one" />
          <div className="hero-leaf hero-leaf-two" />
          <div className="hero-orbit" />
        </div>
        <div className="hero-note"><span>01</span> GOOD FINDS, GOOD FEELING</div>
      </section>

      <section className="shop-section" id="shop">
        <div className="shop-heading">
          <div>
            <p className="section-kicker">THE GOOD STUFF</p>
            <h2>Shop the collection<span className="heading-period">.</span></h2>
            <p className="shop-subtitle">A few of our favorite things, all in one place.</p>
          </div>
          <label className="product-search">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
              <circle cx="10.8" cy="10.8" r="6.8" stroke="currentColor" strokeWidth="1.7" />
              <path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
            <input
              type="search"
              placeholder="Find something..."
              value={search}
              onChange={(event) => updateSearch(event.target.value)}
              aria-label="Search products"
            />
          </label>
        </div>

        <div className="collection-bar">
          <span>ALL FINDS <span className="collection-count">{products.length}</span></span>
          <span className="collection-note">Selected with care <span aria-hidden="true">✳</span></span>
        </div>

        {visibleProducts.length === 0 ? (
          <div className="catalog-empty">
            <span className="empty-sparkle" aria-hidden="true">✳</span>
            <h3>{products.length ? "No finds match that search." : "This shop is getting ready."}</h3>
            <p>{products.length ? "Try another name or clear your search to see everything." : "There are no products in this shop yet. Please check back soon."}</p>
            {search && <button className="text-button" type="button" onClick={() => updateSearch("")}>Clear search</button>}
          </div>
        ) : (
          <div className="products">
            {visibleProducts.map((product, index) => {
              const cartItem = cart.find((item) => item.productId === product._id);
              const quantityLimitReached = cartItem?.qty >= 10;

              return (
                <article key={product._id} className="product-card">
                  <div className={`product-visual product-visual-${index % 4}`}>
                    <span className="image-monogram" aria-hidden="true">{product.name.slice(0, 1)}</span>
                    {product.imageUrl && (
                      <img
                        className="product-image"
                        src={product.imageUrl}
                        alt={product.name}
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                    )}
                    <span className={`stock-pill ${product.inStock ? "" : "stock-pill-empty"}`}>
                      <span />{product.inStock ? "In the shop" : "Sold out"}
                    </span>
                  </div>
                  <div className="product-info">
                    <div className="product-title-row">
                      <h3>{product.name}</h3>
                      <span className="product-price">{formatPrice(product.price)}</span>
                    </div>
                    {product.description && <p className="product-description">{product.description}</p>}
                    <button
                      className={`add-button ${cartItem ? "add-button-added" : ""}`}
                      type="button"
                      onClick={() => changeQuantity(product, 1)}
                      disabled={!product.inStock || quantityLimitReached}
                    >
                      {quantityLimitReached ? "Maximum added" : cartItem ? `Add another · ${cartItem.qty} in bag` : "Add to bag"}
                      <span aria-hidden="true">{cartItem ? "＋" : "↗"}</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="shop-bottom">
        <div className="bottom-asterisk" aria-hidden="true">✳</div>
        <div><p>Questions, a special request, or just saying hi?</p><strong>We’re one message away.</strong></div>
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">Say hello on WhatsApp <span aria-hidden="true">↗</span></a>
      </section>

      <footer className="site-footer">
        <span className="footer-brand"><StoreMark name={merchant.businessName} /> {merchant.businessName}</span>
        <span>Good finds. Easy orders. Always local.</span>
      </footer>

      <aside className="cart-summary" id="your-cart" aria-label="Shopping bag">
        <div className="cart-heading">
          <div><p className="section-kicker">YOUR PICKS</p><h2>Your bag <span>{cartCount}</span></h2></div>
          <span className="bag-sparkle" aria-hidden="true">✳</span>
        </div>
        {cart.length === 0 ? (
          <div className="empty-cart">
            <span aria-hidden="true">↗</span>
            <p>Your bag’s taking a little break.</p>
            <small>Add a find you love to get started.</small>
          </div>
        ) : (
          <ul className="cart-items">
            {cart.map((item) => {
              const product = products.find((entry) => entry._id === item.productId);
              return (
                <li key={item.productId}>
                  <div className="cart-item-copy">
                    <span>{item.name}</span>
                    <small>{formatPrice(item.price)}</small>
                  </div>
                  <div className="quantity-control" aria-label={`${item.name} quantity`}>
                    <button type="button" onClick={() => product && changeQuantity(product, -1)} aria-label={`Remove one ${item.name}`}>−</button>
                    <span>{item.qty}</span>
                    <button type="button" onClick={() => product && changeQuantity(product, 1)} disabled={item.qty >= 10} aria-label={`Add one ${item.name}`}>+</button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <div className="cart-total">
          <span>Subtotal</span>
          <strong>{formatPrice(cartTotal)}</strong>
        </div>
        <p className="cart-footnote">Delivery details and payment come next.</p>
        <button
          className="checkout-button"
          type="button"
          disabled={cart.length === 0}
          onClick={() => {
            navigate(`/order/${encodeURIComponent(normalizedSlug)}`);
          }}
        >
          Continue to checkout <span aria-hidden="true">→</span>
        </button>
        <div className="secure-note"><span aria-hidden="true">✳</span> Easy ordering, personal service</div>
      </aside>
      <a className="floating-whatsapp" href={whatsappUrl} target="_blank" rel="noopener noreferrer">
        <WhatsAppIcon />
        <span>Chat on WhatsApp</span>
      </a>
    </main>
  );
}
