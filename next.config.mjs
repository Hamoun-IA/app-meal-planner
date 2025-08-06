/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuration pour Docker standalone
  output: 'standalone',
  
  // Configuration PWA
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/javascript; charset=utf-8',
          },
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json',
          },
        ],
      },
    ]
  },
  
  // Optimisations pour PWA
  experimental: {
    // optimizeCss: true, // Désactivé temporairement pour éviter les problèmes de build
  },
  
  // Compression et optimisations
  compress: true,
  
  // Images optimisées
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 jours
    unoptimized: true,
  },
  
  // Réécritures pour PWA
  async rewrites() {
    return [
      {
        source: '/sw.js',
        destination: '/sw.js',
      },
    ]
  },
  
  // ESLint and TypeScript configurations
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

export default nextConfig
