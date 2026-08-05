import React, { useState } from 'react';
import {
  UserCircleIcon,
  EnvelopeIcon,
  ArrowLeftOnRectangleIcon,
  TrashIcon,
  CheckIcon,
  ShieldCheckIcon,
  AdjustmentsHorizontalIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { exportDatabaseSpreadsheet } from '../../services/api';

export default function Settings({
  user,
  onUpdateProfile,
  onSignOut,
  onDeleteAccount,
  confidenceThreshold = 50,
  onConfidenceThresholdChange,
  onTriggerToast
}) {
  const [name, setName] = useState(user?.username || 'SIH Operator');
  const [designation, setDesignation] = useState(user?.role || 'Autonomous Specialist');
  const [threshold, setThreshold] = useState(confidenceThreshold);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    onUpdateProfile?.({ username: name.trim(), role: designation.trim() });
    onTriggerToast?.('success', 'Profile Updated', 'Your profile name, designation, and preferences have been saved.');
  };

  const handleReportComplaint = () => {
    const email = 'hhhworkk@gmail.com';
    const subject = encodeURIComponent('TerrainVision AI - Technical Complaint / Issue Report');
    const body = encodeURIComponent(
      `Operator Name: ${name}\nRole: ${designation}\nDate: ${new Date().toLocaleString()}\n\nDescription of Complaint / Feedback:\n`
    );
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    onTriggerToast?.('info', 'Support Mail Client', 'Opening email draft to hhhworkk@gmail.com');
  };

  const handleConfirmDelete = () => {
    setIsDeleteModalOpen(false);
    onDeleteAccount?.();
    const email = 'hhhworkk@gmail.com';
    const subject = encodeURIComponent(`Account Deletion Request - ${name}`);
    const body = encodeURIComponent(`Account deletion requested for Operator: ${name} (${designation}).`);
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="page-enter space-y-6">
      {/* Workspace Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[#f9fafb]">Operator Profile & System Settings</h1>
        <p className="mt-1 text-sm text-[#9ca3af]">Manage your profile details, safety threshold preferences, and account controls.</p>
      </div>

      {/* 1. Top Profile & Designation Card */}
      <div className="card p-6 space-y-5 border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#1a222d] text-[#10b981] border-2 border-[#10b981]/40 text-xl font-bold font-mono-code shadow-lg shadow-[#10b981]/10">
              {name
                .split(' ')
                .map((part) => part.charAt(0))
                .slice(0, 2)
                .join('')
                .toUpperCase() || 'OP'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-[#f9fafb]">{name}</h2>
                <span className="badge badge-success text-[10px]">Verified Operator</span>
              </div>
              <p className="text-xs text-[#9ca3af] font-mono-code mt-0.5">{designation}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSaveProfile}
            className="btn btn-primary self-start sm:self-auto shadow-lg shadow-[#10b981]/15"
          >
            <CheckIcon className="h-4 w-4" />
            Save Profile & Preferences
          </button>
        </div>

        {/* Profile Edit Fields */}
        <form onSubmit={handleSaveProfile} className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="eyebrow block mb-1">Operator Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input font-medium"
            />
          </div>

          <div>
            <label className="eyebrow block mb-1">Role / Designation</label>
            <input
              type="text"
              required
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              className="input font-medium"
            />
          </div>
        </form>
      </div>

      {/* 2. Safety Confidence Threshold Adjuster Card */}
      <div className="card p-6 space-y-4 border-white/10">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#10b981]/10 text-[#10b981]">
            <AdjustmentsHorizontalIcon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[#f9fafb]">Safety Rejection Threshold</h2>
            <p className="text-xs text-[#9ca3af]">Adjust confidence limit for low-confidence rejection filtering</p>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#1a222d] p-4 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#f9fafb]">Confidence Safety Limit:</span>
            <span className="font-mono-code font-bold text-[#10b981]">{threshold}% Confidence</span>
          </div>
          <input
            type="range"
            min="30"
            max="80"
            step="5"
            value={threshold}
            onChange={(e) => {
              const val = Number(e.target.value);
              setThreshold(val);
              onConfidenceThresholdChange?.(val);
            }}
            className="w-full accent-[#10b981] cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-[#6b7280] font-mono-code">
            <span>30% (Permissive)</span>
            <span>50% (Standard Safety)</span>
            <span>80% (Strict Filter)</span>
          </div>
        </div>
      </div>

      {/* 3. Account Actions & Support Card */}
      <div className="card p-6 space-y-4 border-white/10">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0ea5e9]/10 text-[#0ea5e9]">
            <EnvelopeIcon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[#f9fafb]">Support & Session Controls</h2>
            <p className="text-xs text-[#9ca3af]">Report technical issues or manage session state</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          {/* Report Complaint Button */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleReportComplaint}
              className="btn btn-secondary text-xs flex items-center gap-2"
            >
              <EnvelopeIcon className="h-4 w-4 text-[#0ea5e9]" />
              <span>Report Complaint (hhhworkk@gmail.com)</span>
            </button>

            <button
              type="button"
              onClick={async () => {
                const res = await exportDatabaseSpreadsheet();
                if (res.success) {
                  onTriggerToast?.('success', 'Spreadsheet Exported', 'Database records downloaded as CSV spreadsheet.');
                } else {
                  onTriggerToast?.('error', 'Export Failure', res.error || 'Failed to export database.');
                }
              }}
              className="btn btn-primary text-xs flex items-center gap-2"
            >
              <DocumentArrowDownIcon className="h-4 w-4 text-[#10b981]" />
              <span>Export Database (.csv / .xlsx)</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Sign Out Button */}
            <button
              type="button"
              onClick={onSignOut}
              className="btn btn-ghost text-xs text-[#9ca3af] hover:text-[#f9fafb]"
            >
              <ArrowLeftOnRectangleIcon className="h-4 w-4" />
              <span>Sign Out</span>
            </button>

            {/* Delete Account Button */}
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(true)}
              className="btn btn-danger text-xs flex items-center gap-2"
            >
              <TrashIcon className="h-4 w-4" />
              <span>Delete Account</span>
            </button>
          </div>
        </div>
      </div>

      {/* Delete Account Modal Confirmation */}
      <AnimatePresence>
        {isDeleteModalOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-md"
              onClick={() => setIsDeleteModalOpen(false)}
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative z-10 w-full max-w-md rounded-2xl border border-[#f43f5e]/40 bg-[#121820] p-6 shadow-2xl space-y-5 text-[#f9fafb]"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2.5 text-[#f43f5e]">
                  <ExclamationTriangleIcon className="h-6 w-6" />
                  <h3 className="text-base font-bold">Delete Account Confirmation</h3>
                </div>
                <button type="button" onClick={() => setIsDeleteModalOpen(false)} className="icon-btn">
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>

              <p className="text-xs text-[#9ca3af] leading-relaxed">
                Are you sure you want to permanently delete your operator account (<strong className="text-[#f9fafb]">{name}</strong>)? This will purge your session profile and send a deletion notice to <code className="text-[#0ea5e9]">hhhworkk@gmail.com</code>.
              </p>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="btn btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="btn btn-danger text-xs font-bold"
                >
                  Confirm Account Deletion
                </button>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
