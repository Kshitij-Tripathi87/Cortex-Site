import { expect, test } from "@playwright/test";

test("essential-only dismisses and persists", async ({ page }) => {
  await page.goto("/");
  const banner = page.getByRole("dialog", { name: /cookie/i });
  await expect(banner).toBeVisible();
  await page.getByRole("button", { name: /^essential only$/i }).click();
  await expect(banner).toBeHidden();
  await page.reload();
  await expect(banner).toBeHidden();
});

test("customize exposes equal-weight choices", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /^customize$/i }).click();
  await expect(page.getByRole("checkbox", { name: /analytics/i })).toBeVisible();
  await expect(page.getByRole("checkbox", { name: /marketing/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /^accept all$/i })).toBeVisible();
});
