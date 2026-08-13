import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    clearMocks: true,
    coverage: {
      enabled: false,
    },
    include: ["test/**/*.test.ts"],
    setupFiles: ["test/msw.ts"],
  },
});
