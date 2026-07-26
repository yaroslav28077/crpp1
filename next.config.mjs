/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      // Next прибирає кінцевий слеш, тому /admin/ -> 308 -> /admin, а /admin
      // перехоплював катч-ол app/[slug] і віддавав 404 — адмінка була
      // недоступна. Віддаємо статичний index.html CMS напряму.
      { source: '/admin', destination: '/admin/index.html' },
    ]
  },
}

export default nextConfig
