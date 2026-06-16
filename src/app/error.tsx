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
      <h2 className="text-2xl font-bold tracking-wider text-zinc-800 dark:text-zinc-100">
        エラーが発生しました
      </h2>
      <p className="text-sm text-zinc-500">
        時間をおいて再度お試しください。問題が続く場合は通信環境をご確認ください。
      </p>
      <button
        type="button"
        onClick={() => location.reload()} // 更新する
        className="rounded-md border-2 border-transparent bg-green-700 px-5 py-2 text-base font-bold tracking-wider text-white transition-colors hover:bg-green-800 dark:bg-green-700 dark:hover:bg-green-600"
      >
        再試行
      </button>
    </div>
  );
}
