import { useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { getStoreLink } from "../utils/storeLink.js";
import "./storeLinkCard.css";

export default function StoreLinkCard({ slug, compact = false }) {
  const [copyMessage, setCopyMessage] = useState("");
  const [downloadMessage, setDownloadMessage] = useState("");
  const qrRef = useRef(null);
  const link = getStoreLink(slug);
  const shareUrl = `https://wa.me/?text=${encodeURIComponent(`Visit my shop: ${link}`)}`;

  const copyLink = async () => {
    setDownloadMessage("");
    try {
      if (navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(link);
        } catch {
          const field = document.createElement("textarea");
          field.value = link;
          field.setAttribute("readonly", "");
          field.style.position = "fixed";
          field.style.opacity = "0";
          document.body.appendChild(field);
          field.select();
          const copied = document.execCommand("copy");
          field.remove();
          if (!copied) throw new Error("Copy failed");
        }
      } else {
        const field = document.createElement("textarea");
        field.value = link;
        field.setAttribute("readonly", "");
        field.style.position = "fixed";
        field.style.opacity = "0";
        document.body.appendChild(field);
        field.select();
        const copied = document.execCommand("copy");
        field.remove();
        if (!copied) throw new Error("Copy failed");
      }
      setCopyMessage("Copied");
    } catch {
      setCopyMessage("Copy didn’t work. Select and copy the link above.");
    }
  };

  const downloadQr = () => {
    setCopyMessage("");
    try {
      const canvas = qrRef.current?.querySelector("canvas");
      if (!canvas) throw new Error("QR code is not ready");
      const download = document.createElement("a");
      download.href = canvas.toDataURL("image/png");
      download.download = `${slug}-store-qr.png`;
      download.click();
      setDownloadMessage("QR code downloaded.");
    } catch {
      setDownloadMessage("The QR code could not be downloaded. Please try again.");
    }
  };

  return (
    <section className={`store-link-card${compact ? " store-link-card-compact" : ""}`} aria-labelledby={`store-link-title-${slug}`}>
      <div className="store-link-content">
        <p className="store-link-eyebrow">YOUR STORE IS LIVE</p>
        <h2 id={`store-link-title-${slug}`}>Your store link</h2>
        <p className="store-link-description">Share this link with customers so they can browse your shop.</p>
        <div className="store-link-controls">
          <input aria-label="Your store link" readOnly value={link} onFocus={(event) => event.target.select()} />
          <button className="store-link-button store-link-copy" type="button" onClick={copyLink}>Copy link</button>
        </div>
        <p className="store-link-live-message" role="status" aria-live="polite">{copyMessage || downloadMessage}</p>
        <div className="store-link-actions">
          <a className="store-link-button store-link-open" href={link} target="_blank" rel="noopener noreferrer">Open my store</a>
          <a className="store-link-button store-link-share" href={shareUrl} target="_blank" rel="noopener noreferrer">Share on WhatsApp</a>
        </div>
      </div>
      <div className="store-link-qr">
        <div className="store-link-qr-code" ref={qrRef}>
          <QRCodeCanvas value={link} size={132} level="M" includeMargin />
        </div>
        <p>Scan to open your shop</p>
        <button className="store-link-download" type="button" onClick={downloadQr}>Download PNG</button>
      </div>
    </section>
  );
}
