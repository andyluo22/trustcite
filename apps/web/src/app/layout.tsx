import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "TrustCite",
    template: "%s · TrustCite",
  },
  description:
    "Trustworthy long-document QA with per-sentence citations, abstain, and trace.",
  applicationName: "TrustCite",
  metadataBase: new URL("https://trustcite.local"),
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png" }],
  },
  openGraph: {
    title: "TrustCite",
    description:
      "Trustworthy long-document QA with per-sentence citations, abstain, and trace.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TrustCite",
    description:
      "Trustworthy long-document QA with per-sentence citations, abstain, and trace.",
  },
};

export const viewport: Viewport = {
  themeColor: "#05070f",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={[
          geistSans.variable,
          geistMono.variable,
          "min-h-screen bg-[#05070f] text-white antialiased",
        ].join(" ")}
      >
        {children}
      </body>
    </html>
  );
}
