import Image from "next/image";
import Link from "next/link";
import type { IconType } from "react-icons";
import { CgEye, CgGitFork } from "react-icons/cg";
import { VscIssues, VscStarEmpty } from "react-icons/vsc";
import { type FragmentType, graphql, useFragment } from "@/lib/gql";

export const RepositoryDetailFragment = graphql(`
  fragment RepositoryDetail on Repository {
    nameWithOwner
    url
    stargazerCount
    forkCount
    watchers {
      totalCount
    }
    issues(states: OPEN) {
      totalCount
    }
    primaryLanguage {
      name
    }
    owner {
      login
      avatarUrl
    }
  }
`);

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: IconType;
  label: string;
  value: number;
}) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl border-2 border-(--neo-line) bg-white px-2 py-4 shadow-[4px_4px_0_0_var(--neo-shadow)] dark:bg-zinc-950">
      <Icon aria-hidden className="text-4xl text-zinc-500 dark:text-zinc-400" />
      <span className="text-sm text-zinc-500">{label}</span>
      <span className="text-2xl font-bold text-black dark:text-zinc-50">
        {value.toLocaleString()}
      </span>
    </div>
  );
}

export function RepositoryDetail({
  repository,
}: {
  repository: FragmentType<typeof RepositoryDetailFragment>;
}) {
  const repo = useFragment(RepositoryDetailFragment, repository);

  return (
    <>
      <div className="mt-6 flex items-center gap-4">
        <Image
          src={repo.owner.avatarUrl}
          alt={`${repo.owner.login} のアイコン`}
          width={64}
          height={64}
          className="shrink-0 rounded-full"
        />
        <div className="flex flex-col gap-1">
          <Link href={repo.url} target="_blank" rel="noreferrer">
            <h2 className="text-2xl font-bold tracking-wider text-black hover:underline dark:text-zinc-50">
              {repo.nameWithOwner}
            </h2>
          </Link>
          <span className="text-zinc-500 tracking-wide">
            {repo.primaryLanguage?.name ?? "言語不明"}
          </span>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-4">
        <Stat icon={VscStarEmpty} label="Star" value={repo.stargazerCount} />
        <Stat icon={CgEye} label="Watcher" value={repo.watchers.totalCount} />
        <Stat icon={CgGitFork} label="Fork" value={repo.forkCount} />
        <Stat icon={VscIssues} label="Issue" value={repo.issues.totalCount} />
      </div>
    </>
  );
}
