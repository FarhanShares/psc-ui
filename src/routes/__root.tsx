import { HeadContent, Link, Scripts, createRootRoute, useRouter, type ErrorComponentProps } from '@tanstack/react-router'
import { Compass, RotateCcw } from 'lucide-react'

import { AppFrame } from '../components/nav'
import { SITE, absoluteUrl, seo } from '../lib/seo'

import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => {
    const base = seo({
      title: SITE.name,
      jsonLd: [
        {
          '@type': 'Organization',
          name: SITE.name,
          url: SITE.url,
          logo: absoluteUrl('/favicon.svg'),
        },
        {
          '@type': 'WebSite',
          name: SITE.name,
          url: SITE.url,
          potentialAction: {
            '@type': 'SearchAction',
            target: `${SITE.url}/search?q={search_term_string}`,
            'query-input': 'required name=search_term_string',
          },
        },
      ],
    })
    return {
      meta: [
        { charSet: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'theme-color', content: SITE.themeColor },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
        { name: 'apple-mobile-web-app-title', content: SITE.name },
        { name: 'format-detection', content: 'telephone=no' },
        ...base.meta,
      ],
      links: [
        { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/manifest.webmanifest' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=Figtree:wght@400..700&family=JetBrains+Mono:wght@400..600&display=swap',
        },
        { rel: 'stylesheet', href: appCss },
      ],
      scripts: base.scripts,
    }
  },
  component: AppFrame,
  shellComponent: RootDocument,
  notFoundComponent: NotFound,
  errorComponent: RouteError,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}

function NotFound() {
  return (
    <div className="page status-page">
      <span className="status-page__code num" aria-hidden>404</span>
      <h1 className="page-title">This page wandered off</h1>
      <p className="muted">The link may be old, or the page has moved. These usually help:</p>
      <div className="status-page__links">
        <Link to="/" className="btn btn--primary">Go home</Link>
        <Link to="/shop" className="btn btn--ghost">Shop supplies</Link>
        <Link to="/clinics" className="btn btn--ghost">Find a clinic</Link>
        <Link to="/help" className="btn btn--quiet">
          <Compass size={15} strokeWidth={1.75} /> Help centre
        </Link>
      </div>
      <title>Page not found · PetSafeCare</title>
      <meta name="robots" content="noindex" />
    </div>
  )
}

function RouteError({ error, reset }: ErrorComponentProps) {
  const router = useRouter()
  return (
    <div className="page status-page">
      <span className="status-page__code" aria-hidden>Oops</span>
      <h1 className="page-title">Something went wrong</h1>
      <p className="muted">Nothing you did — try again, and if it keeps happening let us know.</p>
      {import.meta.env.DEV && <pre className="status-page__err">{error instanceof Error ? error.message : String(error)}</pre>}
      <div className="status-page__links">
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => {
            reset()
            router.invalidate()
          }}
        >
          <RotateCcw size={15} strokeWidth={2} /> Try again
        </button>
        <Link to="/" className="btn btn--ghost">Go home</Link>
      </div>
    </div>
  )
}
