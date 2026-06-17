import { readFileSync } from "node:fs";
import { createServer } from "node:http";
import { createSchema, createYoga } from "graphql-yoga";

/**
 * GitHub GraphQL API の E2E 用モックサーバー
 *
 * `process.env.GITHUB_API_ENDPOINT=http://localhost:4000` を指定したアプリから
 * そのまま叩けるよう、`graphqlEndpoint` を `/` にしてルートで受ける。
 *
 * 肝は抽象型の解決:
 *  - `SearchResultItem`（union）   → `__resolveType`
 *  - `RepositoryOwner`（interface）→ `__resolveType`
 * いずれも fixture の `__typename` を返すだけで解決できる。
 */

/** モックサーバーのポート */
const PORT = 4000;

// codegen と同じ本物の GitHub スキーマ（git-ignored）をそのまま使う
// 未取得なら `mise run download-schema` で取得する
const SCHEMA_PATH = "schema.docs.graphql";
let typeDefs: string;
try {
  typeDefs = readFileSync(SCHEMA_PATH, "utf-8");
} catch {
  throw new Error(
    `${SCHEMA_PATH} が見つかりません。先に \`mise run download-schema\` を実行してください。`,
  );
}

type Owner = {
  __typename: "User" | "Organization";
  login: string;
  avatarUrl: string;
};

// フィールドは実フラグメント（RepositoryCard / RepositoryDetail）が選択するものに
// 合わせる。選択される非 null フィールドが欠けると
// "Cannot return null for non-nullable field" で落ちる。
type Repo = {
  __typename: "Repository";
  id: string;
  name: string;
  nameWithOwner: string;
  url: string;
  stargazerCount: number;
  forkCount: number;
  watchers: { totalCount: number };
  issues: { totalCount: number };
  primaryLanguage: { name: string } | null;
  owner: Owner;
};

const makeOwner = (over: Partial<Owner> = {}): Owner => ({
  __typename: "User", // RepositoryOwner interface の解決に必須
  login: "foo",
  // avatarUrl のホストは next.config の remotePatterns に合わせる必要がある。
  avatarUrl: "https://avatars.githubusercontent.com/u/31591832",
  ...over,
});

const makeRepo = (over: Partial<Repo> = {}): Repo => ({
  __typename: "Repository", // SearchResultItem union の解決に必須
  id: "R_foobar",
  name: "bar",
  nameWithOwner: "foo/bar",
  url: "https://example.com/foo/bar",
  stargazerCount: 1500,
  forkCount: 230,
  watchers: { totalCount: 80 },
  issues: { totalCount: 12 },
  primaryLanguage: { name: "TypeScript" },
  owner: makeOwner(),
  ...over,
});

/** 検索総数。10 件/ページなので 5 ページ分になり、ページネーションが表示される。 */
const TOTAL_COUNT = 42;

/**
 * 1ページ目に表示する 10 件。先頭2件は既存テストが参照する foo/bar・foo/baz。
 * 2ページ目以降は見ないので用意しない（mock は after を無視して常にこの1ページを返す）。
 */
const FIRST_PAGE: Repo[] = [
  makeRepo(),
  makeRepo({
    id: "R_foobaz",
    name: "baz",
    nameWithOwner: "foo/baz",
    url: "https://example.com/foo/baz",
    stargazerCount: 42,
    primaryLanguage: null,
  }),
  ...Array.from({ length: 8 }, (_, i) => {
    const n = i + 3;
    return makeRepo({
      id: `R_foo_${n}`,
      name: `repo-${n}`,
      nameWithOwner: `foo/repo-${n}`,
      url: `https://example.com/foo/repo-${n}`,
    });
  }),
];

const connection = (
  nodes: Repo[],
  total: number = nodes.length,
  hasNextPage = false,
) => ({
  repositoryCount: total,
  pageInfo: {
    hasNextPage,
    hasPreviousPage: false,
    startCursor: null,
    endCursor: hasNextPage ? "Y3Vyc29yOjEw" : null,
  },
  nodes,
});

const schema = createSchema({
  typeDefs,
  resolvers: {
    Query: {
      // query 文字列で挙動を切り替える（ヘッダー転送なしで URL だけで検証できる）。
      //   "error" を含む → 例外 / "empty" or "no-hit" を含む → 0 件
      //   それ以外 → 全 42 件の 1 ページ目（10 件, hasNextPage: true）
      search: (_parent: unknown, args: { query: string }) => {
        const q = args.query.toLowerCase();
        if (q.includes("error")) throw new Error("Mocked search failure");
        if (q.includes("empty") || q.includes("no-hit")) {
          return connection([]);
        }
        return connection(FIRST_PAGE, TOTAL_COUNT, true);
      },
      // name で挙動を切り替える。"not-found" → null（404）/ "error" → 例外 / それ以外 → 該当 repo
      repository: (_parent: unknown, args: { owner: string; name: string }) => {
        if (args.name === "not-found") return null;
        if (args.name === "error") throw new Error("Mocked repository failure");
        return makeRepo({
          name: args.name,
          nameWithOwner: `${args.owner}/${args.name}`,
          url: `https://example.com/${args.owner}/${args.name}`,
          owner: makeOwner({ login: args.owner }),
        });
      },
    },
    // union の具体型解決（search.nodes）
    SearchResultItem: {
      __resolveType: (obj: { __typename: string }) => obj.__typename,
    },
    // interface の具体型解決（repository.owner）
    RepositoryOwner: {
      __resolveType: (obj: { __typename: string }) => obj.__typename,
    },
  },
});

const yoga = createYoga({
  schema,
  // GITHUB_API_ENDPOINT=http://localhost:4000 をそのまま POST できるよう '/' で受ける。
  graphqlEndpoint: "/",
});

createServer(yoga).listen(PORT, () => {
  console.log(`GitHub GraphQL mock running at http://localhost:${PORT}/`);
});
