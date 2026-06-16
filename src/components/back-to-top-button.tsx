/**
 * ページ右下に固定表示する「Top へ戻る」ボタン。
 *
 * @param onClick - クリック時の動作（先頭へスクロールするなど）。
 */
export function BackToTopButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed right-6 bottom-6 z-(--index-back-to-top) rounded-full border-2 border-zinc-300 bg-white px-4 py-2 text-sm font-medium shadow-md transition-colors hover:border-green-600 hover:text-green-700 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-green-500 dark:hover:text-green-400"
    >
      ↑ Top
    </button>
  );
}
