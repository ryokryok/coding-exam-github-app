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

/** 既定の共有クライアント。 */
export const githubClient = createGitHubClient();
