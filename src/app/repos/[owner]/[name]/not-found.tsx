import Link from "next/link";

/**
 * リポジトリ詳細の NotFound ページ。
 * page.tsx で `notFound()` が呼ばれたとき（存在しない・非公開など）に描画される。
 */
export default function RepositoryNotFound() {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <h2 className="text-2xl font-bold tracking-wider text-black dark:text-zinc-50">
        リポジトリが見つかりませんでした
      </h2>
      <p className="text-sm text-zinc-500">
        指定したリポジトリは存在しないか、非公開の可能性があります。
      </p>
      <Link
        href="/"
        className="rounded-lg border-2 border-(--neo-line) bg-green-400 px-5 py-2 text-base font-bold tracking-wider text-black shadow-[4px_4px_0_0_var(--neo-shadow)] transition-all hover:-translate-y-0.5 hover:bg-green-300 hover:shadow-[6px_6px_0_0_var(--neo-shadow)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_0_var(--neo-shadow)]"
      >
        検索に戻る
      </Link>
    </div>
  );
}
