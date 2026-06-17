import { readFileSync } from "node:fs";
import { createServer } from "node:http";
import { createSchema, createYoga } from "graphql-yoga";

/**
 * GitHub GraphQL API の E2E 用モックサーバー（GraphQL Yoga）。
 *
 * `process.env.GITHUB_API_ENDPOINT=http://localhost:4000` を指定したアプリから
 * そのまま叩けるよう、`graphqlEndpoint` を `/` にしてルートで受ける。
 *
 * 肝は抽象型の解決:
 *  - `SearchResultItem`（union）   → `__resolveType`
 *  - `RepositoryOwner`（interface）→ `__resolveType`
 * いずれも fixture の `__typename` を返すだけで解決できる。
 */

/** モックサーバーのポート（既定 4000）。 */
const PORT = Number(process.env.MOCK_PORT) || 4000;

// codegen と同じ本物の GitHub スキーマ（git-ignored）をそのまま使う。手書きスキーマを
// 二重管理しないことで、実 API とのフィールド名・null 許容・引数のズレを防ぐ。
// pnpm スクリプトはリポジトリルートで実行されるため cwd 相対で読む。
// 未取得なら `mise run download-schema` で取得する（codegen と同じ前提）。
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
  avatarUrl: "https://avatars.githubusercontent.com/u/1?v=4",
  ...over,
});

const makeRepo = (over: Partial<Repo> = {}): Repo => ({
  __typename: "Repository", // SearchResultItem union の解決に必須
  id: "R_foobar",
  name: "bar",
  nameWithOwner: "foo/bar",
  url: "https://github.com/foo/bar",
  stargazerCount: 1500,
  forkCount: 230,
  watchers: { totalCount: 80 },
  issues: { totalCount: 12 },
  primaryLanguage: { name: "TypeScript" },
  owner: makeOwner(),
  ...over,
});

const connection = (nodes: Repo[]) => ({
  repositoryCount: nodes.length,
  pageInfo: {
    hasNextPage: false,
    hasPreviousPage: false,
    startCursor: null,
    endCursor: null,
  },
  nodes,
});

const schema = createSchema({
  typeDefs,
  resolvers: {
    Query: {
      // query 文字列で挙動を切り替える（ヘッダー転送なしで URL だけで検証できる）。
      //   "error" を含む → 例外 / "empty" or "no-hit" を含む → 0 件 / それ以外 → 2 件
      search: (_parent: unknown, args: { query: string }) => {
        const q = args.query.toLowerCase();
        if (q.includes("error")) throw new Error("Mocked search failure");
        if (q.includes("empty") || q.includes("no-hit")) {
          return connection([]);
        }
        return connection([
          makeRepo(),
          makeRepo({
            id: "R_foobaz",
            name: "baz",
            nameWithOwner: "foo/baz",
            url: "https://github.com/foo/baz",
            stargazerCount: 42,
            primaryLanguage: null,
          }),
        ]);
      },
      // name で挙動を切り替える。"not-found" → null（404）/ "error" → 例外 / それ以外 → 該当 repo
      repository: (_parent: unknown, args: { owner: string; name: string }) => {
        if (args.name === "not-found") return null;
        if (args.name === "error") throw new Error("Mocked repository failure");
        return makeRepo({
          name: args.name,
          nameWithOwner: `${args.owner}/${args.name}`,
          url: `https://github.com/${args.owner}/${args.name}`,
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
