import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFile, mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const currentDir = dirname(fileURLToPath(import.meta.url))

function copyNetlifyRedirectsPlugin() {
  return {
    name: 'copy-netlify-redirects',
    async closeBundle() {
      const sourcePath = join(currentDir, '_redirects')
      const distDir = join(currentDir, 'dist')
      const targetPath = join(distDir, '_redirects')
      await mkdir(distDir, { recursive: true })
      await copyFile(sourcePath, targetPath)
    }
  }
}

export default defineConfig({
  plugins: [react(), copyNetlifyRedirectsPlugin()],
  publicDir: 'stitch',
  envPrefix: ['VITE_', 'JSONBIN_']
})
