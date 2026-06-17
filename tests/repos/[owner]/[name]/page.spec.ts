import { expect, test } from "@playwright/test";

test.describe("リポジトリ詳細", () => {
  test("詳細が表示される", async ({ page }) => {
    await page.goto("/repos/foo/bar");

    // 見出し
    await expect(page.getByRole("heading", { name: "foo/bar" })).toBeVisible();
    // 言語
    await expect(page.getByText("TypeScript")).toBeVisible();
    // star
    await expect(page.getByText("1,500")).toBeVisible();
    // watcher
    await expect(page.getByText("80")).toBeVisible();
    // fork
    await expect(page.getByText("230")).toBeVisible();
    // issue
    await expect(page.getByText("12")).toBeVisible();
  });

  test("存在しないリポジトリは 404", async ({ page }) => {
    const response = await page.goto("/repos/foo/not-found");

    expect(response?.status()).toBe(404);
  });
});
