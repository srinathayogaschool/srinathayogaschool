/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'drugsksmjtikipxknlwz.supabase.co' },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

export default nextConfig
