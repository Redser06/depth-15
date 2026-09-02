import React from 'react';
import {
  LayoutGrid,
  Smartphone,
  MessageSquare,
  AlertTriangle,
  TrendingUp,
  ShieldAlert,
  Sparkles,
  GitCompare,
} from 'lucide-react';

export type TabType = 'chart' | 'pub' | 'proposals' | 'contested' | 'movers' | 'vulnerability' | 'rebase' | 'diff';

interface NavigationProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  openProposalsCount: number;
  contestedCount: number;
  isRebaseOpen: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onSelectTab,
  openProposalsCount,
  contestedCount,
  isRebaseOpen,
}) => {
  const tabs = [
    { id: 'chart' as TabType, label: '15-Position Chart', icon: LayoutGrid },
    { id: 'pub' as TabType, label: 'Pub Mode', icon: Smartphone, highlight: true },
    {
      id: 'proposals' as TabType,
      label: 'Debates & Votes',
      icon: MessageSquare,
      badge: openProposalsCount > 0 ? openProposalsCount : undefined,
      badgeColor: 'bg-emerald-600 text-white',
    },
    {
      id: 'contested' as TabType,
      label: 'Contested Table',
      icon: AlertTriangle,
      badge: contestedCount > 0 ? contestedCount : undefined,
      badgeColor: 'bg-amber-500 text-slate-900',
    },
    { id: 'movers' as TabType, label: 'Movers', icon: TrendingUp },
    { id: 'vulnerability' as TabType, label: 'Vulnerability', icon: ShieldAlert },
    {
      id: 'rebase' as TabType,
      label: 'Season Re-Base',
      icon: Sparkles,
      badge: isRebaseOpen ? 'LIVE' : undefined,
      badgeColor: 'bg-amber-500 text-slate-900 animate-pulse',
    },
    { id: 'diff' as TabType, label: 'History & Diff', icon: GitCompare },
  ];

  return (
    <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 sticky top-[57px] z-20 shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center gap-1 sm:gap-2 overflow-x-auto py-2 no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-[#0D6938] text-white shadow-xs shadow-emerald-900/10 dark:bg-emerald-600'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : tab.highlight ? 'text-[#0D6938] dark:text-emerald-400' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold leading-tight ${tab.badgeColor}`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
