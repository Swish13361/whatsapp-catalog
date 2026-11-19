import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../useLanguage.js";
import { useToast } from "../ui/index.js";
import {
  Button,
  Input,
  Card,
  Panel,
} from "../ui/index.js";
import { TopBar } from "../layout/TopBar.jsx";
import { Footer } from "../layout/Footer.jsx";
import { ToastProvider } from "../ui/index.js";

export default function ResetPassword() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setServerError("");
    if (!password || password.length < 8) {
      setServerError("Use at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setServerError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      toast({ title: "Password reset.", variant: "success" });
      navigate("/login", { replace: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToastProvider>
      <TopBar brand="Aether" />
      <main className="max-w-6xl mx-auto px-4 py-6">
        <Card padded className="w-full sm:w-[440px] mx-auto">
          <Panel title={t("resetPassword")} description="Set a new password for your account." padded>
            <form onSubmit={handleSubmit} noValidate className="flex flex-column gap-4">
              {serverError && <p className="text-sm text-danger" role="alert">{serverError}</p>}
              <div className="flex flex-column gap-1">
                <label className="text-xs font-bold text-muted">{t("newPassword")}</label>
                <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} />
              </div>
              <div className="flex flex-column gap-1">
                <label className="text-xs font-bold text-muted">Confirm password</label>
                <Input type="password" value={confirm} onChange={(event) => setConfirm(event.target.value)} required minLength={8} />
              </div>
              <Button variant="primary" className="w-full" loading={loading} type="submit">
                {t("saveChanges")}
              </Button>
              <p className="text-xs text-center text-muted">
                Remembered your password?{" "}
                <a href="/login" className="text-accent hover:text-accent-hover underline underline-offset-2">{t("signIn")}</a>
              </p>
            </form>
          </Panel>
        </Card>
      </main>
      <Footer supportEmail="aetherlystore@gmail.com" />
    </ToastProvider>
  );
}




