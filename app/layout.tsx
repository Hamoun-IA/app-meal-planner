import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { SettingsProvider } from "@/contexts/settings-context"
import { RecettesProvider } from "@/contexts/recettes-context"
import { ProduitsProvider } from "@/contexts/produits-context"

const inter = Inter({ subsets: ["latin"] })

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
        url: "/splash/apple-splash-2048-2732.png",
        media:
          "(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
      },
      {
        url: "/splash/apple-splash-1668-2388.png",
        media:
          "(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
      },
      {
        url: "/splash/apple-splash-1536-2048.png",
        media:
          "(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
      },
      {
        url: "/splash/apple-splash-1125-2436.png",
        media:
          "(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
      },
      {
        url: "/splash/apple-splash-1242-2688.png",
        media:
          "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
      },
      {
        url: "/splash/apple-splash-750-1334.png",
        media:
          "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
      },
      {
        url: "/splash/apple-splash-828-1792.png",
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
  metadataBase: new URL("https://babounette.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://babounette.app",
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
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ec4899" },
    { media: "(prefers-color-scheme: dark)", color: "#ec4899" },
  ],
  colorScheme: "light",
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <head>
        {/* PWA Meta Tags */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Babounette" />
        <meta name="msapplication-TileColor" content="#ec4899" />
        <meta name="msapplication-config" content="/browserconfig.xml" />

        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" />
        <link rel="mask-icon" href="/icons/safari-pinned-tab.svg" color="#ec4899" />
        <link rel="shortcut icon" href="/favicon.ico" />

        {/* Preload critical resources */}
        <link rel="preload" href="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/11L-Clic_de_bouton_girly-1754003907888-JLmi4woLnORJ8q2N7JzYlWZDfsP6Tv.mp3" as="audio" type="audio/mpeg" />
        <link rel="preload" href="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/girlyclick-m35wgd6n66cyCgXLprXDMXMNnmyAQY.mp3" as="audio" type="audio/mpeg" />
        <link rel="preload" href="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/fairyclick-hndPdZFszE6Klei4r4ySyWDfckMVR2.mp3" as="audio" type="audio/mpeg" />

        {/* DNS Prefetch */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
      </head>
      <body className={inter.className}>
        <SettingsProvider>
          <RecettesProvider>
            <ProduitsProvider>{children}</ProduitsProvider>
          </RecettesProvider>
        </SettingsProvider>
      </body>
    </html>
  )
}
