import { expect, test } from "@playwright/test";

test("hero carries the story", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /intelligence for critical systems/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /explore cortex/i })).toBeVisible();
});

test("flow stages are inspectable", async ({ page }) => {
  await page.goto("/");
  const simulation = page.getByRole("group", { name: "The intelligence layer", exact: true }).getByRole("button", { name: /simulation/i });
  await simulation.scrollIntoViewIfNeeded();
  await simulation.click();
  await expect(simulation).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("heading", { name: "Simulation", exact: true })).toBeVisible();
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
    await expect(page.getByRole("heading", { name: /intelligence for critical systems/i })).toBeVisible();
    await expect(page.locator(".cx-hero-field canvas")).toHaveCount(0);
    await expect(page.locator(".cx-hero-poster")).toBeVisible();
  });
});
