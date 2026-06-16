import { CARD_FRAME } from "./repository-card";

// CARD_FRAME を共有し、実カードと同寸でレイアウトシフトを防ぐ。
function RepositoryCardSkeleton() {
  return (
    <div className={CARD_FRAME}>
      <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
      <div className="h-4 w-1/2 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
    </div>
  );
}

/** スケルトンカードを count 枚並べたプレースホルダ。 */
export function RepositoryCardSkeletonList({ count = 6 }: { count?: number }) {
  const keys = Array.from({ length: count }, (_, index) => `skeleton-${index}`);
  return (
    <ul aria-hidden className="flex flex-col gap-3">
      {keys.map((key) => (
        <li key={key}>
          <RepositoryCardSkeleton />
        </li>
      ))}
    </ul>
  );
}
