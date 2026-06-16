import { graphql, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { fetchExchange } from "urql";
import * as v from "valibot";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { RepositoryCardFragment } from "@/components/repository-card";
import { RepositoryDetailFragment } from "@/components/repository-detail";
import { makeFragmentData } from "@/lib/gql";
import {
  GetRepositoryDocument,
  type GetRepositoryQuery,
  SearchRepositoriesDocument,
  type SearchRepositoriesQuery,
} from "@/lib/gql/graphql";
import { createGitHubClient } from "./client";
import {
  getRepository,
  searchRepositories,
  searchRepositoriesByPage,
} from "./repository";

const TEST_ENDPOINT_URL = "https://graphql.example.com/graphql";
const TEST_AVATAR_URL = "https://avatars.example.com/dummy-owner.png";

// msw が横取りするテスト用エンドポイント。
const github = graphql.link(TEST_ENDPOINT_URL);

// 検索結果ノード = id（キー用） + RepositoryCard フラグメント。
const searchNode = (id = "DUMMY_REPO_ID_1") => ({
  id,
  ...makeFragmentData(
    {
      name: "dummy-repo",
      nameWithOwner: "dummy-owner/dummy-repo",
      owner: { login: "dummy-owner", avatarUrl: TEST_AVATAR_URL },
    },
    RepositoryCardFragment,
  ),
});

const searchData = (
  search: Partial<SearchRepositoriesQuery["search"]> = {},
): SearchRepositoriesQuery => ({
  search: {
    repositoryCount: 0,
    pageInfo: { endCursor: null, hasNextPage: false },
    nodes: [],
    ...search,
  },
});

const detailRepository = () =>
  makeFragmentData(
    {
      nameWithOwner: "dummy-owner/dummy-repo",
      description: "テスト用のダミーリポジトリ",
      url: "https://example.com/dummy-owner/dummy-repo",
      stargazerCount: 111,
      forkCount: 22,
      watchers: { totalCount: 33 },
      issues: { totalCount: 44 },
      primaryLanguage: { name: "DummyLang" },
      owner: { login: "dummy-owner", avatarUrl: TEST_AVATAR_URL },
    },
    RepositoryDetailFragment,
  );

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// キャッシュ無効（fetchExchange のみ）のテスト用クライアント。
const client = () =>
  createGitHubClient({
    token: "test-token",
    url: TEST_ENDPOINT_URL,
    exchanges: [fetchExchange],
  });

describe("searchRepositories", () => {
  it("検索クエリと件数を渡し、結果を整形して返す", async () => {
    let captured: Record<string, unknown> | undefined;
    const nodes = [
      searchNode("DUMMY_REPO_ID_1"),
      searchNode("DUMMY_REPO_ID_2"),
    ];
    server.use(
      github.query(SearchRepositoriesDocument, ({ variables }) => {
        captured = variables;
        return HttpResponse.json({
          data: searchData({
            repositoryCount: 42,
            pageInfo: { endCursor: "dummy-cursor-1", hasNextPage: true },
            nodes,
          }),
        });
      }),
    );

    const result = await searchRepositories("dummy", {
      first: 5,
      client: client(),
    });

    expect(captured).toEqual({ query: "dummy", first: 5 });
    expect(result).toEqual({
      repositoryCount: 42,
      repositories: nodes,
      pageInfo: { endCursor: "dummy-cursor-1", hasNextPage: true },
    });
  });

  it("first を省略すると既定値 10 を使う", async () => {
    let captured: Record<string, unknown> | undefined;
    server.use(
      github.query(SearchRepositoriesDocument, ({ variables }) => {
        captured = variables;
        return HttpResponse.json({ data: searchData() });
      }),
    );

    await searchRepositories("dummy", { client: client() });

    expect(captured).toEqual({ query: "dummy", first: 10 });
  });

  it("after カーソルを渡してページングできる", async () => {
    let captured: Record<string, unknown> | undefined;
    server.use(
      github.query(SearchRepositoriesDocument, ({ variables }) => {
        captured = variables;
        return HttpResponse.json({
          data: searchData({
            repositoryCount: 42,
            pageInfo: { endCursor: "dummy-cursor-2", hasNextPage: false },
            nodes: [searchNode()],
          }),
        });
      }),
    );

    const result = await searchRepositories("dummy", {
      after: "dummy-cursor-1",
      client: client(),
    });

    expect(captured).toEqual({
      query: "dummy",
      first: 10,
      after: "dummy-cursor-1",
    });
    expect(result.pageInfo).toEqual({
      endCursor: "dummy-cursor-2",
      hasNextPage: false,
    });
  });

  it("null ノードを除外する", async () => {
    const node = searchNode();
    server.use(
      github.query(SearchRepositoriesDocument, () =>
        HttpResponse.json({
          data: searchData({ repositoryCount: 1, nodes: [node, null] }),
        }),
      ),
    );

    const result = await searchRepositories("dummy", { client: client() });

    expect(result.repositories).toEqual([node]);
  });

  it.each([0, 101, 5.5, -1])(
    "first が範囲外(%s)なら ValiError を投げる",
    async (first) => {
      await expect(
        searchRepositories("dummy", { first, client: client() }),
      ).rejects.toThrow(v.ValiError);
    },
  );

  it("GraphQL エラー時に例外を投げる", async () => {
    server.use(
      github.query(SearchRepositoriesDocument, () =>
        HttpResponse.json({ errors: [{ message: "Bad credentials" }] }),
      ),
    );

    await expect(
      searchRepositories("dummy", { client: client() }),
    ).rejects.toThrow(/Bad credentials/);
  });
});

describe("searchRepositoriesByPage", () => {
  it("1ページ目は after カーソルを渡さない", async () => {
    let captured: Record<string, unknown> | undefined;
    server.use(
      github.query(SearchRepositoriesDocument, ({ variables }) => {
        captured = variables;
        return HttpResponse.json({ data: searchData() });
      }),
    );

    await searchRepositoriesByPage("dummy", 1, { client: client() });

    expect(captured?.after).toBeUndefined();
  });

  it("ページ番号から after カーソル（base64 の cursor:<offset>）を組み立てる", async () => {
    let captured: Record<string, unknown> | undefined;
    server.use(
      github.query(SearchRepositoriesDocument, ({ variables }) => {
        captured = variables;
        return HttpResponse.json({ data: searchData() });
      }),
    );

    // 3ページ目・1ページ10件 → オフセット20。
    await searchRepositoriesByPage("dummy", 3, { client: client() });

    expect(captured?.after).toBe(Buffer.from("cursor:20").toString("base64"));
  });

  it("空クエリでは検索せず空の結果を返す", async () => {
    // ハンドラ未登録。onUnhandledRequest: "error" なので、通信が起きれば失敗する。
    const result = await searchRepositoriesByPage("   ", 1, {
      client: client(),
    });

    expect(result).toEqual({
      repositoryCount: 0,
      repositories: [],
      pageInfo: { endCursor: null, hasNextPage: false },
    });
  });
});

describe("getRepository", () => {
  it("owner と name を渡し、リポジトリを返す", async () => {
    let captured: Record<string, unknown> | undefined;
    const repository = detailRepository();
    server.use(
      github.query(GetRepositoryDocument, ({ variables }) => {
        captured = variables;
        return HttpResponse.json({
          data: { repository } as GetRepositoryQuery,
        });
      }),
    );

    const repo = await getRepository("dummy-owner", "dummy-repo", {
      client: client(),
    });

    expect(captured).toEqual({ owner: "dummy-owner", name: "dummy-repo" });
    expect(repo).toEqual(repository);
  });

  it("存在しない場合は null を返す", async () => {
    server.use(
      github.query(GetRepositoryDocument, () =>
        HttpResponse.json({ data: { repository: null } }),
      ),
    );

    const repo = await getRepository("dummy-owner", "missing", {
      client: client(),
    });

    expect(repo).toEqual(null);
  });

  it("GraphQL エラー時に例外を投げる", async () => {
    server.use(
      github.query(GetRepositoryDocument, () =>
        HttpResponse.json({ errors: [{ message: "Something went wrong" }] }),
      ),
    );

    await expect(
      getRepository("dummy-owner", "dummy-repo", { client: client() }),
    ).rejects.toThrow(/Something went wrong/);
  });
});
