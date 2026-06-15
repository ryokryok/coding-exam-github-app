"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { searchRepositoriesAction } from "@/actions/repositories";
import type { RepositoryListItem } from "@/lib/github/repository";
import { RepositoryCard } from "./repository-card";

type Status = "idle" | "loading" | "loadingMore" | "error";

export function RepositorySearch() {
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<RepositoryListItem[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [count, setCount] = useState(0);
  const [status, setStatus] = useState<Status>("idle");

  const runSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (trimmed === "") return;

    setQuery(trimmed);
    setStatus("loading");
    setItems([]);
    try {
      const result = await searchRepositoriesAction(trimmed);
      setItems(result.repositories);
      setCursor(result.pageInfo.endCursor);
      setHasNextPage(result.pageInfo.hasNextPage);
      setCount(result.repositoryCount);
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  };

  // 取得中フラグ。IntersectionObserver が連続発火しても同一カーソルで
  // 多重フェッチ（→重複アイテム）しないようにガードする。
  const loadingMoreRef = useRef(false);
  const loadMore = useCallback(async () => {
    if (!hasNextPage || cursor === null || loadingMoreRef.current) return;
    loadingMoreRef.current = true;
    setStatus("loadingMore");
    try {
      const result = await searchRepositoriesAction(query, cursor);
      setItems((prev) => [...prev, ...result.repositories]);
      setCursor(result.pageInfo.endCursor);
      setHasNextPage(result.pageInfo.hasNextPage);
      setStatus("idle");
    } catch {
      setStatus("error");
    } finally {
      loadingMoreRef.current = false;
    }
  }, [hasNextPage, cursor, query]);

  // 無限スクロール: センチネルが見えたら次ページを読み込む。
  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        loadMore();
      }
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={runSearch} className="flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="リポジトリ名を入力してください"
          className="flex-1 rounded-md border border-zinc-300 px-4 py-2 text-base outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
        />
        <button
          type="submit"
          className="rounded-md border border-zinc-300 bg-zinc-100 px-5 py-2 text-base font-medium transition-colors hover:bg-zinc-200 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700"
          disabled={status === "loading"}
        >
          検索
        </button>
      </form>

      {status === "error" && (
        <p className="text-sm text-red-600">検索中にエラーが発生しました。</p>
      )}

      {status === "loading" && <p className="text-sm text-zinc-500">検索中…</p>}

      {status !== "loading" && query !== "" && items.length === 0 && (
        <p className="text-sm text-zinc-500">
          「{query}」に一致するリポジトリはありませんでした。
        </p>
      )}

      {items.length > 0 && (
        <>
          <p className="text-sm text-zinc-500">
            {count.toLocaleString()} 件中 {items.length} 件を表示
          </p>
          <ul className="flex flex-col gap-3">
            {items.map((repository) => (
              <RepositoryCard key={repository.id} repository={repository} />
            ))}
          </ul>
        </>
      )}

      {/* 無限スクロール用センチネル */}
      <div ref={sentinelRef} className="h-px" />

      {status === "loadingMore" && (
        <p className="text-center text-sm text-zinc-500">読み込み中…</p>
      )}
    </div>
  );
}
