import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllNews, getNewsYears } from '@/lib/content'
import { NewsCard } from '@/components/news-card'

export const metadata: Metadata = {
  title: 'Новини',
  description: 'Новини Центру професійного розвитку педагогічних працівників м. Лубни',
}

const PER_PAGE = 24

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ rik?: string; storinka?: string }>
}) {
  const params = await searchParams
  const years = getNewsYears()
  const activeYear = params.rik && years.includes(params.rik) ? params.rik : null
  const page = Math.max(1, Number.parseInt(params.storinka || '1', 10) || 1)

  const all = getAllNews()
  const filtered = activeYear ? all.filter((n) => n.date.startsWith(activeYear)) : all
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const current = Math.min(page, totalPages)
  const items = filtered.slice((current - 1) * PER_PAGE, current * PER_PAGE)

  const buildHref = (year: string | null, p: number) => {
    const q = new URLSearchParams()
    if (year) q.set('rik', year)
    if (p > 1) q.set('storinka', String(p))
    const qs = q.toString()
    return qs ? `/novyny?${qs}` : '/novyny'
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-heading text-3xl md:text-4xl font-bold mb-2">Новини</h1>
      <p className="text-muted-foreground mb-6">
        {activeYear ? `Публікації за ${activeYear} рік — ${filtered.length}` : `Усього публікацій — ${all.length}`}
      </p>

      {/* Фільтр за роками */}
      <nav aria-label="Фільтр за роками" className="flex flex-wrap gap-2 mb-8">
        <Link
          href={buildHref(null, 1)}
          className={`rounded-full px-4 py-1.5 text-sm font-medium border ${!activeYear ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border hover:border-primary'}`}
        >
          Усі роки
        </Link>
        {years.map((year) => (
          <Link
            key={year}
            href={buildHref(year, 1)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium border ${activeYear === year ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border hover:border-primary'}`}
          >
            {year}
          </Link>
        ))}
      </nav>

      {items.length === 0 ? (
        <p className="text-muted-foreground py-12 text-center">Публікацій не знайдено.</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <NewsCard key={item.slug} item={item} />
          ))}
        </div>
      )}

      {/* Пагінація */}
      {totalPages > 1 && (
        <nav aria-label="Пагінація" className="flex justify-center items-center gap-2 mt-10">
          {current > 1 && (
            <Link href={buildHref(activeYear, current - 1)} className="rounded-lg border border-border px-4 py-2 text-sm hover:border-primary">
              Попередня
            </Link>
          )}
          <span className="text-sm text-muted-foreground px-2">
            {`Сторінка ${current} з ${totalPages}`}
          </span>
          {current < totalPages && (
            <Link href={buildHref(activeYear, current + 1)} className="rounded-lg border border-border px-4 py-2 text-sm hover:border-primary">
              Наступна
            </Link>
          )}
        </nav>
      )}
    </main>
  )
}
