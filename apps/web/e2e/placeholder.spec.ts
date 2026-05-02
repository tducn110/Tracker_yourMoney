import { test, expect } from "@playwright/test";

test.describe("app", () => {
  test("placeholder — test suite is configured", async () => {
    // E2E tests will be added in Phase 7 (Testing).
    // This placeholder ensures the test suite has at least one test
    // so `pnpm test` does not fail with "No tests found".
    expect(true).toBe(true);
  });
});
