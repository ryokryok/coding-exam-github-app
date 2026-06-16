import Link from "next/link";

export function PageHeader({ title }: { title: string }) {
  return (
    <header className="sticky top-0 z-(--index-header) border-b-2 border-zinc-200 bg-white dark:border-zinc-800 dark:bg-black">
      <div className="mx-auto max-w-3xl px-6 py-4">
        <h1 className="text-4xl font-semibold tracking-widest text-black dark:text-zinc-50">
          <Link href="/" className="transition-opacity hover:opacity-70">
            {title}
          </Link>
        </h1>
      </div>
    </header>
  );
}
