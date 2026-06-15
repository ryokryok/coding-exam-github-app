"use server";

import {
  type SearchRepositoriesResult,
  searchRepositories,
} from "@/lib/github/repository";

/**
 * リポジトリ検索の Server Action。
 *
 * クライアント（検索フォーム・無限スクロール）から呼ばれる。トークンは
 * サーバー側に保持したまま GitHub API を叩く。
 *
 * @param query - 検索クエリ。
 * @param after - 続きを取得するカーソル（次ページ取得時）。
 */
export async function searchRepositoriesAction(
  query: string,
  after?: string,
): Promise<SearchRepositoriesResult> {
  const trimmed = query.trim();
  if (trimmed === "") {
    return {
      repositoryCount: 0,
      repositories: [],
      pageInfo: { endCursor: null, hasNextPage: false },
    };
  }

  return searchRepositories(trimmed, { after });
}
