import type { Client } from "urql";
import * as v from "valibot";
import { graphql } from "@/lib/gql";
import { githubClient } from "./client";
import { DEFAULT_SEARCH_PAGE_SIZE } from "./constants";
import { SearchPageSizeSchema } from "./schema";

// 表示に必要なフィールドは各コンポーネントの Fragment に colocate している
// （RepositoryCard / RepositoryDetail）。ここではそれらを spread するだけ。
const SearchRepositoriesQuery = graphql(`
  query SearchRepositories($query: String!, $first: Int!, $after: String) {
    search(query: $query, type: REPOSITORY, first: $first, after: $after) {
      repositoryCount
      pageInfo {
        endCursor
        hasNextPage
      }
      nodes {
        ... on Repository {
          id
          ...RepositoryCard
        }
      }
    }
  }
`);

const GetRepositoryQuery = graphql(`
  query GetRepository($owner: String!, $name: String!) {
    repository(owner: $owner, name: $name) {
      ...RepositoryDetail
    }
  }
`);

/**
 * GitHub のリポジトリを検索する。
 *
 * GitHub の Search API は1ページ最大100件、ページングしても累計1,000件までしか
 * 取得できない点に注意。
 *
 * @param query - 検索クエリ（例: `"next.js stars:>1000"`）。
 * @param options.first - 取得する件数（1〜100、既定: 10）。
 * @param options.after - 続きを取得するためのカーソル（前回の `endCursor`）。
 * @param options.client - 使用する urql クライアント（既定: 共有クライアント）。
 * @returns マッチ総数・リポジトリ一覧・ページング情報。
 * @throws first が 1〜100 の整数でない場合（`ValiError`）。
 */
export async function searchRepositories(
  query: string,
  options: {
    first?: number;
    after?: string;
    client?: Client;
  } = {},
) {
  const {
    first = DEFAULT_SEARCH_PAGE_SIZE,
    after,
    client = githubClient,
  } = options;

  // first の範囲チェックはスキーマに委譲する（不正値は ValiError）。
  const validatedFirst = v.parse(SearchPageSizeSchema, first);

  const result = await client
    .query(
      SearchRepositoriesQuery,
      { query, first: validatedFirst, after },
      { requestPolicy: "network-only" },
    )
    .toPromise();

  if (result.error) {
    throw result.error;
  }

  const search = result.data?.search;
  const repositories = (search?.nodes ?? []).filter(
    (node): node is NonNullable<typeof node> => node != null,
  );

  return {
    repositoryCount: search?.repositoryCount ?? 0,
    repositories,
    pageInfo: {
      endCursor: search?.pageInfo.endCursor ?? null,
      hasNextPage: search?.pageInfo.hasNextPage ?? false,
    },
  };
}

/**
 * ページ番号（1始まり）を指定してリポジトリを検索する。
 *
 * GitHub の検索コネクションのカーソルは `cursor:<1始まりの位置>` を base64 した
 * もの。これを利用してページ番号から直接 `after` カーソルを構築することで、前ページ
 * を辿らずに任意のページ（例: `?page=5`）へ直接アクセスできる。
 *
 * @param query - 検索クエリ。空文字なら検索せず空の結果を返す。
 * @param page - 取得するページ（1始まり、既定: 1）。
 * @param options.client - 使用する urql クライアント（既定: 共有クライアント）。
 * @returns マッチ総数・リポジトリ一覧・ページング情報。
 */
export async function searchRepositoriesByPage(
  query: string,
  page = 1,
  options: { client?: Client } = {},
): Promise<SearchRepositoriesResult> {
  const trimmed = query.trim();
  if (trimmed === "") {
    return {
      repositoryCount: 0,
      repositories: [],
      pageInfo: { endCursor: null, hasNextPage: false },
    };
  }

  const offset = (page - 1) * DEFAULT_SEARCH_PAGE_SIZE;
  const after =
    offset > 0 ? Buffer.from(`cursor:${offset}`).toString("base64") : undefined;

  return searchRepositories(trimmed, { after, client: options.client });
}

/**
 * オーナーとリポジトリ名を指定して単一のリポジトリを取得する。
 *
 * @param owner - リポジトリのオーナー（ユーザー名または組織名）。
 * @param name - リポジトリ名。
 * @param options.client - 使用する urql クライアント（既定: 共有クライアント）。
 * @returns リポジトリ。存在しない場合は `null`。
 */
export async function getRepository(
  owner: string,
  name: string,
  options: { client?: Client } = {},
) {
  const { client = githubClient } = options;

  const result = await client
    .query(
      GetRepositoryQuery,
      { owner, name },
      { requestPolicy: "network-only" },
    )
    .toPromise();

  if (result.error) {
    throw result.error;
  }

  return result.data?.repository ?? null;
}

/** `searchRepositories` の戻り値の型。 */
export type SearchRepositoriesResult = Awaited<
  ReturnType<typeof searchRepositories>
>;

/** 検索結果のリポジトリ1件分の型（`id` + RepositoryCard フラグメント）。 */
export type RepositoryListItem =
  SearchRepositoriesResult["repositories"][number];
