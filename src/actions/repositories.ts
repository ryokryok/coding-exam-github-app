"use server";

import { unstable_cache } from "next/cache";
import {
  type SearchRepositoriesResult,
  searchRepositories,
} from "@/lib/github/repository";

/** 検索結果キャッシュの有効期間（秒）。 */
const SEARCH_CACHE_REVALIDATE_SECONDS = 300;

/**
 * 同一クエリ（+カーソル）に対する検索結果をサーバー側でキャッシュする。
 *
 * 同じ検索語を繰り返したり、戻る/進む・リロードした際に GitHub API を
 * 叩き直さず、キャッシュ済みの結果を返す。キャッシュキーは引数
 * （query, after）から自動的に導出される。
 */
const cachedSearchRepositories = unstable_cache(
  (query: string, after?: string) => searchRepositories(query, { after }),
  ["search-repositories"],
  { revalidate: SEARCH_CACHE_REVALIDATE_SECONDS },
);

/**
 * リポジトリ検索の Server Action。
 *
 * クライアント（検索フォーム・無限スクロール）から呼ばれる。トークンは
 * サーバー側に保持したまま GitHub API を叩く。結果はキャッシュされる。
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

  return cachedSearchRepositories(trimmed, after);
}
