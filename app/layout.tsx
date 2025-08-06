import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { SettingsProvider } from "@/contexts/settings-context"
import { RecettesProvider } from "@/contexts/recettes-context"
import { ProduitsProvider } from "@/contexts/produits-context"
import { Toaster } from "@/components/ui/toaster"
import { PWAInstallPrompt } from "@/components/pwa-install-prompt"
import { PWAUpdatePrompt } from "@/components/pwa-update-prompt"
import { OfflineIndicator } from "@/components/offline-indicator"

const inter = Inter({ subsets: ["latin"] })

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#ec4899",
  colorScheme: "light",
}

export const metadata: Metadata = {
  title: "Assistante Babounette",
  description: "Ton assistante magique personnelle",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Babounette",
    startupImage: [
      {
        url: "/splash/apple-splash-1125-2436.svg",
        media:
          "(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
      },
      {
        url: "/splash/apple-splash-1242-2688.svg",
        media:
          "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
      },
      {
        url: "/splash/apple-splash-750-1334.svg",
        media:
          "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
      },
      {
        url: "/splash/apple-splash-828-1792.svg",
        media:
          "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
      },
    ],
  },
  applicationName: "Assistante Babounette",
  authors: [{ name: "Babounette Team" }],
  generator: "Next.js",
  keywords: ["assistante", "recettes", "courses", "calendrier", "productivité", "lifestyle"],
  referrer: "origin-when-cross-origin",
  creator: "Babounette Team",
  publisher: "Babounette",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://babounette.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://babounette.app",
    siteName: "Assistante Babounette",
    title: "Assistante Babounette - Ton assistante magique",
    description: "Ton assistante magique personnelle pour gérer tes recettes, courses, calendrier et plus encore !",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Assistante Babounette",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Assistante Babounette",
    description: "Ton assistante magique personnelle",
    images: ["/twitter-image.png"],
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
  verification: {
    google: "your-google-verification-code",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "Babounette",
    "msapplication-TileColor": "#ec4899",
    "msapplication-config": "/browserconfig.xml",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#ec4899" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Babounette" />
        <meta name="msapplication-TileColor" content="#ec4899" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.svg" />
        <link rel="icon" type="image/svg+xml" sizes="32x32" href="/icons/icon-32x32.svg" />
        <link rel="icon" type="image/svg+xml" sizes="16x16" href="/icons/icon-16x16.svg" />
        <link rel="mask-icon" href="/icons/safari-pinned-tab.svg" color="#ec4899" />
        <meta name="msapplication-TileImage" content="/icons/icon-144x144.svg" />
      </head>
      <body className={inter.className}>
        <SettingsProvider>
          <RecettesProvider>
            <ProduitsProvider>
              {children}
              <Toaster />
              <PWAInstallPrompt />
              <PWAUpdatePrompt />
              <OfflineIndicator />
            </ProduitsProvider>
          </RecettesProvider>
        </SettingsProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('Service Worker enregistré avec succès:', registration.scope);
                    })
                    .catch(function(error) {
                      console.log('Échec de l\'enregistrement du Service Worker:', error);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
