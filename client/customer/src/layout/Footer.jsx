import { Link } from "react-router-dom";
import { Icon } from "../ui/Icon.jsx";
 
export function Footer({ supportEmail = "aetherlystore@gmail.com", className }) {
  return (
    <footer className={`border-t border-line bg-surface ${className || ""}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-sm text-muted">
          <nav className="flex flex-wrap gap-6">
            <Link to="/" className="text-text hover:text-accent transition-colors">
              Shop
            </Link>
            <Link to="/orders/lookup" className="text-text hover:text-accent transition-colors">
              Order lookup
            </Link>
            <a href={`mailto:${supportEmail}`} className="text-text hover:text-accent transition-colors">
              Support
            </a>
            <a href="https://wa.me/message/KO52CCS5JKZND1" target="_blank" rel="noopener noreferrer" className="text-text hover:text-accent transition-colors flex items-center gap-1.5">
              <Icon name="messageCircle" size={14} /> WhatsApp
            </a>
            <a href="https://t.me/Aetherlystore" target="_blank" rel="noopener noreferrer" className="text-text hover:text-accent transition-colors flex items-center gap-1.5">
              <Icon name="send" size={14} /> Telegram
            </a>
          </nav>
          <p>© {new Date().getFullYear()} Aether. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}




