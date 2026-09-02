import React, { useState } from 'react';
import { Member, RebaseSession } from '../../types/depth';
import { Shield, Copy, Check, Sun, Moon, HelpCircle, Sparkles } from 'lucide-react';

interface HeaderProps {
  activeMember: Member;
  members: Member[];
  onSelectMember: (id: string) => void;
  groupCode: string;
  rebaseSession: RebaseSession;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenRules: () => void;
  onOpenRebase: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeMember,
  members,
  onSelectMember,
  groupCode,
  rebaseSession,
  darkMode,
  onToggleDarkMode,
  onOpenRules,
  onOpenRebase,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(`https://depth15.app/join?code=${groupCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors shadow-sm">
      {/* Top Banner with Irish Rugby Green strip */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#0D6938] via-[#16A34A] to-[#0F1E36]" />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2 sm:gap-3">
        {/* Brand & Logo */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#0D6938] text-white flex items-center justify-center shadow-md shadow-emerald-900/20 font-bold text-lg tracking-wider border border-emerald-600/30 shrink-0">
            <span className="text-lg sm:text-xl">🏉</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-1">
                DEPTH 15
                <span className="text-[10px] sm:text-xs px-1.5 py-0.2 rounded font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-[#0D6938] dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                  IRL
                </span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block truncate">
              Ireland Rugby Squad Consensus Chart
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Re-Base status pill */}
          {rebaseSession.isOpen ? (
            <button
              onClick={onOpenRebase}
              className="flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700 animate-pulse"
            >
              <Sparkles className="w-3 h-3 text-amber-600" />
              <span className="hidden xs:inline">Gate {rebaseSession.currentGate}</span>
            </button>
          ) : (
            <button
              onClick={onOpenRebase}
              className="hidden md:flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-800 transition"
              title="Open Season 2026-27 Re-Base Window"
            >
              <Sparkles className="w-3 h-3 text-[#0D6938]" />
              <span>Season Re-Base</span>
            </button>
          )}

          {/* Group Share Link Code */}
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1 px-2 py-1 text-xs font-mono rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition"
            title="Copy invite link with group code"
          >
            <Shield className="w-3.5 h-3.5 text-[#0D6938] shrink-0" />
            <span className="font-semibold hidden sm:inline">{groupCode}</span>
            <span className="font-semibold sm:hidden text-[10px]">{groupCode.split('-')[0]}</span>
            {copied ? (
              <Check className="w-3 h-3 text-emerald-600 shrink-0" />
            ) : (
              <Copy className="w-3 h-3 text-slate-400 shrink-0" />
            )}
          </button>

          {/* Active Member Switcher */}
          <div className="relative flex items-center">
            <div className="flex items-center gap-1 px-1.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm max-w-[130px] xs:max-w-[170px] sm:max-w-none">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-xs shrink-0"
                style={{ backgroundColor: activeMember.color }}
              >
                {activeMember.initials}
              </div>
              <select
                value={activeMember.id}
                onChange={(e) => onSelectMember(e.target.value)}
                aria-label="Active participant"
                className="text-xs font-medium bg-transparent text-slate-800 dark:text-slate-200 focus:outline-hidden cursor-pointer pr-1 truncate max-w-[85px] xs:max-w-[125px] sm:max-w-[180px] md:max-w-none"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id} className="dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                    {m.name} ({m.role === 'owner' ? 'Owner' : m.role === 'lurker' ? 'Lurker' : 'Member'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Rules Modal Button */}
          <button
            onClick={onOpenRules}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition shrink-0"
            title="Pub rules & rating criteria"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition shrink-0"
            title={darkMode ? "Switch to Bright Light UI" : "Switch to Dark Mode"}
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        </div>
      </div>
    </header>
  );
};
