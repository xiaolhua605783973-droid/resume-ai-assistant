type SectionTitleProps = {
  eyebrow: string;
  title: string;
  description?: string;
};

export function SectionTitle({ eyebrow, title, description }: SectionTitleProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-700">
        {eyebrow}
      </p>
      <h2 className="text-2xl font-semibold text-slate-950">{title}</h2>
      {description ? (
        <p className="max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
          {description}
        </p>
      ) : null}
    </div>
  );
}
