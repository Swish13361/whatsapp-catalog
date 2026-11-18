import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCartStore } from "../stores/cartStore.js";
import { SINGLE_STORE_KEY, useStoreDataStore } from "../stores/storeDataStore.js";
import { useAuthStore } from "../stores/authStore.js";
import { useLanguage } from "../useLanguage.js";
import {
  Button,
  Card,
  PriceTag,
  Skeleton,
  EmptyState,
  Badge,
  Panel,
  Icon,
  Input,
  QuantityStepper,
  ImageZoom,
  Modal,
  Chips,
  LoadingOverlay,
  Toast,
  Tooltip,
  EmptyStateWithAction,
  Page,
} from "../ui/index.js";
import { ToastProvider, useToast } from "../ui/index.js";

const EMPTY_PRODUCTS = [];

function formatPrice(price, currency = "USDT", language = "en") {
  return new Intl.NumberFormat(
    language === "zh-CN" ? "zh-CN" : currency === "USD" ? "en-US" : "en-KE",
    { style: "currency", currency, minimumFractionDigits: 2, maximumFractionDigits: 2 },
  ).format(Number(price || 0));
}

function ProductCard({ product, cartItem, onAdd, onChangeQty, disabled, t, language, mixedCurrency, onQuickView }) {
  const [isHovered, setIsHovered] = useState(false);
  const [showQty, setShowQty] = useState(false);
  const inStock = product.inStock !== false;
  const qty = cartItem?.qty || 0;
  const isInCart = qty > 0;

  return (
    <Card
      padded
      className="flex flex-col h-full group border border-line bg-surface rounded-lg shadow-sm hover:border-accent/40 transition-[border-color] duration-150"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-[4/3] bg-line/60 overflow-hidden rounded-lg">
        <ImageZoom
          src={product.imageUrl}
          alt={product.name}
          className="product-thumb"
        />
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
          <Badge variant="accent" className="text-xs" aria-hidden="true">
            {t("autoDelivery")}
          </Badge>
          {product.isNew && (
            <Badge variant="success" className="text-xs">
              {t("new")}
            </Badge>
          )}
        </div>
        {!inStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
            <span className="text-on-accent font-bold text-xs sm:text-sm px-3 py-1.5 bg-danger rounded-lg">
              {t("outOfStock")}
            </span>
          </div>
        )}
        {isHovered && inStock && (
          <button
            type="button"
            onClick={onQuickView}
            className="absolute bottom-2.5 right-2.5 min-w-[40px] min-h-[40px] rounded-full bg-surface/95 border border-line text-text flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-[opacity,background-color] duration-150 hover:bg-accent-soft hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            aria-label={t("quickView", { item: product.name })}
          >
            <Icon name="maximize2" size={16} />
          </button>
        )}
      </div>

      <div className="mt-3 flex flex-col gap-2 flex-grow">
        <h3 className="product-title group-hover:text-accent transition-[color] duration-150">{product.name}</h3>
        <p className="text-xs text-muted line-clamp-2">{product.description || t("digitalProductFromShop")}</p>

        <div className="mt-auto flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col gap-0.5">
              <PriceTag amount={product.price} currency={product.currency || "USDT"} />
              <span className="text-xs text-muted">
                {product.stock == null ? t("unlimitedStock") : `${product.stock} ${t("inStock")}`}
              </span>
            </div>
          </div>

          <div className="product-price-row flex items-center justify-between gap-3">
            {isInCart ? (
              <div className="flex items-center gap-2 flex-1">
                <Tooltip content={t("removeOne", { item: product.name })} position="top">
                  <button
                    type="button"
                    onClick={() => onChangeQty(product, -1)}
                    disabled={disabled || !inStock}
                    className="flex shrink-0 items-center justify-center min-w-[36px] min-h-[36px] rounded-lg border border-line bg-surface text-text hover:bg-accent-soft active:bg-line/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-40 disabled:cursor-not-allowed transition-[color,background-color] duration-150"
                  >
                    <Icon name="minus" size={14} />
                  </button>
                </Tooltip>
                <span className="qty-display text-text">{qty}</span>
                <Tooltip content={t("addOne", { item: product.name })} position="top">
                  <button
                    type="button"
                    onClick={() => onChangeQty(product, 1)}
                    disabled={disabled || !inStock || qty >= 10}
                    className="flex shrink-0 items-center justify-center min-w-[36px] min-h-[36px] rounded-lg border border-line bg-surface text-text hover:bg-accent-soft active:bg-line/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-40 disabled:cursor-not-allowed transition-[color,background-color] duration-150"
                  >
                    <Icon name="plus" size={14} />
                  </button>
                </Tooltip>
              </div>
            ) : (
<Button
                variant={mixedCurrency ? "secondary" : "primary"}
                size="sm"
                className="flex-1"
                disabled={disabled || !inStock || mixedCurrency}
                onClick={() => onAdd(product, 1)}
              >
                {mixedCurrency ? t("clearBagToSwitchCurrency") : inStock ? t("addToBag") : t("unavailable")}
              </Button>
            )}
            {mixedCurrency && (
              <Badge variant="warning" className="text-xs whitespace-nowrap">
                {t("mixedCurrencies")}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

function CartSidebar({ cartItems, products, cartCount, cartTotal, cartCurrency, onChangeQty, onClearCart, navigate, t, language, auth }) {
  const [isOpen, setIsOpen] = useState(true);

  if (typeof window === "undefined") return null;

  return (
    <div className="w-full lg:w-80 shrink-0" aria-label={t("shoppingBag")}>
      <Card padded className="overflow-hidden shadow-sm border border-line bg-surface hover:border-accent/40 transition-[border-color] duration-150 lg:sticky lg:top-20">
        <div className="flex items-center justify-between mb-3">
          <div className="flex flex-col gap-0">
            <p className="text-xs font-bold text-muted uppercase">{t("yourPicks")}</p>
            <h2 className="text-lg font-bold text-text">{t("yourBag")} <span className="text-accent">{Number(cartCount) || 0}</span></h2>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="text-muted hover:text-text transition-colors p-1 rounded-lg hover:bg-accent-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            aria-label={isOpen ? "Collapse cart" : "Expand cart"}
            aria-expanded={isOpen}
          >
            <Icon name={isOpen ? "chevronUp" : "chevronDown"} size={18} className="transition-transform duration-200" />
          </button>
        </div>

        {!isOpen ? (
          <div className="text-center py-4 text-muted text-sm">
            {cartCount > 0 ? `${cartCount} ${t("productPlural")} - ${cartCurrency ? formatPrice(cartTotal, cartCurrency, language) : t("mixedCurrencies")}` : t("bagEmpty")}
          </div>
        ) : (
          <>
            {cartItems.length === 0 ? (
              <EmptyStateWithAction
                title={t("bagEmpty")}
                description={t("addDigitalProduct")}
                icon="bag"
                action={
                  <Button variant="secondary" size="sm" onClick={() => navigate("/")}>
                    {t("browseProducts")}
                  </Button>
                }
                className="py-8"
              />
            ) : (
              <>
                <ul className="divide-y divide-line max-h-[350px] overflow-y-auto py-2 pr-1">
                  {cartItems.map((item) => {
                    const product = products.find((entry) => entry._id === item.productId);
                    const inStock = product?.inStock !== false;
                    return (
                      <li key={item.productId} className="py-3 flex items-center gap-3 transition-[background-color] duration-150 hover:bg-accent-soft/30 rounded-lg px-2 -ml-2">
                        <ImageZoom
                          src={product?.imageUrl}
                          alt={item.name}
                          className="w-14 h-14 object-cover rounded-lg bg-line/60 flex-shrink-0"
                        />
                        <div className="flex flex-col gap-1 min-w-0 flex-1">
                          <span className="text-sm font-semibold text-text line-clamp-1">{item.name}</span>
                          <small className="text-muted">{formatPrice(item.price, item.currency, language)}</small>
                        </div>
                        <div className="flex items-center gap-2">
                          <Tooltip content={t("removeOne", { item: item.name })} position="top">
                            <button
                              type="button"
                              disabled={!inStock}
                              onClick={() => onChangeQty(product, -1)}
                              className="flex shrink-0 items-center justify-center min-w-[36px] min-h-[36px] rounded-lg border border-line bg-surface text-text hover:bg-accent-soft active:bg-line/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-40 disabled:cursor-not-allowed transition-[color,background-color] duration-150"
                            >
                              <Icon name="minus" size={14} />
                            </button>
                          </Tooltip>
                          <output className="qty-display text-text">{Number(item.qty) || 0}</output>
                          <Tooltip content={t("addOne", { item: item.name })} position="top">
                            <button
                              type="button"
                              disabled={!inStock || item.qty >= 10}
                              onClick={() => onChangeQty(product, 1)}
                              className="flex shrink-0 items-center justify-center min-w-[36px] min-h-[36px] rounded-lg border border-line bg-surface text-text hover:bg-accent-soft active:bg-line/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-40 disabled:cursor-not-allowed transition-[color,background-color] duration-150"
                            >
                              <Icon name="plus" size={14} />
                            </button>
                          </Tooltip>
                        </div>
                      </li>
                    );
                  })}
                </ul>
                <div className="border-t border-line pt-4 flex items-center justify-between">
                  <span className="text-sm text-muted">{t("subtotal")}</span>
                  <strong className="text-sm font-bold text-text">
                    {cartCurrency ? <PriceTag amount={cartTotal} currency={cartCurrency} /> : t("mixedCurrencies")}
                  </strong>
                </div>
                {cartCurrency !== "USD" && cartItems.length > 0 && (
                  <div className="flex items-center gap-2 p-3 bg-warning-soft border border-warning/30 rounded-lg">
                    <Icon name="alertTriangle" size={16} className="text-warning shrink-0" />
                    <p className="text-xs text-warning flex-1">{t("checkoutRequiresUsd")}</p>
                  </div>
                )}
<Button
                  className="w-full"
                  disabled={!cartItems.length || cartCurrency !== "USD"}
                  onClick={() => {
                    if (auth !== "authenticated") {
                      navigate(`/login?returnTo=${encodeURIComponent("/checkout")}`);
                      return;
                    }
                    navigate("/checkout");
                  }}
                >
                  {t("continueCheckout")}
                </Button>
                <p className="mt-3 text-xs text-muted text-center">{t("networkNote")}</p>
              </>
            )}
          </>
        )}
      </Card>
    </div>
  );
}

export default function ShopHome() {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const { slug } = useParams();
  const authStatus = useAuthStore((state) => state.status);
  const authInitialize = useAuthStore((state) => state.initialize);
  const storeResult = useStoreDataStore((state) => state.stores[SINGLE_STORE_KEY]);
  const fetchStore = useStoreDataStore((state) => state.fetchStore);
  const cartSlug = useCartStore((state) => state.slug);
  const storedCart = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const changeCartQuantity = useCartStore((state) => state.changeQuantity);
  const clearCart = useCartStore((state) => state.clearCart);
  const { toast } = useToast();
  const activeSlug = slug || SINGLE_STORE_KEY;
  const cart = cartSlug === activeSlug ? storedCart : [];
  const [category, setCategory] = useState("All");
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  useEffect(() => {
    console.log('[ShopHome] cart state:', { cartSlug, storedCartLength: storedCart?.length, cartLength: cart?.length, activeSlug });
  }, [cartSlug, storedCart, cart, activeSlug]);

  useEffect(() => {
    void fetchStore({ slug });
  }, [fetchStore, slug]);

  useEffect(() => {
    const mediaQuery = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!mediaQuery) return undefined;
    mediaQuery.addEventListener("change", () => {});
    return () => mediaQuery.removeEventListener("change", () => {});
  }, []);

  const merchant = storeResult?.merchant;
  const products = storeResult?.products || EMPTY_PRODUCTS;
  const status = storeResult?.status || "loading";
  const categories = useMemo(
    () => ["All", ...new Set(products.map((product) => product.category || "Other"))],
    [products],
  );
  const visibleProducts = useMemo(
    () =>
      products.filter((product) => {
        const matchesCategory = category === "All" || (product.category || "Other") === category;
        return matchesCategory;
      }),
    [category, products],
  );
  const cartItems = cart.map((item) => {
    const product = products.find((entry) => entry._id === item.productId);
    return product
      ? { ...item, name: product.name, price: product.price, currency: product.currency || "KES" }
      : item;
  });
  const cartCount = cartItems.reduce((sum, item) => sum + (Number(item.qty) || 0), 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.qty) || 0), 0);
  const cartCurrencies = [...new Set(cartItems.map((item) => item.currency || "KES"))];
  const cartCurrency = cartCurrencies.length === 1 ? cartCurrencies[0] : null;
  const storeName = merchant?.businessName || "Aether";

  useEffect(() => {
    if (!merchant) return undefined;
    document.title = `${merchant.businessName} | ${t("digitalProducts")}`;
    return () => {
      document.title = "";
    };
  }, [merchant, t]);

useEffect(() => {
    if (status !== "ready") return;
    const staleIds = cart.filter((item) => !products.some((p) => p._id === item.productId));
    if (staleIds.length > 0) {
      clearCart(activeSlug);
    }
  }, [products, cart, clearCart, status]);

useEffect(() => {
    authInitialize();
  }, [authInitialize]);

  useEffect(() => {
    if (authStatus === "authenticated") {
      const pendingId = sessionStorage.getItem("pendingBuyItem");
      if (pendingId) {
        sessionStorage.removeItem("pendingBuyItem");
        const product = products.find((p) => p._id === pendingId);
        if (product) {
          addItem(activeSlug, product);
          setTimeout(() => {
            toast(`${product.name} ${t("addedToBag")}`, "success");
          }, 0);
        }
      }
    }
  }, [authStatus, products, addItem, toast, t]);

  const changeQuantity = useCallback((product, amount) => {
    console.log('[ShopHome] changeQuantity called:', { productId: product?._id, amount, authStatus });
    if (!product) return;

    if (amount > 0) {
      const mixedCurrency = cartCurrencies.length > 0 && !cartCurrencies.includes(product.currency || "KES");
      if (mixedCurrency) {
        toast(t("clearBagToSwitchCurrency"), "warning");
        return;
      }
      addItem(activeSlug, product);
      toast(`${product.name} ${t("addedToBag")}`, "success");
    } else {
      changeCartQuantity(activeSlug, product, amount);
    }
  }, [addItem, changeCartQuantity, cartCurrencies, toast, t, navigate, activeSlug]);

  const handleQuickView = useCallback((product) => {
    setQuickViewProduct(product);
  }, []);

  const supportEmail = "support@aether.example";

  if (status === "loading") {
    return (
      <Page brand={storeName} variant="sidebar">
        <section aria-label="Loading shop" className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent-soft text-accent animate-pulse">
              <Icon name="package" size={28} />
            </div>
            <h2 className="text-lg font-semibold text-text">{t("loadingShop")}</h2>
            <p className="text-sm text-muted max-w-xs mx-auto">
              Fetching products from the store. This usually takes just a moment.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-8 max-w-5xl w-full">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="border border-line bg-surface rounded-lg p-4 space-y-3 animate-pulse">
                <Skeleton className="aspect-[4/3] w-full rounded-lg" />
                <Skeleton heading className="w-3/4" />
                <Skeleton text className="w-1/2" />
                <div className="pt-2 border-t border-line flex justify-between items-center">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-8 w-20 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </section>
        <aside className="lg:sticky lg:top-20 flex flex-col gap-4 w-full shrink-0">
          <div className="border border-line bg-surface rounded-lg p-5 space-y-4 animate-pulse">
            <Skeleton heading className="w-1/2" />
            <Skeleton text className="w-3/4" />
            <div className="space-y-3 pt-3 border-t border-line">
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </aside>
      </Page>
    );
  }
  if (status === "not-found") {
    return (
      <Page brand={storeName} variant="default">
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-line/50 mb-6">
            <Icon name="store" size={32} className="text-muted" />
          </div>
          <h2 className="text-xl font-semibold text-text mb-2">
            {t("shopSetupNeeded")}
          </h2>
          <p className="text-muted mb-6 max-w-md">
            No active shop is configured yet. Click <strong className="text-text">"Shop"</strong> in the navigation to start browsing products.
          </p>
          <Button onClick={() => void fetchStore({ force: true })} variant="primary">
            {t("tryAgain")}
          </Button>
        </div>
      </Page>
    );
  }
  if (status === "network-error" || !merchant) {
    return (
      <Page brand={storeName} variant="default">
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-danger-soft mb-6">
            <Icon name="alertTriangle" size={32} className="text-danger" />
          </div>
          <h2 className="text-xl font-semibold text-text mb-2">
            {t("shopCouldNotLoad")}
          </h2>
          <p className="text-muted mb-6 max-w-md">
            {storeResult?.error || t("connectionError")}
          </p>
          <Button onClick={() => void fetchStore({ force: true })} variant="primary">
            {t("tryAgain")}
          </Button>
        </div>
      </Page>
    );
  }

return (
    <>
      <Page brand={storeName} variant="default" supportEmail={supportEmail}>
        <div className="grid lg:grid-cols-[1fr_320px] gap-6 lg:gap-8">
          <div className="min-w-0">
            <section aria-label={t("shop")}>
              <Panel title="Notice" padded className="bg-accent-soft/30 border-accent/30">
                <p className="text-sm text-muted">
                  Need help with an order? Email <a href={`mailto:${supportEmail}`} className="text-accent hover:text-accent-hover underline underline-offset-2 transition-[color] duration-150">
                    {supportEmail}
                  </a>
                </p>
              </Panel>
            </section>

            <section aria-label={t("shop")}>
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                <div className="flex flex-wrap gap-2" aria-label={t("productCategories")}>
                  <Chips
                    options={categories.map((name) => name === "All" ? t("allCategory") : name === "Other" ? t("otherCategory") : name)}
                    value={category === "All" ? t("allCategory") : category === "Other" ? t("otherCategory") : category}
                    onValueChange={(value) => {
                      const cat = categories.find((c) => (c === "All" ? t("allCategory") : c === "Other" ? t("otherCategory") : c) === value);
                      setCategory(cat || "All");
                    }}
                  />
                </div>
                <span className="text-xs text-muted hidden sm:block">{t("productCount", { count: visibleProducts.length, unit: visibleProducts.length === 1 ? t("productSingular") : t("productPlural") })}</span>
              </div>

              {visibleProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[300px] text-center px-6 py-12">
                  {products.length === 0 ? (
                    <>
                      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-line/50 mb-4">
                        <Icon name="package" size={32} className="text-muted" />
                      </div>
                      <h3 className="text-lg font-semibold text-text mb-2">
                        {t("productsOnTheWay")}
                      </h3>
                      <p className="text-muted mb-4 max-w-md">
                        No products available yet. Once the admin adds products, they'll appear here automatically.
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-line/50 mb-4">
                        <Icon name="search" size={32} className="text-muted" />
                      </div>
                      <h3 className="text-lg font-semibold text-text mb-2">
                        {t("noProductsFound")}
                      </h3>
                      <p className="text-muted mb-4 max-w-md">
                        {t("tryAnotherCategory")}
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" role="list" aria-label="Products">
                  {visibleProducts.map((product, index) => {
                    const item = cartItems.find((cartItem) => cartItem.productId === product._id);
                    const mixedCurrency = cartCurrencies.length > 0 && !cartCurrencies.includes(product.currency || "KES");
                    const disabled = !product.inStock || (item && item.qty >= 10) || mixedCurrency;
                    return (
                      <ProductCard
                        key={product._id}
                        product={product}
                        cartItem={item}
                        onAdd={changeQuantity}
                        onChangeQty={changeQuantity}
                        disabled={disabled}
                        t={t}
                        language={language}
                        mixedCurrency={mixedCurrency}
                        onQuickView={handleQuickView}
                      />
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          <aside className="lg:sticky lg:top-20" aria-label={t("shoppingBag")}>
            <CartSidebar
              cartItems={cartItems}
              products={products}
              cartCount={cartCount}
              cartTotal={cartTotal}
              cartCurrency={cartCurrency}
              onChangeQty={changeQuantity}
              onClearCart={() => clearCart(activeSlug)}
              navigate={navigate}
              t={t}
              language={language}
              auth={authStatus}
            />
          </aside>
        </div>
      </Page>

      {quickViewProduct && (
        <Modal
          open={!!quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          title={quickViewProduct.name}
          size="md"
        >
          <div className="grid md:grid-cols-2 gap-6">
            <div className="aspect-video bg-line relative overflow-hidden rounded-lg">
              <ImageZoom
                src={quickViewProduct.imageUrl}
                alt={quickViewProduct.name}
                className="w-full h-full object-cover"
              />
              <Badge variant="accent" className="absolute top-3 left-3 text-xs">{t("autoDelivery")}</Badge>
            </div>
            <div className="flex flex-col gap-4 p-2">
              <p className="text-sm text-muted">{quickViewProduct.description || t("digitalProductFromShop")}</p>
              <div className="flex items-center gap-2">
                <PriceTag amount={quickViewProduct.price} currency={quickViewProduct.currency || "USDT"} />
                <span className="text-xs text-muted">
                  {quickViewProduct.stock == null ? t("unlimitedStock") : `${quickViewProduct.stock} ${t("inStock")}`}
                </span>
              </div>
              <div className="flex gap-2 pt-2 border-t border-line">
                <Button variant="primary" className="flex-1" onClick={() => { 
                  changeQuantity(quickViewProduct, 1); 
                  setQuickViewProduct(null); 
                }}>
                  {t("addToBag")}
                </Button>
                <Button variant="secondary" onClick={() => navigate(`/item/${quickViewProduct._id}`)}>
                  {t("viewDetails")}
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
