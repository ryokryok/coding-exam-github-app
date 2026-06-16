import { searchRepositoriesByPage } from "@/lib/github/repository";
import { RepositorySearchView } from "./repository-search-view";

/**
 * 検索結果の取得担当（Server Component）。
 *
 * page.tsx で検証済みの検索語・ページをもとにサーバー側でリポジトリを取得し、
 * 表示・操作担当の {@link RepositorySearchView} に結果を渡すだけ。空クエリ（未検索）
 * のときは searchRepositoriesByPage 側が通信せず空の結果を返す。
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

  return (
    <RepositorySearchView
      query={query}
      page={page}
      repositories={repositories}
      total={repositoryCount}
    />
  );
}
