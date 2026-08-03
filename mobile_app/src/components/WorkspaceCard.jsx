export default function WorkspaceCard({ title, summary, badge, footer }) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-[rgba(22,30,25,0.45)] p-5 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-[#ECECEC]">{title}</h3>
        {badge ? <span className="rounded-full border border-[#79D46E]/20 bg-[#79D46E]/10 px-2.5 py-1 text-xs text-[#79D46E]">{badge}</span> : null}
      </div>
      <p className="mt-3 text-sm leading-6 text-[#B8B8B8]">{summary}</p>
      {footer ? <div className="mt-4 border-t border-white/10 pt-4 text-sm text-[#ECECEC]/70">{footer}</div> : null}
    </div>
  );
}
