import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";
import { MobileNav } from "@/components/layout/MobileNav";
import { Toaster } from "@/components/ui/sonner";
import { UserTracker } from "@/components/user-tracker";
import { Providers } from "@/components/providers";
import { ErrorBoundary } from "@/components/error-boundary";
import { ConnectionStatus } from "@/components/ui/realtime-status";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Advanced SEO Metadata
export const metadata: Metadata = {
  title: {
    default: "Kabadiwala - Sell Scrap from Home | Best Prices Guaranteed",
    template: "%s | Kabadiwala App"
  },
  description: "India's #1 scrap selling platform. Connect with verified Kabadiwalas near you. Get best prices for iron, plastic, paper, e-waste. Free doorstep pickup, instant cash payment.",
  keywords: [
    "kabadiwala",
    "scrap dealer",
    "sell scrap online",
    "scrap pickup",
    "raddi wala",
    "kabad",
    "scrap rates today",
    "iron scrap price",
    "plastic scrap buyer",
    "paper scrap",
    "e-waste recycling",
    "doorstep scrap pickup",
    "best scrap prices",
    "कबाड़ीवाला",
    "रद्दी",
    "कबाड़"
  ],
  authors: [{ name: "Kabadiwala App" }],
  creator: "Kabadiwala App",
  publisher: "Kabadiwala App",
  formatDetection: {
    email: false,
    address: false,
    telephone: true,
  },
  metadataBase: new URL("https://kabadiwala.app"),
  alternates: {
    canonical: "/",
    languages: {
      "en-IN": "/en",
      "hi-IN": "/hi",
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://kabadiwala.app",
    siteName: "Kabadiwala App",
    title: "Kabadiwala - Sell Your Scrap from Home",
    description: "Connect with verified Kabadiwalas. Best prices for iron, plastic, paper, e-waste. Free pickup, instant cash.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Kabadiwala App - Sell Scrap from Home",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kabadiwala - Sell Your Scrap from Home",
    description: "Connect with verified Kabadiwalas. Best prices for iron, plastic, paper, e-waste. Free pickup, instant cash.",
    images: ["/og-image.png"],
    creator: "@kabadiwalaapp",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  category: "business",
};

// Viewport configuration (separated from metadata in Next.js 14+)
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#10b981" },
    { media: "(prefers-color-scheme: dark)", color: "#059669" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

// JSON-LD Structured Data
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Kabadiwala App",
  description: "India's #1 scrap selling platform. Connect with verified Kabadiwalas near you.",
  url: "https://kabadiwala.app",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "INR",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    ratingCount: "1250",
  },
  creator: {
    "@type": "Organization",
    name: "Kabadiwala App",
    url: "https://kabadiwala.app",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Preconnect to external resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background`}
      >
        <Providers>
          <ErrorBoundary>
            <ConnectionStatus />
            <Header />
            <main className="pb-20 md:pb-0">{children}</main>
            <MobileNav />
            <Toaster />
            <UserTracker />
          </ErrorBoundary>
        </Providers>
        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(registration) {
                    console.log('ServiceWorker registration successful');
                  }, function(err) {
                    console.log('ServiceWorker registration failed: ', err);
                  });
                });
              }
            `
          }}
        />
      </body>
    </html>
  );
}

