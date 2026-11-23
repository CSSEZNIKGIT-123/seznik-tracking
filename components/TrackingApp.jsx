
"use client";

import { useEffect, useState, useCallback } from "react";
import { productImage } from "../lib/productImages";

const WORKER_URL = "https://seznik-tracking-proxy.cs-seznik.workers.dev";

const STAGES = [
  "Order Confirmed",
  "In Transit",
  "Out for Delivery",
  "Delivered",
];

export default function TrackingApp({ initialAwb = "" }) {
  const [awb, setAwb] = useState(initialAwb);
  const [status, setStatus] = useState("idle");
  const [data, setData] = useState(null);
  const [message, setMessage] = useState("");

  /* Dynamic WhatsApp Support Message */

  const getWhatsAppLink = () => {
    const phone = "918237869618";

    const shipment = status === "ok" ? data : null;

    const issueStatus = String(
      shipment?.issue_status || ""
    ).trim();

    const normalizedStatus = (
      issueStatus + " " + (shipment?.stage_label || "")
    )
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim();

    const isDelayed = normalizedStatus.includes("delay");
    const isCancelled = normalizedStatus.includes("cancel");

    const isPickup =
      normalizedStatus.includes("pickup") ||
      normalizedStatus.includes("pick up");

    const isDispatch =
      normalizedStatus.includes("dispatch");

    let issueMessage = "";

    if (isCancelled && isPickup) {
      issueMessage = "My shipment pickup has been cancelled.";
    } else if (isCancelled && isDispatch) {
      issueMessage = "My shipment dispatch has been cancelled.";
    } else if (isDelayed && isPickup) {
      issueMessage = "My shipment pickup has been delayed.";
    } else if (isDelayed && isDispatch) {
      issueMessage = "My shipment dispatch has been delayed.";
    } else if (isCancelled) {
      issueMessage = "My shipment has been cancelled.";
    } else if (isDelayed) {
      issueMessage = "My shipment has been delayed.";
    } else if (Number(shipment?.stage) === 4) {
      issueMessage =
        "I need assistance regarding my delivered shipment.";
    } else if (Number(shipment?.stage) === 2) {
      issueMessage =
        "I would like an update on my shipment in transit.";
    }

    const details = [
      shipment?.case_id
        ? `Case ID: ${shipment.case_id}`
        : "",

      shipment?.tracking_id
        ? `Tracking Number: ${shipment.tracking_id}`
        : "",

      shipment?.product
        ? `Product: ${shipment.product}`
        : "",

      issueStatus
        ? `Status: ${issueStatus}`
        : "",
    ]
      .filter(Boolean)
      .join("\n");

    const text = [
      "Hello Seznik Support,",
      "I need help with my shipment.",
      details,
      issueMessage,
      "Kindly assist me and provide an update.",
      "Thank you.",
    ]
      .filter(Boolean)
      .join("\n\n");

    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  };

  
  const track = useCallback(async (value) => {
    const n = (value || "").trim();

    if (!n) return;

    setStatus("loading");
    setData(null);
    setMessage("");

    // Start the 2-second timer immediately
    const animationDelay = new Promise((resolve) =>
      setTimeout(resolve, 2000)
    );

    try {
      // Fetch shipment details immediately
      const res = await fetch(
        `${WORKER_URL}/?awb=${encodeURIComponent(n)}`
      );

      if (!res.ok) {
        throw new Error(`API returned ${res.status}`);
      }

      const d = await res.json();

      // Wait only for the remaining animation time
      await animationDelay;

      
      // Expired tracking link
      if (d.expired === true) {
        setData(d);
        setStatus("expired");
        return;
      }

      // Invalid tracking number
      if (!d.found) {
        setMessage(d.message || "No shipment found.");
        setStatus("notfound");
        return;
      }


      setData(d);
      setStatus("ok");

    } catch (error) {
      await animationDelay;

      console.error("Tracking API error:", error);

      setMessage(
        "Unable to fetch shipment details. Please try again."
      );

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

    window.history.pushState(
      null,
      "",
      "/track/" + encodeURIComponent(n)
    );

    track(n);
  };

  return (
    <>
      {/* Navigation */}
      <header className="navbar">
        <a href="https://seznik.in" className="brand">
          <img
            src="https://seznik.in/cdn/shop/files/SEZNIK_LOGO-rec.webp?v=1786822463&width=250"
            alt="Seznik"
          />
        </a>

        <nav className="nav-links">
          <a href="https://seznik.in">Home</a>
          <a href="https://seznik.in/collections/all">
            Catalog
          </a>
        </nav>
      </header>

      <main className="main">
        <div className="container">

          {/* Hero Section */}
          <section className="hero">
            <HeroTruck />
            <div className="hero-eyebrow">SEAMLESS SHIPMENT TRACKING</div>
            <h1>Track Your <span>Order</span></h1>

            <p>
              Your order is on its way! Enter your tracking
              number below to check the latest shipment updates.
            </p>
          </section>

          {/* Tracking Form */}
          <section className="tracking-card">
            <div className="tracking-card-header">
              <div className="package-icon"><SupportIcon type="package" /></div>
              <div>
                <h2 className="card-heading">Where is your order?</h2>
                <p className="card-description">Enter your shipment tracking number below.</p>
              </div>
            </div>

            <form
              className="tracking-form"
              onSubmit={onSubmit}
            >
              <input
                id="awb"
                name="awb"
                className="tracking-input"
                type="text"
                value={awb}
                onChange={(e) => setAwb(e.target.value)}
                placeholder="Enter your AWB / tracking number"
                aria-label="Tracking number"
                autoComplete="off"
                maxLength={100}
              />

              <button
                className="track-btn"
                type="submit"
                disabled={status === "loading"}
              >
                {status === "loading"
                  ? "Checking..."
                  : "Track Order →"}
              </button>
            </form>

            {/* Tracking Result */}
            <div className="result" aria-live="polite">

              {status === "loading" && <TruckLoader />}

              {status === "notfound" && (
                <p className="message">{message}</p>
              )}

              {status === "error" && (
                <p className="message">
                  Something went wrong. Please try again.
                </p>
              )}

              {status === "expired" && data && (
                <ExpiredTracking d={data} />
              )}
              
              {status === "ok" && data && (
                <Result d={data} />
              )}

            </div>
          </section>

          {/* Customer Support */}
          <section className="support-section">
            <h2>We’re here to help.</h2>

            <p>
              Our support team is here to help you.
              Reach out to us for any questions regarding
              your shipment.
            </p>

            <div className="support-actions">
              <a
                href="tel:+918237869618"
                className="support-btn"
              >
                <SupportIcon type="phone" />
                Call Us
              </a>

              <a
                href={getWhatsAppLink()}
                className="support-btn"
                target="_blank"
                rel="noopener noreferrer"
              >
                <SupportIcon type="whatsapp" />
                WhatsApp
              </a>


              <a
                href="mailto:support@seznik.in"
                className="support-btn"
              >
                <SupportIcon type="email" />
                Email Support
              </a>
            </div>
          </section>

        </div>
      </main>

    </>
  );
}

/* ======================================
   SHIPMENT RESULT COMPONENT
   ====================================== */


function Result({ d }) {

  /* Shipment Exception */
  if (d.is_exception) {
    return (
      <div className="exception">
        {d.stage_label ||
          "Your shipment is currently on hold. Please contact support."}
      </div>
    );
  }

  /* Current Shipment Stage */
  const stage = Math.max(
    1,
    Math.min(4, Number(d.stage) || 1)
  );

  const isDelivered = stage === 4;

  /* Product Image or Gift Box */
  const isGift =
    d.is_gift === true ||
    String(d.product || "").toLowerCase().includes("gift");

  const img = isGift ? null : productImage(d.product);

  /* Timeline Progress */
  const progress = ((stage - 1) / 3) * 100;

  /* Clean Customer Name */
  const customerName = String(d.customer_name || "")
    .trim()
    .replace(/[,!]+$/, "")
    .trim();

  /* Shipment Information */
  const rows = [
    ["Product", d.product],
    ["Status", d.issue_status],
    ["Current Location", d.current_location],
    ["Expected Delivery", d.expected_delivery],
    ["Contact", d.contact_number],
    ["Reference ID", d.crm_record_id],
  ].filter(([, v]) => v);

  /* Courier Tracking Link */
  let courier = null;

  if (d.courier_link) {
    try {
      const u = new URL(d.courier_link);

      if (["https:", "http:"].includes(u.protocol)) {
        courier = (
          <a
            className="courier-link"
            href={u.href}
            target="_blank"
            rel="noopener noreferrer"
          >
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

      {/* Customer Greeting */}
      <div className="result-header">
        <p className="greeting">
          {customerName
            ? `Hello, ${customerName}!`
            : "Your Shipment Details"}
        </p>

        {d.case_id && (
          <p className="case-id">
            Case ID: {d.case_id}
          </p>
        )}
      </div>

      {/* Delivered Confirmation Banner */}
      {isDelivered && (
        <div className="delivered-banner">

          <div className="delivered-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12l4 4L19 6" />
            </svg>
          </div>

          <div className="delivered-content">
            <h3>Successfully Delivered</h3>
            <p>
              Your shipment has been delivered successfully.
            </p>
          </div>

          <span className="delivered-badge">
            Delivered
          </span>

        </div>
      )}

      {/* Shipment Timeline */}
      <div className="timeline-section">

        <div className="timeline-title">
          Shipment Progress
        </div>

        <div className="timeline">

          {/* Blue Progress Line */}
          <div
            className="timeline-progress"
            style={{ width: `${progress * 0.75}%` }}
          />

          {STAGES.map((label, i) => {
            const n = i + 1;

            const isCompleted = n < stage;
            const isCurrent = n === stage;

            const cls = isCompleted
              ? "done"
              : isCurrent
              ? "active"
              : "pending";

            return (
              <div
                className={`step ${cls}`}
                key={label}
                aria-current={
                  isCurrent ? "step" : undefined
                }
              >

                <div
                  className={`dot ${
                    isCurrent ? "has-product" : ""
                  }`}
                >

                  {/* Product image or animated gift box */}
                  {isCurrent && (
                    img ? (
                      <img
                        className="stage-product"
                        src={img}
                        alt={d.product || "Shipment product"}
                      />
                    ) : (
                      <GiftBox />
                    )
                  )}

                </div>

                <div className="step-label">
                  {label}
                </div>

              </div>
            );
          })}

        </div>
      </div>

      {/* Shipment Information */}
      <div className="details">

        <div className="details-title">
          Shipment Information
        </div>

        {rows.map(([k, v]) => (
          <div className="detail-row" key={k}>
            <b>{k}</b>
            <span>{v}</span>
          </div>
        ))}

      </div>

      {/* Courier Link */}
      {courier}

    </>
  );
}


/* ======================================
   ANIMATED TRUCK LOADER
   ====================================== */

function TruckLoader() {
  return (
    <div className="truck-loader" role="status">

      <div className="truck-animation" aria-hidden="true">

        {/* Moving speed lines */}
        <div className="truck-speed-lines">
          <span />
          <span />
          <span />
        </div>

        {/* Animated road */}
        <div className="truck-road" />

        {/* Delivery truck */}
        <svg
          className="loading-truck"
          viewBox="0 0 140 90"
          fill="none"
        >
          {/* Truck container */}
          <rect
            x="5"
            y="7"
            width="84"
            height="57"
            rx="7"
            fill="#1463ed"
          />

          {/* Truck cabin */}
          <path
            d="M89 24H110Q115 24 118 29L133 48V64H89Z"
            fill="#2563eb"
          />

          {/* Cabin window */}
          <path
            d="M98 31H110L122 47H98Z"
            fill="#dbeafe"
          />

          {/* Truck chassis */}
          <rect
            x="4"
            y="60"
            width="131"
            height="8"
            rx="3"
            fill="#1e3a8a"
          />

          {/* Seznik branding */}
          <text
            x="47"
            y="40"
            textAnchor="middle"
            fill="#ffffff"
            fontSize="16"
            fontWeight="800"
            letterSpacing="1"
          >
            SEZNIK
          </text>

          {/* Rear wheel */}
          <g className="truck-wheel">
            <circle
              cx="30"
              cy="68"
              r="13"
              fill="#1e293b"
            />
            <circle
              cx="30"
              cy="68"
              r="6"
              fill="#cbd5e1"
            />
            <path
              d="M30 63V73M25 68H35"
              stroke="#64748b"
              strokeWidth="2"
            />
          </g>

          {/* Front wheel */}
          <g className="truck-wheel">
            <circle
              cx="110"
              cy="68"
              r="13"
              fill="#1e293b"
            />
            <circle
              cx="110"
              cy="68"
              r="6"
              fill="#cbd5e1"
            />
            <path
              d="M110 63V73M105 68H115"
              stroke="#64748b"
              strokeWidth="2"
            />
          </g>

          {/* Headlight */}
          <rect
            x="127"
            y="51"
            width="8"
            height="5"
            rx="2"
            fill="#fbbf24"
          />

        </svg>
      </div>

      {/* Loading message */}
      <h3 className="truck-loader-title">
        Locating your shipment...
      </h3>

      <p className="truck-loader-description">
        Fetching the latest tracking updates.
      </p>

      {/* Animated loading dots */}
      <div className="truck-loading-dots" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

    </div>
  );
}



function GiftBox() {
  return (
    <svg
      className="animated-gift-box"
      viewBox="0 0 80 80"
      aria-hidden="true"
    >
      <g className="gift-body">

        {/* Gift box body */}
        <rect
          x="16"
          y="34"
          width="48"
          height="36"
          rx="5"
          fill="#2563eb"
        />

        {/* Golden ribbon */}
        <rect
          x="35"
          y="34"
          width="10"
          height="36"
          fill="#fbbf24"
        />

        {/* Moving lid */}
        <g className="gift-lid">

          <rect
            x="12"
            y="25"
            width="56"
            height="13"
            rx="4"
            fill="#60a5fa"
          />

          <rect
            x="35"
            y="25"
            width="10"
            height="13"
            fill="#fcd34d"
          />

          {/* Ribbon bow */}
          <path
            d="M40 25C8 25 23 0 40 25M40 25C72 25 57 0 40 25"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="5"
            strokeLinecap="round"
          />

        </g>
      </g>

      {/* Sparkles */}
      <path
        className="gift-sparkles"
        d="M9 8V20M3 14H15M69 3V15M63 9H75"
        stroke="#fbbf24"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}


/* =========================================
   EXPIRED TRACKING / CLOSED CASE
   ========================================= */

function ExpiredTracking({ d }) {

  const isPickup =
    String(d.shipment_type || "").toLowerCase() === "pickup";

  const normalizedStatus = String(d.issue_status || "")
    .toLowerCase()
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const isConfirmed =
    normalizedStatus === "closed customer confirmed";

  const closureMessage = isConfirmed
    ? isPickup
      ? "This case has been closed as the customer has confirmed that the package was successfully collected."
      : "This case has been closed as the customer has confirmed that the package was successfully delivered."
    : d.message ||
      "This case has been closed and the tracking link is no longer active.";

  const whatsappMessage = encodeURIComponent(
    `Hello Seznik Support, I have a query regarding my shipment.${
      d.case_id ? ` Case ID: ${d.case_id}.` : ""
    }`
  );

  const whatsappLink =
    `https://wa.me/918237869618?text=${whatsappMessage}`;

  return (
    <div className="expired-tracking">

      {/* Case Closure Banner */}
      <div className="delivered-banner expired-banner">

        <div className="delivered-icon">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M5 12l4 4L19 6" />
          </svg>
        </div>

        <div className="delivered-content">

          <h3>Case Successfully Closed</h3>

          <p>{closureMessage}</p>

          <p className="expired-note">
            This tracking link is no longer active.
          </p>

        </div>

        <span className="delivered-badge">
          Closed
        </span>

      </div>

      {/* Case Reference */}
      {d.case_id && (
        <div className="expired-case-id">
          Case ID: <strong>{d.case_id}</strong>
        </div>
      )}

      {/* Customer Support */}
      <div className="expired-support">

        <h3>Need further assistance?</h3>

        <p>
          If you have any queries or inquiries regarding
          your shipment, please contact us on WhatsApp.
        </p>

        <a
          className="expired-whatsapp"
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
        >

          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 2a9.8 9.8 0 0 0-8.5 14.7L2 22l5.5-1.4A10 10 0 1 0 12 2zm0 18a8 8 0 0 1-4.1-1.1l-.4-.2-3.2.8.9-3.1-.2-.4A8 8 0 1 1 12 20z"/>
            <path d="M9 7c-.2-.5-.4-.5-.7-.5h-.6c-.2 0-.6.1-.9.5-.3.3-1 1-1 2.4s1 2.8 1.2 3c.2.2 2 3.1 5 4.2 2.5 1 3 .6 3.6.6.6-.1 1.8-.8 2-1.5.3-.7.3-1.3.2-1.5-.1-.1-.3-.2-.6-.4l-2.1-1c-.3-.1-.5-.2-.7.2l-1 1.1c-.2.2-.4.2-.7.1-.3-.2-1.4-.5-2.5-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.5-.5.3-.5c.1-.2 0-.4 0-.6L9 7z"/>
          </svg>

          <span>+91 82378 69618</span>

          <span aria-hidden="true">↗</span>

        </a>

        <span className="expired-support-caption">
          Click to chat with our support team
        </span>

      </div>

    </div>
  );
}

function HeroTruck() {
  return (
    <div className="hero-truck" aria-hidden="true">
      <svg viewBox="0 0 260 120" fill="none">
        <ellipse cx="130" cy="104" rx="91" ry="6" fill="#cfdef0" />
        <g className="hero-truck-speed" stroke="#9bbef1" strokeWidth="3" strokeLinecap="round">
          <path d="M12 38H40M3 52H32M18 66H40" />
        </g>
        <g className="hero-truck-body">
          <rect x="42" y="15" width="119" height="66" rx="9" fill="white" stroke="#c5d9f4" strokeWidth="2" />
          <rect x="42" y="15" width="119" height="8" rx="4" fill="#2264dc" />
          <path d="M161 39H190L213 62V83H161Z" fill="#2463db" />
          <path d="M169 45H187L202 62H169Z" fill="#c4e7ff" />
          <rect x="38" y="77" width="178" height="10" rx="4" fill="#15366a" />
          <rect x="208" y="69" width="7" height="7" rx="2" fill="#fbbf24" />
          <image href="https://seznik.in/cdn/shop/files/SEZNIK_LOGO-rec.webp?v=1786822463&amp;width=250" x="52" y="31" width="99" height="34" preserveAspectRatio="xMidYMid meet" />
          {[72, 186].map((x) => (
            <g key={x} className="hero-truck-wheel">
              <circle cx={x} cy="86" r="14" fill="#1e293b" />
              <circle cx={x} cy="86" r="7" fill="#cbd5e1" />
              <path d={`M${x} 80V92M${x-6} 86H${x+6}`} stroke="#64748b" strokeWidth="2" />
            </g>
          ))}
        </g>
      </svg>
      <div className="hero-truck-road" />
    </div>
  );
}

function SupportIcon({ type }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {type === "package" && <path d="M3 7L12 2L21 7V17L12 22L3 17Z M3 7L12 12L21 7M12 12V22M7.5 4.5L16.5 9.5" />}
      {type === "phone" && <path d="M5 3H9L11 8L8 11Q10 15 14 17L17 14L22 16V20Q22 23 18 22Q3 18 2 6Q2 3 5 3Z" />}
      {type === "whatsapp" && <><path d="M3 21L4.5 16.5A9 9 0 1 1 8 20Z" /><path d="M8 7Q5 12 14 16Q17 17 17 13L14 12L12 14Q9 12 10 10Z" fill="currentColor" stroke="none" /></>}
      {type === "email" && <><rect x="2" y="4" width="20" height="16" rx="3" /><path d="M2 6L12 13L22 6" /></>}
    </svg>
  );
}
