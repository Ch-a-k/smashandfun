/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    // Явно задаём корень workspace, чтобы Next не "угадывал" его по чужим lockfile'ам
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'smashandfun.pl',
      },
      {
        protocol: 'https',
        hostname: 'pub-5d93ca85aa254770b92923b13711ceb3.r2.dev',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:all*(png|jpg|jpeg|webp|avif|svg|ico|gif|woff|woff2|ttf|otf|eot)',
        locale: false,
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/:all*(mp4|webm|mov)',
        locale: false,
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
