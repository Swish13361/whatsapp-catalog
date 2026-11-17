import { useEffect, useState } from "react";
import { getAdminProducts, updateAdminProduct } from "../api.js";
import { useLanguage } from "../useLanguage.js";
import {
  Button,
  Input,
  StatusBadge,
  Skeleton,
  Panel,
  Page,
} from "../ui/index.js";
import { ToastProvider } from "../ui/index.js";

export default function InventoryPage() {
  const { t } = useLanguage();
  const [products, setProducts] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");

  useEffect(() => {
    let active = true;
    getAdminProducts()
      .then((list) => { if (active) setProducts(list); })
      .catch((requestError) => { if (active) setError(requestError.message); });
    return () => { active = false; };
  }, []);

  const adjustStock = async (product, delta) => {
    setBusy(product._id);
    setError("");
    try {
      const next = product.stock == null ? delta : Math.max(0, product.stock + delta);
      await updateAdminProduct(product._id, { stock: next });
      setProducts((current) => current.map((entry) => entry._id === product._id ? { ...entry, stock: next } : entry));
    } catch (requestError) {
      setError(requestError.message || "Could not update stock.");
    } finally {
      setBusy("");
    }
  };

  const toggleActive = async (product) => {
    setBusy(product._id);
    setError("");
    try {
      await updateAdminProduct(product._id, { isActive: !product.isActive });
      setProducts((current) => current.map((entry) => entry._id === product._id ? { ...entry, isActive: !entry.isActive } : entry));
    } catch (requestError) {
      setError(requestError.message || "Could not update the product.");
    } finally {
      setBusy("");
    }
  };

if (products === null) {
    return (
      <Page brand="Aether" variant="default">
        <div className="text-center py-24 animate-in fade-in-0">
          <Skeleton heading className="mx-auto w-64" />
          <p className="mt-4 text-sm text-muted">{t("loadingCheckout")}</p>
        </div>
      </Page>
    );
  }

  return (
    <ToastProvider>
      <Page brand="Aether" variant="default" supportEmail="support@aether.example">
        {error && <p className="text-sm text-danger mb-4" role="alert">{error}</p>}
        <Panel title="Inventory" description="Stock levels and availability for every product in your catalogue." padded>
          <div className="table-container">
            <table className="table-base">
              <thead>
                <tr className="bg-surface/50">
                  <th className="th-base">Product</th>
                  <th className="th-base">Image</th>
                  <th className="th-base">Stock</th>
                  <th className="th-base">Status</th>
                  <th className="th-base">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-accent-soft/30 transition-colors">
                    <td className="td-base text-sm text-text">
                      <div className="flex items-center gap-3">
                        <div className="flex shrink-0 items-center justify-center w-8 h-8 rounded-lg bg-line text-muted text-[10px]">{product.name.slice(0, 1).toUpperCase()}</div>
                        <span className="font-medium text-text truncate max-w-[160px]">{product.name}</span>
                      </div>
                    </td>
                    <td className="td-base text-sm text-muted">
                      <Input
                        value={product.imageUrl || ""}
                        onChange={(event) => void updateAdminProduct(product._id, { imageUrl: event.target.value.trim() }).catch(() => {})}
                        placeholder="https://…"
                        className="w-[170px] text-xs h-7 px-1.5"
                        disabled={busy === product._id}
                      />
                    </td>
                    <td className="td-base text-sm text-text">
                      <div className="flex items-center gap-2">
                        {product.stock == null ? (
                          <span className="text-muted">Unlimited</span>
                        ) : (
                          <>
                            <button type="button" onClick={() => adjustStock(product, -1)} disabled={busy === product._id || product.stock === 0} className="btn-step-sm rounded border border-line bg-surface text-text hover:bg-accent-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50">−</button>
                            <span className="w-6 text-sm font-bold text-text text-center">{product.stock}</span>
                            <button type="button" onClick={() => adjustStock(product, 1)} disabled={busy === product._id} className="btn-step-sm rounded border border-line bg-surface text-text hover:bg-accent-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50">+</button>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="td-base">
                      <StatusBadge status={product.isActive ? "active" : "inactive"} />
                    </td>
                    <td className="td-base">
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={busy === product._id}
                        onClick={() => toggleActive(product)}
                      >
                        {busy === product._id ? "Saving…" : product.isActive ? "Hide" : "Show"}
                      </Button>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={5} className="td-base text-center text-sm text-muted">No products yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted">Changes are saved to your shop immediately. Stock updates also reflect on the storefront.</p>
        </Panel>
      </Page>
      <Footer supportEmail="support@aether.example" />
    </ToastProvider>
  );
}


