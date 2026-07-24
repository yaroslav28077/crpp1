import { unified } from "unified"
import remarkParse from "remark-parse"
import remarkGfm from "remark-gfm"
import remarkRehype from "remark-rehype"
import rehypeRaw from "rehype-raw"
import rehypeStringify from "rehype-stringify"

/**
 * Конвертує кастомний синтаксис <tabs X><tab Назва>...</tab></tabs>,
 * успадкований від TiddlyWiki, у доступні <details>/<summary> блоки.
 */
function convertTabs(md: string): string {
  let out = md.replace(/<tabs[^>]*>/g, '<div class="tab-group">').replace(/<\/tabs>/g, "</div>")
  out = out.replace(/<tab ([^>]+)>/g, (_m, label) => `<details class="tab-item"><summary>${String(label).trim()}</summary>\n<div class="tab-body">\n`)
  out = out.replace(/<\/tab>/g, "\n</div></details>")
  return out
}

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeRaw)
  .use(rehypeStringify)

export async function markdownToHtml(md: string): Promise<string> {
  const prepared = convertTabs(md)
  const result = await processor.process(prepared)
  return String(result)
}
