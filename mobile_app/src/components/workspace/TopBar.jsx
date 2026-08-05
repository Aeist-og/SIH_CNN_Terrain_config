import React, { useState } from 'react';
import {
  BellIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  CodeBracketIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

const PAGE_LABELS = {
  dashboard: 'System Dashboard',
  analyze: 'Primary Analysis Workspace',
  history: 'Analysis History',
  community: 'Community Explorer Hub',
  reports: 'PDF Studio Catalog',
  settings: 'System Settings',
};

export default function TopBar({
  page,
  onNavigate,
  onOpenMobileSidebar,
  onOpenCommandPalette,
  onOpenContextDrawer,
  username = 'SIH Operator',
  role = 'Autonomous Specialist',
  isServerOnline = false
}) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const pageLabel = PAGE_LABELS[page] || 'Workspace';

  return (
    <header className="flex h-[64px] shrink-0 items-center justify-between gap-3 border-b border-white/10 bg-[#121820]/75 px-4 lg:px-6 backdrop-blur-md">
      {/* Left Breadcrumb Nav */}
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="icon-btn lg:hidden"
          aria-label="Open mobile menu"
        >
          <Bars3Icon className="h-5 w-5" />
        </button>

        <div className="flex min-w-0 items-center gap-2 text-sm">
          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className="text-[#9ca3af] transition hover:text-[#f9fafb]"
          >
            Workspace
          </button>
          <span className="text-[#6b7280]">/</span>
          <span className="truncate font-semibold text-[#f9fafb]">{pageLabel}</span>
        </div>

        {/* System Status Chip */}
        <div className="hidden md:flex items-center gap-2 rounded-full border border-white/10 bg-[#1a222d] px-3 py-1 text-xs">
          <span className={`h-2 w-2 rounded-full ${isServerOnline ? 'bg-[#10b981] animate-pulse' : 'bg-[#f59e0b]'}`} />
          <span className="font-mono-code text-[11px] font-semibold text-[#f9fafb]">
            {isServerOnline ? 'Model API Online' : 'Local Inference'}
          </span>
        </div>
      </div>

      {/* Right Toolbar Actions */}
      <div className="flex items-center gap-2">
        {/* Command Palette Trigger (Ctrl + K) */}
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="hidden sm:flex items-center gap-2.5 rounded-xl border border-white/10 bg-[#1a222d] px-3.5 py-1.5 text-xs text-[#9ca3af] transition hover:border-[#10b981]/40 hover:text-[#f9fafb]"
        >
          <MagnifyingGlassIcon className="h-4 w-4 shrink-0 text-[#10b981]" />
          <span>Quick command search...</span>
          <kbd className="font-mono-code rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] text-[#9ca3af]">
            Ctrl + K
          </kbd>
        </button>

        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="icon-btn sm:hidden"
          aria-label="Search commands"
        >
          <MagnifyingGlassIcon className="h-[18px] w-[18px]" />
        </button>

        {/* Raw Telemetry Context Drawer Trigger */}
        <button
          type="button"
          onClick={onOpenContextDrawer}
          className="icon-btn"
          title="Open Telemetry Inspector"
        >
          <CodeBracketIcon className="h-[18px] w-[18px] text-[#10b981]" />
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setNotificationsOpen((prev) => !prev);
              setProfileOpen(false);
            }}
            className="icon-btn relative"
            aria-label="Notifications"
          >
            <BellIcon className="h-[18px] w-[18px]" />
            <span
              className={`absolute right-2 top-2 h-2 w-2 rounded-full ${
                isServerOnline ? 'bg-[#10b981]' : 'bg-[#f59e0b]'
              }`}
            />
          </button>

          <AnimatePresence>
            {notificationsOpen ? (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-[48px] z-40 w-[320px] rounded-xl border border-white/10 bg-[#121820] p-3 shadow-2xl space-y-2"
              >
                <p className="eyebrow px-1">System Notifications</p>
                <div className="rounded-lg border border-white/10 bg-[#1a222d] p-3 space-y-1">
                  <div className="flex items-center gap-2">
                    <ShieldCheckIcon className="h-4 w-4 text-[#10b981]" />
                    <span className="font-semibold text-xs text-[#f9fafb]">
                      {isServerOnline ? 'Backend Connected' : 'Standalone Mode'}
                    </span>
                  </div>
                  <p className="text-xs text-[#9ca3af]">
                    {isServerOnline
                      ? 'Flask backend endpoint active on localhost:5000.'
                      : 'Backend server offline. Running local client inference predictor.'}
                  </p>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        {/* Profile Switcher */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setProfileOpen((prev) => !prev);
              setNotificationsOpen(false);
            }}
            className={`flex items-center gap-2 rounded-xl border border-transparent p-1.5 transition hover:border-white/10 hover:bg-white/5 ${
              profileOpen ? 'border-white/10 bg-white/5' : ''
            }`}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1a222d] text-[11px] font-bold text-[#10b981] border border-[#10b981]/30">
              SIH
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-[13px] font-medium leading-tight text-[#f9fafb]">{username}</p>
              <p className="font-mono-code text-[10px] leading-tight text-[#6b7280]">{role}</p>
            </div>
            <ChevronDownIcon className="hidden h-3.5 w-3.5 text-[#6b7280] sm:block" />
          </button>

          <AnimatePresence>
            {profileOpen ? (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-[52px] z-40 w-52 rounded-xl border border-white/10 bg-[#121820] p-1.5 shadow-2xl"
              >
                <button
                  type="button"
                  onClick={() => { setProfileOpen(false); onNavigate('settings'); }}
                  className="w-full rounded-lg px-3 py-2 text-left text-xs text-[#9ca3af] hover:bg-white/5 hover:text-[#f9fafb]"
                >
                  Operator Settings
                </button>
                <button
                  type="button"
                  onClick={() => { setProfileOpen(false); onOpenContextDrawer(); }}
                  className="w-full rounded-lg px-3 py-2 text-left text-xs text-[#9ca3af] hover:bg-white/5 hover:text-[#f9fafb]"
                >
                  Telemetry Inspector
                </button>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="w-full rounded-lg px-3 py-2 text-left text-xs text-[#f43f5e] hover:bg-[#f43f5e]/10"
                >
                  Reload Workspace
                </button>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
