import { useState } from "react";
import { Link } from "react-router-dom";
import "./auth.css";

export function AuthLayout({ eyebrow, title, description, children, footer }) {
  return (
    <main className="auth-shell">
      <header className="auth-header">
        <Link className="auth-brand" to="/login" aria-label="SokoLink home">
          <span className="auth-brand-mark" aria-hidden="true">s</span>
          <span>SokoLink</span>
        </Link>
        <span className="auth-header-note">Made for local businesses</span>
      </header>

      <section className="auth-card" aria-labelledby="auth-title">
        <div className="auth-card-heading">
          <span className="auth-eyebrow">{eyebrow}</span>
          <h1 id="auth-title">{title}</h1>
          <p>{description}</p>
        </div>
        {children}
        <div className="auth-card-footer">{footer}</div>
      </section>

      <footer className="auth-page-footer">
        <span className="auth-footer-check" aria-hidden="true">✓</span>
        Simple tools for your shop. Your customers order on WhatsApp.
      </footer>
    </main>
  );
}

export function TextField({
  id,
  label,
  type = "text",
  value,
  onChange,
  onBlur,
  placeholder,
  autoComplete,
  autoCapitalize = "none",
  inputMode,
  maxLength,
  minLength,
  required = false,
  error,
  helperText,
  inputRef,
  trailingAction,
}) {
  const describedBy = [
    error ? `${id}-error` : null,
    helperText ? `${id}-help` : null,
  ].filter(Boolean).join(" ") || undefined;

  return (
    <div className={`auth-field${error ? " has-error" : ""}`}>
      <label className="auth-label" htmlFor={id}>{label}</label>
      <div className="auth-input-wrap">
        <input
          ref={inputRef}
          id={id}
          name={id}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          autoComplete={autoComplete}
          autoCapitalize={autoCapitalize}
          inputMode={inputMode}
          maxLength={maxLength}
          minLength={minLength}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
        />
        {trailingAction}
      </div>
      {error && <span className="auth-field-error" id={`${id}-error`}>{error}</span>}
      {helperText && <span className="auth-field-help" id={`${id}-help`}>{helperText}</span>}
    </div>
  );
}

export function PasswordField({ id = "password", label = "Password", value, onChange, error, helperText, inputRef, autoComplete = "current-password" }) {
  const [visible, setVisible] = useState(false);

  return (
    <TextField
      id={id}
      label={label}
      type={visible ? "text" : "password"}
      value={value}
      onChange={onChange}
      inputRef={inputRef}
      autoComplete={autoComplete}
      minLength={8}
      required
      error={error}
      helperText={helperText}
      trailingAction={
        <button
          className="auth-password-toggle"
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
        >
          {visible ? "Hide" : "Show"}
        </button>
      }
    />
  );
}

export function Button({ children, loading = false, ...props }) {
  const { disabled, ...buttonProps } = props;
  return (
    <button className="auth-submit" type="submit" disabled={loading || disabled} aria-busy={loading} {...buttonProps}>
      {loading && <span className="auth-spinner" aria-hidden="true" />}
      <span>{loading ? "Please wait..." : children}</span>
      {!loading && <span className="auth-submit-arrow" aria-hidden="true">→</span>}
    </button>
  );
}
