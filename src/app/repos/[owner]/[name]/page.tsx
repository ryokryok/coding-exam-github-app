import { notFound } from "next/navigation";
import * as v from "valibot";
import { BackLink } from "@/components/back-link";
import { RepositoryDetail } from "@/components/repository-detail";
import { getRepository } from "@/lib/github/repository";
import { RepositoryParamsSchema } from "@/lib/github/schema";

type PageProps = {
  params: Promise<{ owner: string; name: string }>;
};

export default async function RepositoryDetailPage({ params }: PageProps) {
  // 不正なパスは 404 にする。
  const parsed = v.safeParse(RepositoryParamsSchema, await params);
  if (!parsed.success) {
    notFound();
  }

  const { owner, name } = parsed.output;
  const repository = await getRepository(owner, name);

  if (!repository) {
    notFound();
  }

  return (
    <>
      <BackLink
        fallbackPath="/"
        className="text-sm text-zinc-500 transition-colors hover:text-black dark:hover:text-zinc-50"
      >
        ← 検索結果へ戻る
      </BackLink>

      <RepositoryDetail repository={repository} />
    </>
  );
}
