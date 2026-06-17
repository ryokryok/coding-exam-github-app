import { expect, test } from "@playwright/test";

test.describe("リポジトリ検索（ホーム）", () => {
  test("検索結果が表示される（union SearchResultItem の解決）", async ({
    page,
  }) => {
    await page.goto("/?q=foo");

    // search.nodes（union → Repository）が解決され、カードが描画される
    await expect(page.getByText("foo/bar")).toBeVisible();
    await expect(page.getByText("foo/baz")).toBeVisible();
    // repositoryCount（モックは件数 = nodes 数）
    await expect(page.getByText("2 件")).toBeVisible();
  });

  test("0件のときは未ヒットメッセージを表示する", async ({ page }) => {
    await page.goto("/?q=no-hit");

    await expect(
      page.getByText("「no-hit」に一致するリポジトリはありませんでした。"),
    ).toBeVisible();
  });
});
