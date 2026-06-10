import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";
export default defineConfig(({ mode }) => {
    return {
        plugins: [react()],
        root: "./",
        base: mode == "deploy" ? "/emotionalHome/" : "./",
        resolve: {
            alias: {
                "@": fileURLToPath(new URL("./src", import.meta.url)),
                "@styles": fileURLToPath(new URL("./src/styles", import.meta.url)),
                "@components": fileURLToPath(new URL("./src/components", import.meta.url)),
                "@pages": fileURLToPath(new URL("./src/pages", import.meta.url)),
                "@store": fileURLToPath(new URL("./src/store", import.meta.url)),
                "@data": fileURLToPath(new URL("./src/data", import.meta.url)),
                "@utils": fileURLToPath(new URL("./src/utils", import.meta.url)),
                "@hooks": fileURLToPath(new URL("./src/hooks", import.meta.url)),
                "@api": fileURLToPath(new URL("./src/api", import.meta.url)),
            },
        },
        css: {
            preprocessorOptions: {
                scss: {
                    additionalData: `@import "@styles/variables.scss";`,
                },
            },
        },
        server: {
            host: "0.0.0.0",
            port: 5173,
        },
        build: {
            rollupOptions: {
                output: {
                    manualChunks: {
                        'react-vendor': ['react', 'react-dom', 'react-router-dom'],
                        'state-vendor': ['zustand'],
                        'db-vendor': ['idb'],
                    },
                },
            },
        },
    };
});
