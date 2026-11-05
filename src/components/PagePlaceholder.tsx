type PagePlaceholderProps = {
  title: string;
  description: string;
};

export default function PagePlaceholder({
  title,
  description,
}: PagePlaceholderProps) {
  return (
    <section className="rounded-xl border border-dashed border-zinc-300 bg-white p-8">
      <h1 className="text-2xl font-semibold text-zinc-900">{title}</h1>
      <p className="mt-2 text-zinc-600">{description}</p>
      <p className="mt-6 text-sm text-zinc-500">
        Halaman ini masih berupa kerangka dan siap untuk diimplementasikan.
      </p>
    </section>
  );
}
