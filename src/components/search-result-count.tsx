/**
 * 検索結果の件数バー（「{total} 件」）。
 * total 未指定（読み込み中）はプレースホルダを表示する。
 *
 * @param total - マッチした総件数。
 */
export function SearchResultCount({ total }: { total?: number }) {
  const loaded = total !== undefined;
  return (
    <p className="w-fit rounded-lg border-2 border-(--neo-line) bg-yellow-300 px-3 py-1 text-base font-bold tracking-wider text-black shadow-[3px_3px_0_0_var(--neo-shadow)]">
      {loaded ? (
        `${total.toLocaleString()} 件`
      ) : (
        <span className="inline-block h-4 w-40 animate-pulse rounded bg-zinc-200 align-middle dark:bg-zinc-800" />
      )}
    </p>
  );
}
