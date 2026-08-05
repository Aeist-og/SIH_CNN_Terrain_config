import React, { useEffect, useState } from 'react';
import {
  MagnifyingGlassIcon,
  SparklesIcon,
  ClockIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  PhotoIcon,
  XMarkIcon,
  Squares2X2Icon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

const COMMANDS = [
  { id: 'nav-dashboard', label: 'Go to Dashboard', category: 'Navigation', icon: Squares2X2Icon, action: 'dashboard' },
  { id: 'nav-analyze', label: 'Go to Primary Analysis Workspace', category: 'Navigation', icon: SparklesIcon, action: 'analyze' },
  { id: 'nav-history', label: 'Go to Analysis History', category: 'Navigation', icon: ClockIcon, action: 'history' },
  { id: 'nav-reports', label: 'Go to PDF Assessment Studio', category: 'Navigation', icon: DocumentTextIcon, action: 'reports' },
  { id: 'nav-settings', label: 'Go to System Settings', category: 'Navigation', icon: Cog6ToothIcon, action: 'settings' },

  { id: 'sample-1', label: 'Load Dataset Sample: Rocky Slope (test_1.jpg)', category: 'Dataset Samples', icon: PhotoIcon, sample: 'test_1.jpg' },
  { id: 'sample-2', label: 'Load Dataset Sample: Waterlogged Marsh (test_2.jpg)', category: 'Dataset Samples', icon: PhotoIcon, sample: 'test_2.jpg' },
  { id: 'sample-3', label: 'Load Dataset Sample: Meadow Pasture (test_3.jpg)', category: 'Dataset Samples', icon: PhotoIcon, sample: 'test_3.jpg' },
  { id: 'sample-4', label: 'Load Dataset Sample: Desert Dunes (test_4.jpg)', category: 'Dataset Samples', icon: PhotoIcon, sample: 'test_4.jpg' },
  { id: 'sample-5', label: 'Load Dataset Sample: Arctic Ice (test_5.jpg)', category: 'Dataset Samples', icon: PhotoIcon, sample: 'test_5.jpg' },
];

export default function CommandPalette({ isOpen, onClose, onNavigate, onSelectSample }) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(true);
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredCommands = COMMANDS.filter((cmd) =>
    cmd.label.toLowerCase().includes(query.toLowerCase()) ||
    cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (cmd) => {
    onClose();
    if (cmd.action) {
      onNavigate(cmd.action);
    } else if (cmd.sample) {
      onSelectSample(cmd.sample);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.96, opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-[#121820] shadow-2xl z-10 text-[#f9fafb]"
        >
          {/* Input Box */}
          <div className="flex items-center border-b border-white/10 px-4 py-3">
            <MagnifyingGlassIcon className="h-5 w-5 text-[#10b981] shrink-0" />
            <input
              type="text"
              autoFocus
              placeholder="Search views, dataset samples, commands (Ctrl + K)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent px-3 text-sm outline-none placeholder:text-[#6b7280] text-[#f9fafb]"
            />
            <button type="button" onClick={onClose} className="icon-btn">
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>

          {/* Results List */}
          <div className="max-h-80 overflow-y-auto p-2 space-y-1">
            {filteredCommands.length > 0 ? (
              filteredCommands.map((cmd) => {
                const Icon = cmd.icon;
                return (
                  <button
                    key={cmd.id}
                    type="button"
                    onClick={() => handleSelect(cmd)}
                    className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-xs transition hover:bg-white/5 hover:text-[#10b981]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon className="h-4 w-4 shrink-0 text-[#6b7280]" />
                      <span className="truncate font-medium">{cmd.label}</span>
                    </div>
                    <span className="badge font-mono-code text-[10px] shrink-0">{cmd.category}</span>
                  </button>
                );
              })
            ) : (
              <div className="py-8 text-center text-xs text-[#6b7280]">
                No matching commands or sample datasets found.
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
