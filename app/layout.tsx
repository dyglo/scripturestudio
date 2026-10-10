import type { Metadata, Viewport } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Daily Scripture Studio — A little stillness. A deeper faith.",
  description:
    "A free, private space to create scripture art, reflect, and grow in faith. No account needed.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Scripture Studio",
    statusBarStyle: "default",
  },
  icons: { icon: "/icons/icon-192.png", apple: "/icons/icon-192.png" },
};
export const viewport: Viewport = {
  themeColor: "#f7f4ee",
  width: "device-width",
  initialScale: 1,
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
