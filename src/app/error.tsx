"use client";

import { useEffect } from "react";

/**
 * ルートのエラーバウンダリ。Server Component での取得失敗などをここで受け止める。
 *
 * @param error - 発生したエラー（`digest` はサーバー側ログとの突き合わせ用）。
 */
export default function ErrorBoundary({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    // 監視サービスへの送信などを想定。今はコンソールへ出すだけ。
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <h2 className="text-2xl font-bold tracking-wider text-black dark:text-zinc-50">
        エラーが発生しました
      </h2>
      <p className="text-sm text-zinc-500">
        時間をおいて再度お試しください。問題が続く場合は通信環境をご確認ください。
      </p>
      <button
        type="button"
        onClick={() => location.reload()} // 更新する
        className="rounded-lg border-2 border-(--neo-line) bg-green-400 px-5 py-2 text-base font-bold tracking-wider text-black shadow-[4px_4px_0_0_var(--neo-shadow)] transition-all hover:-translate-y-0.5 hover:bg-green-300 hover:shadow-[6px_6px_0_0_var(--neo-shadow)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_0_var(--neo-shadow)]"
      >
        再試行
      </button>
    </div>
  );
}
