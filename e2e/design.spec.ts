import { expect, test } from "@playwright/test";

test("homepage follows numbered editorial chapters", async ({ page }) => {
  await page.goto("/");
  const chapters = page.locator("main .cx-secnum b");
  await expect(chapters).toHaveText([
    "001",
    "002",
    "003",
    "004",
    "005",
    "006",
    "007",
    "008",
    "009",
  ]);
  const steps = page.getByRole("group", {
    name: "How Cortex works",
    exact: true,
  });
  await expect(steps.getByRole("button")).toHaveCount(7);
  await steps.getByRole("button", { name: /authorize/i }).click();
  await expect(
    steps.getByRole("button", { name: /authorize/i })
  ).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByText("Explicit authorization required", { exact: true })
  ).toBeVisible();
});

test("workload selection exposes a specific product mapping", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("group", { name: "Explore workloads" })
    .getByRole("button", { name: /mission engineering/i })
    .click();
  const detail = page.locator("#workload-detail");
  await expect(detail.getByRole("link", { name: /ASTRA/ })).toHaveAttribute(
    "href",
    "/products/astra#architecture"
  );
  await expect(detail.getByRole("link")).toHaveCount(1);
  await expect(detail).toContainText("not a customer outcome");
});

test("evidence does not masquerade as a benchmark", async ({ page }) => {
  await page.goto("/products/workflo");
  await expect(page.locator("main .cx-secnum b")).toHaveText([
    "002",
    "003",
    "004",
    "005",
    "006",
    "007",
    "008",
  ]);
  await expect(page.getByText(/No sourced benchmark loaded/)).toBeVisible();
  const schemas = await page
    .locator("script[data-cortex-jsonld]")
    .allTextContents();
  expect(schemas.join(" ")).not.toContain('"offers"');
});

test("WebGL failure leaves the HTML story usable", async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      ...args: Parameters<typeof original>
    ) {
      if (String(args[0]).startsWith("webgl")) return null;
      return original.apply(this, args);
    } as typeof original;
  });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Intelligencefor criticalsystems."
  );
  await expect(page.locator(".cx-hero-field canvas")).toHaveCount(0);
  await expect(page.locator(".cx-hero-poster")).toBeVisible();
});

test.describe("mobile design", () => {
  test.use({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
  test("navigation traps focus and restores it on Escape", async ({ page }) => {
    await page.goto("/");
    await page
      .getByRole("button", { name: "Essential only", exact: true })
      .click();
    const trigger = page.getByRole("button", { name: "Open navigation" });
    await trigger.click();
    const dialog = page.getByRole("dialog", { name: "Site navigation" });
    await expect(
      dialog.getByRole("button", { name: "Close navigation" })
    ).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(
      dialog.getByRole("link", { name: /view system status/i })
    ).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(
      dialog.getByRole("button", { name: "Close navigation" })
    ).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });
  for (const path of [
    "/",
    "/products/workflo",
    "/products/nexus",
    "/products/astra",
  ]) {
    test(`${path} has no horizontal page overflow or canvas under reduced motion`, async ({
      page,
    }) => {
      await page.goto(path);
      await page.getByRole("contentinfo").scrollIntoViewIfNeeded();
      await expect(page.locator("canvas")).toHaveCount(0);
      const dimensions = await page.evaluate(() => ({
        width: document.documentElement.scrollWidth,
        viewport: innerWidth,
      }));
      expect(dimensions.width).toBeLessThanOrEqual(dimensions.viewport);
    });
  }
});

test("source-backed CMS evidence renders with methodology", async ({
  page,
}) => {
  await page.route("**/api/content/resource", route =>
    route.fulfill({
      json: {
        ok: true,
        source: "supabase",
        entries: [
          {
            slug: "synthetic-e2e-fixture",
            type: "resource",
            title: "Synthetic test fixture",
            body: "Test data only. Not a Cortex measurement.",
            published_at: "2026-09-09T00:00:00Z",
            metadata: {
              kind: "benchmark",
              product: "workflo",
              value: "42",
              unit: "ms",
              environment: "Test environment",
              measuredAt: "2026-09-09",
              methodology: "Synthetic browser fixture",
              limitations: "Not a real benchmark",
              sourceUrl: "https://example.com/fixture",
            },
          },
        ],
      },
    })
  );
  await page.goto("/products/workflo");
  await page.locator(".cx-published-evidence").scrollIntoViewIfNeeded();
  const metric = page.locator(".cx-benchmark");
  await expect(metric).toContainText("Synthetic browser fixture");
  await expect(metric).toContainText("Not a real benchmark");
  await expect(metric.getByRole("link")).toHaveAttribute(
    "href",
    "https://example.com/fixture"
  );
});

test("architecture links land on the technical section", async ({ page }) => {
  await page.goto("/products/nexus#architecture");
  await expect(
    page.getByRole("heading", { name: /a system you can trace/i })
  ).toBeInViewport();
});
