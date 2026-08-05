import React, { useState } from 'react';
import {
  ShieldCheckIcon,
  UserIcon,
  EnvelopeIcon,
  KeyIcon,
  UserCircleIcon,
  ArrowRightIcon,
  SparklesIcon,
  CheckCircleIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

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

export default function AuthView({ onLoginSuccess, onBackToLanding }) {
  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('Autonomous Specialist');
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const userPayload = {
      username: name || (email ? email.split('@')[0] : 'SIH Operator'),
      role: role || 'Autonomous Specialist',
      email: email || 'operator@terrainvision.ai'
    };

    onLoginSuccess(userPayload);
  };

  const handleSelectDemo = (acc) => {
    onLoginSuccess({
      username: acc.username,
      role: acc.role,
      email: acc.email
    });
  };

  return (
    <div className="min-h-screen bg-[#0b0f14] text-[#f9fafb] flex flex-col justify-between selection:bg-[#10b981] selection:text-black font-sans relative overflow-hidden">
      {/* Background Radial Blurs */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[550px] bg-gradient-to-b from-[#10b981]/15 via-[#0ea5e9]/10 to-transparent blur-[140px] rounded-full" />

      {/* Top Header */}
      <header className="relative z-10 flex h-[72px] items-center justify-between border-b border-white/10 px-6 lg:px-12 backdrop-blur-md bg-[#0b0f14]/80">
        <button
          type="button"
          onClick={onBackToLanding}
          className="flex items-center gap-2 text-xs text-[#9ca3af] hover:text-[#f9fafb] transition font-medium"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          <span>Back to Overview</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#10b981]/30 bg-[#10b981]/15 text-[#10b981]">
            <ShieldCheckIcon className="h-5 w-5" />
          </div>
          <span className="text-sm font-bold tracking-tight">TerrainVision AI</span>
        </div>
      </header>

      {/* Main Auth Container */}
      <div className="relative z-10 my-auto mx-auto w-full max-w-md px-4 py-8">
        <div className="card p-8 space-y-6 border-white/15 bg-[#121820]/90 backdrop-blur-xl shadow-2xl rounded-2xl">
          {/* Header & Tabs */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#10b981]/30 bg-[#10b981]/10 px-3 py-1 text-[11px] text-[#10b981] font-semibold">
              <SparklesIcon className="h-3.5 w-3.5" />
              <span>Operator Portal</span>
            </div>

            <h1 className="text-2xl font-bold text-[#f9fafb] tracking-tight">
              {mode === 'login' ? 'Sign In to Operator Workspace' : 'Create Operator Account'}
            </h1>
            <p className="text-xs text-[#9ca3af]">
              {mode === 'login'
                ? 'Select a 1-click saved demo account or enter credentials.'
                : 'Register your details to access the Vision Workspace.'}
            </p>
          </div>

          {/* Mode Tabs */}
          <div className="grid grid-cols-2 gap-1 rounded-xl border border-white/10 bg-[#1a222d] p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`py-2 rounded-lg transition ${
                mode === 'login' ? 'bg-[#10b981] text-black shadow-md' : 'text-[#9ca3af] hover:text-[#f9fafb]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`py-2 rounded-lg transition ${
                mode === 'signup' ? 'bg-[#10b981] text-black shadow-md' : 'text-[#9ca3af] hover:text-[#f9fafb]'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Error Alert */}
          {error ? (
            <div className="rounded-xl border border-[#f43f5e]/30 bg-[#f43f5e]/10 p-3 text-xs text-[#f43f5e]">
              {error}
            </div>
          ) : null}

          {/* 1-CLICK SAVED DEMO ACCOUNTS (Login Mode) */}
          {mode === 'login' ? (
            <div className="space-y-3 pt-1">
              <span className="eyebrow block">Instant 1-Click Accounts</span>
              <div className="grid gap-2">
                {SAVED_DEMO_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => handleSelectDemo(acc)}
                    className="group flex items-center justify-between rounded-xl border border-white/10 bg-[#1a222d] p-3 hover:border-[#10b981]/50 hover:bg-[#10b981]/5 transition text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr ${acc.accentColor} text-white font-bold text-xs shadow-md`}>
                        {acc.avatarLetter}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#f9fafb] group-hover:text-[#10b981] transition">
                          {acc.username}
                        </h4>
                        <p className="text-[10px] text-[#9ca3af]">{acc.role}</p>
                      </div>
                    </div>

                    <ArrowRightIcon className="h-4 w-4 text-[#10b981] opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition" />
                  </button>
                ))}
              </div>

              <div className="relative my-4 flex items-center justify-center">
                <div className="w-full border-t border-white/10" />
                <span className="absolute bg-[#121820] px-3 font-mono-code text-[10px] text-[#6b7280]">OR</span>
              </div>
            </div>
          ) : null}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' ? (
              <>
                <div>
                  <label className="eyebrow block mb-1">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b7280]" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Aris Thorne"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="input pl-9"
                    />
                  </div>
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

            {mode === 'signup' ? (
              <div>
                <label className="eyebrow block mb-1">Confirm Password</label>
                <div className="relative">
                  <KeyIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b7280]" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input pl-9"
                  />
                </div>
              </div>
            ) : null}

            <button type="submit" className="btn btn-primary w-full py-3 text-xs font-bold shadow-xl shadow-[#10b981]/20">
              {mode === 'login' ? 'Sign In to Workspace' : 'Create & Launch Workspace'}
            </button>
          </form>

          {/* Footer toggle */}
          <div className="text-center text-xs text-[#9ca3af] border-t border-white/10 pt-4">
            {mode === 'login' ? (
              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="text-[#10b981] font-semibold hover:underline"
                >
                  Sign Up
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-[#10b981] font-semibold hover:underline"
                >
                  Sign In
                </button>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-4 text-center font-mono-code text-[11px] text-[#6b7280]">
        TerrainVision AI • Smart India Hackathon Perception System
      </footer>
    </div>
  );
}
