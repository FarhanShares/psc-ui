import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'

import { AppFrame } from '../components/nav'

import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1, viewport-fit=cover',
      },
      {
        name: 'theme-color',
        content: '#f7f8fa',
      },
      {
        name: 'description',
        content:
          'PetSafeCare — shop pet supplies, book clinic services, and keep vaccine dates in one place.',
      },
      { title: 'PetSafeCare' },
    ],
    links: [
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: '' },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=Figtree:wght@400..700&family=JetBrains+Mono:wght@400..600&display=swap',
      },
      { rel: 'stylesheet', href: appCss },
    ],
  }),
  component: AppFrame,
  shellComponent: RootDocument,
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
