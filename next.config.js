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
    ],
  },
}

module.exports = nextConfig
