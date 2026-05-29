import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Allow builds to succeed while we fix TS errors progressively
    ignoreBuildErrors: true,
  },
  eslint: {
    // Allow builds to succeed while we set up ESLint properly
    ignoreDuringBuilds: true,
  },
  images: {
    // Prefer AVIF (≈20-30% smaller than WebP) with WebP fallback.
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

export default withNextIntl(nextConfig)
