import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

const ICONS = {
  success: CheckCircleIcon,
  warning: ExclamationTriangleIcon,
  error: XCircleIcon,
  info: InformationCircleIcon
};

const STYLES = {
  success: 'border-[#10B981]/30 bg-[#10B981]/10 text-[#10B981]',
  warning: 'border-[#F59E0B]/30 bg-[#F59E0B]/10 text-[#F59E0B]',
  error: 'border-[#EF4444]/30 bg-[#EF4444]/10 text-[#EF4444]',
  info: 'border-[#3B82F6]/30 bg-[#3B82F6]/10 text-[#3B82F6]'
};

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  if (!toast) return null;

  const Icon = ICONS[toast.type || 'info'];
  const styleClass = STYLES[toast.type || 'info'];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="fixed bottom-6 right-6 z-50 flex max-w-md items-start gap-3 rounded-2xl border p-4 shadow-2xl backdrop-blur-md bg-[#0C110D]/95"
      >
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border ${styleClass}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-semibold text-[#EDF1EC]">{toast.title || 'Notification'}</h4>
          <p className="mt-0.5 text-xs text-[#A7B0AA] leading-relaxed">{toast.message}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-[#6E7871] hover:text-[#EDF1EC] text-xs font-medium px-1"
        >
          ✕
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
