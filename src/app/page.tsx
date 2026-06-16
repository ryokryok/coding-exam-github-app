import { notFound } from "next/navigation";
import * as v from "valibot";
import { RepositorySearch } from "@/components/repository-search";
import { RepositorySearchParamsSchema } from "@/lib/page/schema";

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Home({ searchParams }: PageProps) {
  // 検索語・ページは URL（?q=...&page=...）を単一の真実とし、Server Component で
  // 検証してから RepositorySearch に渡す。不正なパラメーターは 404 にする。
  const parsed = v.safeParse(RepositorySearchParamsSchema, await searchParams);
  if (!parsed.success) {
    notFound();
  }

  // 共通レイアウト（ヘッダー・main ラッパー）は layout.tsx に集約。
  const { q, page } = parsed.output;
  return <RepositorySearch query={q} page={page} />;
}
