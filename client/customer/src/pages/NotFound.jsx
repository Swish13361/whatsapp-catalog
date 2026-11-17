import { useEffect } from "react";
import { useLanguage } from "../useLanguage.js";
import { Button } from "../ui/index.js";
import { TopBar } from "../layout/TopBar.jsx";
import { Footer } from "../layout/Footer.jsx";
import { ToastProvider } from "../ui/index.js";

export default function NotFound() {
  const { t } = useLanguage();

  useEffect(() => {
    document.title = `Page not found · Aether`;
  }, []);
  return (
    <ToastProvider>
      <TopBar brand="Aether" />
      <main className="max-w-6xl mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-text">404</h1>
        <p className="mt-2 text-sm text-muted">{t("pageNotFound")}</p>
        <Button variant="primary" onClick={() => window.location.assign("/")}>
          Return to store
        </Button>
      </main>
      <Footer supportEmail="support@aether.example" />
    </ToastProvider>
  );
}


