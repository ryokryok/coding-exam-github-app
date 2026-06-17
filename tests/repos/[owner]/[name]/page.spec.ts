import { expect, test } from "@playwright/test";

test.describe("リポジトリ詳細", () => {
  test("詳細が表示される", async ({ page }) => {
    await page.goto("/repos/foo/bar");

    // 詳細全体は article で囲まれる
    const detail = page.getByRole("article", { name: "foo/bar" });
    await expect(detail).toBeVisible();
    // 見出しが表示される
    await expect(
      detail.getByRole("heading", { level: 2, name: "foo/bar" }),
    ).toBeVisible();
    // 言語が表示される
    await expect(detail.getByText("TypeScript")).toBeVisible();

    // Stats は dl/dt/dd で表示され、各 dd の値が検証される
    const statValue = (label: string) =>
      detail.locator("dl > div", { hasText: label }).getByRole("definition");
    await expect(statValue("Star")).toHaveText("1,500");
    await expect(statValue("Watcher")).toHaveText("80");
    await expect(statValue("Fork")).toHaveText("230");
    await expect(statValue("Issue")).toHaveText("12");
  });

  test("存在しないリポジトリは NotFound ページが表示される", async ({
    page,
  }) => {
    const response = await page.goto("/repos/foo/not-found");

    // 404 が返される
    expect(response?.status()).toBe(404);
    // NotFound の見出しが表示される
    await expect(
      page.getByRole("heading", { name: "リポジトリが見つかりませんでした" }),
    ).toBeVisible();
    // 検索へ戻るリンクが表示される
    await expect(page.getByRole("link", { name: "検索に戻る" })).toBeVisible();
  });

  test("取得エラー時はエラーページが表示される", async ({ page }) => {
    await page.goto("/repos/foo/error");

    // 通信/取得エラーは error.tsx で受け止められる
    await expect(
      page.getByRole("heading", { name: "エラーが発生しました" }),
    ).toBeVisible();
  });
});
