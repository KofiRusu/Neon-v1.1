/**
 * Example E2E test for Neon0.2
 */

import { test, expect } from '@playwright/test';

test.describe('Neon0.2 Application', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
  });

  test('should display homepage correctly', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Neon0\.2/);

    // Check main heading
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
    await expect(heading).toContainText('Welcome to Neon0.2');
  });

  test('should navigate between pages', async ({ page }) => {
    // Click navigation link
    await page.click('nav a[href="/about"]');

    // Verify navigation
    await expect(page).toHaveURL(/\/about$/);
    await expect(page.locator('h1')).toContainText('About');
  });

  test('should handle form submission', async ({ page }) => {
    // Navigate to contact form
    await page.goto('/contact');

    // Fill out form
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('textarea[name="message"]', 'This is a test message');

    // Submit form
    await page.click('button[type="submit"]');

    // Verify success message
    await expect(page.locator('.success-message')).toBeVisible();
    await expect(page.locator('.success-message')).toContainText('Thank you');
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check mobile navigation
    const mobileMenu = page.locator('.mobile-menu-toggle');
    await expect(mobileMenu).toBeVisible();

    // Test mobile menu functionality
    await mobileMenu.click();
    const navigation = page.locator('.mobile-navigation');
    await expect(navigation).toBeVisible();
  });

  test('should handle API interactions', async ({ page }) => {
    // Mock API response
    await page.route('**/api/data', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: { message: 'Test data' },
        }),
      });
    });

    // Navigate to page that uses API
    await page.goto('/dashboard');

    // Click button that triggers API call
    await page.click('button[data-testid="load-data"]');

    // Verify API data is displayed
    await expect(page.locator('[data-testid="api-data"]')).toContainText('Test data');
  });

  test('should handle error states gracefully', async ({ page }) => {
    // Mock API error response
    await page.route('**/api/data', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: 'Internal server error',
        }),
      });
    });

    // Navigate to page that uses API
    await page.goto('/dashboard');

    // Click button that triggers API call
    await page.click('button[data-testid="load-data"]');

    // Verify error message is displayed
    await expect(page.locator('.error-message')).toBeVisible();
    await expect(page.locator('.error-message')).toContainText('error');
  });

  test('should perform accessibility checks', async ({ page }) => {
    // Check for proper heading hierarchy
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    expect(headings.length).toBeGreaterThan(0);

    // Check for alt text on images
    const images = await page.locator('img').all();
    for (const img of images) {
      const alt = await img.getAttribute('alt');
      expect(alt).toBeTruthy();
    }

    // Check for form labels
    const inputs = await page.locator('input[type="text"], input[type="email"], textarea').all();
    for (const input of inputs) {
      const id = await input.getAttribute('id');
      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        await expect(label).toBeVisible();
      }
    }
  });
});
