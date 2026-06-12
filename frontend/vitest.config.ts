import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // No test files exist yet — real tests are added in later steps.
    // passWithNoTests prevents vitest from exiting non-zero when the
    // test suite is empty, satisfying the A2 done-when check.
    passWithNoTests: true,
  },
});
