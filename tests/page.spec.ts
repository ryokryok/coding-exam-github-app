import { expect, test } from "@playwright/test";

test.describe("リポジトリ検索 (ホーム)", () => {
  test("ページタイトルが表示されている", async ({ page }) => {
    await page.goto("/");

    // タイトルが表示される
    await expect(
      page.getByRole("heading", { level: 1, name: "Repo Digger" }),
    ).toBeVisible();
    // document.title が設定される
    expect(await page.title()).toBe("Repo Digger");
  });
  test("操作したら検索結果を表示する", async ({ page }) => {
    await page.goto("/");

    // 検索文字列が入力される
    await page.getByRole("textbox").fill("foo");
    // 送信される
    await page.getByRole("button", { name: "検索" }).click();
    // URL が変更される
    await expect(page).toHaveURL("/?q=foo&page=1");

    // 件数は status として表示される
    await expect(page.getByRole("status")).toHaveText("42 件");
    // 結果カードは article として表示される
    await expect(page.getByRole("article", { name: "foo/bar" })).toBeVisible();
    await expect(page.getByRole("article", { name: "foo/baz" })).toBeVisible();
  });

  test("直接検索URLにアクセスしても検索結果が表示される", async ({ page }) => {
    await page.goto("/?q=foo");

    // 件数は status として表示される
    await expect(page.getByRole("status")).toHaveText("42 件");
    // 結果カードは article として表示される
    await expect(page.getByRole("article", { name: "foo/bar" })).toBeVisible();
    await expect(page.getByRole("article", { name: "foo/baz" })).toBeVisible();
  });

  test("複数ページのときページネーションを表示する", async ({ page }) => {
    await page.goto("/?q=foo");

    // 全 42 件が 10 件/ページで 5 ページに分割される
    await expect(page.getByRole("status")).toHaveText("42 件");

    const pagination = page.getByRole("navigation", { name: "pagination" });
    await expect(pagination).toBeVisible();

    // ページネーションの項目は role="button" として公開される
    // 1ページ目では現在ページ(1)が active 表示され、最終ページ(5)も表示される
    await expect(
      pagination.getByRole("button", { name: "1", exact: true }),
    ).toHaveAttribute("aria-current", "page");
    await expect(
      pagination.getByRole("button", { name: "5", exact: true }),
    ).toBeVisible();

    // 1ページ目では「前へ」が無効化され、「次へ」は有効にされる
    await expect(
      pagination.getByRole("button", { name: "Go to previous page" }),
    ).toHaveAttribute("aria-disabled", "true");
    await expect(
      pagination.getByRole("button", { name: "Go to next page" }),
    ).not.toHaveAttribute("aria-disabled", "true");
  });

  test("0件のときは未ヒットメッセージを表示する", async ({ page }) => {
    await page.goto("/?q=no-hit");

    // 未ヒットメッセージも status として表示される
    await expect(page.getByRole("status")).toHaveText(
      "「no-hit」に一致するリポジトリはありませんでした。",
    );
  });
});
