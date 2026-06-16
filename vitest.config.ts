import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    // 既定は node（src/lib の純ロジック/MSW テスト用）。コンポーネントテストは
    // 各ファイル先頭の `// @vitest-environment happy-dom` で DOM 環境を選ぶ。
    environment: "node",
    setupFiles: ["./vitest.setup.ts"],
  },
});
