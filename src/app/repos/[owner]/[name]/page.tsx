import { notFound } from "next/navigation";
import * as v from "valibot";
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

  // getRepository は「見つからない時は null、通信/GraphQL エラー時は throw」を返す。
  // - null（存在しない・非公開）→ notFound() で NotFound ページ
  // - throw（通信失敗など）→ そのまま伝播させ error.tsx で受け止める
  // notFound() は内部で例外を throw して動くため、try-catch で囲んではいけない
  // （catch が握りつぶすと NotFound が表示されない）。
  const repository = await getRepository(owner, name);
  if (!repository) {
    notFound();
  }

  return <RepositoryDetail repository={repository} />;
}
