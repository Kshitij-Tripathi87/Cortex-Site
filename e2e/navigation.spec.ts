import { expect, test } from "@playwright/test";

test("desktop nav reaches key routes", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Platform" }).click();
  await expect(page).toHaveURL(/\/platform/);
});

test("product menu lists three systems", async ({ page }) => {
  await page.goto("/");
  const products = page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: /products/i });
  await products.hover();
  await expect(page.getByRole("menuitem", { name: /workflo/i })).toBeVisible();
  await expect(page.getByRole("menuitem", { name: /nexus/i })).toBeVisible();
  await expect(page.getByRole("menuitem", { name: /astra/i })).toBeVisible();
});

test.describe("mobile nav", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("burger opens full-screen menu", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /open navigation/i }).click();
    const dialog = page.getByRole("dialog", { name: /site navigation/i });
    await expect(dialog).toBeVisible();
    await dialog.getByRole("link", { name: /solutions/i }).click();
    await expect(page).toHaveURL(/\/solutions/);
  });
});

test("footer reopens consent preferences", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /^essential only$/i }).click();
  const prefs = page.getByRole("button", { name: /cookie preferences/i });
  await prefs.scrollIntoViewIfNeeded();
  await prefs.click();
  await expect(page.getByRole("dialog", { name: /cookie/i })).toBeVisible();
});
