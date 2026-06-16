"use client";

import { usePathname, useRouter } from "next/navigation";
import { type SubmitEvent, useState } from "react";
import { DEFAULT_SEARCH_PAGE_SIZE } from "@/lib/github/constants";
import { buildSearchPath } from "@/lib/page/search";
import { RepositoryCard, type RepositoryCardData } from "./repository-card";
import { ResultPagination } from "./result-pagination";
import { SearchResultCount } from "./search-result-count";

/**
 * 検索フォーム + 結果一覧 + ページネーションの表示・操作担当（Client）。
 *
 * データ取得は Server Component（RepositorySearch）が行い、結果を props で受け取る
 * だけ。フォーム送信時に URL を書き換える＝ページ遷移し、サーバー側で再取得される。
 *
 * @param query - 現在の検索語（検証済み）。
 * @param page - 現在のページ（1始まり、検証済み）。
 * @param repositories - 現在ページのリポジトリ一覧（カード表示用のプレーンデータ）。
 * @param total - マッチした総件数。
 */
export function RepositorySearchView({
  query,
  page,
  repositories,
  total,
}: {
  query: string;
  page: number;
  repositories: (RepositoryCardData & { id: string })[];
  total: number;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [input, setInput] = useState(query); // 入力欄の文字列

  // 送信時は URL を書き換えるだけ。新しい検索なので必ず1ページ目に戻す。
  // URL が変わると Server Component が再取得し、新しい結果が props で流れてくる。
  const runSearch = (event: SubmitEvent) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (trimmed === "") return;

    router.push(buildSearchPath(trimmed, 1, pathname));
  };

  const hasResults = repositories.length > 0;
  const canSubmit = input.trim() !== "";

  return (
    <div className="flex flex-col gap-3">
      <form onSubmit={runSearch} className="flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="リポジトリ名を入力してください"
          className="flex-1 rounded-md border-2 border-zinc-300 px-4 py-2 text-base tracking-wide outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
        />
        <button
          type="submit"
          disabled={!canSubmit}
          className={`rounded-md border-2 border-transparent px-5 py-2 text-lg font-bold tracking-wider transition-colors ${
            canSubmit
              ? "bg-green-700 text-white hover:bg-green-800 dark:bg-green-700 dark:hover:bg-green-600"
              : "cursor-not-allowed bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500"
          }`}
        >
          検索
        </button>
      </form>

      {query !== "" && !hasResults && (
        <p className="text-sm text-zinc-500">
          「{query}」に一致するリポジトリはありませんでした。
        </p>
      )}

      {hasResults && (
        <>
          <SearchResultCount total={total} />

          <ul className="flex flex-col gap-3">
            {repositories.map((repository) => (
              <li key={repository.id}>
                <RepositoryCard
                  name={repository.name}
                  nameWithOwner={repository.nameWithOwner}
                  ownerLogin={repository.ownerLogin}
                  avatarUrl={repository.avatarUrl}
                />
              </li>
            ))}
          </ul>

          <ResultPagination
            query={query}
            page={page}
            total={total}
            pageSize={DEFAULT_SEARCH_PAGE_SIZE}
            pathname={pathname}
          />
        </>
      )}
    </div>
  );
}
