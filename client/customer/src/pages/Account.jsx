import { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../stores/authStore.js";
import { useLanguage } from "../useLanguage.js";
import { useToast } from "../ui/index.js";
import {
  Button,
  EmptyState,
  Input,
  Card,
  Panel,
  Skeleton,
  PasswordStrength,
  Icon,
  Toast,
  Modal,
  Tooltip,
} from "../ui/index.js";
import { TopBar } from "../layout/TopBar.jsx";
import { Footer } from "../layout/Footer.jsx";
import { ToastProvider } from "../ui/index.js";

const PROFILE_KEY = "aether-profile";

function readProfile() {
  try {
    return JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeProfile(profile) {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {
    // Storage unavailable
  }
}

function getInitials(name) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function Account() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const auth = useAuthStore();
  const { toast } = useToast();

  useEffect(() => {
    document.title = `Account · Aether`;
  }, []);
  const profile = readProfile();
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(profile.name || "");
  const [email, setEmail] = useState(profile.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showCopyToast, setShowCopyToast] = useState(false);

  useEffect(() => {
    auth.initialize();
  }, []);

  const handleSaveProfile = useCallback(() => {
    if (!name.trim() || !email.trim()) {
      setServerError("Name and email are required.");
      return;
    }
    writeProfile({ name: name.trim(), email: email.trim() });
    setEditMode(false);
    toast({ title: t("profileSaved"), variant: "success" });
  }, [name, email, toast, t]);

  const handlePasswordChange = useCallback((event) => {
    event.preventDefault();
    setServerError("");
    if (!currentPassword || !newPassword || newPassword.length < 8) {
      setServerError("Enter your current password and a new password of at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setServerError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      toast({ title: t("passwordUpdated"), variant: "success" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } finally {
      setLoading(false);
    }
  }, [currentPassword, newPassword, confirmPassword, toast, t]);

  const copyEmail = useCallback(() => {
    navigator.clipboard.writeText(profile.email);
    setShowCopyToast(true);
    setTimeout(() => setShowCopyToast(false), 2000);
  }, [profile.email]);

  if (auth.status === "loading") {
    return (
      <main className="max-w-6xl mx-auto px-4 py-24 text-center">
        <Skeleton heading className="mx-auto w-64" />
        <p className="mt-4 text-sm text-muted">{t("loadingCheckout")}</p>
      </main>
    );
  }
  if (auth.status === "unauthenticated") {
    return (
      <main className="max-w-6xl mx-auto px-4 py-24 text-center">
        <EmptyState title={t("notAuthorized")} description={t("adminOnly")} action={<Button onClick={() => navigate("/login")}>{t("signIn")}</Button>} />
      </main>
    );
  }

  return (
    <ToastProvider>
      <TopBar brand="Aether" />
      <main className="max-w-6xl mx-auto px-4 py-6 lg:grid lg:grid-cols-[1fr_420px] lg:gap-8 animate-in fade-in-0">
        <section className="flex flex-col gap-6 min-w-0">
          <Panel title={t("profile")} padded className="animate-in slide-in-from-bottom">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-full bg-accent-soft flex items-center justify-center text-2xl font-bold text-accent flex-shrink-0">
                {getInitials(profile.name || "User")}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-text truncate">{profile.name || t("unnamedUser")}</h2>
                <p className="text-sm text-muted truncate">{profile.email || "No email"}</p>
              </div>
              <Button variant="secondary" size="sm" onClick={() => setEditMode(true)}>
                <Icon name="edit3" size={14} className="mr-1" />
                {t("editProfile")}
              </Button>
            </div>

            {editMode ? (
              <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="label-base">{t("name")}</label>
                  <Input
                    className="input-base"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t("fullName")}
                    maxLength={50}
                    required
                    autoFocus
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="label-base">{t("deliveryEmail")}</label>
                  <Input
                    className="input-base"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    inputMode="email"
                    maxLength={254}
                    required
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="secondary" type="button" onClick={() => { setName(profile.name || ""); setEmail(profile.email || ""); setEditMode(false); }}>
                    {t("cancel")}
                  </Button>
                  <Button variant="primary" type="submit" loading={loading}>
                    {t("saveChanges")}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-muted w-[120px]">{t("name")}</span>
                  <p className="text-sm text-text">{profile.name || "—"}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-muted w-[120px]">{t("deliveryEmail")}</span>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-text flex-1 truncate">{profile.email || "—"}</p>
                    <Tooltip content={t("copyEmail")} position="top">
                      <button
                        type="button"
                        onClick={copyEmail}
                        className="text-xs font-bold text-accent hover:text-accent-hover underline underline-offset-2 flex items-center gap-1"
                      >
                        <Icon name="copy" size={12} />
                      </button>
                    </Tooltip>
                  </div>
                </div>
                <p className="text-xs text-muted mt-2">Profile details are set when you create your account.</p>
              </div>
            )}
          </Panel>

          <div className="animate-in slide-in-from-bottom" style={{ animationDelay: "100ms" }}>
            <p className="text-xs font-bold text-muted uppercase mb-3">{t("changePassword")}</p>
            <Panel padded>
              <form onSubmit={handlePasswordChange} noValidate className="flex flex-col gap-4">
                {serverError && <p className="text-sm text-danger animate-in fade-in-0" role="alert">{serverError}</p>}
                <div className="flex flex-col gap-1">
                  <label className="label-base">{t("currentPassword")}</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      className="input-base pr-10"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted hover:text-accent transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="label-base">{t("newPassword")}</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={8}
                      className="input-base pr-10"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted hover:text-accent transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  <PasswordStrength password={newPassword} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="label-base">Confirm new password</label>
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    className="input-base"
                    autoComplete="new-password"
                    error={confirmPassword && newPassword !== confirmPassword}
                  />
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-xs text-danger animate-in fade-in-0">Passwords do not match.</p>
                  )}
                </div>
                <Button variant="primary" className="w-full" loading={loading} type="submit" disabled={loading || !currentPassword || !newPassword || newPassword.length < 8 || newPassword !== confirmPassword}>
                  {t("saveChanges")}
                </Button>
              </form>
            </Panel>
          </div>
        </section>

        <aside className="lg:sticky lg:top-4 flex flex-col gap-4 w-[420px] shrink-0 animate-in slide-in-from-bottom" style={{ animationDelay: "150ms" }}>
          <Card padded className="shadow-sm border-line/50 hover:border-accent/30 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-accent-soft flex items-center justify-center">
                <Icon name="user" size={24} className="text-accent" />
              </div>
              <div>
                <p className="font-bold text-text">{t("accountInfo")}</p>
                <p className="text-xs text-muted">{t("manageProfile")}</p>
              </div>
            </div>
            <p className="text-sm text-muted mb-4">Orders and downloads are tied to {profile.email || "your email address"}. Check your inbox for download links after a purchase is confirmed.</p>
            <Link to="/orders" className="block w-full text-left px-4 py-3 rounded-lg border border-line bg-surface text-text hover:bg-accent-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent transition-colors">
              <Icon name="package" size={16} className="inline-block mr-2" />
              {t("myOrders")}
            </Link>
            <Link to="/orders/lookup" className="block w-full text-left px-4 py-3 rounded-lg border border-line bg-surface text-text hover:bg-accent-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent transition-colors mt-2">
              <Icon name="search" size={16} className="inline-block mr-2" />
              {t("lookupOrder")}
            </Link>
          </Card>

          <Card padded className="bg-accent-soft/30 border-accent/50">
            <h3 className="text-sm font-bold text-text mb-2 flex items-center gap-2">
              <Icon name="shieldCheck" size={16} className="text-accent" />
              {t("secureAccount")}
            </h3>
            <ul className="text-sm text-muted space-y-1">
              <li className="flex items-center gap-2"><Icon name="check" size={14} className="text-success" /> {t("encryptedPasswords")}</li>
              <li className="flex items-center gap-2"><Icon name="check" size={14} className="text-success" /> {t("secureSessions")}</li>
              <li className="flex items-center gap-2"><Icon name="check" size={14} className="text-success" /> {t("dataPrivacy")}</li>
            </ul>
          </Card>
        </aside>
      </main>
      <Footer supportEmail="aetherlystore@gmail.com" />

      {showCopyToast && (
        <Toast message={t("emailCopied")} variant="success" onClose={() => setShowCopyToast(false)} duration={2000} />
      )}
    </ToastProvider>
  );
}


