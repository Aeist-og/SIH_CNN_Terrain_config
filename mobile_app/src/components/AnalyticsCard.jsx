import { motion } from 'framer-motion';

export default function AnalyticsCard({ title, value, caption, tone = 'default' }) {
  const toneClasses = {
    default: 'border-white/10 bg-[#050806]/70 text-[#ECECEC]',
    success: 'border-[#79D46E]/20 bg-[#79D46E]/10 text-[#79D46E]',
    muted: 'border-white/10 bg-white/5 text-[#ECECEC]/70',
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }} className={`rounded-[24px] border p-4 ${toneClasses[tone] || toneClasses.default}`}>
      <p className="text-[10px] uppercase tracking-[0.3em] text-[#B6A16E]">{title}</p>
      <p className="mt-3 text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-sm text-[#ECECEC]/70">{caption}</p>
    </motion.div>
  );
}
