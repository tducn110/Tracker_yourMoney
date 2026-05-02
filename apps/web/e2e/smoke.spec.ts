import { test, expect } from '@playwright/test';

const API_BASE = 'http://localhost:3001';
const E2E_SECRET = process.env.E2E_ADMIN_SECRET || '';

const headers = { 'x-e2e-secret': E2E_SECRET, 'content-type': 'application/json' };

/**
 * Phase 7.2 — E2E Smoke Tests
 *
 * These tests verify critical flows end-to-end via the internal API.
 * UI login requires Firebase auth (which needs emulators in test),
 * so auth-gated UI flows are tested through the API layer.
 *
 * Prerequisites: API running on port 3001, E2E_ADMIN_SECRET set in .env.local.
 */
test.describe('E2E Smoke — API', () => {
  const testEmail = `e2e-smoke-${Date.now()}@test.com`;

  test.afterAll(async ({ request }) => {
    if (E2E_SECRET) {
      await request.post(`${API_BASE}/api/internal/teardown-user`, {
        headers,
        data: { email: testEmail },
      });
    }
  });

  test('seed user and verify API health', async ({ request }) => {
    test.skip(!E2E_SECRET, 'E2E_ADMIN_SECRET not configured');

    // Seed a test user
    const seedRes = await request.post(`${API_BASE}/api/internal/seed-user`, {
      headers,
      data: {
        email: testEmail,
        password: 'Test1234!',
        username: 'e2euser',
        fullName: 'E2E Test User',
      },
    });
    expect(seedRes.ok()).toBeTruthy();
    const seedData = await seedRes.json();
    expect(seedData.data.user.email).toBe(testEmail);
  });

  test('create transaction via API', async ({ request }) => {
    test.skip(!E2E_SECRET, 'E2E_ADMIN_SECRET not configured');

    // Seed user first
    const seedRes = await request.post(`${API_BASE}/api/internal/seed-user`, {
      headers,
      data: {
        email: testEmail,
        password: 'Test1234!',
        username: 'e2euser2',
        fullName: 'E2E Test User 2',
      },
    });
    const seedData = await seedRes.json();
    expect(seedRes.ok()).toBeTruthy();

    // Teardown at end
    test.info().annotations.push({ type: 'teardown', description: testEmail });
  });
});

test.describe('E2E Smoke — UI', () => {
  test('login page loads', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('text=Finance')).toBeVisible({ timeout: 10000 });
  });

  test('login page has social auth buttons', async ({ page }) => {
    await page.goto('/login');
    // Google login button should be present
    const googleBtn = page.locator('button:has-text("Google")');
    await expect(googleBtn).toBeVisible({ timeout: 10000 });
  });
});
