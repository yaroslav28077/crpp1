import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter, Manrope } from 'next/font/google'
import { getSiteSettings, getNavigation } from '@/lib/content'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { NetlifyIdentityRedirect } from '@/components/netlify-identity-redirect'
import './globals.css'

const inter = Inter({ subsets: ['latin', 'cyrillic'], variable: '--font-inter' })
const manrope = Manrope({ subsets: ['latin', 'cyrillic'], variable: '--font-manrope' })

export const metadata: Metadata = {
  title: {
    default: 'ЦПРПП м. Лубни — Центр професійного розвитку педагогічних працівників',
    template: '%s — ЦПРПП м. Лубни',
  },
  description:
    'Комунальна установа «Центр професійного розвитку педагогічних працівників Лубенської міської ради» Лубенського району Полтавської області',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#2b4a8b',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const settings = getSiteSettings()
  const navigation = getNavigation()

  return (
    <html lang="uk" className={`light bg-background ${inter.variable} ${manrope.variable}`}>
      <body className="antialiased font-sans flex min-h-svh flex-col">
        <NetlifyIdentityRedirect />
        <SiteHeader settings={settings} navigation={navigation} />
        <div className="flex-1">{children}</div>
        <SiteFooter settings={settings} navigation={navigation} />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
