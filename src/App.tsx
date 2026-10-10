import React, { useState, useMemo } from 'react';
import { useDepthStore } from './lib/store';
import { POSITIONS } from './data/baseline2025';
import { Header } from './components/layout/Header';
import { Navigation, TabType } from './components/layout/Navigation';
import { OverviewGrid } from './components/chart/OverviewGrid';
import { PositionCard } from './components/chart/PositionCard';
import { SelectionConflictBanner } from './components/chart/SelectionConflictBanner';
import { PubModeView } from './components/views/PubModeView';
import { ProposalList } from './components/proposals/ProposalList';
import { ProposalModal } from './components/proposals/ProposalModal';
import { ContestedView } from './components/views/ContestedView';
import { MoversView } from './components/views/MoversView';
import { VulnerabilityView } from './components/views/VulnerabilityView';
import { SnapshotsDiffView } from './components/views/SnapshotsDiffView';
import { RebaseWizard } from './components/rebase/RebaseWizard';
import { RulesModal } from './components/views/RulesModal';
import { RugbyPitchView } from './components/analytics/RugbyPitchView';
import { AnalystChartsView } from './components/analytics/AnalystChartsView';
import { TransferPlayerModal } from './components/modals/TransferPlayerModal';
import { AddBreakthroughPlayerModal } from './components/modals/AddBreakthroughPlayerModal';
import { PlayerEntry, Position, Proposal, Province, PROVINCES } from './types/depth';
import { Search, RotateCcw, ArrowRightLeft, UserPlus } from 'lucide-react';

