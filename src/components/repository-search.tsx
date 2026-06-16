import { searchRepositoriesByPage } from "@/lib/github/repository";
// useFragment は名前に反して React フックではなく純粋な unmask 関数。サーバーの
// .map 内で呼ぶため、フック検出（use* 命名）に引っかからないよう別名にする。
import { graphql, useFragment as readFragment } from "@/lib/gql";
import { RepositorySearchView } from "./repository-search-view";

/**
 * カード表示に必要なフィールドの Fragment。
 *
 * 表示を担う RepositoryCard は Client Component なので、Fragment の宣言と unmask は
 * サーバー側（この Server Component）に集約する。SearchRepositoriesQuery 側はこの
 * Fragment を `...RepositoryCard` で spread するだけ。
 */
export const RepositoryCardFragment = graphql(`
  fragment RepositoryCard on Repository {
    name
    nameWithOwner
    owner {
      login
      avatarUrl
    }
  }
`);

/**
 * 検索結果の取得担当（Server Component）。
 *
 * page.tsx で検証済みの検索語・ページをもとにサーバー側でリポジトリを取得し、
 * Fragment を unmask してプレーンなオブジェクトへ整形してから、表示・操作担当の
 * {@link RepositorySearchView} に渡す。空クエリ（未検索）のときは
 * searchRepositoriesByPage 側が通信せず空の結果を返す。
 *
 * @param query - 検索語（検証済み）。
 * @param page - 表示するページ（1始まり、検証済み）。
 */
export async function RepositorySearch({
  query,
  page,
}: {
  query: string;
  page: number;
}) {
  const { repositories, repositoryCount } = await searchRepositoriesByPage(
    query,
    page,
  );

  // サーバー側で Fragment を unmask し、Client へは serializable なプレーンデータ
  // だけを渡す（マスクされた Fragment 参照を境界の向こうへ持ち出さない）。
  const cards = repositories.map((node) => {
    const repo = readFragment(RepositoryCardFragment, node);
    return {
      id: node.id,
      name: repo.name,
      nameWithOwner: repo.nameWithOwner,
      ownerLogin: repo.owner.login,
      avatarUrl: repo.owner.avatarUrl,
    };
  });

  return (
    <RepositorySearchView
      query={query}
      page={page}
      repositories={cards}
      total={repositoryCount}
    />
  );
}
