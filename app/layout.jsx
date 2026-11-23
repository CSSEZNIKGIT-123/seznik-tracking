import "./globals.css";

export const metadata = {
  title: "Track Your Order | Seznik",
  description: "Track your Seznik order shipment status.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
