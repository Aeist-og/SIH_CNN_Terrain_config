import { motion } from 'framer-motion';

export default function AnalyticsChartCard({ title, subtitle, children, emptyState }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }} className="rounded-[32px] border border-white/10 bg-[rgba(24,33,28,0.45)] p-4 shadow-[0_20px_80px_rgba(0,0,0,0.28)] backdrop-blur-2xl sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.35em] text-[#B6A16E]">{title}</p>
          <h3 className="mt-2 text-lg font-semibold text-[#ECECEC]">{subtitle}</h3>
        </div>
      </div>
      <div className="mt-4">{emptyState ? emptyState : children}</div>
    </motion.div>
  );
}
