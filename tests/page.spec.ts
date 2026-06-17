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
    await expect(page.getByText("2 件")).toBeVisible();
    // 結果が表示されているか
    await expect(page.getByText("foo/bar")).toBeVisible();
    await expect(page.getByText("foo/baz")).toBeVisible();
  });

  test("直接検索URLにアクセスしても検索結果が表示される", async ({ page }) => {
    await page.goto("/?q=foo");

    // 件数は表示されているか
    await expect(page.getByText("2 件")).toBeVisible();
    // 結果が表示されているか
    await expect(page.getByText("foo/bar")).toBeVisible();
    await expect(page.getByText("foo/baz")).toBeVisible();
  });

  test("0件のときは未ヒットメッセージを表示する", async ({ page }) => {
    await page.goto("/?q=no-hit");

    await expect(
      page.getByText("「no-hit」に一致するリポジトリはありませんでした。"),
    ).toBeVisible();
  });
});
