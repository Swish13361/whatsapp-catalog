import { useState } from "react";
import { useLanguage } from "../useLanguage.js";
import { useToast } from "../ui/index.js";
import {
  Button,
  Input,
  Checkbox,
  Panel,
  Badge,
  Page,
} from "../ui/index.js";
import { ToastProvider } from "../ui/index.js";

export default function SettingsPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [announcement, setAnnouncement] = useState("");
  const [supportEmail, setSupportEmail] = useState("support@aether.example");
  const [usdtEnabled, setUsdtEnabled] = useState(true);
  const [alipayEnabled, setAlipayEnabled] = useState(false);
  const [bankEnabled, setBankEnabled] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleSave = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      toast({ title: "Settings saved.", variant: "success" });
    } finally {
      setBusy(false);
    }
  };

return (
    <ToastProvider>
      <Page brand="Aether" variant="default" supportEmail="support@aether.example">
        <Panel title={t("settings")} description="Announcement text, support contact, and payment methods for your storefront." padded>
          <form onSubmit={handleSave} noValidate className="layout-form">
            <div className="border border-line rounded-lg p-5">
              <p className="text-xs font-bold text-accent uppercase mb-3">{t("announcement")}</p>
              <textarea
                value={announcement}
                onChange={(event) => setAnnouncement(event.target.value)}
                placeholder="e.g. New templates added every Friday."
                rows={3}
                className="textarea-base"
              />
              <p className="mt-2 text-xs text-muted">Shown at the top of your storefront so customers see it first.</p>
            </div>

            <div className="border border-line rounded-lg p-5">
              <p className="text-xs font-bold text-accent uppercase mb-3">{t("supportContact")}</p>
              <Input value={supportEmail} onChange={(event) => setSupportEmail(event.target.value)} type="email" placeholder="support@yourshop.example" required className="input-base" />
              <p className="mt-2 text-xs text-muted">Shown on the storefront and in order emails.</p>
            </div>

            <div className="border border-line rounded-lg p-5">
              <p className="text-xs font-bold text-accent uppercase mb-4">{t("paymentMethods")}</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox checked={usdtEnabled} onChange={() => setUsdtEnabled(!usdtEnabled)} label="USDT (Binance Pay)" />
                  </div>
                  <Badge variant="neutral">{usdtEnabled ? t("enabled") : t("disabled")}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox checked={alipayEnabled} onChange={() => setAlipayEnabled(!alipayEnabled)} label="Alipay" />
                  </div>
                  <Badge variant="neutral">{alipayEnabled ? t("enabled") : t("disabled")} <span className="text-xs text-muted">({t("comingSoon")})</span></Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox checked={bankEnabled} onChange={() => setBankEnabled(!bankEnabled)} label="Bank transfer" />
                  </div>
                  <Badge variant="neutral">{bankEnabled ? t("enabled") : t("disabled")} <span className="text-xs text-muted">({t("comingSoon")})</span></Badge>
                </div>
              </div>
              <p className="mt-2 text-xs text-muted">Coming soon options are shown as unavailable on the storefront checkout.</p>
            </div>

            <Button variant="primary" className="w-full h-10" loading={busy} type="submit" disabled={busy}>
              Save settings
            </Button>
          </form>
        </Panel>
      </Page>
      <Footer supportEmail="support@aether.example" />
    </ToastProvider>
  );
}


