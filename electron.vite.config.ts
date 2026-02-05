import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  root: path.join(__dirname),
  build: {
    lib: {
      entry: path.join(__dirname, 'electron', 'main.ts'),
      formats: ['cjs'],
      fileName: () => 'main.js',
    },
    outDir: path.join(__dirname, 'dist-electron'),
    emptyOutDir: true,
    rollupOptions: {
      external: ['electron'],
    },
  },
})
