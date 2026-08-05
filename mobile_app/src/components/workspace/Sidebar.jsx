import React from 'react';
import {
  ChartBarSquareIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  PlusIcon,
  ShieldCheckIcon,
  SparklesIcon,
  Squares2X2Icon,
  GlobeAltIcon,
  BoltIcon
} from '@heroicons/react/24/outline';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: Squares2X2Icon, badge: 'Overview' },
  { id: 'analyze', label: 'Analyze Workspace', icon: SparklesIcon, shortcut: '⌘1' },
  { id: 'history', label: 'History Log', icon: ClockIcon, shortcut: '⌘2' },
  { id: 'community', label: 'Community Hub', icon: GlobeAltIcon, shortcut: '⌘3' },
  { id: 'reports', label: 'PDF Studio', icon: DocumentTextIcon, shortcut: '⌘4' },
  { id: 'settings', label: 'Settings', icon: Cog6ToothIcon, shortcut: '⌘5' },
];

export default function Sidebar({
  collapsed,
  onToggleCollapse,
  activeView,
  onNavigate,
  onNewAnalysis,
  recentItems = [],
  onQuickAnalyze,
  isMobileOpen,
  onCloseMobile,
  username = 'SIH Operator',
  role = 'Autonomous Specialist',
  isServerOnline = false
}) {
  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen ? (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={onCloseMobile} />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-white/10 bg-[#121820] transition-all duration-250 ease-in-out lg:static lg:z-auto lg:translate-x-0 ${
          isMobileOpen
            ? 'translate-x-0 w-[280px]'
            : collapsed
            ? '-translate-x-full w-[72px] lg:translate-x-0'
            : '-translate-x-full w-[280px] lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-[64px] shrink-0 items-center justify-between border-b border-white/10 px-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#10b981]/30 bg-[#10b981]/15 text-[#10b981]">
              <ShieldCheckIcon className="h-5 w-5" />
            </div>
            {!(collapsed && !isMobileOpen) ? (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold tracking-tight text-[#f9fafb]">TerrainVision AI</p>
                <p className="truncate font-mono-code text-[10px] text-[#6b7280]">v1.2.0 Workspace</p>
              </div>
            ) : null}
          </div>

          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="icon-btn hidden lg:inline-flex"
          >
            {collapsed ? <ChevronRightIcon className="h-4 w-4" /> : <ChevronLeftIcon className="h-4 w-4" />}
          </button>
        </div>

        {/* Content Body */}
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-3 py-3">
          {/* New Analysis Action */}
          <button type="button" onClick={onNewAnalysis} className="btn btn-primary w-full">
            <PlusIcon className="h-4 w-4" />
            {!(collapsed && !isMobileOpen) ? <span>New Analysis</span> : null}
          </button>

          {/* Primary Nav */}
          <nav className="space-y-1" aria-label="Primary Navigation">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = activeView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNavigate(item.id)}
                  className={`nav-item ${active ? 'nav-item-active' : ''} ${
                    collapsed && !isMobileOpen ? 'justify-center px-3' : ''
                  }`}
                >
                  <Icon className={`h-[18px] w-[18px] shrink-0 ${active ? 'text-[#10b981]' : ''}`} />
                  {!(collapsed && !isMobileOpen) ? (
                    <div className="flex flex-1 items-center justify-between min-w-0">
                      <span className="truncate">{item.label}</span>
                      {item.shortcut ? (
                        <kbd className="font-mono-code text-[10px] text-[#6b7280] bg-white/5 border border-white/10 px-1.5 py-0.5 rounded">
                          {item.shortcut}
                        </kbd>
                      ) : item.badge ? (
                        <span className="badge text-[10px] px-1.5 py-0.5">{item.badge}</span>
                      ) : null}
                    </div>
                  ) : null}
                </button>
              );
            })}
          </nav>

          {/* Workspace Status Chip */}
          {!(collapsed && !isMobileOpen) ? (
            <div className="rounded-xl border border-white/10 bg-[#1a222d] p-3 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#9ca3af]">Model Status:</span>
                <span className={`font-mono-code font-bold ${isServerOnline ? 'text-[#10b981]' : 'text-[#f59e0b]'}`}>
                  {isServerOnline ? 'Online' : 'Standby'}
                </span>
              </div>
              <p className="text-[10px] text-[#6b7280]">
                {isServerOnline ? 'Flask CNN inference engine connected' : 'Local predictor active'}
              </p>
            </div>
          ) : null}

          {/* Recent History Feed */}
          {!(collapsed && !isMobileOpen) && recentItems.length > 0 ? (
            <div className="min-h-0 pt-1">
              <p className="eyebrow px-2 pb-2">Recent Scans</p>
              <div className="space-y-1">
                {recentItems.slice(0, 4).map((item) => (
                  <button key={item.id} type="button" onClick={() => onQuickAnalyze(item)} className="nav-item">
                    <ChartBarSquareIcon className="h-[18px] w-[18px] shrink-0 text-[#6b7280]" />
                    <span className="truncate font-mono-code text-xs">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {/* User Footer */}
        <div className="shrink-0 border-t border-white/10 p-3">
          <button
            type="button"
            onClick={() => onNavigate('settings')}
            className={`flex w-full items-center gap-3 rounded-xl border border-transparent p-2 text-left transition hover:border-white/10 hover:bg-white/5 ${
              collapsed && !isMobileOpen ? 'justify-center px-0' : ''
            }`}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1a222d] text-xs font-bold text-[#10b981] border border-[#10b981]/30">
              {username
                .split(' ')
                .map((part) => part.charAt(0))
                .slice(0, 2)
                .join('')
                .toUpperCase() || 'OP'}
            </div>
            {!(collapsed && !isMobileOpen) ? (
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-[#f9fafb]">{username}</p>
                <p className="truncate font-mono-code text-[11px] text-[#6b7280]">{role}</p>
              </div>
            ) : null}
          </button>
        </div>
      </aside>
    </>
  );
}
