import { Children, isValidElement } from "react";
import { TopBar } from "../layout/TopBar.jsx";
import { Footer } from "../layout/Footer.jsx";

export function Page({ children, brand = "Aether", variant = "default", className, supportEmail = "support@aether.example" }) {
  const kids = Children.toArray(children).filter(isValidElement);
  const spaced = kids.map((child, index) => (
    <div key={child.key ?? index} className={index > 0 ? "mt-6" : ""}>
      {child}
    </div>
  ));

  const widthClass = variant === "narrow" ? "page-narrow" : variant === "auth" ? "page-auth" : "";
  const layoutClass = variant === "sidebar" ? "layout-main-sidebar" : variant === "sidebar-wide" ? "layout-main-sidebar-wide" : "";

  return (
    <div className={`page-wrapper ${className || ""}`}>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-surface focus:text-text focus:border focus:border-line focus:rounded-lg focus:shadow-sm focus:outline-2 focus:outline-accent text-sm font-semibold"
      >
        Skip to content
      </a>
      <TopBar brand={brand} />
      <main id="main-content" className={`page-content container-main page-section ${widthClass} ${layoutClass}`} tabIndex={-1}>
        {spaced}
      </main>
      <Footer supportEmail={supportEmail} className="footer-inner" />
    </div>
  );
}

Page.displayName = "Page";
