/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'smashandfun.pl',
      },
    ],
  },
}

module.exports = nextConfig
