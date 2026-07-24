import type { MetadataRoute } from 'next'
import { getAllNews, getAllPages } from '@/lib/content'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://lubny-cprpp.netlify.app'

export default function sitemap(): MetadataRoute.Sitemap {
  const news = getAllNews()
  const pages = getAllPages()

  return [
    {
      url: BASE_URL,
      lastModified: news[0] ? new Date(news[0].date) : new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/novyny`,
      lastModified: news[0] ? new Date(news[0].date) : new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/komanda`,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    ...pages.map((p) => ({
      url: `${BASE_URL}/${p.slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...news.map((n) => ({
      url: `${BASE_URL}/novyny/${n.slug}`,
      lastModified: new Date(n.date),
      changeFrequency: 'yearly' as const,
      priority: 0.5,
    })),
  ]
}
