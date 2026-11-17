import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAdminProducts } from "../api.js";
import { ProductForm } from "./AdminPages.jsx";
import { useLanguage } from "../useLanguage.js";
import { Button, Panel, EmptyState, Skeleton, Page } from "../ui/index.js";
import { ToastProvider } from "../ui/index.js";

export default function ProductEditor() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { id } = useParams();
  const [products, setProducts] = useState(null);

  useEffect(() => {
    let active = true;
    getAdminProducts()
      .then((list) => { if (active) setProducts(list); })
      .catch(() => { if (active) setProducts([]); });
    return () => { active = false; };
  }, []);

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

  const product = id ? products.find((entry) => entry._id === id) || null : null;
  if (id && !product) {
    return (
      <Page brand="Aether" variant="default">
        <EmptyState title="Product not found" description="No product with that number was found." action={<Button onClick={() => navigate("/admin/products")}>Back to products</Button>} />
      </Page>
    );
  }

  return (
    <ToastProvider>
      <Page brand="Aether" variant="default" supportEmail="support@aether.example">
        <Panel title={id ? "Edit product" : "New product"} padded>
          <ProductForm
            product={product}
            onClose={() => navigate("/admin/products", { replace: true })}
            onSaved={() => navigate("/admin/products", { replace: true })}
          />
        </Panel>
      </Page>
      <Footer supportEmail="support@aether.example" />
    </ToastProvider>
  );
}


