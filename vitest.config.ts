import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.spec.ts"],
    hookTimeout: 30_000,
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: ["src/**/*.ts"],
      exclude: [
        "src/**/*.spec.ts",
        "src/**/*.dto.ts",
        "src/**/*.schema.ts",
        "src/**/*.controller.ts",
        "src/**/*.repository.ts",
        "src/**/*.mapper.ts",
        "src/**/index.ts",
        "src/app/database/**",
        "src/app/config/**",
        "src/app/models/**",
        "src/app/@types/**",
        "src/app/routes/**",
        "src/index.ts",
        "src/test/**",
      ],
      thresholds: {
        statements: 40,
        branches: 40,
        functions: 40,
        lines: 40,
      },
    },
  },
});
