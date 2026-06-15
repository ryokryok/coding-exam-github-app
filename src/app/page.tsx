import { Suspense } from "react";
import { RepositorySearch } from "@/components/repository-search";

export default function Home() {
  // 共通レイアウト（ヘッダー・main ラッパー）は layout.tsx に集約。
  // RepositorySearch は useSearchParams を使うため Suspense が必要。
  return (
    <Suspense>
      <RepositorySearch />
    </Suspense>
  );
}
