import Image from "next/image";
import Link from "next/link";

/**
 * カードの枠・寸法（実カードとスケルトンで共有）。
 * これを変えると両者が同時に変わり、レイアウトシフトを防ぐ。
 */
export const CARD_FRAME =
  "flex items-center gap-4 rounded-xl border-2 border-zinc-200 px-5 py-4 dark:border-zinc-800";

/**
 * カード表示に必要なプレーンなデータ。
 *
 * GraphQL の Fragment / マスキングからは切り離し、表示だけを担う。データ取得側
 * （Server Component の RepositorySearch）が Fragment を unmask して、この形の
 * serializable なオブジェクトに整形してから渡す。
 */
export type RepositoryCardData = {
  /** リポジトリ名（owner なし。詳細ページの URL に使う）。 */
  name: string;
  /** `owner/name` 形式の表示名。 */
  nameWithOwner: string;
  /** オーナーのログイン名。 */
  ownerLogin: string;
  /** オーナーのアバター画像 URL。 */
  avatarUrl: string;
};

export function RepositoryCard({
  name,
  nameWithOwner,
  ownerLogin,
  avatarUrl,
}: RepositoryCardData) {
  return (
    <Link
      href={`/repos/${ownerLogin}/${name}`}
      className={`${CARD_FRAME} transition-colors hover:border-zinc-400 hover:bg-zinc-50 dark:hover:border-zinc-600 dark:hover:bg-zinc-900`}
    >
      <Image
        src={avatarUrl}
        alt={`${ownerLogin} のアイコン`}
        width={40}
        height={40}
        className="shrink-0 rounded-full"
      />
      <span className="truncate text-base font-medium tracking-wide text-black dark:text-zinc-50">
        {nameWithOwner}
      </span>
    </Link>
  );
}
