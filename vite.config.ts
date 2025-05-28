import { defineConfig } from "vite"
import react from "@vitejs/plugin-react-swc"
import framer from "vite-plugin-framer"

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react(), framer()],
    build: {
        target: "ES2022",
    },
    server: {
        port: 3000,
    },
})
