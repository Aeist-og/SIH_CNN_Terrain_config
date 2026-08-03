import { motion } from 'framer-motion';
import {
  AdjustmentsHorizontalIcon,
  ChartBarIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  CpuChipIcon,
  CubeTransparentIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  ShieldCheckIcon,
  SparklesIcon,
  DocumentTextIcon,
  FolderOpenIcon,
  CpuChipIcon as ModelIcon,
} from '@heroicons/react/24/outline';

const navItems = [
  { id: 'overview', label: 'Dashboard', icon: ChartBarIcon },
  { id: 'analysis', label: 'Terrain Analysis', icon: CubeTransparentIcon },
  { id: 'analytics', label: 'Analytics', icon: CpuChipIcon },
  { id: 'reports', label: 'Reports', icon: DocumentTextIcon },
  { id: 'dataset', label: 'Dataset', icon: FolderOpenIcon },
  { id: 'model', label: 'Model', icon: ModelIcon },
  { id: 'settings', label: 'Settings', icon: AdjustmentsHorizontalIcon },
  { id: 'about', label: 'About Model', icon: SparklesIcon },
];

const recentAnalyses = [
  { id: 'mission-alpha', label: 'Mission Alpha', icon: ShieldCheckIcon },
  { id: 'forest-survey', label: 'Forest Survey', icon: SparklesIcon },
  { id: 'rocky-ridge', label: 'Rocky Ridge', icon: CubeTransparentIcon },
  { id: 'desert-route', label: 'Desert Route', icon: ChartBarIcon },
];

export default function SidebarNav({ activeView, onChange, isOnline, modelStatus, collapsed, onToggleCollapse }) {
  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 280 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="flex h-full shrink-0 flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[rgba(22,30,25,0.45)] shadow-[0_20px_80px_rgba(0,0,0,0.32)] backdrop-blur-2xl"
    >
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#79D46E]/25 bg-[#79D46E]/10">
            <ShieldCheckIcon className="h-5 w-5 text-[#79D46E]" />
          </div>
          {!collapsed ? (
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#B59B69]">TerraIntel</p>
              <h2 className="truncate text-sm font-semibold text-[#ECECEC]">Mission Workspace</h2>
            </div>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onToggleCollapse}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-[#050806]/70 text-[#ECECEC]/70 transition hover:border-[#79D46E]/30 hover:text-[#79D46E] focus:outline-none focus:ring-2 focus:ring-[#79D46E]/30"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronDoubleRightIcon className="h-4 w-4" /> : <ChevronDoubleLeftIcon className="h-4 w-4" />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3">
        <div className="rounded-[20px] border border-white/10 bg-[#050806]/70 p-3">
          <button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#79D46E] px-3 py-3 text-sm font-semibold text-[#050806] transition hover:bg-[#6bc560] focus:outline-none focus:ring-2 focus:ring-[#79D46E]/40">
            <PlusIcon className="h-4 w-4" />
            {!collapsed ? 'New Analysis' : null}
          </button>

          {!collapsed ? (
            <label className="mt-3 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-[#B8B8B8]">
              <MagnifyingGlassIcon className="h-4 w-4 text-[#B59B69]" />
              <input className="w-full bg-transparent text-sm text-[#ECECEC] outline-none placeholder:text-[#B8B8B8]/70" placeholder="Search analyses" />
            </label>
          ) : null}
        </div>

        {!collapsed ? (
          <div className="mt-4">
            <p className="px-2 text-[10px] uppercase tracking-[0.3em] text-[#B59B69]">Recent Analyses</p>
            <div className="mt-3 space-y-2">
              {recentAnalyses.map((item) => {
                const Icon = item.icon;
                return (
                  <button key={item.id} className="flex w-full items-center gap-3 rounded-2xl border border-transparent px-3 py-2.5 text-left text-sm text-[#ECECEC]/70 transition hover:border-white/10 hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-[#79D46E]/30">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 text-[#B59B69]">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        <nav className="mt-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeView === item.id;
            return (
              <motion.button
                key={item.id}
                whileHover={{ x: 2, scale: 1.002 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onChange(item.id)}
                className={`flex w-full items-center rounded-2xl px-3 py-2.5 text-left transition focus:outline-none focus:ring-2 focus:ring-[#79D46E]/30 ${
                  active
                    ? 'bg-[#79D46E]/12 text-[#ECECEC] shadow-[inset_0_0_0_1px_rgba(121,212,110,0.18)]'
                    : 'text-[#ECECEC]/70 hover:bg-white/5 hover:text-[#ECECEC]'
                }`}
              >
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${active ? 'bg-[#79D46E]/15 text-[#79D46E]' : 'bg-white/5 text-[#B8B8B8]'}`}>
                  <Icon className="h-4 w-4" />
                </span>
                {!collapsed ? <span className="ml-3 truncate text-sm font-medium">{item.label}</span> : null}
              </motion.button>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-white/10 px-3 py-3">
        <div className={`rounded-[20px] border border-white/10 bg-[#050806]/70 p-3 ${collapsed ? 'space-y-2' : 'space-y-3'}`}>
          <div className="flex items-center justify-between">
            <span className={`text-[10px] uppercase tracking-[0.3em] text-[#B59B69] ${collapsed ? 'hidden' : 'block'}`}>Model Status</span>
            <span className={`inline-flex h-2.5 w-2.5 rounded-full ${isOnline ? 'bg-[#79D46E]' : 'bg-[#C55F5F]'}`} />
          </div>
          {!collapsed ? (
            <>
              <div className="space-y-1 text-sm text-[#ECECEC]/70">
                <div className="flex items-center justify-between">
                  <span>API</span>
                  <span className="text-[#79D46E]">{isOnline ? 'Online' : 'Standby'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Version</span>
                  <span>1.0.0</span>
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-[#B8B8B8]">{modelStatus}</div>
            </>
          ) : null}
        </div>
      </div>
    </motion.aside>
  );
}
