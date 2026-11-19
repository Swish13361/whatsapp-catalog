import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useStoreDataStore } from "../stores/storeDataStore.js";
import { SINGLE_STORE_KEY } from "../stores/storeDataStore.js";
import { useCartStore } from "../stores/cartStore.js";
import { useAuthStore } from "../stores/authStore.js";
import { useLanguage } from "../useLanguage.js";
import {
  Button,
  Card,
  PriceTag,
  QuantityStepper,
  Skeleton,
  Panel,
  Badge,
  Icon,
  ImageZoom,
  EmptyStateWithAction,
  Page,
  useToast,
} from "../ui/index.js";

const EMPTY_PRODUCTS = [];

export default function ItemPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const authStatus = useAuthStore((state) => state.status);
  const authInitialize = useAuthStore((state) => state.initialize);
  const { id, productId: legacyProductId } = useParams();
  const productId = id || legacyProductId;
  const storeResult = useStoreDataStore((state) => state.stores[SINGLE_STORE_KEY]);
  const fetchStore = useStoreDataStore((state) => state.fetchStore);
  const cart = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const { toast } = useToast();
  const [qty, setQty] = useState(1);
  const [isBuying, setIsBuying] = useState(false);

  const products = storeResult?.products || EMPTY_PRODUCTS;
  const product = products.find((entry) => entry._id === productId);
  const status = storeResult?.status || "loading";
  const storeName = storeResult?.merchant?.businessName || "Aether";
  const inStock = product?.inStock !== false;
  const stockText =
    !inStock
      ? t("outOfStock")
      : product?.stock == null
        ? t("unlimitedStock")
        : `${product.stock} ${t("inStock")}`;
  const itemInCart = cart.find((item) => item.productId === productId);
  const cartQty = itemInCart ? itemInCart.qty : 0;

  useEffect(() => {
    void fetchStore();
  }, [fetchStore]);

  useEffect(() => {
    if (authStatus !== "unauthenticated") {
      authInitialize();
    }
  }, [authStatus, authInitialize]);

  useEffect(() => {
    if (authStatus === "authenticated") {
      const pendingId = sessionStorage.getItem("pendingBuyItem");
      if (pendingId) {
        sessionStorage.removeItem("pendingBuyItem");
        if (product && product._id === pendingId) {
          addItem(SINGLE_STORE_KEY, product);
          toast({ title: `${product.name} ${t("addedToBag")}`, variant: "success" });
        }
      }
    }
  }, [authStatus, product, addItem, toast, t]);

  useEffect(() => {
    if (product) {
      document.title = `${product.name} · ${storeName}`;
    }
    return () => {
      document.title = "";
    };
  }, [product, storeName]);

  const handleAddToCart = useCallback(() => {
    if (!product || !inStock) return;
    if (cartQty >= 10) {
      toast({ title: t("maxQuantityReached"), variant: "warning" });
      return;
    }
    addItem(SINGLE_STORE_KEY, product);
    toast({ title: `${product.name} ${t("addedToBag")}`, variant: "success" });
  }, [inStock, cartQty, addItem, product, toast, t]);

  const handleBuyNow = () => {
    if (!product || !inStock) return;
    if (authStatus === "unauthenticated") {
      sessionStorage.setItem("pendingBuyItem", product._id);
      navigate(`/login?returnTo=${encodeURIComponent(`/item/${product._id}`)}`);
      return;
    }
    setIsBuying(true);
    addItem(SINGLE_STORE_KEY, product);
    navigate("/checkout");
  };

  const disabled = !inStock || cartQty >= 10;
  const buyDisabled = !inStock;

  if (status === "loading") {
    return (
      <Page brand={storeName} variant="sidebar">
        <div className="grid lg:grid-cols-[5fr_7fr] gap-6 lg:gap-8 flex-1">
          <div className="space-y-4">
            <Skeleton className="aspect-[4/3] w-full rounded-lg" />
            <Skeleton className="h-28 w-full rounded-lg" />
          </div>
          <div className="space-y-4">
            <div className="border border-line bg-surface rounded-lg p-6 space-y-4">
              <Skeleton heading className="w-1/3" />
              <Skeleton text className="w-1/4" />
              <Skeleton className="h-10 w-32 rounded-lg" />
              <div className="flex gap-2 pt-2">
                <Skeleton className="h-10 flex-1 rounded-lg" />
                <Skeleton className="h-10 flex-1 rounded-lg" />
              </div>
            </div>
            <Skeleton className="h-32 w-full rounded-lg" />
          </div>
        </div>
      </Page>
    );
  }

  if (!product) {
    return (
      <Page brand={storeName} variant="default">
        <EmptyStateWithAction
          title={t("storeNotFound")}
          description="This product is no longer available."
          icon="package"
          action={<Button onClick={() => navigate("/")}>{t("returnToStore")}</Button>}
        />
      </Page>
    );
  }

  return (
    <Page brand={storeName} variant="sidebar" supportEmail="aetherlystore@gmail.com">
      <div className="grid lg:grid-cols-[5fr_7fr] gap-6 lg:gap-8 flex-1">
        <section className="flex flex-col gap-4 min-w-0" aria-label="Product preview">
          <div className="relative">
            <div className="aspect-[4/3] bg-line/60 relative overflow-hidden rounded-lg border border-line">
              <ImageZoom
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 flex flex-col gap-1">
                <Badge variant="accent" className="text-xs">{t("autoDelivery")}</Badge>
                {product.isNew && <Badge variant="success" className="text-xs">{t("new")}</Badge>}
              </div>
              {!inStock && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
                  <span className="text-on-accent font-bold text-sm px-3.5 py-1.5 bg-danger rounded-lg">
                    {t("outOfStock")}
                  </span>
                </div>
              )}
            </div>
            {product.description && (
              <Panel title={t("description")} padded className="mt-4">
                <p className="text-sm text-text whitespace-pre-wrap">{product.description}</p>
              </Panel>
            )}
            <Panel title={t("deliveryInfo")} padded className="mt-4">
              <div className="flex items-center gap-3 text-sm text-muted">
                <Icon name="mail" size={18} className="text-accent shrink-0" />
                <span>{t("deliverySteps")}</span>
              </div>
            </Panel>
          </div>
        </section>

        <aside className="lg:sticky lg:top-20 flex flex-col gap-4 w-full shrink-0">
          <Card padded className="shadow-sm border border-line bg-surface">
            <div className="flex items-center justify-between mb-4">
              <PriceTag amount={product.price} currency={product.currency || "USDT"} className="text-2xl" />
              <Badge variant={inStock ? "success" : "danger"}>{inStock ? t("inStock") : t("outOfStock")}</Badge>
            </div>
            <p className="text-xs text-muted mb-4">{t("stock")}: {stockText}</p>
            
            <div className="mb-4">
              <label htmlFor="item-quantity" className="label-base block mb-2">{t("quantity")}</label>
              <QuantityStepper value={qty} onChange={setQty} min={1} max={10} disabled={disabled} />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="primary"
                className="flex-1"
                disabled={buyDisabled || isBuying}
                onClick={handleBuyNow}
                loading={isBuying}
              >
                {t("buyNow")}
              </Button>
              <Button
                variant="secondary"
                className="flex-1"
                disabled={disabled}
                onClick={handleAddToCart}
              >
                {t("addToBag")}
              </Button>
            </div>
          </Card>

          <Card padded className="bg-accent-soft/30 border-accent/30">
            <h3 className="text-sm font-bold text-text mb-2 flex items-center gap-2">
              <Icon name="shieldCheck" size={16} className="text-accent" />
              {t("securePurchase")}
            </h3>
            <ul className="text-sm text-muted space-y-1.5">
              <li className="flex items-center gap-2"><Icon name="check" size={14} className="text-success" /> {t("instantDelivery")}</li>
              <li className="flex items-center gap-2"><Icon name="check" size={14} className="text-success" /> {t("securePayment")}</li>
              <li className="flex items-center gap-2"><Icon name="check" size={14} className="text-success" /> {t("support247")}</li>
            </ul>
          </Card>
        </aside>
      </div>
    </Page>
  );
}


