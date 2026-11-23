# Seznik Tracking (Next.js)

Customer order-tracking page. Same design/behaviour as the static version,
rebuilt as React. Backend (Cloudflare proxy Worker + Zoho function) is unchanged.

## Routes
- `/` — manual tracking box
- `/track/{AWB}` — auto-tracks that AWB (built-in dynamic route, no vercel.json rewrite needed)

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
  (e.g. https://seznik-tracking.vercel.app or https://track.seznik.in).
