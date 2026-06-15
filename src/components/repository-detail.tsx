import Image from "next/image";
import { type FragmentType, graphql, useFragment } from "@/lib/gql";

export const RepositoryDetailFragment = graphql(`
  fragment RepositoryDetail on Repository {
    nameWithOwner
    description
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

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-sm text-zinc-500">{label}</span>
      <span className="text-2xl font-semibold text-black dark:text-zinc-50">
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
          <a
            href={repo.url}
            target="_blank"
            rel="noreferrer"
            className="text-2xl font-semibold text-black hover:underline dark:text-zinc-50"
          >
            {repo.nameWithOwner}
          </a>
          <span className="text-zinc-500">
            {repo.primaryLanguage?.name ?? "言語不明"}
          </span>
        </div>
      </div>

      {repo.description && (
        <p className="mt-4 text-zinc-600 dark:text-zinc-400">
          {repo.description}
        </p>
      )}

      <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-4">
        <Stat label="Star数" value={repo.stargazerCount} />
        <Stat label="Watcher数" value={repo.watchers.totalCount} />
        <Stat label="Fork数" value={repo.forkCount} />
        <Stat label="Issue数" value={repo.issues.totalCount} />
      </div>
    </>
  );
}
