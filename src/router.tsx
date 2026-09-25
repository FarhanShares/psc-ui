import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

/**
 * A view transition that gets interrupted (another navigation starts first)
 * rejects its `ready` promise with "Transition was skipped". The router
 * doesn't observe that promise, so every fast double-tap logged an uncaught
 * error. Observing it here keeps the console honest; nothing else changes.
 */
let observing = false

function observeSkippedTransitions() {
  if (observing || typeof document === 'undefined' || typeof document.startViewTransition !== 'function') return
  observing = true
  const start = document.startViewTransition.bind(document) as (arg?: unknown) => ViewTransition
  const patched = (arg?: unknown) => {
    const transition = start(arg)
    transition.ready.catch(() => {})
    return transition
  }
  document.startViewTransition = patched as typeof document.startViewTransition
}

export function getRouter() {
  observeSkippedTransitions()
  const router = createTanStackRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
    // cross-fade between pages only: a filter tap or option change (same path,
    // new ?query) updates in place instead of fading the whole page
    defaultViewTransition: {
      types: ({ pathChanged }) => (pathChanged ? ['page'] : false),
    },
  })

  return router
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
