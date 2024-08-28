import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import resolve from "vite-plugin-resolve";
import path from "path"; // Import path module

const aztecVersion = "0.48.0";

export default defineConfig({
    plugins: [
        react(), // Add the react plugin here
        process.env.NODE_ENV === "production"
            ? /** @type {any} */ (
                resolve({
                    "@aztec/bb.js": `export * from "https://unpkg.com/@aztec/bb.js@${aztecVersion}/dest/browser/index.js"`,
                })
            )
            : undefined,
        nodePolyfills(),
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"), // Add the alias configuration here
        },
    },
    build: {
        target: "esnext",
    },
    optimizeDeps: {
        esbuildOptions: {
            target: "esnext",
        },
    },
});
