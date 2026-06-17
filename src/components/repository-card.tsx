import Image from "next/image";
import Link from "next/link";

/**
 * カードの枠・寸法（実カードとスケルトンで共有）。
 * これを変えると両者が同時に変わり、レイアウトシフトを防ぐ。
 */
export const CARD_FRAME =
  "flex items-center gap-4 rounded-xl border-2 border-(--neo-line) bg-white px-5 py-4 text-black shadow-[5px_5px_0_0_var(--neo-shadow)] dark:bg-zinc-950 dark:text-zinc-50";

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
    <article aria-label={nameWithOwner}>
      <Link
        href={`/repos/${ownerLogin}/${name}`}
        className={`${CARD_FRAME} transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-yellow-200 hover:shadow-[7px_7px_0_0_var(--neo-shadow)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_0_var(--neo-shadow)] dark:hover:bg-zinc-800`}
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
    </article>
  );
}
