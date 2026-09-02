-- Migration: Relax rationale length constraint on proposals table
-- Retire/out proposals require no minimum length; re-rate and add proposals require only a brief reason.

ALTER TABLE proposals DROP CONSTRAINT IF EXISTS proposals_rationale_check;

ALTER TABLE proposals ADD CONSTRAINT proposals_rationale_check CHECK (
  (proposal_type = 'retire' AND char_length(rationale) >= 0) OR
  (char_length(rationale) >= 5)
);
