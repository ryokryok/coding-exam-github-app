/**
 * 検索結果の件数バー（「{total} 件」）。
 * total 未指定（読み込み中）はプレースホルダを表示する。
 *
 * @param total - マッチした総件数。
 */
export function SearchResultCount({ total }: { total?: number }) {
  const loaded = total !== undefined;
  return (
    <p className="border-b-2 border-zinc-200 bg-white py-2 text-base font-medium tracking-wider text-zinc-800 dark:border-zinc-800 dark:bg-black dark:text-zinc-100">
      {loaded ? (
        `${total.toLocaleString()} 件`
      ) : (
        <span className="inline-block h-4 w-40 animate-pulse rounded bg-zinc-200 align-middle dark:bg-zinc-800" />
      )}
    </p>
  );
}
