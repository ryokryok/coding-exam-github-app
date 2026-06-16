import * as v from "valibot";
import {
  MAX_SEARCH_PAGE_SIZE,
  OWNER_NAME_PATTERN,
  REPO_NAME_MAX_LENGTH,
  REPO_NAME_PATTERN,
} from "./constants";

/**
 * searchRepositories の `first`（1ページあたりの取得件数）のスキーマ。
 * GitHub Search API の上限に合わせ、1〜MAX_SEARCH_PAGE_SIZE の整数のみ許可する。
 */
export const SearchPageSizeSchema = v.pipe(
  v.number(),
  v.integer(),
  v.minValue(1),
  v.maxValue(MAX_SEARCH_PAGE_SIZE),
);

/**
 * リポジトリ詳細ページのルートパラメータ（`/repos/[owner]/[name]`）のスキーマ。
 *
 * GitHub の命名規則に沿って検証する:
 * - owner: 英数字とハイフン。先頭・末尾はハイフン不可、最大39文字。
 * - name: 英数字・ハイフン・アンダースコア・ドット。最大100文字。
 */
export const RepositoryParamsSchema = v.object({
  owner: v.pipe(
    v.string(),
    v.regex(OWNER_NAME_PATTERN, "owner が GitHub の命名規則に一致しません"),
  ),
  name: v.pipe(
    v.string(),
    v.maxLength(REPO_NAME_MAX_LENGTH, "name が長すぎます"),
    v.regex(REPO_NAME_PATTERN, "name が GitHub の命名規則に一致しません"),
  ),
});

export type RepositoryParams = v.InferOutput<typeof RepositoryParamsSchema>;
