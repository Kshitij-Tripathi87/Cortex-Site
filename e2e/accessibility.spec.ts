import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.use({ reducedMotion: "reduce" });
for (const path of [
  "/",
  "/products",
  "/products/workflo",
  "/products/nexus",
  "/products/astra",
]) {
  test(`${path} has no automated WCAG A/AA violations`, async ({ page }) => {
    await page.goto(path);
    await page.getByRole("heading", { level: 1 }).waitFor();
    await page
      .getByRole("button", { name: "Essential only", exact: true })
      .click();
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(result.violations).toEqual([]);
  });
}
