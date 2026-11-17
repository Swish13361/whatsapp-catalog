import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { adminRegister } from "../api.js";
import { AuthLayout, Button, PasswordField, TextField } from "../components/AuthComponents.jsx";
import StoreLinkCard from "../components/StoreLinkCard.jsx";
import { EMAIL_PATTERN, getAuthErrorMessage } from "./authUtils.js";

function Register() {
  const [values, setValues] = useState({
    businessName: "",
    email: "",
    password: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [createdSlug, setCreatedSlug] = useState("");
  const businessNameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const updateField = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: "" }));
    setServerError("");
  };

  const validate = () => {
    const errors = {};
    const businessName = values.businessName.trim();
    const email = values.email.trim();

    if (!businessName) errors.businessName = "Enter your shop name.";
    else if (businessName.length > 80) errors.businessName = "Keep your shop name under 80 characters.";
    if (!email) errors.email = "Enter your email address.";
    else if (!EMAIL_PATTERN.test(email)) errors.email = "Enter a valid email address.";
    if (values.password.length < 8) errors.password = "Use at least 8 characters.";

    return errors;
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    const errors = validate();
    setFieldErrors(errors);
    setServerError("");
    if (Object.keys(errors).length) {
      const fieldRefs = {
        businessName: businessNameRef,
        email: emailRef,
        password: passwordRef,
      };
      fieldRefs[Object.keys(errors)[0]].current?.focus();
      return;
    }

    setLoading(true);
    try {
      const data = await adminRegister(
        values.businessName.trim(),
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

  return (
    <AuthLayout
      eyebrow="YOUR SHOP, ONLINE"
      title="Let’s set up your shop."
      description="Create your free shop and start taking orders."
      footer={<>Already have a shop? <Link to="/login">Log in</Link></>}
    >
      {serverError && <div className="auth-alert" role="alert">{serverError}</div>}
      <form className="auth-form" onSubmit={handleRegister} noValidate>
        <TextField
          id="businessName"
          label="Shop name"
          value={values.businessName}
          inputRef={businessNameRef}
          onChange={(event) => updateField("businessName", event.target.value)}
          placeholder="e.g. Mama Joy's Kitchen"
          autoComplete="organization"
          maxLength={80}
          required
          error={fieldErrors.businessName}
        />
        <TextField
          id="email"
          label="Email address"
          type="email"
          value={values.email}
          inputRef={emailRef}
          onChange={(event) => updateField("email", event.target.value)}
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
          onChange={(event) => updateField("password", event.target.value)}
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


