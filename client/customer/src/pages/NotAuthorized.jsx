import { useLanguage } from "../useLanguage.js";
import { Button } from "../ui/index.js";
import { TopBar } from "../layout/TopBar.jsx";
import { Footer } from "../layout/Footer.jsx";
import { ToastProvider } from "../ui/index.js";

export default function NotAuthorized() {
  const { t } = useLanguage();
  return (
    <ToastProvider>
      <TopBar brand="Aether" />
      <main className="max-w-6xl mx-auto px-4 py-24 text-center">
        <h1 className="text-xl font-bold text-text">{t("notAuthorized")}</h1>
        <p className="mt-2 text-sm text-muted">{t("adminOnly")}</p>
        <Button variant="primary" onClick={() => window.location.assign("/")}>
          Return to store
        </Button>
      </main>
      <Footer supportEmail="aetherlystore@gmail.com" />
    </ToastProvider>
  );
}




