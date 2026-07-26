import Link from 'next/link'
import { FileText, Megaphone } from 'lucide-react'
import { getAllNews, type PageBlock } from '@/lib/content'
import { markdownToHtml } from '@/lib/markdown'
import { slugify } from '@/lib/slug'
import { PhotoGallery } from '@/components/photo-gallery'
import { formatDateUk } from '@/components/news-card'

/**
 * Блоки з Markdown усередині (текст, оголошення, розділ) рендеряться
 * асинхронно, тому HTML готується наперед, а не в самому компоненті.
 */
async function renderMarkdown(blocks: PageBlock[]): Promise<Map<number, string>> {
  const html = new Map<number, string>()
  await Promise.all(
    blocks.map(async (block, i) => {
      if (block.type === 'text' || block.type === 'accordion' || block.type === 'notice') {
        html.set(i, await markdownToHtml(block.text))
      }
    }),
  )
  return html
}

export async function PageBlocks({ blocks }: { blocks: PageBlock[] }) {
  if (blocks.length === 0) return null
  const html = await renderMarkdown(blocks)
  const news = getAllNews()

  return (
    <div className="flex flex-col gap-6">
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'notice':
            return (
              <aside
                key={i}
                className="rounded-xl border border-accent bg-accent/10 p-5"
                aria-label={block.heading}
              >
                <p className="font-heading font-bold flex items-center gap-2 mb-2">
                  <Megaphone className="size-4 shrink-0" aria-hidden="true" />
                  {block.heading}
                </p>
                <div className="article-content" dangerouslySetInnerHTML={{ __html: html.get(i) ?? '' }} />
              </aside>
            )

          case 'text':
            return <div key={i} className="article-content" dangerouslySetInnerHTML={{ __html: html.get(i) ?? '' }} />

          case 'accordion':
            // Обгортка потрібна: стилі акордеонів у globals.css написані як
            // «.article-content details», тобто details має бути всередині
            return (
              <div key={i} className="article-content">
                <details>
                  <summary>{block.title}</summary>
                  <div dangerouslySetInnerHTML={{ __html: html.get(i) ?? '' }} />
                </details>
              </div>
            )

          case 'news_list': {
            // Редактор обирає новини зі списку, а підпис і дата беруться
            // з самої публікації — тож вони не розходяться з нею з часом
            // CMS зберігає назву файлу, а адреси в нас транслітеровані,
            // тож зіставляємо за тим самим правилом (див. lib/slug.ts)
            const items = block.items
              .map((ref) => {
                const key = slugify(String(ref).replace(/\.md$/, ''))
                return news.find((n) => n.slug === key)
              })
              .filter((n): n is NonNullable<typeof n> => Boolean(n))
            if (items.length === 0) return null
            return (
              <section key={i}>
                {block.title && <h2 className="font-heading text-xl font-bold mb-3">{block.title}</h2>}
                <ul className="flex flex-col gap-2">
                  {items.map((n) => (
                    <li key={n.slug} className="flex flex-col sm:flex-row sm:items-baseline sm:gap-3">
                      <time dateTime={n.date} className="text-xs text-muted-foreground shrink-0 sm:w-32">
                        {formatDateUk(n.date)}
                      </time>
                      <Link href={`/novyny/${n.slug}`} className="text-primary hover:underline underline-offset-2">
                        {n.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )
          }

          case 'documents':
            if (block.items.length === 0) return null
            return (
              <section key={i} className="rounded-xl border border-border bg-card p-5">
                <h2 className="font-heading font-bold mb-3 flex items-center gap-2">
                  <FileText className="size-4" aria-hidden="true" />
                  {block.title || 'Документи'}
                </h2>
                <ul className="flex flex-col gap-2">
                  {block.items.map((doc) => (
                    <li key={doc.url}>
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline underline-offset-2 text-sm"
                      >
                        {doc.label || doc.url}
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )

          case 'gallery':
            return <PhotoGallery key={i} items={block.images} title={block.title} />

          default:
            return null
        }
      })}
    </div>
  )
}
