import { Inter } from "next/font/google";
import "./globals.css";

export const metadata = {
  title: "Track Your Order | Seznik",
  description: "Track your Seznik order shipment status.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.variable}>
        {children}
      </body>
    </html>
  );
}

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});