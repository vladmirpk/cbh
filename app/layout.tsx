import type { Metadata } from "next";
import { Fraunces, Outfit } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces" });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "CBH | Consolidated Bricks & Hardware",
    template: "%s · CBH",
  },
  description:
    "Consolidated Bricks & Hardware supplies bricks, pavers, building materials and upcoming solar systems in Zimbabwe, with provisional quotes that include delivery.",
  keywords: [
    "bricks in Harare",
    "bricks suppliers Zimbabwe",
    "pavers Harare",
    "building materials Zimbabwe",
    "solar systems Zimbabwe",
    "solar batteries Zimbabwe",
    "building material delivery Harare",
  ],
  openGraph: {
    title: "Consolidated Bricks & Hardware",
    description: "Quote materials and delivery before you commit. Bricks, pavers and the next energy range.",
    locale: "en_ZW",
    siteName: "Consolidated Bricks & Hardware",
    type: "website",
  },
};

function Analytics() {
  const id = process.env.NEXT_PUBLIC_GA_ID;
  if (!id || !/^G-[A-Z0-9]+$/i.test(id)) return null;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${id}`} strategy="afterInteractive" />
      <Script id="cbh-ga" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${id}');`}
      </Script>
    </>
  );
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} ${fraunces.variable} antialiased`}>
        <a href="#content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-white focus:px-3 focus:py-2">
          Skip to content
        </a>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
