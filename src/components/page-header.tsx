export function PageHeader({ title }: { title: string }) {
  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto max-w-3xl px-6 py-4">
        <h1 className="text-4xl font-semibold tracking-widest text-black dark:text-zinc-50">
          {title}
        </h1>
      </div>
    </header>
  );
}
