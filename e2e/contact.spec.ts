import { expect, test } from "@playwright/test";

test("empty submit surfaces validation", async ({ page }) => {
  await page.goto("/contact");
  await page.getByRole("button", { name: /send message/i }).click();
  await expect(page.locator(".contact-fields small").first()).toBeVisible();
});

test("valid submit resolves gracefully", async ({ page }) => {
  await page.goto("/contact");
  await page.getByLabel("Name", { exact: true }).fill("Ada Operator");
  await page.getByLabel("Work email").fill("ada@example.com");
  await page.getByRole("textbox", { name: "Company", exact: true }).fill("Example Systems");
  await page.getByLabel("What would you like to discuss?").selectOption({ index: 1 });
  await page.getByLabel("What are you working on?").fill("Our handoffs need proof before the next audit window.");
  await page.getByRole("button", { name: /send message/i }).click();
  // Against the full stack this succeeds; against UI-only servers it must fail gracefully.
  await expect(page.locator(".contact-success, [role='alert']")).toBeVisible({ timeout: 15_000 });
});
