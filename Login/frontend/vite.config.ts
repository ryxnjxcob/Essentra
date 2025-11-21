import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    server: {
      port: 3000,
      host: "0.0.0.0",
      allowedHosts: ["jen-unmarbled-digressingly.ngrok-free.dev"],
    },
    plugins: [react()],
    define: {
      // Expose the new Zhipu key
      "process.env.ZHIPU_API_KEY": JSON.stringify(env.ZHIPU_API_KEY),
    },
    resolve: {
      alias: {
        "@": path.resolve(process.cwd(), "./src"),
      },
    },
  };
});
