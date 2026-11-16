import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { adminLogin } from "../api.js";
import { AuthLayout, Button, PasswordField, TextField } from "../components/AuthComponents.jsx";
import { EMAIL_PATTERN, getAuthErrorMessage } from "./authUtils.js";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const emailRef = useRef(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!email.trim()) errors.email = "Enter your email address.";
    else if (!EMAIL_PATTERN.test(email.trim())) errors.email = "Enter a valid email address.";
    if (!password) errors.password = "Enter your password.";
    else if (password.length < 8) errors.password = "Use at least 8 characters.";

    setFieldErrors(errors);
    setServerError("");
    if (Object.keys(errors).length) {
      document.getElementById(Object.keys(errors)[0])?.focus();
      return;
    }

    setLoading(true);
    try {
      const data = await adminLogin(email, password);
      if (!data.token) throw new Error("AUTH_REQUEST_FAILED");
      localStorage.setItem("adminToken", data.token);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setServerError(getAuthErrorMessage(err));
      if (err?.status === 409) emailRef.current?.focus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="WELCOME BACK"
      title="Good to see you again."
      description="Sign in to keep your shop and orders moving."
      footer={<>New to SokoLink? <Link to="/signup">Create your shop</Link></>}
    >
      {serverError && <div className="auth-alert" role="alert">{serverError}</div>}
      <form className="auth-form" onSubmit={handleLogin} noValidate>
        <TextField
          id="email"
          label="Email address"
          type="email"
          value={email}
          inputRef={emailRef}
          onChange={(e) => { setEmail(e.target.value); setFieldErrors((current) => ({ ...current, email: "" })); setServerError(""); }}
          placeholder="you@yourshop.co.ke"
          autoComplete="email"
          inputMode="email"
          required
          error={fieldErrors.email}
        />
        <PasswordField
          value={password}
          onChange={(e) => { setPassword(e.target.value); setFieldErrors((current) => ({ ...current, password: "" })); setServerError(""); }}
          error={fieldErrors.password}
        />
        <Button loading={loading}>Log in</Button>
      </form>
    </AuthLayout>
  );
}

export default Login;