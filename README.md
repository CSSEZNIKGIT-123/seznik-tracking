# Seznik Tracking (Next.js)

Customer order-tracking page for the Seznik website. Rebuilt from the static
version as a React (Next.js) app with the same design and behaviour. The backend
(Cloudflare proxy Worker + Zoho Deluge function) is unchanged.

**Status:** Live at **https://track.seznik.in**

## How it works

Customer → this site (Next.js on Vercel) → `seznik-tracking-proxy` (Cloudflare
Worker) → Zoho `get_tracking` function (COQL read of the `Seznik_Automation`
module). The page only **reads** data by AWB and renders a status timeline —
it never writes to the CRM.

## Routes
- `/` — manual tracking box
- `/track/{AWB}` — auto-tracks that AWB (built-in dynamic route, no `vercel.json` rewrite needed)

## Run locally
```
npm install
npm run dev     # http://localhost:3000
```

## Deploy (Vercel)
Push this repo to GitHub → import in Vercel. Vercel auto-detects Next.js.
No `vercel.json` needed — `/track/[awb]` is a real route.

## Product images
- Drop images in `public/products/` (see that folder's README).
- Map each product name keyword to its image in `lib/productImages.js`.
- The matched image shows inside the active step's circle on the timeline.

## Config
- Proxy Worker URL is set in `components/TrackingApp.jsx` (`WORKER_URL`).
- The proxy Worker's `ALLOWED_ORIGIN` must match this site's domain
  (e.g. `https://seznik-tracking.vercel.app` or `https://track.seznik.in`).

## Custom domain
Point `track.seznik.in` to Vercel, then set the Worker's `ALLOWED_ORIGIN`
(and any link-building base) to `https://track.seznik.in`.

## Tracking-link expiry
For **closed** cases, the Zoho function keeps the tracking link active for
**15 days** after `issue_close_date`. After that the function returns an
"expired" response and the page shows the closed/expired state instead of
live tracking.

## Security
- Credentials never reach the browser: the Zoho API key lives **only** in the
  Cloudflare Worker secret, and the page talks only to the Worker.
- The flow is **read-only** — nothing on the page can change CRM data.
- Open item (not yet implemented): tracking links are public and AWB-based,
  so anyone with a valid AWB can *view* that shipment. A **signed token** in the
  link (a hash of AWB + a Worker-side secret, verified before returning data)
  would stop AWB guessing. Deferred for now.

## Project structure
```
app/
  page.jsx              # "/" — manual tracking
  track/[awb]/page.jsx  # "/track/{AWB}" — auto-track
  globals.css           # styles
components/
  TrackingApp.jsx       # UI + fetch to WORKER_URL (set here)
lib/
  productImages.js      # product-name → image mapping
public/
  products/             # product images (+ README)
```
