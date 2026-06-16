import * as v from "valibot";

/** 検索ページのクエリパラメーター（?q=...&page=...）。 */
export const RepositorySearchParamsSchema = v.object({
  // 検索語。未指定は空文字（＝未検索状態）。
  q: v.optional(v.string(), ""),
  // ページ番号（1始まりの整数）。未指定は1。不正値（非数値・0以下・小数）は 404。
  // 既定値はパイプの入力（文字列）を渡し、変換後に number となる。
  page: v.optional(
    v.pipe(v.string(), v.transform(Number), v.integer(), v.minValue(1)),
    "1",
  ),
});
