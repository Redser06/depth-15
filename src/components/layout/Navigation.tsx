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
  Compass,
  LineChart,
} from 'lucide-react';

export type TabType = 'chart' | 'pitch' | 'analytics' | 'pub' | 'proposals' | 'contested' | 'movers' | 'vulnerability' | 'rebase' | 'diff';

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
    { id: 'pitch' as TabType, label: 'Tactical Pitch', icon: Compass, highlight: true },
    { id: 'analytics' as TabType, label: 'Analyst Charts', icon: LineChart },
    { id: 'pub' as TabType, label: 'Pub Mode', icon: Smartphone },
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
    <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-2 sm:px-6 sticky top-[57px] z-20 shadow-xs w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto flex items-center gap-1 overflow-x-auto no-scrollbar py-2 touch-pan-x overscroll-x-contain">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-bold shrink-0 transition relative ${
                isActive
                  ? 'bg-[#0D6938] text-white shadow-xs'
                  : tab.highlight
                  ? 'text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${tab.badgeColor}`}
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