export const App: React.FC = () => {
  const store = useDepthStore();

  const [currentTab, setCurrentTab] = useState<TabType>('chart');
  const [selectedPosId, setSelectedPosId] = useState<number>(10); // Default to Fly-Half (10) for pub debate
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [positionFilter, setPositionFilter] = useState<'all' | 'Forwards' | 'Backs'>('all');
  const [provinceFilter, setProvinceFilter] = useState<'all' | Province>('all');

  // Modals state
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [proposalTargetPlayer, setProposalTargetPlayer] = useState<PlayerEntry | undefined>();
  const [proposalTargetPosition, setProposalTargetPosition] = useState<Position | undefined>();
  const [proposalRationale, setProposalRationale] = useState<string>('');
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);

  // Transfer & Breakthrough Modals state
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferTargetPlayer, setTransferTargetPlayer] = useState<PlayerEntry | undefined>();
  const [isBreakthroughModalOpen, setIsBreakthroughModalOpen] = useState(false);
  const [breakthroughDefaultPosId, setBreakthroughDefaultPosId] = useState<number>(10);

  // Use the resolved ladders where every position has a distinct #1 starter
  const playersByPos = store.resolvedSelection.adjustedLadders;

  const handleChallengePlayer = (player: PlayerEntry) => {
    setProposalTargetPlayer(player);
    setProposalTargetPosition(POSITIONS.find((p) => p.id === player.pos));
    setProposalRationale('');
    setIsProposalModalOpen(true);
  };

  const handleAddPlayer = (pos: Position) => {
    handleOpenBreakthrough(pos.id);
  };

  const handleOpenTransfer = (player?: PlayerEntry) => {
    setTransferTargetPlayer(player);
    setIsTransferModalOpen(true);
  };

  const handleOpenBreakthrough = (posId?: number) => {
    setBreakthroughDefaultPosId(posId ?? selectedPosId ?? 10);
    setIsBreakthroughModalOpen(true);
  };

  const handleOpenPubView = (posId: number) => {
    setSelectedPosId(posId);
    setCurrentTab('pub');
  };

  const handleViewProposal = (_prop: Proposal) => {
    setCurrentTab('proposals');
  };

  const handleStartSelectionDebate = (playerName: string, posId: number, rationale: string) => {
    const pos = POSITIONS.find((p) => p.id === posId);
    const player = store.players.find((p) => p.name === playerName && p.pos === posId);
    setProposalTargetPlayer(player);
    setProposalTargetPosition(pos);
    setProposalRationale(rationale);
    setIsProposalModalOpen(true);
  };

  const openProposals = store.proposals.filter((p) => p.status === 'open');
  const contestedPlayers = store.players.filter((p) => p.isContested);

  // Unique active players for province counts
  const uniquePlayers = useMemo(() => {
    const map = new Map<string, PlayerEntry>();
    store.players.forEach((p) => {
      const key = p.name.toLowerCase().trim();
      if (!map.has(key)) map.set(key, p);
    });
    return Array.from(map.values());
  }, [store.players]);

  const provinceCounts = useMemo(() => {
    const counts: Record<string, number> = { all: uniquePlayers.length };
    PROVINCES.forEach((prov) => {
      counts[prov] = uniquePlayers.filter((p) => (p.province ?? 'Other') === prov).length;
    });
    return counts;
  }, [uniquePlayers]);

  // Filtered ladder per position if province filter is active
  const displayedPlayersByPos = useMemo(() => {
    if (provinceFilter === 'all') return playersByPos;
    const filtered: Record<number, PlayerEntry[]> = {};
    Object.entries(playersByPos).forEach(([posId, list]) => {
      filtered[Number(posId)] = (list ?? []).filter((p) => (p.province ?? 'Other') === provinceFilter);
    });
    return filtered;
  }, [playersByPos, provinceFilter]);

  // Filter positions for main chart
  const displayedPositions = POSITIONS.filter((pos) => {
    if (positionFilter !== 'all' && pos.group !== positionFilter) return false;
    const candidateList = displayedPlayersByPos[pos.id] ?? [];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const posMatches = pos.name.toLowerCase().includes(q) || pos.abbr.toLowerCase().includes(q);
      const playerMatches = candidateList.some((pl) =>
        pl.name.toLowerCase().includes(q)
      );
      return posMatches || playerMatches;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F8FAF8] dark:bg-[#090E17] text-slate-900 dark:text-slate-100 flex flex-col selection:bg-emerald-100 selection:text-emerald-900 transition-colors w-full max-w-full overflow-x-hidden">
      {/* App Header */}
      <Header
        activeMember={store.activeMember}
        members={store.members}
        onSelectMember={store.setActiveMemberId}
        groupCode={store.groupCode}
        rebaseSession={store.rebaseSession}
        darkMode={store.darkMode}
        onToggleDarkMode={() => store.setDarkMode(!store.darkMode)}
        onOpenRules={() => setIsRulesModalOpen(true)}
        onOpenRebase={() => setCurrentTab('rebase')}
      />

      {/* Horizontal Nav Bar */}
      <Navigation
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        openProposalsCount={openProposals.length}
        contestedCount={contestedPlayers.length}
        isRebaseOpen={store.rebaseSession.isOpen}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* CHART VIEW */}
        {currentTab === 'chart' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Selection Conflict & Opportunity Cost Banner */}
            <SelectionConflictBanner
              conflicts={store.resolvedSelection.conflicts}
              tradeoffs={store.resolvedSelection.tradeoffs}
              starterAssignments={store.starterAssignments}
              onAssignStarter={store.assignPlayerStarter}
              onStartDebate={handleStartSelectionDebate}
              unresolvedPositions={store.resolvedSelection.unresolvedPositions}
            />

            {/* Overview Grid */}
            <OverviewGrid
              positions={POSITIONS}
              playersByPos={playersByPos}
              onSelectPosition={handleOpenPubView}
            />

            {/* Filter and Action Bar */}
            <div className="space-y-2.5 pt-2">
              {/* Row 1: Position filters + Action buttons + Search */}
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
                  <button
                    type="button"
                    onClick={() => setPositionFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                      positionFilter === 'all'
                        ? 'bg-[#0D6938] text-white shadow-xs'
                        : 'bg-white dark:bg-slate-850 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    All 15 Positions
                  </button>
                  <button
                    type="button"
                    onClick={() => setPositionFilter('Forwards')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                      positionFilter === 'Forwards'
                        ? 'bg-[#0D6938] text-white shadow-xs'
                        : 'bg-white dark:bg-slate-850 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    Forwards (1–8)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPositionFilter('Backs')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                      positionFilter === 'Backs'
                        ? 'bg-[#0D6938] text-white shadow-xs'
                        : 'bg-white dark:bg-slate-850 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    Backs (9–15)
                  </button>
                </div>

                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenTransfer()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-750 transition shadow-xs cursor-pointer"
                    title="Transfer player or change provincial squad allocation"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Transfer Player</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenBreakthrough()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-[#0D6938] hover:bg-[#0a522c] transition shadow-xs cursor-pointer"
                    title="Add new 2026 breakthrough talent"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>+ Add 2026 Breakthrough</span>
                  </button>

                  <div className="relative w-full sm:w-56">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Filter player or position..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-[#0D6938]"
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Province Filter Chips with live player counts */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mr-1 shrink-0">
                  Province:
                </span>
                <button
                  type="button"
                  onClick={() => setProvinceFilter('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition shrink-0 cursor-pointer ${
                    provinceFilter === 'all'
                      ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs'
                      : 'bg-white dark:bg-slate-850 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  All Squads <span className="text-[10px] opacity-75 font-mono">({provinceCounts.all ?? 0})</span>
                </button>

                {PROVINCES.map((prov) => {
                  const count = provinceCounts[prov] ?? 0;
                  const isSelected = provinceFilter === prov;
                  return (
                    <button
                      key={prov}
                      type="button"
                      onClick={() => setProvinceFilter(isSelected ? 'all' : prov)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition shrink-0 cursor-pointer border ${
                        isSelected
                          ? prov === 'Leinster'
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : prov === 'Munster'
                            ? 'bg-red-600 text-white border-red-600 shadow-xs'
                            : prov === 'Ulster'
                            ? 'bg-slate-700 text-white border-slate-700 shadow-xs'
                            : prov === 'Connacht'
                            ? 'bg-[#0D6938] text-white border-[#0D6938] shadow-xs'
                            : 'bg-purple-600 text-white border-purple-600 shadow-xs'
                          : 'bg-white dark:bg-slate-850 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      {prov} <span className="text-[10px] opacity-75 font-mono">({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 15 Position Cards Grid (with Drag to Reorder) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedPositions.map((pos) => (
                <PositionCard
                  key={pos.id}
                  position={pos}
                  players={displayedPlayersByPos[pos.id] ?? []}
                  onChallengePlayer={handleChallengePlayer}
                  onTransferPlayer={handleOpenTransfer}
                  onAddPlayer={(posObj) => handleOpenBreakthrough(posObj.id)}
                  onOpenPubView={handleOpenPubView}
                  onReorderLadder={store.reorderPositionLadder}
                  isVacant={store.resolvedSelection.unresolvedPositions.includes(pos.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* TACTICAL PITCH VIEW */}
        {currentTab === 'pitch' && (
          <div className="animate-in fade-in duration-200">
            <RugbyPitchView
              positions={POSITIONS}
              playersByPos={playersByPos}
              onSelectPosition={handleOpenPubView}
              onChallengePlayer={handleChallengePlayer}
              unresolvedPositions={store.resolvedSelection.unresolvedPositions}
            />
          </div>
        )}

        {/* ANALYST CHARTS VIEW */}
        {currentTab === 'analytics' && (
          <div className="animate-in fade-in duration-200">
            <AnalystChartsView
              positions={POSITIONS}
              playersByPos={playersByPos}
              onSelectPosition={handleOpenPubView}
            />
          </div>
        )}

        {/* PUB MODE VIEW */}
        {currentTab === 'pub' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Selection Conflict Banner in Pub Mode too */}
            <SelectionConflictBanner
              conflicts={store.resolvedSelection.conflicts}
              tradeoffs={store.resolvedSelection.tradeoffs}
              starterAssignments={store.starterAssignments}
              onAssignStarter={store.assignPlayerStarter}
              onStartDebate={handleStartSelectionDebate}
              unresolvedPositions={store.resolvedSelection.unresolvedPositions}
            />

            <PubModeView
              positions={POSITIONS}
              playersByPos={playersByPos}
              selectedPosId={selectedPosId}
              onSelectPosId={setSelectedPosId}
              onChallengePlayer={handleChallengePlayer}
              onTransferPlayer={handleOpenTransfer}
              onAddPlayer={(posObj) => handleOpenBreakthrough(posObj.id)}
              openProposals={openProposals}
              onViewProposal={handleViewProposal}
              onReorderLadder={store.reorderPositionLadder}
              unresolvedPositions={store.resolvedSelection.unresolvedPositions}
            />
          </div>
        )}

        {/* PROPOSALS & DEBATES VIEW */}
        {currentTab === 'proposals' && (
          <div className="animate-in fade-in duration-200">
            <ProposalList
              proposals={store.proposals}
              activeMember={store.activeMember}
              positions={POSITIONS}
              onVote={store.castVote}
              onComment={store.addComment}
              onResolveManually={store.manuallyResolveProposal}
              onOpenCreateModal={() => {
                setProposalTargetPlayer(undefined);
                setProposalTargetPosition(undefined);
                setIsProposalModalOpen(true);
              }}
            />
          </div>
        )}

        {/* CONTESTED TABLE VIEW */}
        {currentTab === 'contested' && (
          <div className="animate-in fade-in duration-200">
            <ContestedView
              players={store.players}
              positions={POSITIONS}
              onChallengePlayer={handleChallengePlayer}
              openProposals={openProposals}
              onViewProposal={handleViewProposal}
            />
          </div>
        )}

        {/* MOVERS VIEW */}
        {currentTab === 'movers' && (
          <div className="animate-in fade-in duration-200">
            <MoversView
              currentPlayers={store.players}
              snapshots={store.snapshots}
              positions={POSITIONS}
              onChallengePlayer={handleChallengePlayer}
            />
          </div>
        )}

        {/* VULNERABILITY VIEW */}
        {currentTab === 'vulnerability' && (
          <div className="animate-in fade-in duration-200">
            <VulnerabilityView
              positions={POSITIONS}
              playersByPos={playersByPos}
              onSelectPosition={handleOpenPubView}
              onAddPlayer={handleAddPlayer}
            />
          </div>
        )}

        {/* REBASE WIZARD VIEW */}
        {currentTab === 'rebase' && (
          <div className="animate-in fade-in duration-200">
            <RebaseWizard
              rebaseSession={store.rebaseSession}
              positions={POSITIONS}
              players={store.players}
              activeMember={store.activeMember}
              onOpenRebase={store.openRebase}
              onSetGate={store.setGate}
              onRecordGate1={store.recordGate1}
              onRecordGate1Batch={store.recordGate1Batch}
              onTransferPlayer={handleOpenTransfer}
              onAddGate2Entrant={store.addGate2Entrant}
              onRemoveGate2Entrant={store.removeGate2Entrant}
              onMarkGate3Position={store.markGate3Position}
              onMarkAllGate3Positions={store.markAllGate3Positions}
              onCompleteSignoff={store.completeRebaseSignoff}
            />
          </div>
        )}

        {/* SNAPSHOTS & DIFF VIEW */}
        {currentTab === 'diff' && (
          <div className="animate-in fade-in duration-200">
            <SnapshotsDiffView
              snapshots={store.snapshots}
              currentPlayers={store.players}
              positions={POSITIONS}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6 px-4 text-center text-xs text-slate-500 dark:text-slate-400 space-y-2 mt-auto">
        <div className="flex items-center justify-center gap-2">
          <span>🏉 <strong>Depth 15</strong></span>
          <span>·</span>
          <span>Ireland Rugby Squad Consensus</span>
          <span>·</span>
          <button
            onClick={store.resetAllToBaseline}
            className="flex items-center gap-1 text-slate-400 hover:text-red-500 transition underline decoration-dotted"
            title="Reset demo data to 2025 immutable baseline"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Demo Baseline</span>
          </button>
        </div>
        <p className="text-[11px] text-slate-400 max-w-xl mx-auto">
          Ratings reflect international test performance, European minutes, Lions selection, and current squad readiness. Depth Score decays 35/25/20/13/7% across ranked contenders.
        </p>
      </footer>

      {/* Modals */}
      <ProposalModal
        isOpen={isProposalModalOpen}
        onClose={() => setIsProposalModalOpen(false)}
        targetPlayer={proposalTargetPlayer}
        targetPosition={proposalTargetPosition}
        positions={POSITIONS}
        initialRationale={proposalRationale}
        onSubmit={store.createProposal}
      />

      <TransferPlayerModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        player={transferTargetPlayer}
        allPlayers={store.players}
        onTransferDirect={store.transferPlayer}
        onProposeTransfer={(data) => {
          store.createProposal({
            type: 'transfer',
            targetPlayerName: data.targetPlayerName,
            pos: data.pos,
            currentValue: data.currentProvince,
            proposedValue: data.newProvince,
            rationale: data.rationale,
            province: data.newProvince,
          });
        }}
      />

      <AddBreakthroughPlayerModal
        isOpen={isBreakthroughModalOpen}
        onClose={() => setIsBreakthroughModalOpen(false)}
        positions={POSITIONS}
        defaultPositionId={breakthroughDefaultPosId}
        onAddPlayerDirect={store.addPlayer}
        onProposePlayer={store.createProposal}
      />

      <RulesModal
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
      />
    </div>
  );
};
