export default function SectionHeader({ eyebrow, title, description, badge }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="text-[10px] uppercase tracking-[0.35em] text-[#B59B69]">{eyebrow}</p>
        <h2 className="mt-2 text-2xl font-semibold text-[#ECECEC]">{title}</h2>
        {description ? <p className="mt-2 max-w-2xl text-sm text-[#B8B8B8]">{description}</p> : null}
      </div>
      {badge ? <div className="rounded-full border border-[#79D46E]/25 bg-[#79D46E]/10 px-3 py-1 text-sm text-[#79D46E]">{badge}</div> : null}
    </div>
  );
}
