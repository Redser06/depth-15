import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RebaseWizard } from './RebaseWizard';
import { POSITIONS, BASELINE_PLAYERS } from '../../data/baseline2025';
import { RebaseSession } from '../../types/depth';

vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}));

describe('RebaseWizard Full Squad & All-15-Positions Integrity', () => {
  const mockOpenSession: RebaseSession = {
    isOpen: true,
    targetSeason: '2026-27',
    currentGate: 1,
    gate1Attrition: {},
    gate2Entrants: [],
    gate3PositionsReviewed: {},
  };

  const defaultProps = {
    rebaseSession: mockOpenSession,
    positions: POSITIONS,
    players: BASELINE_PLAYERS,
    onOpenRebase: vi.fn(),
    onSetGate: vi.fn(),
    onRecordGate1: vi.fn(),
    onRecordGate1Batch: vi.fn(),
    onAddGate2Entrant: vi.fn(),
    onRemoveGate2Entrant: vi.fn(),
    onMarkGate3Position: vi.fn(),
    onMarkAllGate3Positions: vi.fn(),
    onCompleteSignoff: vi.fn(),
  };

  it('renders all 15 positions and entire squad pool at Gate 1 without slicing at position 4', () => {
    render(<RebaseWizard {...defaultProps} />);

    // Headline confirms all 15 positions
    expect(screen.getByText(/Gate 1 — Attrition \(Who's Gone Across All 15 Positions\)/i)).toBeDefined();

    // Pool count matches full baseline players
    expect(screen.getByText(`Pool: ${BASELINE_PLAYERS.length}`)).toBeDefined();

    // Verify key players across Front Row, Locks, Back Row, Halves, and Back Three are present
    expect(screen.getAllByText('Andrew Porter').length).toBeGreaterThan(0); // Pos 1
    expect(screen.getAllByText('Tadhg Beirne').length).toBeGreaterThan(0); // Pos 5 & 6 (was truncated before!)
    expect(screen.getAllByText('Caelan Doris').length).toBeGreaterThan(0); // Pos 6, 7 & 8 (was truncated before!)
    expect(screen.getAllByText('Jamison Gibson-Park').length).toBeGreaterThan(0); // Pos 9 (was truncated before!)
    expect(screen.getAllByText('Jack Crowley').length).toBeGreaterThan(0); // Pos 10 (was truncated before!)
    expect(screen.getAllByText('Garry Ringrose').length).toBeGreaterThan(0); // Pos 13 (was truncated before!)
    expect(screen.getAllByText('Hugo Keenan').length).toBeGreaterThan(0); // Pos 15 (was truncated before!)
  });

  it('filters correctly between All 15 Positions, Forwards (1-8), and Backs (9-15)', () => {
    render(<RebaseWizard {...defaultProps} />);

    // Click Forwards (1-8)
    const forwardsBtn = screen.getByRole('button', { name: /Forwards \(1–8\)/i });
    fireEvent.click(forwardsBtn);

    expect(screen.getAllByText('Andrew Porter').length).toBeGreaterThan(0); // Pos 1
    expect(screen.queryByText('Jack Crowley')).toBeNull(); // Pos 10 Back - hidden
    expect(screen.queryByText('Hugo Keenan')).toBeNull(); // Pos 15 Back - hidden

    // Click Backs (9-15)
    const backsBtn = screen.getByRole('button', { name: /Backs \(9–15\)/i });
    fireEvent.click(backsBtn);

    expect(screen.queryByText('Andrew Porter')).toBeNull(); // Pos 1 Forward - hidden
    expect(screen.getAllByText('Jack Crowley').length).toBeGreaterThan(0); // Pos 10
    expect(screen.getAllByText('Hugo Keenan').length).toBeGreaterThan(0); // Pos 15
  });

  it('filters by search query', () => {
    render(<RebaseWizard {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText(/Search player or province/i);
    fireEvent.change(searchInput, { target: { value: 'Prendergast' } });

    expect(screen.getByText('Sam Prendergast')).toBeDefined();
    expect(screen.queryByText('Andrew Porter')).toBeNull();
  });

  it('records Gate 1 attrition decisions (keep, retire, ineligible)', () => {
    const onRecordGate1 = vi.fn();
    render(<RebaseWizard {...defaultProps} onRecordGate1={onRecordGate1} />);

    // Find retire buttons
    const retireButtons = screen.getAllByRole('button', { name: /^Retire$/i });
    fireEvent.click(retireButtons[0]!);

    expect(onRecordGate1).toHaveBeenCalledWith(
      'Andrew Porter',
      'retire',
      'Retired from international rugby'
    );

    // Find ineligible buttons
    const ineligibleButtons = screen.getAllByRole('button', { name: /^Ineligible$/i });
    fireEvent.click(ineligibleButtons[0]!);

    expect(onRecordGate1).toHaveBeenCalledWith(
      'Andrew Porter',
      'ineligible',
      'Moved abroad outside IRFU selection policy'
    );
  });

  it('supports batch keep for all contenders in a specific position', () => {
    const onRecordGate1Batch = vi.fn();
    render(<RebaseWizard {...defaultProps} onRecordGate1Batch={onRecordGate1Batch} />);

    const keepAllPos1Btn = screen.getByRole('button', { name: /^Keep All in Pos 1$/i });
    fireEvent.click(keepAllPos1Btn);

    expect(onRecordGate1Batch).toHaveBeenCalled();
    const [names, action] = onRecordGate1Batch.mock.calls[0]!;
    expect(names).toContain('Andrew Porter');
    expect(names).toContain('Paddy McCarthy');
    expect(action).toBe('keep');
  });

  it('allows adding and removing entrants across all positions in Gate 2', () => {
    const onAddGate2Entrant = vi.fn();
    const onRemoveGate2Entrant = vi.fn();

    const sessionWithEntrant: RebaseSession = {
      ...mockOpenSession,
      currentGate: 2,
      gate2Entrants: [
        {
          id: 'entrant-123',
          name: 'Ben O’Connor',
          pos: 15,
          rating: 74,
          stream: 'U20 / Emerging',
          province: 'Munster',
          uncapped: true,
          rationale: 'U20 World Championship standout.',
        },
      ],
    };

    render(
      <RebaseWizard
        {...defaultProps}
        rebaseSession={sessionWithEntrant}
        onAddGate2Entrant={onAddGate2Entrant}
        onRemoveGate2Entrant={onRemoveGate2Entrant}
      />
    );

    // Staged entrant displays with position name
    expect(screen.getByText(/Ben O’Connor/i)).toBeDefined();
    expect(screen.getAllByText(/15\. Fullback/i).length).toBeGreaterThan(0);

    // Form submission adds entrant
    const nameInput = screen.getByPlaceholderText(/e\.g\. Brian Gleeson/i);
    fireEvent.change(nameInput, { target: { value: 'Henry Walker' } });
    const addBtn = screen.getByRole('button', { name: /\+ Add Entrant Candidate/i });
    fireEvent.click(addBtn);

    expect(onAddGate2Entrant).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Henry Walker',
        pos: 10,
      })
    );

    // Remove entrant button
    const removeBtn = screen.getByTitle('Remove entrant');
    fireEvent.click(removeBtn);
    expect(onRemoveGate2Entrant).toHaveBeenCalledWith('entrant-123');
  });

  it('supports position inspection and Confirm All in Gate 3', () => {
    const onMarkGate3Position = vi.fn();
    const onMarkAllGate3Positions = vi.fn();

    const sessionGate3: RebaseSession = {
      ...mockOpenSession,
      currentGate: 3,
    };

    render(
      <RebaseWizard
        {...defaultProps}
        rebaseSession={sessionGate3}
        onMarkGate3Position={onMarkGate3Position}
        onMarkAllGate3Positions={onMarkAllGate3Positions}
      />
    );

    // All 15 positions represented
    expect(screen.getByText('Loosehead Prop')).toBeDefined();
    expect(screen.getByText('Fly-Half')).toBeDefined();
    expect(screen.getByText('Fullback')).toBeDefined();

    // Confirm all button
    const confirmAllBtn = screen.getByRole('button', { name: /Confirm All 15 Positions/i });
    fireEvent.click(confirmAllBtn);
    expect(onMarkAllGate3Positions).toHaveBeenCalled();
  });

  it('renders Gate 4 summary and executes sign-off snapshot', () => {
    const onCompleteSignoff = vi.fn();

    const sessionGate4: RebaseSession = {
      ...mockOpenSession,
      currentGate: 4,
      gate1Attrition: {
        'Finlay Bealham': { action: 'retire', reason: 'International retirement' },
      },
      gate2Entrants: [
        {
          id: 'ent-1',
          name: 'Hugh Gavin',
          pos: 12,
          rating: 74,
          stream: 'U20 / Emerging',
          province: 'Connacht',
          uncapped: true,
          rationale: 'Breakthrough',
        },
      ],
      gate3PositionsReviewed: { 1: true, 2: true, 3: true },
    };

    render(
      <RebaseWizard
        {...defaultProps}
        rebaseSession={sessionGate4}
        onCompleteSignoff={onCompleteSignoff}
      />
    );

    expect(screen.getByText(/1 Retired · 0 Ineligible/i)).toBeDefined();
    expect(screen.getByText(/\+1 Entrants Staged/i)).toBeDefined();

    const publishBtn = screen.getByRole('button', { name: /Publish Official 2026-27\.0 Snapshot/i });
    fireEvent.click(publishBtn);

    expect(onCompleteSignoff).toHaveBeenCalledWith(
      '2026-27.0 Official Consensus Baseline',
      expect.stringContaining('Full squad consensus')
    );
  });
});
