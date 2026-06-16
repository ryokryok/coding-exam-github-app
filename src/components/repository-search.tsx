"use client";

import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  type SubmitEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { searchRepositoriesAction } from "@/actions/repositories";
import type { RepositoryListItem } from "@/lib/github/repository";
import { BackToTopButton } from "./back-to-top-button";
import { RepositoryCard } from "./repository-card";
import { RepositoryCardSkeletonList } from "./repository-card-skeleton";
import { SearchResultCount } from "./search-result-count";

type Status = "idle" | "loading" | "loadingMore" | "error";

/** 検索文字列を保持する URL クエリパラメーター名。 */
const QUERY_PARAM = "q";

/** 行の初期見積もり高さ（px）。実測（measureElement）で上書きされる。 */
const ESTIMATED_ROW_HEIGHT = 76;
/** 行間（Tailwind の gap-3 相当）。 */
const ROW_GAP = 12;
/** 可視範囲の上下に余分に描画する行数。 */
const OVERSCAN = 6;
/** この高さ以上スクロールしたら「Top へ戻る」を表示する（px）。 */
const BACK_TO_TOP_THRESHOLD = 600;

export function RepositorySearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 検索語は URL（?q=...）を単一の真実とする。共有・リロード・戻る/進むで
  // 同じ検索結果を再現できる。
  const query = searchParams.get(QUERY_PARAM)?.trim() ?? "";

  const [input, setInput] = useState(query); // 入力欄の文字列
  const [items, setItems] = useState<RepositoryListItem[]>([]); // 取得済みリポジトリ
  const [cursor, setCursor] = useState<string | null>(null); // 次ページ取得用カーソル
  const [hasNextPage, setHasNextPage] = useState(false); // 次ページの有無
  const [total, setTotal] = useState(0); // マッチした総件数
  const [status, setStatus] = useState<Status>("idle"); // 取得状態

  // フォーム送信時は URL を書き換えるだけ。実際の検索は下の effect が
  // URL の変化を検知して実行する。
  const runSearch = (event: SubmitEvent) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (trimmed === "") return;

    const params = new URLSearchParams();
    params.set(QUERY_PARAM, trimmed);
    router.push(`${pathname}?${params.toString()}`);
  };

  // URL の検索語が変わるたびに1ページ目を取得する。初回マウント時
  // （共有 URL でのアクセス）にも走る。
  useEffect(() => {
    if (query === "") {
      setItems([]);
      setCursor(null);
      setHasNextPage(false);
      setTotal(0);
      setStatus("idle");
      return;
    }

    let cancelled = false;
    setStatus("loading");
    setItems([]);
    searchRepositoriesAction(query)
      .then((result) => {
        if (cancelled) return;
        setItems(result.repositories);
        setCursor(result.pageInfo.endCursor);
        setHasNextPage(result.pageInfo.hasNextPage);
        setTotal(result.repositoryCount);
        setStatus("idle");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [query]);

  // 多重フェッチ（重複アイテム）を防ぐ取得中フラグ。
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

  // --- 仮想化 ---------------------------------------------------------------
  // ページ（ウィンドウ）スクロールのまま、window virtualizer で可視範囲のみ描画。
  const listRef = useRef<HTMLUListElement>(null);
  const hasResults = items.length > 0;

  // scrollMargin 用にリスト開始位置のオフセットを測る。
  const [listOffset, setListOffset] = useState(0);
  useEffect(() => {
    if (!hasResults) return;
    const measure = () => {
      if (listRef.current) {
        setListOffset(
          listRef.current.getBoundingClientRect().top + window.scrollY,
        );
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [hasResults]);

  const virtualizer = useWindowVirtualizer({
    count: items.length,
    estimateSize: () => ESTIMATED_ROW_HEIGHT,
    overscan: OVERSCAN,
    gap: ROW_GAP,
    scrollMargin: listOffset,
  });

  const virtualItems = virtualizer.getVirtualItems();

  // 無限スクロール: 末尾付近の行が可視範囲に入ったら次ページを読み込む。
  useEffect(() => {
    const last = virtualItems.at(-1);
    if (!last) return;
    if (
      last.index >= items.length - 1 &&
      hasNextPage &&
      !loadingMoreRef.current
    ) {
      loadMore();
    }
  }, [virtualItems, hasNextPage, items.length, loadMore]);

  const showBackToTop = (virtualizer.scrollOffset ?? 0) > BACK_TO_TOP_THRESHOLD;

  // 入力があり取得中でなければ送信可能。
  const canSubmit = input.trim() !== "" && status !== "loading";

  return (
    // ルートの gap は ROW_GAP に合わせる。
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
      {status === "error" && (
        <p className="text-sm text-red-600">検索中にエラーが発生しました。</p>
      )}
      {status !== "loading" && query !== "" && items.length === 0 && (
        <p className="text-sm text-zinc-500">
          「{query}」に一致するリポジトリはありませんでした。
        </p>
      )}
      {/* 読み込み中も同じ構造で描画し、バー差し込みによるレイアウトシフトを防ぐ。 */}
      {(status === "loading" || hasResults) && (
        <>
          {hasResults ? (
            <SearchResultCount total={total} count={items.length} />
          ) : (
            <SearchResultCount />
          )}

          {hasResults ? (
            // 仮想リスト本体。総高さ分の箱を作り、可視行だけ絶対配置する。
            <ul
              ref={listRef}
              className="relative w-full"
              style={{ height: `${virtualizer.getTotalSize()}px` }}
            >
              {virtualItems.map((virtualRow) => {
                const repository = items[virtualRow.index];
                if (!repository) return null;
                return (
                  <li
                    key={virtualRow.key}
                    data-index={virtualRow.index}
                    ref={virtualizer.measureElement}
                    className="absolute left-0 top-0 w-full"
                    style={{
                      transform: `translateY(${
                        virtualRow.start - virtualizer.options.scrollMargin
                      }px)`,
                    }}
                  >
                    <RepositoryCard repository={repository} />
                  </li>
                );
              })}
            </ul>
          ) : (
            <RepositoryCardSkeletonList count={6} />
          )}
        </>
      )}
      {status === "loadingMore" && <RepositoryCardSkeletonList count={3} />}
      {showBackToTop && (
        <BackToTopButton
          onClick={() =>
            virtualizer.scrollToOffset(0, {
              align: "start",
              behavior: "smooth",
            })
          }
        />
      )}
    </div>
  );
}
