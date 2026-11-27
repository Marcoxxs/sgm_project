import { defineConfig } from "vitest/config";

// Executado por `npm run test:rules` dentro do Firebase Emulator Suite.
export default defineConfig({
  test: {
    include: ["tests/rules/**/*.test.js"],
    environment: "node",
    testTimeout: 20000,
  },
});
