"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode, MouseEvent } from "react";

/**
 * 1つ前の履歴へ戻るリンク。
 *
 * 検索画面は検索条件を URL（?q=...）で保持しているため、`router.back()` で
 * 戻れば検索結果一覧をそのままの条件で再現できる。別タブ・共有リンクから
 * 詳細を直接開いた場合はアプリ内の履歴が無いため、`fallbackPath` へ
 * 遷移する。`href` には `fallbackPath` を設定しているので、右クリックや
 * 新規タブで開いた場合もアンカーとして正しく機能する。
 *
 * @param fallbackPath - 戻れる履歴が無い場合の遷移先。
 */
export function BackLink({
  children,
  className,
  fallbackPath,
}: {
  children: ReactNode;
  className?: string;
  fallbackPath: string;
}) {
  const router = useRouter();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    // 同一タブ内に戻れる履歴があれば戻る。無ければ href（fallbackPath）へ遷移。
    if (window.history.length > 1) {
      event.preventDefault();
      router.back();
    }
  };

  return (
    <Link href={fallbackPath} onClick={handleClick} className={className}>
      {children}
    </Link>
  );
}
