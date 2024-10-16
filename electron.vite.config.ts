import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import { svelte, vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import path from 'path'


export default defineConfig(({ command, mode }) => {

    return {
        main: {
            plugins: [externalizeDepsPlugin()],
            build: {
                rollupOptions: {
                    input: path.resolve('./src/backend/main/electron/index.ts'),
                    output: {
                        format: 'es',
                        entryFileNames: '[name].mjs',
                        manualChunks(id) {
                            if (id.includes('node_modules')) {
                                return 'vendor'
                            }
                        }
                    }
                }
            },
            resolve: {
                alias: {
                    $root: path.resolve('./'),
                    $src: path.resolve('./src'),
                    $bridge: path.resolve('./src/bridge'),
                    $lib: path.resolve('./src/lib'),
                    $modules: path.resolve('./modules'),
                    '.prisma/client/index-browser': path.resolve('./node_modules/.prisma/client/index-browser.js')
                }
            },
        },
        preload: {
            plugins: [externalizeDepsPlugin()],
            build: {
                rollupOptions: {
                    input: path.resolve('./src/backend/main/electron/preload.ts'),
                    output: {
                        format: 'es'
                    }
                }
            }
        },
        renderer: {
            plugins: [
                svelte({
                    preprocess: vitePreprocess(),
                })
            ],
            root: path.resolve('./src/frontend'),
            build: {
                rollupOptions: {
                    input: path.resolve('./src/frontend/index.html')
                }
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
    }
})
