import { registerUrql } from "@urql/next/rsc";
import { Client, cacheExchange, type Exchange, fetchExchange } from "urql";
import { GITHUB_GRAPHQL_ENDPOINT } from "./constants";

export type GitHubClientConfig = {
  /** GitHub のアクセストークン。省略時は `GITHUB_API_TOKEN` 環境変数を使用する。 */
  token?: string;
  /** GraphQL エンドポイント URL。テスト時の差し替え用（既定: GitHub 本番）。 */
  url?: string;
  /** urql の exchanges。テストでキャッシュを無効化したい場合などに差し替える。 */
  exchanges?: Exchange[];
};

/**
 * GitHub GraphQL API 用の urql クライアントを生成する。
 *
 * @param config - 接続設定。テスト時は `url` や `exchanges` を差し替えられる。
 */
export function createGitHubClient(config: GitHubClientConfig = {}): Client {
  const {
    token = process.env.GITHUB_API_TOKEN,
    url = GITHUB_GRAPHQL_ENDPOINT,
    exchanges = [cacheExchange, fetchExchange],
  } = config;

  return new Client({
    url,
    exchanges,
    // GitHub の GraphQL API は POST のみ受け付ける。urql/core は既定で
    // クエリを URL に載る範囲で GET 送信する（preferGetMethod: 'within-url-limit'）
    // ため、明示的に false にして常に POST させる。
    preferGetMethod: false,
    fetchOptions: () => {
      const headers: Record<string, string> = {};
      if (token) {
        headers.authorization = `Bearer ${token}`;
      }
      return { headers };
    },
  });
}

/**
 * Server Component から使う、リクエスト単位でキャッシュされた urql クライアント。
 *
 * `@urql/next/rsc` の `registerUrql` は内部で React の `cache()` を使い、同一リクエスト
 * 内では同じクライアント（＝同じ取得キャッシュ）を共有し、リクエストをまたぐと新しい
 * クライアントを生成する。これにより SSR 中の取得結果が別リクエストへ漏れない。
 * トークンなどの環境変数もリクエスト時に評価される。
 *
 * @see https://nearform.com/open-source/urql/docs/advanced/server-side-rendering/#nextjs
 */
export const { getClient } = registerUrql(() => createGitHubClient());
