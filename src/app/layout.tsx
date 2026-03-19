import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/config/site";
import Script from "next/script";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MuiThemeProvider from "@/components/providers/MuiThemeProvider";
import { JsonLdRealEstateAgent } from "@/components/seo/JsonLdRealEstateAgent";
import { CookieConsentBanner } from "@/components/CookieConsentBanner";
import { AnalyticsSender } from "@/components/AnalyticsSender";
import { getSiteConfig } from "@/services/properties";
import { getSaxApiBase } from "@/lib/sax-api";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? siteConfig.url;

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: baseUrl,
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    creator: siteConfig.social.twitter,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;
  const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
  const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

  let logoSrc: string | null = null;
  let faviconSrc: string | null = null;
  let footerContent: Record<string, unknown> | null = null;
  try {
    const config = await getSiteConfig();
    footerContent = config?.footerContent ?? null;
    const base = getSaxApiBase();
    if (config?.logoUrl && base) {
      logoSrc = `${base}${config.logoUrl.startsWith("/") ? config.logoUrl : `/${config.logoUrl}`}`;
    }
    if (config?.faviconUrl && base) {
      faviconSrc = `${base}${config.faviconUrl.startsWith("/") ? config.faviconUrl : `/${config.faviconUrl}`}`;
    }
  } catch {
    // ignora; Header usa logo padrão
  }

  return (
    <html lang="pt-BR">
      <head>
        <JsonLdRealEstateAgent />
        {faviconSrc ? <link rel="icon" href={faviconSrc} /> : null}
        {/* Google Tag Manager */}
        {GTM_ID ? (
          <Script id="gtm" strategy="afterInteractive">
            {`
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${GTM_ID}');
            `}
          </Script>
        ) : null}

        {/* Google Analytics (gtag.js) */}
        {GA_ID ? (
          <>
            <Script
              id="ga-src"
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}', { anonymize_ip: true });
              `}
            </Script>
          </>
        ) : null}

        {/* Meta Pixel */}
        {META_PIXEL_ID ? (
          <Script id="fb-pixel" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${META_PIXEL_ID}');
              fbq('track', 'PageView');
            `}
          </Script>
        ) : null}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
        suppressHydrationWarning
      >
          {GTM_ID ? (
            <noscript>
              <iframe
                src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
                height="0"
                width="0"
                style={{ display: "none", visibility: "hidden" }}
              />
            </noscript>
          ) : null}
        <MuiThemeProvider>
          <CookieConsentBanner />
          <AnalyticsSender />
          <Header logoSrc={logoSrc} />
          {/* Top mask to fade content under fixed header/menu */}
          {/* Solid cap under the fixed header (desktop/tablet only) */}
          <div className="pointer-events-none fixed inset-x-0 top-0 z-40 hidden h-12 bg-white dark:bg-zinc-900 md:block" />
          {/* Stronger fade below the cap (desktop/tablet only) */}
          <div className="pointer-events-none fixed inset-x-0 top-12 z-40 hidden h-24 bg-linear-to-b from-white/98 via-white/80 to-transparent dark:from-zinc-900 dark:via-zinc-900/85 md:block" />
          <main className="flex-1 pb-24">{children}</main>
          <Footer footerContent={footerContent} />
        </MuiThemeProvider>
      </body>
    </html>
  );
}
