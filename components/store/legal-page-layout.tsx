export function LegalPageLayout({
  title,
  updatedAt,
  children,
}: {
  title: string;
  updatedAt?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="container-content py-10 xs:py-12 md:py-16">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-3xl font-semibold text-ink-700 xs:text-4xl">{title}</h1>
        {updatedAt && <p className="mt-2 text-sm text-ink-300">Last updated: {updatedAt}</p>}
        <div className="prose-legal mt-8 flex flex-col gap-5 text-base leading-relaxed text-ink-500">
          {children}
        </div>
      </div>
    </div>
  );
}
