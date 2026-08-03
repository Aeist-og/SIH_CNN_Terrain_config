export default function StatCard({ title, value, caption, accent = 'text-[#ECECEC]' }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-[#050806]/60 p-4 backdrop-blur-xl">
      <p className="text-[10px] uppercase tracking-[0.3em] text-[#B6A16E]">{title}</p>
      <p className={`mt-3 text-2xl font-semibold ${accent}`}>{value}</p>
      <p className="mt-2 text-sm text-[#ECECEC]/60">{caption}</p>
    </div>
  );
}
