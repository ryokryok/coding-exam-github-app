import Link from "next/link";

export function PageHeader({ title }: { title: string }) {
  return (
    <header className="sticky top-0 z-(--index-header) border-b-2 border-(--neo-line) bg-white dark:bg-black">
      <div className="mx-auto max-w-3xl px-6 py-4">
        <h1 className="text-4xl font-bold tracking-widest">
          <Link
            href="/"
            className="text-outline inline-block text-yellow-300 underline decoration-(--neo-line) decoration-4 underline-offset-8 transition-all hover:-translate-y-0.5"
          >
            {title}
          </Link>
        </h1>
      </div>
    </header>
  );
}
