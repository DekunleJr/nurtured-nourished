import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Montserrat, Playfair_Display } from "next/font/google";
import "./globals.css";
import SiteChrome from "@/components/SiteChrome";
import SkipLink from "@/components/SkipLink";
import Script from "next/script";
import { hasPhone, siteConfig } from "@/lib/site";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://nurturedandnourished.co.uk"
  ),
  title: {
    default:
      "Nurtured & Nourished Women's Health | Perinatal Education & Maternity Support",
    template: "%s | Nurtured & Nourished",
  },
  description: siteConfig.description,
  icons: { icon: "/Logo.png" },
  openGraph: {
    type: "website",
    locale: "en_GB",
    siteName: "Nurtured & Nourished",
    title: "Nurtured & Nourished Women's Health",
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title: "Nurtured & Nourished Women's Health",
    description: siteConfig.description,
  },
};

const gaId = process.env.NEXT_PUBLIC_GA_ID;

const structuredData = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Nurtured & Nourished Women's Health Ltd",
  description: siteConfig.description,
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://nurturedandnourished.co.uk",
  email: process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "hello@nurturedandnourished.co.uk",
  ...(hasPhone ? { telephone: siteConfig.phone } : {}),
  areaServed: "UK",
  serviceType: ["Perinatal Education", "Birth Preparation", "Postnatal Support", "Infant Feeding Support"],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${montserrat.variable} ${playfair.variable} h-full antialiased`}
    >
      <head>
        <Script
          id="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}');
              `}
            </Script>
          </>
        )}
      </head>
      <body className="min-h-full flex flex-col">
        <SkipLink />
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}

