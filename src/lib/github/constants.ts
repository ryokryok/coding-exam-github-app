/** GitHub GraphQL API のエンドポイント。 */
export const GITHUB_GRAPHQL_ENDPOINT = "https://api.github.com/graphql";

/** 1ページあたりに取得できる最大件数（GitHub の上限）。 */
export const MAX_SEARCH_PAGE_SIZE = 100;

/** `first` 未指定時の既定件数。 */
export const DEFAULT_SEARCH_PAGE_SIZE = 20;

/** owner（ユーザー名・組織名）の命名規則。先頭・末尾はハイフン不可、最大39文字。 */
export const OWNER_NAME_PATTERN = /^[a-zA-Z0-9](?:-?[a-zA-Z0-9]){0,38}$/;

/** リポジトリ名の命名規則。英数字・ハイフン・アンダースコア・ドット。 */
export const REPO_NAME_PATTERN = /^[a-zA-Z0-9._-]+$/;

/** リポジトリ名の最大文字数。 */
export const REPO_NAME_MAX_LENGTH = 100;
