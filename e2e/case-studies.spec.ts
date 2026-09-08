import { expect, test } from "@playwright/test";

const STORIES = [
  { slug: "northstar-health", company: "Northstar Health" },
  { slug: "vela-financial", company: "Vela Financial" },
  { slug: "aster-works", company: "Aster Works" },
];

for (const story of STORIES) {
  test(`${story.slug} brief renders honestly`, async ({ page }) => {
    await page.goto(`/case-study/${story.slug}`);
    await expect(page.getByText(`Case study / ${story.company}`)).toBeVisible();
    await expect(page.locator("blockquote.cx-story-quote")).toBeVisible();
    await expect(page.locator(".cx-secnum", { hasText: "Deployment structure" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Your system is next.", exact: true })).toBeVisible();
  });
}
