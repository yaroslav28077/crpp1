import fs from "fs"
import path from "path"
import matter from "gray-matter"
import * as yaml from "js-yaml"

const CONTENT_DIR = path.join(process.cwd(), "content")

export interface GalleryItem {
  image: string
  caption?: string
}

export interface AttachmentItem {
  label: string
  file: string
}

export interface NewsItem {
  slug: string
  title: string
  date: string
  description?: string
  cover?: string
  tags: string[]
  gallery: GalleryItem[]
  attachments: AttachmentItem[]
  body: string
  seo_title?: string
  seo_description?: string
}

export interface PageItem {
  slug: string
  title: string
  section?: string
  body: string
  gallery: GalleryItem[]
  attachments: AttachmentItem[]
  seo_title?: string
  seo_description?: string
}

export interface TeamMember {
  name: string
  position: string
  photo?: string
  order: number
  bio?: string
}

export interface NavItem {
  label: string
  url: string
}

export interface NavSection {
  title: string
  items: NavItem[]
}

export interface SiteSettings {
  site_name: string
  site_short_name: string
  site_description: string
  logo?: string
  address?: string
  map_url?: string
  phones: string[]
  email?: string
  consultation_url?: string
  schedule: { days: string; hours: string }[]
  partners: { name: string; image?: string; url?: string }[]
}

function readMd(dir: string) {
  const full = path.join(CONTENT_DIR, dir)
  if (!fs.existsSync(full)) return []
  return fs
    .readdirSync(full)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const raw = fs.readFileSync(path.join(full, f), "utf-8")
      const { data, content } = matter(raw)
      return { file: f, data, content }
    })
}

// Кешуємо лише в продакшні: у дев-режимі редактор має бачити нові файли одразу
const isProd = process.env.NODE_ENV === "production"

let newsCache: NewsItem[] | null = null

export function getAllNews(): NewsItem[] {
  if (isProd && newsCache) return newsCache
  const items = readMd("news").map(({ file, data, content }) => {
    const gallery: GalleryItem[] = Array.isArray(data.gallery) ? data.gallery.filter((g: GalleryItem) => g?.image) : []
    return {
      slug: file.replace(/\.md$/, ""),
      title: String(data.title || file),
      date: data.date ? new Date(data.date).toISOString() : "1970-01-01T00:00:00.000Z",
      description: data.description ? String(data.description) : undefined,
      cover: data.cover ? String(data.cover) : gallery[0]?.image,
      tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
      gallery,
      attachments: Array.isArray(data.attachments) ? data.attachments : [],
      body: content,
      seo_title: data.seo_title,
      seo_description: data.seo_description,
    }
  })
  items.sort((a, b) => (a.date < b.date ? 1 : -1))
  newsCache = items
  return items
}

export function getNewsBySlug(slug: string): NewsItem | undefined {
  return getAllNews().find((n) => n.slug === slug)
}

export function getNewsYears(): string[] {
  const years = new Set(getAllNews().map((n) => n.date.slice(0, 4)))
  return Array.from(years).sort((a, b) => (a < b ? 1 : -1))
}

let pagesCache: PageItem[] | null = null

export function getAllPages(): PageItem[] {
  if (isProd && pagesCache) return pagesCache
  pagesCache = readMd("pages").map(({ file, data, content }) => ({
    slug: String(data.slug || file.replace(/\.md$/, "")),
    title: String(data.title || file),
    section: data.section ? String(data.section) : undefined,
    body: content,
    gallery: Array.isArray(data.gallery) ? data.gallery.filter((g: GalleryItem) => g?.image) : [],
    attachments: Array.isArray(data.attachments) ? data.attachments : [],
    seo_title: data.seo_title,
    seo_description: data.seo_description,
  }))
  return pagesCache
}

export function getPageBySlug(slug: string): PageItem | undefined {
  return getAllPages().find((p) => p.slug === slug)
}

export function getTeam(): TeamMember[] {
  return readMd("team")
    .map(({ data, content }) => ({
      name: String(data.name || ""),
      position: String(data.position || ""),
      photo: data.photo ? String(data.photo) : undefined,
      order: Number(data.order ?? 99),
      bio: content.trim() || undefined,
    }))
    .sort((a, b) => a.order - b.order)
}

function readYaml<T>(file: string, fallback: T): T {
  const full = path.join(CONTENT_DIR, "settings", file)
  if (!fs.existsSync(full)) return fallback
  return (yaml.load(fs.readFileSync(full, "utf-8")) as T) ?? fallback
}

export function getSiteSettings(): SiteSettings {
  const raw = readYaml<Partial<SiteSettings>>("site.yml", {})
  return {
    site_name: raw.site_name || "Центр професійного розвитку педагогічних працівників",
    site_short_name: raw.site_short_name || "ЦПРПП м. Лубни",
    site_description: raw.site_description || "",
    logo: raw.logo,
    address: raw.address,
    map_url: raw.map_url,
    phones: raw.phones || [],
    email: raw.email,
    consultation_url: raw.consultation_url,
    schedule: raw.schedule || [],
    partners: raw.partners || [],
  }
}

export function getNavigation(): NavSection[] {
  const raw = readYaml<{ sections?: NavSection[] }>("navigation.yml", {})
  return raw.sections || []
}
