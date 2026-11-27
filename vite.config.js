import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    // Os testes de Security Rules exigem o Firebase Emulator Suite e são executados
    // separadamente por `npm run test:rules`.
    exclude: ["**/node_modules/**", "**/dist/**", "tests/rules/**"],
  },
});
