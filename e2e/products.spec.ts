import { expect, test } from "@playwright/test";

const PRODUCTS = [
  { slug: "workflo", name: "Workflo", cat: "Execution Assurance", second: "SEAL" },
  { slug: "nexus", name: "Nexus", cat: "Operations Intelligence", second: "FORECAST" },
  { slug: "astra", name: "ASTRA", cat: "Mission Engineering", second: "BRANCH" },
];

for (const product of PRODUCTS) {
  test(`${product.slug} brief is complete`, async ({ page }) => {
    await page.goto(`/products/${product.slug}`);
    await expect(page.getByRole("heading", { name: product.name, exact: true })).toBeVisible();
    await expect(page.getByText(`001 / ${product.cat}`)).toBeVisible();

    const second = page.getByRole("button", { name: new RegExp(`^002 ${product.second}\\b`, "i") });
    await second.scrollIntoViewIfNeeded();
    await second.click();
    await expect(second).toHaveAttribute("aria-expanded", "true");

    await expect(page.getByRole("img", { name: new RegExp(`${product.name} mechanism diagram`, "i") })).toBeVisible();
    await expect(page.locator(".cx-secnum", { hasText: "Proof" })).toBeVisible();
    await expect(page.locator(".cx-closing-routes a").first()).toBeVisible();
  });
}
