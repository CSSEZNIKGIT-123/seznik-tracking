// Map product-name keywords -> image file in /public/products/
// The resolver matches the product name returned by the CRM against these keys
// (case-insensitive "contains"). Put MORE SPECIFIC keys FIRST — the first match wins.
// Fill in all 24 of your products. Example entries below.


const PRODUCT_IMAGE_MAP = [
  // A4 Printers
  {
    name: "A4 Lite Printer",
    keywords: ["a4 lite printer", "a4 lite"],
    image: "/products/a4-lite-printer.png",
  },
  {
    name: "A4 Pro HD Printer",
    keywords: ["a4 pro hd printer", "a4 pro hd"],
    image: "/products/a4-pro-hd-printer.png",
  },
  {
    name: "A4 Pro HD White Printer",
    keywords: ["a4 pro hd white", "a4 pro hd white printer"],
    image: "/products/a4-pro-hd-white.png",
  },
  {
    name: "A4 Pro HD+ Printer",
    keywords: ["a4 pro hd+ printer", "a4 pro+ hd printer"],
    image: "/products/a4-pro+hd-printer.png",
  },

  // Other Printers
  {
    name: "Dev Printer",
    keywords: ["dev printer"],
    image: "/products/dev-printer.png",
  },
  {
    name: "Dhruv Printer",
    keywords: ["dhruv printer"],
    image: "/products/dhruv-printer.png",
  },
  {
    name: "Echo Printer",
    keywords: ["echo printer"],
    image: "/products/echo-printer.png",
  },
  {
    name: "Eon Printer",
    keywords: ["eon printer"],
    image: "/products/eon-printer.png",
  },
  {
    name: "Josh Printer",
    keywords: ["josh printer"],
    image: "/products/josh-printer.png",
  },
  {
    name: "LabelX Printer",
    keywords: ["labelx printer", "label x printer"],
    image: "/products/labelx-printer.png",
  },
  {
    name: "Mini Printer",
    keywords: ["mini printer"],
    image: "/products/mini-printer.png",
  },
  {
    name: "NanoX Printer",
    keywords: ["nanox printer", "nano x printer"],
    image: "/products/nanox-printer.png",
  },
  {
    name: "Nexa Printer",
    keywords: ["nexa printer"],
    image: "/products/nexa-printer.png",
  },
  {
    name: "Neo Blue",
    keywords: ["neo blue printer", "neo blue"],
    image: "/products/neo-blue.png",
  },
  {
    name: "Neo Pink",
    keywords: ["neo pink printer", "neo pink"],
    image: "/products/neo-pink.png",
  },
  {
    name: "Nova Printer",
    keywords: ["nova printer", "nova-printer", "nova"],
    image: "/products/nova-prnter.png",
  },
  {
    name: "Rudra Printer",
    keywords: ["rudra printer"],
    image: "/products/rudra-printer.png",
  },
  {
    name: "Shakti Printer",
    keywords: ["shakti printer"],
    image: "/products/shakti-printer.png",
  },
  {
    name: "Tej Printer",
    keywords: ["tej printer"],
    image: "/products/tej-printer.png",
  },
  {
    name: "Tejas Printer",
    keywords: ["tejas printer"],
    image: "/products/tejas-printer.png",
  },
  {
    name: "Ved Printer",
    keywords: ["ved printer"],
    image: "/products/ved-printer.png",
  },
  {
    name: "Veer Printer",
    keywords: ["veer printer"],
    image: "/products/veer-printer.png",
  },

  // Vacuum Cleaners
  {
    name: "All In One Vacuum",
    keywords: ["all in one vacuum", "all-in-one vacuum"],
    image: "/products/all-in-one-vacuum.png",
  },
  {
    name: "Mighty Vacuum",
    keywords: ["mighty vacuum"],
    image: "/products/mighty-vacuum.png",
  },
  {
    name: "Mustangg Vacuum",
    keywords: ["mustangg car vacuum", "mustangg vacuum"],
    image: "/products/mustangg-vacuum.png",
  },
  {
    name: "Stark Vacuum",
    keywords: ["stark vacuum"],
    image: "/products/stark-vacuum.png",
  },

  {
    name: "Turbo Vacuum",
    keywords: ["turbo vacuum", "turbo-vacuum", "trubo vacuum", "trubo-vacuum"],
    image: "/products/turbo-vacuum.png",
  },

  // Label Printer
  {
    name: "Label Printer",
    keywords: ["label printer"],
    image: "/products/label-printer.png",
  },
];


// Returns the image path for a product name, or null if nothing matches
// (null => the timeline circle stays a plain blue dot).


export function productImage(productName) {
  const name = (productName || "").trim().toLowerCase();

  // Gift products use the animated gift box
  if (name.includes("gift")) {
    return null;
  }

  // Find a matching product image
  const matched = PRODUCT_IMAGE_MAP.find((product) =>
    product.keywords.some((keyword) =>
      name.includes(keyword.toLowerCase())
    )
  );

  // Unknown products use the animated gift box
  return matched ? matched.image : null;
}

