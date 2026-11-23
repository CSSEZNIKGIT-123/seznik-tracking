// Map product-name keywords -> image file in /public/products/
// The resolver matches the product name returned by the CRM against these keys
// (case-insensitive "contains"). Put MORE SPECIFIC keys FIRST — the first match wins.
// Fill in all 24 of your products. Example entries below.

const PRODUCT_IMAGE_MAP = [
  // keyword (lowercase)            image path
  ["mustangg car vacuum", "/products/mustangg-car-vacuum.png"],
  ["car vacuum",          "/products/car-vacuum.png"],
  ["vacuum",              "/products/vacuum.png"],
  ["mini printer",        "/products/mini-printer.png"],
  ["label printer",       "/products/label-printer.png"],
  ["a4 printer",          "/products/a4-printer.png"],
  ["printer",             "/products/printer.png"],
  // ... add the rest of your 24 products here
];

// Returns the image path for a product name, or null if nothing matches
// (null => the timeline circle stays a plain blue dot).
export function productImage(name) {
  const n = (name || "").toLowerCase();
  for (const [key, path] of PRODUCT_IMAGE_MAP) {
    if (n.includes(key)) return path;
  }
  return null;
}
