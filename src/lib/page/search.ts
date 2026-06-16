/** 検索文字列を保持する URL クエリパラメーター名。 */
export const SEARCH_QUERY_PARAM = "q";
/** ページ番号を保持する URL クエリパラメーター名。 */
export const SEARCH_PAGE_PARAM = "page";

/** GitHub Search API が一覧できる結果総数の上限。これを超えるページは作れない。 */
export const MAX_SEARCH_RESULTS = 1000;

/** ページネーションで現在ページの左右に表示する既定の隣接ページ数。 */
const DEFAULT_SIBLING_COUNT = 2;

/**
 * 検索ページの URL を組み立てる（`?q=...&page=...`）。
 *
 * フォーム送信・ページネーションの双方がこの関数を通すことで、パラメーター名と
 * URL 形を1箇所に集約する。
 *
 * @param query - 検索語。
 * @param page - ページ番号（1始まり）。
 * @param pathname - リンク先のパス（既定: `/`）。
 */
export function buildSearchPath(
  query: string,
  page: number,
  pathname = "/",
): string {
  const params = new URLSearchParams();
  params.set(SEARCH_QUERY_PARAM, query);
  params.set(SEARCH_PAGE_PARAM, String(page));
  return `${pathname}?${params.toString()}`;
}

/** {@link getPageWindow} の戻り値。ページネーション描画に必要な情報一式。 */
export type PageWindow = {
  /** 総ページ数（GitHub の1000件上限でキャップ済み）。 */
  totalPages: number;
  /** 範囲内に丸めた現在ページ。 */
  current: number;
  /** 中央に表示するページ番号の並び。 */
  pages: number[];
  /** 先頭ページ（1）を別途表示するか。 */
  showFirst: boolean;
  /** 先頭ページと窓の間に省略記号を表示するか。 */
  showLeadingEllipsis: boolean;
  /** 末尾ページを別途表示するか。 */
  showLast: boolean;
  /** 窓と末尾ページの間に省略記号を表示するか。 */
  showTrailingEllipsis: boolean;
  /** 現在が先頭ページか。 */
  isFirst: boolean;
  /** 現在が末尾ページか。 */
  isLast: boolean;
};

/**
 * ページネーション表示に必要な情報を算出する純粋関数。
 *
 * - 総ページ数は GitHub の1000件上限（{@link MAX_SEARCH_RESULTS}）でキャップする。
 * - 現在ページの左右に siblingCount ページずつ並べ、窓の外側は先頭/末尾＋省略記号で表す。
 * - `page` が範囲外でも `current` を 1〜totalPages に丸める。
 *
 * @param page - 現在ページ（1始まり）。
 * @param total - マッチした総件数。
 * @param pageSize - 1ページあたりの件数。
 * @param siblingCount - 現在ページの左右に並べるページ数（既定: 2）。
 */
export function getPageWindow(
  page: number,
  total: number,
  pageSize: number,
  siblingCount = DEFAULT_SIBLING_COUNT,
): PageWindow {
  const totalPages = Math.min(
    Math.ceil(total / pageSize),
    Math.ceil(MAX_SEARCH_RESULTS / pageSize),
  );
  const current = Math.min(Math.max(page, 1), Math.max(totalPages, 1));

  const start = Math.max(1, current - siblingCount);
  const end = Math.min(totalPages, current + siblingCount);
  const pages = Array.from(
    { length: Math.max(end - start + 1, 0) },
    (_, i) => start + i,
  );

  return {
    totalPages,
    current,
    pages,
    showFirst: start > 1,
    showLeadingEllipsis: start > 2,
    showLast: end < totalPages,
    showTrailingEllipsis: end < totalPages - 1,
    isFirst: current === 1,
    isLast: current === totalPages,
  };
}
