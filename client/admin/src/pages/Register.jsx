import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { adminCheckSlugAvailability, adminRegister } from "../api.js";
import { AuthLayout, Button, PasswordField, TextField } from "../components/AuthComponents.jsx";
import StoreLinkCard from "../components/StoreLinkCard.jsx";
import { getStoreLink } from "../utils/storeLink.js";
import {
  EMAIL_PATTERN,
  getAuthErrorMessage,
  KENYAN_PHONE_PATTERN,
  RESERVED_SLUGS,
} from "./authUtils.js";

function Register() {
  const [values, setValues] = useState({
    businessName: "",
    slug: "",
    whatsappNumber: "",
    email: "",
    password: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [createdSlug, setCreatedSlug] = useState("");
  const [slugCheck, setSlugCheck] = useState({ slug: "", status: "idle" });
  const businessNameRef = useRef(null);
  const slugRef = useRef(null);
  const whatsappNumberRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  useEffect(() => {
    const slug = values.slug;
    if (
      !/^[a-z0-9-]{3,30}$/.test(slug) ||
      RESERVED_SLUGS.has(slug)
    ) return undefined;

    let active = true;
    const timeout = setTimeout(() => {
      setSlugCheck({ slug, status: "checking" });
      adminCheckSlugAvailability(slug)
        .then((result) => {
          if (!active) return;
          const status = result.available
            ? "available"
            : result.reason === "taken"
              ? "taken"
              : "not-allowed";
          setSlugCheck({ slug, status });
        })
        .catch(() => {
          if (active) setSlugCheck({ slug, status: "error" });
        });
    }, 500);

    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [values.slug]);

  const updateField = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: "" }));
    setServerError("");
  };

  const validate = () => {
    const errors = {};
    const businessName = values.businessName.trim();
    const slug = values.slug;
    const email = values.email.trim();

    if (!businessName) errors.businessName = "Enter your business name.";
    else if (businessName.length > 80) errors.businessName = "Keep your business name under 80 characters.";

    if (slug.length < 3 || slug.length > 30) errors.slug = "Your store link must be 3 to 30 characters.";
    else if (!/^[a-z0-9-]+$/.test(slug)) errors.slug = "Use lowercase letters, numbers, and dashes only.";
    else if (RESERVED_SLUGS.has(slug)) errors.slug = "That store link is reserved. Choose another.";

    if (!KENYAN_PHONE_PATTERN.test(values.whatsappNumber.trim())) {
      errors.whatsappNumber = "Enter a Kenyan number, such as 0712345678 or +254712345678.";
    }
    if (!email) errors.email = "Enter your email address.";
    else if (!EMAIL_PATTERN.test(email)) errors.email = "Enter a valid email address.";
    if (values.password.length < 8) errors.password = "Use at least 8 characters.";

    return errors;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const errors = validate();
    setFieldErrors(errors);
    setServerError("");
    if (Object.keys(errors).length) {
      const firstInvalidField = Object.keys(errors)[0];
      const fieldRefs = {
        businessName: businessNameRef,
        slug: slugRef,
        whatsappNumber: whatsappNumberRef,
        email: emailRef,
        password: passwordRef,
      };
      fieldRefs[firstInvalidField].current?.focus();
      return;
    }

    setLoading(true);
    try {
      const data = await adminRegister(
        values.businessName.trim(),
        values.slug,
        values.whatsappNumber,
        values.email.trim(),
        values.password,
      );
      if (!data.token || !data.merchant?.slug) throw new Error("AUTH_REQUEST_FAILED");
      localStorage.setItem("adminToken", data.token);
      setCreatedSlug(data.merchant.slug);
    } catch (err) {
      setServerError(getAuthErrorMessage(err, true));
      if (err?.status === 409) emailRef.current?.focus();
    } finally {
      setLoading(false);
    }
  };

  if (createdSlug) {
    return (
      <AuthLayout
        eyebrow="YOUR SHOP IS READY"
        title="Your store is live."
        description="Your customers can visit your shop, browse products, and get in touch with you."
        footer={<>Ready to add products? <Link to="/dashboard">Go to your dashboard</Link></>}
      >
        <StoreLinkCard slug={createdSlug} />
      </AuthLayout>
    );
  }

  const slugIsLocallyNotAllowed = values.slug.length > 0 && (
    !/^[a-z0-9-]{3,30}$/.test(values.slug) || RESERVED_SLUGS.has(values.slug)
  );
  const currentSlugStatus = slugCheck.slug === values.slug ? slugCheck.status : "idle";

  return (
    <AuthLayout
      eyebrow="YOUR SHOP, ONLINE"
      title="Let’s set up your shop."
      description="Create your free shop link and start taking orders on WhatsApp."
      footer={<>Already have a shop? <Link to="/login">Log in</Link></>}
    >
      {serverError && <div className="auth-alert" role="alert">{serverError}</div>}
      <form className="auth-form" onSubmit={handleRegister} noValidate>
        <TextField
          id="businessName"
          label="Business name"
          value={values.businessName}
          inputRef={businessNameRef}
          onChange={(e) => updateField("businessName", e.target.value)}
          placeholder="e.g. Mama Joy’s Kitchen"
          autoComplete="organization"
          maxLength={80}
          required
          error={fieldErrors.businessName}
        />
        <TextField
          id="slug"
          label="Your store link"
          value={values.slug}
          inputRef={slugRef}
          onChange={(e) => updateField("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 30))}
          placeholder="mamajoy"
          autoComplete="off"
          maxLength={30}
          required
          error={fieldErrors.slug}
          helperText={
            <>
              <span className="auth-store-preview">
                Your customers can visit <strong>{getStoreLink(values.slug || "your-store")}</strong>
              </span>
              {values.slug && (
                <span
                  className={`auth-slug-status auth-slug-status-${slugIsLocallyNotAllowed ? "not-allowed" : currentSlugStatus}`}
                  role="status"
                  aria-live="polite"
                >
                  {slugIsLocallyNotAllowed
                    ? "Not allowed"
                    : currentSlugStatus === "available"
                      ? "Available"
                      : currentSlugStatus === "taken"
                        ? "Taken"
                        : currentSlugStatus === "not-allowed"
                          ? "Not allowed"
                          : currentSlugStatus === "checking"
                            ? "Checking availability…"
                            : currentSlugStatus === "error"
                              ? "Couldn’t check right now. You can still try this link."
                              : ""}
                </span>
              )}
            </>
          }
        />
        <TextField
          id="whatsappNumber"
          label="WhatsApp number"
          type="tel"
          value={values.whatsappNumber}
          inputRef={whatsappNumberRef}
          onChange={(e) => updateField("whatsappNumber", e.target.value)}
          placeholder="0712345678"
          autoComplete="tel"
          inputMode="tel"
          required
          error={fieldErrors.whatsappNumber}
          helperText="Use the number your customers message to place orders."
        />
        <TextField
          id="email"
          label="Email address"
          type="email"
          value={values.email}
          inputRef={emailRef}
          onChange={(e) => updateField("email", e.target.value)}
          placeholder="you@yourshop.co.ke"
          autoComplete="email"
          inputMode="email"
          required
          error={fieldErrors.email}
        />
        <PasswordField
          id="password"
          label="Create a password"
          value={values.password}
          inputRef={passwordRef}
          onChange={(e) => updateField("password", e.target.value)}
          autoComplete="new-password"
          error={fieldErrors.password}
          helperText={values.password.length < 8
            ? "At least 8 characters. A longer password is even safer."
            : values.password.length < 12
              ? "Good start. A few more characters can make it stronger."
              : "Strong password length."}
        />
        <Button loading={loading}>Create my shop</Button>
        <p className="auth-form-note">No card needed. Your shop is ready in a few minutes.</p>
      </form>
    </AuthLayout>
  );
}

export default Register;