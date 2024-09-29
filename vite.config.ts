import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    base: mode === 'electron' ? './' : '/',
    plugins: [svelte({
      preprocess: vitePreprocess(),
    })],
    root: mode === 'test' ? './src/' : './src/frontend',
    build: {
      outDir: path.resolve('./dist/src/frontend')
    },
    resolve: {
      alias: {
        $src: path.resolve("./src"),
        $lib: path.resolve("./src/lib"),
        $bridge: path.resolve("./src/bridge")
      }
    },
    publicDir: path.resolve("./static")
  }
})
