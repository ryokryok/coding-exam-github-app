import type { Client } from "urql";
import { graphql } from "@/lib/gql";
import { githubClient } from "./client";
import { DEFAULT_SEARCH_PAGE_SIZE, MAX_SEARCH_PAGE_SIZE } from "./constants";

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
 * @param options.first - 取得する件数（1〜100、既定: 20）。
 * @param options.after - 続きを取得するためのカーソル（前回の `endCursor`）。
 * @param options.client - 使用する urql クライアント（既定: 共有クライアント）。
 * @returns マッチ総数・リポジトリ一覧・ページング情報。
 * @throws first が 1〜100 の範囲外の場合。
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

  if (!Number.isInteger(first) || first < 1 || first > MAX_SEARCH_PAGE_SIZE) {
    throw new RangeError(
      `first は 1〜${MAX_SEARCH_PAGE_SIZE} の整数で指定してください（受け取った値: ${first}）`,
    );
  }

  const result = await client
    .query(
      SearchRepositoriesQuery,
      { query, first, after },
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
