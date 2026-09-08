import { expect, test } from "@playwright/test";

test("hero carries the story", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /seal the decision/i })).toBeVisible();
  await expect(page.getByRole("marquee")).toBeVisible();
  await expect(page.getByRole("link", { name: /explore the system/i })).toBeVisible();
});

test("flow stages are inspectable", async ({ page }) => {
  await page.goto("/");
  const forecast = page.getByRole("button", { name: /forecast/i });
  await forecast.scrollIntoViewIfNeeded();
  await forecast.click();
  await expect(page.getByRole("heading", { name: /002 — forecast/i })).toBeVisible();
});

test("systems link to product briefs", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /explore nexus/i }).click();
  await expect(page).toHaveURL(/\/products\/nexus/);
  await expect(page.getByRole("heading", { name: "Nexus", exact: true })).toBeVisible();
});

test("closing converts", async ({ page }) => {
  await page.goto("/");
  const cta = page.getByRole("link", { name: /talk to cortex/i }).last();
  await cta.scrollIntoViewIfNeeded();
  await expect(cta).toHaveAttribute("href", "/contact");
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("poster carries the hero without WebGL", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /seal the decision/i })).toBeVisible();
    await expect(page.locator(".cx-hero-field canvas")).toHaveCount(0);
    await expect(page.locator(".cx-hero-poster")).toBeVisible();
  });
});
