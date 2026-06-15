import { Suspense } from "react";
import { PageHeader } from "@/components/page-header";
import { RepositorySearch } from "@/components/repository-search";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-white dark:bg-black">
      <PageHeader title="リポジトリ検索" />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-8">
        {/* RepositorySearch は useSearchParams を使うため Suspense が必要。 */}
        <Suspense>
          <RepositorySearch />
        </Suspense>
      </main>
    </div>
  );
}
