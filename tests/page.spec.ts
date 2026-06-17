import { expect, test } from "@playwright/test";

test("has title", async ({ page }) => {
  // TODO: replace dummy
  await page.goto("/repos/react/react");

  await expect(page).toHaveTitle(/Repo Digger/);
});
