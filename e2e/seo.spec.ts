import { expect, test } from "@playwright/test";

const ROUTES: [string, string][] = [
  ["/", "Cortex — Intelligence for critical systems"],
  ["/products/workflo", "Workflo — Execution Assurance | Cortex"],
  ["/products/nexus", "Nexus — Operations Intelligence | Cortex"],
  ["/products/astra", "ASTRA — Mission Engineering | Cortex"],
  ["/case-study/northstar-health", "Northstar Health — A shared language for complexity | Cortex"],
  ["/platform", "Platform — One intelligence layer | Cortex"],
  ["/contact", "Contact — Talk to Cortex"],
];

for (const [path, title] of ROUTES) {
  test(`${path} has metadata`, async ({ page }) => {
    await page.goto(path);
    await expect(page).toHaveTitle(title);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /.+/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /cortex\.systems/);
  });
}

test("unknown route renders branded 404", async ({ page }) => {
  await page.goto("/does-not-exist");
  await expect(page).toHaveTitle("Page not found — Cortex");
  await expect(page.getByRole("heading").first()).toBeVisible();
});
