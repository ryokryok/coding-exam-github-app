import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { buildSearchPath, getPageWindow } from "@/lib/page/search";

/** 無効状態（先頭/末尾での前へ/次へ）に付与するクラス。 */
const DISABLED_CLASS = "pointer-events-none opacity-50";

/**
 * 検索結果のページネーション。ページは URL の `?q=...&page=N` で保持する。
 * 表示計算は {@link getPageWindow}、URL 生成は {@link buildSearchPath} に委譲する。
 *
 * @param query - 現在の検索クエリ（リンク生成に使う）。
 * @param page - 現在のページ（1始まり）。
 * @param total - マッチした総件数。
 * @param pageSize - 1ページあたりの件数。
 * @param pathname - リンク先のパス（既定: `/`）。
 */
export function ResultPagination({
  query,
  page,
  total,
  pageSize,
  pathname = "/",
}: {
  query: string;
  page: number;
  total: number;
  pageSize: number;
  pathname?: string;
}) {
  const window = getPageWindow(page, total, pageSize);
  // ページが1つ以下なら何も出さない。
  if (window.totalPages <= 1) return null;

  const { current, totalPages, pages, isFirst, isLast } = window;
  const hrefFor = (target: number) => buildSearchPath(query, target, pathname);

  return (
    <Pagination className="pt-2">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            text="前へ"
            href={hrefFor(isFirst ? current : current - 1)}
            aria-disabled={isFirst}
            className={isFirst ? DISABLED_CLASS : undefined}
          />
        </PaginationItem>

        {/* 先頭ページと省略記号 */}
        {window.showFirst && (
          <>
            <PaginationItem>
              <PaginationLink href={hrefFor(1)}>1</PaginationLink>
            </PaginationItem>
            {window.showLeadingEllipsis && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
          </>
        )}

        {pages.map((p) => (
          <PaginationItem key={p}>
            <PaginationLink href={hrefFor(p)} isActive={p === current}>
              {p}
            </PaginationLink>
          </PaginationItem>
        ))}

        {/* 末尾ページと省略記号 */}
        {window.showLast && (
          <>
            {window.showTrailingEllipsis && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
            <PaginationItem>
              <PaginationLink href={hrefFor(totalPages)}>
                {totalPages}
              </PaginationLink>
            </PaginationItem>
          </>
        )}

        <PaginationItem>
          <PaginationNext
            text="次へ"
            href={hrefFor(isLast ? current : current + 1)}
            aria-disabled={isLast}
            className={isLast ? DISABLED_CLASS : undefined}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
