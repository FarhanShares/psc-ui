import { defineConfig } from 'vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import { nitro } from 'nitro/vite'

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  server: {
    host: true,          // listen on all interfaces — reachable from the LAN
    port: 3000,
    allowedHosts: true,  // accept IP and .local mDNS hostnames alike
  },
  plugins: [nitro(), tanstackStart(), viteReact()],
})

export default config
