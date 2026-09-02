import { describe, it, expect } from 'vitest';
import {
  validateNoDuplicateStarters,
  detectStarterConflicts,
  calculateSelectionTradeoffs,
  resolveStartingXV,
} from './selectionRules';
import { POSITIONS, BASELINE_PLAYERS } from '../data/baseline2025';
import { groupPlayersByPosition } from './depthCalc';
import { PlayerEntry } from '../types/depth';

function createMockPlayer(name: string, pos: number, rating: number, secondary = false): PlayerEntry {
  return {
    id: `p-${pos}-${name}`,
    name,
    pos,
    rating,
    secondary,
    status: 'active',
    lastReviewed: '2025 Baseline',
  };
}

describe('Starting XV Selection Constraint & Conflict Evaluation', () => {
  const baselinePlayersByPos = groupPlayersByPosition(BASELINE_PLAYERS, POSITIONS);

  describe('Eval 1: validateNoDuplicateStarters constraint', () => {
    it('passes when all 15 positions have unique human starters', () => {
      const mockStarters: Record<number, PlayerEntry> = {};
      POSITIONS.forEach(p => {
        mockStarters[p.id] = createMockPlayer(`Player_${p.id}`, p.id, 85);
      });

      const validation = validateNoDuplicateStarters(mockStarters);
      expect(validation.valid).toBe(true);
      expect(validation.duplicates).toHaveLength(0);
    });

    it('fails when a player is set as starter in 2 positions', () => {
      const mockStarters: Record<number, PlayerEntry> = {};
      POSITIONS.forEach(p => {
        mockStarters[p.id] = createMockPlayer(`Player_${p.id}`, p.id, 85);
      });
      // Force Tadhg Beirne as starter at both 5 and 6
      mockStarters[5] = createMockPlayer('Tadhg Beirne', 5, 95);
      mockStarters[6] = createMockPlayer('Tadhg Beirne', 6, 96, true);

      const validation = validateNoDuplicateStarters(mockStarters);
      expect(validation.valid).toBe(false);
      expect(validation.duplicates).toContain('tadhg beirne');
    });
  });

  describe('Eval 2: detectStarterConflicts on 2025 Ireland Baseline Dataset', () => {
    it('detects that Tadhg Beirne is naively highest rated in multiple positions (5 and 6)', () => {
      const conflicts = detectStarterConflicts(baselinePlayersByPos, POSITIONS);
      const beirneConflict = conflicts.find(c => c.playerName.toLowerCase().includes('tadhg beirne'));

      expect(beirneConflict).toBeDefined();
      expect(beirneConflict?.positions.map(p => p.posId)).toContain(5);
      expect(beirneConflict?.positions.map(p => p.posId)).toContain(6);
    });

    it('detects that Caelan Doris is naively highest rated in multiple positions (8, 6, and 7)', () => {
      const conflicts = detectStarterConflicts(baselinePlayersByPos, POSITIONS);
      const dorisConflict = conflicts.find(c => c.playerName.toLowerCase().includes('caelan doris'));

      expect(dorisConflict).toBeDefined();
      expect(dorisConflict?.positions.map(p => p.posId)).toContain(8);
      // Doris has 96 at 6 (tied top with Beirne) and 94 at 7 (higher than VdF 92)
    });
  });

  describe('Eval 3: Tactical Trade-Off & Backup Drop-Off Analyzer', () => {
    it('calculates the tactical opportunity cost for Beirne starting at 5 vs 6', () => {
      const conflicts = detectStarterConflicts(baselinePlayersByPos, POSITIONS);
      const beirneConflict = conflicts.find(c => c.playerName.toLowerCase().includes('beirne'))!;
      
      // When back rows are designated to 8 (Doris starts, Conan cover at 8), Baird starts at 6
      const tradeoff = calculateSelectionTradeoffs(beirneConflict, baselinePlayersByPos, POSITIONS, {
        'Caelan Doris': 8,
        'Jack Conan': 8,
      });
      expect(tradeoff.playerName).toBe('Tadhg Beirne');
      expect(tradeoff.options.length).toBeGreaterThan(0);

      // Check Option 1: Beirne starts at 5 (95) -> backup at 6 starts (Ryan Baird 88) -> combined = 183
      const optionAt5 = tradeoff.options.find(o => o.assignedPos === 5 && o.alternativePos === 6);
      expect(optionAt5).toBeDefined();
      expect(optionAt5?.playerRatingAtPos).toBe(95);
      expect(optionAt5?.backupStarterName).toBe('Ryan Baird');
      expect(optionAt5?.backupStarterRating).toBe(88);
      expect(optionAt5?.combinedScore).toBe(183);

      // Check Option 2: Beirne starts at 6 (96) -> backup at 5 starts (James Ryan 90) -> combined = 186
      const optionAt6 = tradeoff.options.find(o => o.assignedPos === 6 && o.alternativePos === 5);
      expect(optionAt6).toBeDefined();
      expect(optionAt6?.playerRatingAtPos).toBe(96);
      expect(optionAt6?.backupStarterName).toBe('James Ryan');
      expect(optionAt6?.backupStarterRating).toBe(90);
      expect(optionAt6?.combinedScore).toBe(186);

      // Verify net tactical gain of +3 points when playing Beirne slightly out of position at 6
      expect(tradeoff.bestOptionPos).toBe(6);
      expect(tradeoff.netDelta).toBe(3);
    });
  });

  describe('Eval 4: resolveStartingXV guarantees 15 distinct starters', () => {
    it('resolves the squad so every position has a distinct starter and zero duplicate players', () => {
      const resolved = resolveStartingXV(baselinePlayersByPos, POSITIONS);

      // Verify exactly 15 starters
      expect(Object.keys(resolved.starters)).toHaveLength(15);

      // Verify no duplicate starters
      const validation = validateNoDuplicateStarters(resolved.starters);
      expect(validation.valid).toBe(true);
      expect(validation.duplicates).toHaveLength(0);

      // Verify the Starting XV average rating is calculated
      expect(resolved.startingXVAverageRating).toBeGreaterThan(85);
    });

    it('promotes the backup to #1 in the position where a multi-position player does not start', () => {
      // Force Beirne to start at 5, Doris and Conan at 8
      const resolvedWithBeirneAt5 = resolveStartingXV(baselinePlayersByPos, POSITIONS, {
        'Tadhg Beirne': 5,
        'Caelan Doris': 8,
        'Jack Conan': 8,
      });

      // At position 5, Beirne is starter
      expect(resolvedWithBeirneAt5.starters[5]?.name).toBe('Tadhg Beirne');
      expect(resolvedWithBeirneAt5.adjustedLadders[5]?.[0]?.name).toBe('Tadhg Beirne');

      // At position 6, Beirne cannot be starter! Ryan Baird must be starter #1
      expect(resolvedWithBeirneAt5.starters[6]?.name).toBe('Ryan Baird');
      expect(resolvedWithBeirneAt5.adjustedLadders[6]?.[0]?.name).toBe('Ryan Baird');

      // Beirne must be marked as starting at 5 on the position 6 ladder
      const beirneAt6 = resolvedWithBeirneAt5.adjustedLadders[6]?.find(p => p.name === 'Tadhg Beirne');
      expect(beirneAt6?.startsAtOtherPos).toBe(5);
    });

    it('promotes James Ryan to #1 at lock if Beirne is chosen to start at 6', () => {
      // Force Beirne to start at 6
      const resolvedWithBeirneAt6 = resolveStartingXV(baselinePlayersByPos, POSITIONS, {
        'Tadhg Beirne': 6,
        'Caelan Doris': 8,
      });

      // At position 6, Beirne is starter
      expect(resolvedWithBeirneAt6.starters[6]?.name).toBe('Tadhg Beirne');
      expect(resolvedWithBeirneAt6.adjustedLadders[6]?.[0]?.name).toBe('Tadhg Beirne');

      // At position 5, James Ryan is promoted to starter #1
      expect(resolvedWithBeirneAt6.starters[5]?.name).toBe('James Ryan');
      expect(resolvedWithBeirneAt6.adjustedLadders[5]?.[0]?.name).toBe('James Ryan');

      // And Beirne is tagged as starting at 6
      const beirneAt5 = resolvedWithBeirneAt6.adjustedLadders[5]?.find(p => p.name === 'Tadhg Beirne');
      expect(beirneAt5?.startsAtOtherPos).toBe(6);
    });
  });
});
