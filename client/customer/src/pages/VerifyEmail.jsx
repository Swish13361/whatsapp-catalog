import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../useLanguage.js";
import { useToast } from "../ui/index.js";
import {
  Button,
  Card,
  Panel,
} from "../ui/index.js";
import { TopBar } from "../layout/TopBar.jsx";
import { Footer } from "../layout/Footer.jsx";
import { ToastProvider } from "../ui/index.js";

export default function VerifyEmail() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [verified, setVerified] = useState(false);

  const handleVerify = () => {
    toast({ title: t("emailVerified"), variant: "success" });
    setVerified(true);
  };

  return (
    <ToastProvider>
      <TopBar brand="Aether" />
      <main className="max-w-6xl mx-auto px-4 py-6">
        <Card padded className="w-full sm:w-[440px] mx-auto">
          <Panel title={t("verifyEmail")} padded>
            {!verified ? (
              <>
                <p className="text-sm text-muted">We sent a verification link to your email address. Open it and confirm below.</p>
                <Button variant="primary" className="w-full" onClick={handleVerify}>
                  {t("verifyEmail")}
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm text-success">{t("emailVerified")}</p>
                <p className="text-sm text-muted">You can now sign in to your account.</p>
                <Button variant="primary" className="w-full" onClick={() => navigate("/login", { replace: true })}>
                  {t("signIn")}
                </Button>
              </>
            )}
          </Panel>
        </Card>
      </main>
      <Footer supportEmail="support@aether.example" />
    </ToastProvider>
  );
}


