import { expect, test } from "@playwright/test";

test.describe("リポジトリ検索 (ホーム)", () => {
  test("ページタイトルが表示されている", async ({ page }) => {
    await page.goto("/");

    // タイトル
    await expect(
      page.getByRole("heading", { level: 1, name: "Repo Digger" }),
    ).toBeVisible();
    // document.title の確認
    expect(await page.title()).toBe("Repo Digger");
  });
  test("操作したら検索結果を表示する", async ({ page }) => {
    await page.goto("/");

    // 検索文字列を入れる
    await page.getByRole("textbox").fill("foo");
    // 送信する
    await page.getByRole("button", { name: "検索" }).click();
    // URLが変わっているか
    await expect(page).toHaveURL("/?q=foo&page=1");

    // 件数は表示されているか
    await expect(page.getByText("42 件")).toBeVisible();
    // 結果が表示されているか
    await expect(page.getByText("foo/bar")).toBeVisible();
    await expect(page.getByText("foo/baz")).toBeVisible();
  });

  test("直接検索URLにアクセスしても検索結果が表示される", async ({ page }) => {
    await page.goto("/?q=foo");

    // 件数は表示されているか
    await expect(page.getByText("42 件")).toBeVisible();
    // 結果が表示されているか
    await expect(page.getByText("foo/bar")).toBeVisible();
    await expect(page.getByText("foo/baz")).toBeVisible();
  });

  test("複数ページのときページネーションを表示する", async ({ page }) => {
    await page.goto("/?q=foo");

    // 全 42 件 = 10 件/ページで 5 ページ
    await expect(page.getByText("42 件")).toBeVisible();

    const pagination = page.getByRole("navigation", { name: "pagination" });
    await expect(pagination).toBeVisible();

    // ページネーションの項目は base-ui の Button により role="button"。
    // 1ページ目なので現在ページ(1)が active、最終ページ(5)へのリンクも出る
    await expect(
      pagination.getByRole("button", { name: "1", exact: true }),
    ).toHaveAttribute("aria-current", "page");
    await expect(
      pagination.getByRole("button", { name: "5", exact: true }),
    ).toBeVisible();

    // 1ページ目なので「前へ」は無効・「次へ」は有効
    await expect(
      pagination.getByRole("button", { name: "Go to previous page" }),
    ).toHaveAttribute("aria-disabled", "true");
    await expect(
      pagination.getByRole("button", { name: "Go to next page" }),
    ).not.toHaveAttribute("aria-disabled", "true");
  });

  test("0件のときは未ヒットメッセージを表示する", async ({ page }) => {
    await page.goto("/?q=no-hit");

    await expect(
      page.getByText("「no-hit」に一致するリポジトリはありませんでした。"),
    ).toBeVisible();
  });
});
