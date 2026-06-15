import Image from "next/image";
import Link from "next/link";
import { type FragmentType, graphql, useFragment } from "@/lib/gql";

export const RepositoryCardFragment = graphql(`
  fragment RepositoryCard on Repository {
    name
    nameWithOwner
    owner {
      login
      avatarUrl
    }
  }
`);

export function RepositoryCard({
  repository,
}: {
  repository: FragmentType<typeof RepositoryCardFragment>;
}) {
  const repo = useFragment(RepositoryCardFragment, repository);

  return (
    <li>
      <Link
        href={`/repos/${repo.owner.login}/${repo.name}`}
        className="flex items-center gap-4 rounded-xl border border-zinc-200 px-5 py-4 transition-colors hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:border-zinc-600 dark:hover:bg-zinc-900"
      >
        <Image
          src={repo.owner.avatarUrl}
          alt={`${repo.owner.login} のアイコン`}
          width={40}
          height={40}
          className="shrink-0 rounded-full"
        />
        <span className="truncate text-base font-medium text-black dark:text-zinc-50">
          {repo.nameWithOwner}
        </span>
      </Link>
    </li>
  );
}
