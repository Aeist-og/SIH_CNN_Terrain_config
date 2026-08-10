import React, { useState } from 'react';
import {
  ShieldCheckIcon,
  SparklesIcon,
  CpuChipIcon,
  DocumentTextIcon,
  UserIcon,
  ArrowRightIcon,
  XMarkIcon,
  KeyIcon,
  EnvelopeIcon,
  UserCircleIcon,
  CheckCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

const SAVED_DEMO_ACCOUNTS = [
  {
    id: 'demo-1',
    username: 'Dr. Aris Thorne',
    role: 'Lead Vision Specialist',
    email: 'dr.thorne@terrainvision.ai',
    avatarLetter: 'AT',
    accentColor: 'from-[#10b981] to-[#0ea5e9]'
  },
  {
    id: 'demo-2',
    username: 'Clara Vance',
    role: 'Autonomous Robotics Researcher',
    email: 'clara.vance@terrainvision.ai',
    avatarLetter: 'CV',
    accentColor: 'from-[#0ea5e9] to-[#6366f1]'
  },
  {
    id: 'demo-3',
    username: 'Rover Tech Team',
    role: 'Field Systems Operator Group',
    email: 'tech.team@terrainvision.ai',
    avatarLetter: 'RT',
    accentColor: 'from-[#f59e0b] to-[#10b981]'
  }
];

export default function LandingView({ onEnterWorkspace, onLoginSuccess }) {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('Autonomous Specialist');
  const [selectedDemoId, setSelectedDemoId] = useState('demo-1');

  const handleSelectDemoAccount = (acc) => {
    setSelectedDemoId(acc.id);
    onLoginSuccess({
      username: acc.username,
      role: acc.role,
      email: acc.email
    });
  };

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    const userPayload = {
      username: name || (email ? email.split('@')[0] : 'SIH Operator'),
      role: role || 'Autonomous Specialist',
      email: email || 'operator@terrainvision.ai'
    };
    onLoginSuccess(userPayload);
    setIsAuthOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#0b0f14] text-[#f9fafb] selection:bg-[#10b981] selection:text-black font-sans relative overflow-x-hidden">
      {/* Background Radial Blur Glows */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[550px] bg-gradient-to-b from-[#10b981]/20 via-[#0ea5e9]/10 to-transparent blur-[140px] rounded-full" />
      <div className="pointer-events-none absolute bottom-0 right-0 w-[550px] h-[550px] bg-[#10b981]/10 blur-[160px] rounded-full" />

      {/* Header */}
      <header className="relative z-10 flex h-[72px] items-center justify-between border-b border-white/10 px-6 lg:px-12 backdrop-blur-md bg-[#0b0f14]/80">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#10b981]/30 bg-[#10b981]/15 text-[#10b981] shadow-lg shadow-[#10b981]/10">
            <ShieldCheckIcon className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-[#f9fafb]">TerrainVision AI</h1>
            <p className="text-[10px] text-[#6b7280]">Autonomous Vision & Geotechnical Perception</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onOpenAuth?.('login')}
            className="btn btn-ghost text-xs"
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => onOpenAuth?.('signup')}
            className="btn btn-primary text-xs shadow-md shadow-[#10b981]/15"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 py-16 lg:py-24 text-center space-y-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#10b981]/30 bg-[#10b981]/10 px-4 py-1.5 text-xs text-[#10b981] font-medium backdrop-blur-md">
          <SparklesIcon className="h-4 w-4" />

        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[#f9fafb] leading-tight max-w-4xl mx-auto">
          Autonomous Terrain Recognition & <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#10b981] via-[#0ea5e9] to-[#10b981]">Geotechnical Intelligence</span>
        </h1>

        <p className="max-w-2xl mx-auto text-base sm:text-lg text-[#9ca3af] leading-relaxed">
          Real-time CNN surface classification, Grad-CAM explainability heatmaps, low-confidence safety rejection, and automated PDF report streaming for planetary rovers & UGVs.
        </p>

        {/* 1-CLICK INSTANT DEMO ACCOUNTS SELECTOR (Instagram / Google Style) */}
        <div className="card p-6 max-w-2xl mx-auto space-y-4 border-white/15 bg-[#121820]/90 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2 text-left">
              <UserCircleIcon className="h-5 w-5 text-[#10b981]" />
              <div>
                <h3 className="text-sm font-bold text-[#f9fafb]">Saved Operator Accounts</h3>
                <p className="text-[11px] text-[#9ca3af]">Click any account to launch workspace instantly</p>
              </div>
            </div>
            <span className="badge badge-success text-[10px]">1-Click Quick Login</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {SAVED_DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.id}
                type="button"
                onClick={() => handleSelectDemoAccount(acc)}
                className="group relative flex flex-col items-center justify-between rounded-xl border border-white/10 bg-[#1a222d] p-4 text-center hover:border-[#10b981]/50 hover:bg-[#10b981]/5 transition-all shadow-md"
              >
                <div className="flex flex-col items-center gap-2">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr ${acc.accentColor} text-white font-bold text-base shadow-lg`}>
                    {acc.avatarLetter}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#f9fafb] group-hover:text-[#10b981] transition">{acc.username}</h4>
                    <p className="text-[10px] text-[#9ca3af] mt-0.5">{acc.role}</p>
                  </div>
                </div>

                <div className="mt-3 inline-flex items-center gap-1 text-[10px] font-semibold text-[#10b981]">
                  <span>Log in</span>
                  <ArrowRightIcon className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <button
            type="button"
            onClick={onEnterWorkspace}
            className="btn btn-primary px-8 py-3 text-sm shadow-xl shadow-[#10b981]/20 flex items-center gap-2"
          >
            <span>Enter Workspace Directly</span>
            <ArrowRightIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Feature Cards Grid (Glassmorphism) */}
        <div className="grid gap-6 sm:grid-cols-3 pt-8 text-left">
          <div className="card p-6 space-y-3 border-white/10 hover:border-[#10b981]/40 transition bg-[#121820]/60 backdrop-blur-lg">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#10b981]/10 text-[#10b981]">
              <CpuChipIcon className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-[#f9fafb]">CNN Vision Classifier</h3>
            <p className="text-xs text-[#9ca3af] leading-relaxed">
              Classifies surface substrates into 5 terrain categories with confidence safety rejection below 50%.
            </p>
          </div>

          <div className="card p-6 space-y-3 border-white/10 hover:border-[#0ea5e9]/40 transition bg-[#121820]/60 backdrop-blur-lg">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0ea5e9]/10 text-[#0ea5e9]">
              <SparklesIcon className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-[#f9fafb]">Grad-CAM Heatmaps</h3>
            <p className="text-xs text-[#9ca3af] leading-relaxed">
              Gradient-weighted feature attribution maps for real-time model explainability and opacity blending.
            </p>
          </div>

          <div className="card p-6 space-y-3 border-white/10 hover:border-[#f59e0b]/40 transition bg-[#121820]/60 backdrop-blur-lg">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f59e0b]/10 text-[#f59e0b]">
              <DocumentTextIcon className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-[#f9fafb]">Geotechnical Matrix & PDF</h3>
            <p className="text-xs text-[#9ca3af] leading-relaxed">
              Calculates surface roughness ($R_a$), friction ($\mu$), bearing capacity, and streams PDF assessment reports.
            </p>
          </div>
        </div>
      </section>

      {/* Custom Auth Modal */}
      <AnimatePresence>
        {isAuthOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-md"
              onClick={() => setIsAuthOpen(false)}
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative z-10 w-full max-w-md rounded-2xl border border-white/15 bg-[#121820] p-6 shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <UserIcon className="h-5 w-5 text-[#10b981]" />
                  <h2 className="text-base font-semibold">
                    {authTab === 'login' ? 'Operator Sign In' : 'Create Operator Account'}
                  </h2>
                </div>
                <button type="button" onClick={() => setIsAuthOpen(false)} className="icon-btn">
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {authTab === 'signup' ? (
                  <>
                    <div>
                      <label className="eyebrow block mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Dr. Aris Thorne"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="eyebrow block mb-1">Role / Designation</label>
                      <input
                        type="text"
                        placeholder="e.g. Lead Autonomous Systems Specialist"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="input"
                      />
                    </div>
                  </>
                ) : null}

                <div>
                  <label className="eyebrow block mb-1">Email Address</label>
                  <div className="relative">
                    <EnvelopeIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b7280]" />
                    <input
                      type="email"
                      required
                      placeholder="operator@terrainvision.ai"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input pl-9"
                    />
                  </div>
                </div>

                <div>
                  <label className="eyebrow block mb-1">Password</label>
                  <div className="relative">
                    <KeyIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b7280]" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input pl-9"
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary w-full py-2.5 mt-2">
                  {authTab === 'login' ? 'Sign In to Workspace' : 'Create & Enter Workspace'}
                </button>
              </form>

              <div className="text-center text-xs text-[#9ca3af] pt-2 border-t border-white/10">
                {authTab === 'login' ? (
                  <p>
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setAuthTab('signup')}
                      className="text-[#10b981] font-semibold hover:underline"
                    >
                      Sign Up
                    </button>
                  </p>
                ) : (
                  <p>
                    Already registered?{' '}
                    <button
                      type="button"
                      onClick={() => setAuthTab('login')}
                      className="text-[#10b981] font-semibold hover:underline"
                    >
                      Sign In
                    </button>
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
