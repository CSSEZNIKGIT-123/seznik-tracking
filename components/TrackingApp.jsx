"use client";

import { useEffect, useState, useCallback } from "react";
import { productImage } from "../lib/productImages";

const WORKER_URL = "https://seznik-tracking-proxy.cs-seznik.workers.dev";
const STAGES = ["Order Confirmed", "In Transit", "Out for Delivery", "Delivered"];

export default function TrackingApp({ initialAwb = "" }) {
  const [awb, setAwb] = useState(initialAwb);
  const [status, setStatus] = useState("idle"); // idle | loading | ok | notfound | error
  const [data, setData] = useState(null);
  const [message, setMessage] = useState("");

  const track = useCallback(async (value) => {
    const n = (value || "").trim();
    if (!n) return;
    setStatus("loading");
    try {
      const res = await fetch(WORKER_URL + "?awb=" + encodeURIComponent(n));
      const d = await res.json();
      if (!d.found) {
        setMessage(d.message || "No shipment found.");
        setStatus("notfound");
        return;
      }
      setData(d);
      setStatus("ok");
    } catch (e) {
      console.error("Tracking API error:", e);
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    if (initialAwb) track(initialAwb);
  }, [initialAwb, track]);

  const onSubmit = (e) => {
    e.preventDefault();
    const n = awb.trim();
    if (!n) return;
    window.history.pushState(null, "", "/track/" + encodeURIComponent(n));
    track(n);
  };

  return (
    <>
      <header className="navbar">
        <a href="https://seznik.in" className="brand">
          <img
            src="https://seznik.in/cdn/shop/files/SEZNIK_LOGO-rec.webp?v=1786822463&width=250"
            alt="Seznik"
          />
        </a>
        <nav className="nav-links">
          <a href="https://seznik.in">Home</a>
          <a href="https://seznik.in/collections/all">Catalog</a>
        </nav>
      </header>

      <main className="main">
        <div className="container">
          <section className="hero">
            <div className="hero-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 7h11v12H3z" />
                <path d="M14 11h4l3 3v5h-7z" />
                <circle cx="7.5" cy="19" r="2" />
                <circle cx="17.5" cy="19" r="2" />
                <path d="M3 10h8" />
              </svg>
            </div>
            <h1>Track Your Order</h1>
            <p>Your order is on its way! Enter your tracking number below to check the latest shipment updates.</p>
          </section>

          <section className="tracking-card">
            <h2 className="card-heading">Where is your order?</h2>
            <form className="tracking-form" onSubmit={onSubmit}>
              <input
                id="awb"
                name="awb"
                className="tracking-input"
                type="text"
                value={awb}
                onChange={(e) => setAwb(e.target.value)}
                placeholder="Enter your tracking number"
                autoComplete="off"
                maxLength={100}
              />
              <button className="track-btn" type="submit" disabled={status === "loading"}>
                {status === "loading" ? "Checking..." : "Track Order →"}
              </button>
            </form>

            <div className="result" aria-live="polite">
              {status === "loading" && <p className="message">Checking your shipment details...</p>}
              {status === "notfound" && <p className="message">{message}</p>}
              {status === "error" && <p className="message">Something went wrong. Please try again.</p>}
              {status === "ok" && data && <Result d={data} />}
            </div>
          </section>

          <section className="support-section">
            <h2>Need Help With Your Order?</h2>
            <p>Our support team is here to help you. Reach out to us for any questions regarding your shipment.</p>
            <div className="support-actions">
              <a href="tel:+918237869618" className="support-btn">Call Us</a>
              <a href="https://wa.me/918237869618" className="support-btn" target="_blank" rel="noopener noreferrer">WhatsApp</a>
              <a href="mailto:support@seznik.in" className="support-btn">Email Support</a>
            </div>
          </section>
        </div>
      </main>

      <footer className="footer">
        <a href="https://seznik.in" aria-label="Seznik home">
          <img
            src="https://seznik.in/cdn/shop/files/SEZNIK_LOGO-rec.webp?v=1786822463&width=250"
            alt="Seznik"
          />
        </a>
      </footer>
    </>
  );
}

function Result({ d }) {
  if (d.is_exception) {
    return (
      <div className="exception">
        {d.stage_label || "Your shipment is currently on hold. Please contact support."}
      </div>
    );
  }

  const stage = Math.max(1, Math.min(4, Number(d.stage) || 1));
  const img = productImage(d.product);
  const progress = Math.max(0, Math.min(100, ((stage - 1) / 3) * 82));

  const rows = [
    ["Product", d.product],
    ["Status", d.issue_status],
    ["Current Location", d.current_location],
    ["Expected Delivery", d.expected_delivery],
    ["Contact", d.contact_number],
    ["Reference ID", d.crm_record_id],
  ].filter(([, v]) => v);

  let courier = null;
  if (d.courier_link) {
    try {
      const u = new URL(d.courier_link);
      if (["https:", "http:"].includes(u.protocol)) {
        courier = (
          <a className="courier-link" href={u.href} target="_blank" rel="noopener noreferrer">
            View on Courier Website ↗
          </a>
        );
      }
    } catch (e) {
      courier = null;
    }
  }

  return (
    <>
      <div className="result-header">
        <p className="greeting">{d.customer_name ? `Hello, ${d.customer_name}!` : "Your Shipment Details"}</p>
        {d.case_id ? <p className="case-id">Case ID: {d.case_id}</p> : null}
      </div>

      <div className="timeline-section">
        <div className="timeline-title">Shipment Progress</div>
        <div className="timeline">
          <div className="timeline-progress" style={{ width: progress + "%" }} />
          {STAGES.map((label, i) => {
            const n = i + 1;
            const cls = n < stage ? "done" : n === stage ? "active" : "";
            return (
              <div className={`step ${cls}`} key={label}>
                <div className="dot">
                  {n === stage && img ? <img src={img} alt={d.product || ""} /> : null}
                </div>
                <div className="step-label">{label}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="details">
        <div className="details-title">Shipment Information</div>
        {rows.map(([k, v]) => (
          <div className="detail-row" key={k}>
            <b>{k}</b>
            <span>{v}</span>
          </div>
        ))}
      </div>

      {courier}
    </>
  );
}
