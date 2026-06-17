import { expect, test } from "@playwright/test";

test.describe("リポジトリ詳細", () => {
  test("詳細が表示される（owner interface RepositoryOwner の解決）", async ({
    page,
  }) => {
    await page.goto("/repos/foo/bar");

    // repository.owner（interface → User）が解決され、見出し・言語・スタッツが出る
    await expect(page.getByRole("heading", { name: "foo/bar" })).toBeVisible();
    await expect(page.getByText("TypeScript")).toBeVisible();
    await expect(page.getByText("1,500")).toBeVisible(); // stargazerCount

    await expect(page).toHaveTitle(/Repo Digger/);
  });

  test("存在しないリポジトリは 404", async ({ page }) => {
    const response = await page.goto("/repos/foo/not-found");

    expect(response?.status()).toBe(404);
  });
});
