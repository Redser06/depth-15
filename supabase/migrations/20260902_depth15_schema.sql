-- ==============================================================================
-- Depth 15: PostgreSQL Multi-Tenant Consensus Schema (v2 — NOT WIRED)
-- Note: Current production runtime is client-consensus on Firebase Hosting.
-- This schema represents the candidate architecture for future server sync.
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Groups (Private pub consensus rooms)
CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL, -- e.g. 'IRE-2627-9F3K'
  owner_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone with code can view group"
  ON groups FOR SELECT
  USING (true);

CREATE POLICY "Owner can update group"
  ON groups FOR UPDATE
  USING (auth.uid() = owner_id);

-- 2. Memberships
CREATE TABLE IF NOT EXISTS memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'member', 'lurker')),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view co-members"
  ON memberships FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM memberships m WHERE m.group_id = memberships.group_id AND m.user_id = auth.uid()
  ));

CREATE POLICY "Users can join group"
  ON memberships FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 3. Positions (Standard 1 to 15 Rugby Union)
CREATE TABLE IF NOT EXISTS positions (
  id INT PRIMARY KEY,
  num TEXT NOT NULL,
  name TEXT NOT NULL,
  abbr TEXT NOT NULL,
  position_group TEXT NOT NULL CHECK (position_group IN ('Forwards', 'Backs'))
);

ALTER TABLE positions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Positions are readable by everyone"
  ON positions FOR SELECT
  USING (true);

-- 4. Players
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  primary_pos INT NOT NULL REFERENCES positions(id),
  province TEXT,
  uncapped BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'retired', 'ineligible', 'injured')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Group members can view players"
  ON players FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM memberships m WHERE m.group_id = players.group_id AND m.user_id = auth.uid()
  ));

CREATE POLICY "Group members can insert players"
  ON players FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM memberships m WHERE m.group_id = players.group_id AND m.user_id = auth.uid()
  ));

CREATE POLICY "Group members can update player status"
  ON players FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM memberships m WHERE m.group_id = players.group_id AND m.user_id = auth.uid()
  ));

-- 5. Ratings (Consensus 0-100 rating for player at position)
CREATE TABLE IF NOT EXISTS ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  pos INT NOT NULL REFERENCES positions(id),
  rating INT NOT NULL CHECK (rating >= 0 AND rating <= 100),
  secondary BOOLEAN DEFAULT false,
  is_contested BOOLEAN DEFAULT false,
  dispute_count INT DEFAULT 0,
  spread_min INT,
  spread_max INT,
  spread_stddev NUMERIC(4, 2),
  last_reviewed TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(group_id, player_id, pos)
);

ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Group members can view ratings"
  ON ratings FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM memberships m WHERE m.group_id = ratings.group_id AND m.user_id = auth.uid()
  ));

CREATE POLICY "Group members can update ratings"
  ON ratings FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM memberships m WHERE m.group_id = ratings.group_id AND m.user_id = auth.uid()
  ));

-- 6. Proposals (Propose and challenge system)
CREATE TABLE IF NOT EXISTS proposals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  proposer_id UUID NOT NULL,
  proposer_name TEXT NOT NULL,
  proposal_type TEXT NOT NULL CHECK (proposal_type IN ('rerate', 'reorder', 'add_player', 'retire', 'add_secondary')),
  target_player_name TEXT NOT NULL,
  pos INT NOT NULL REFERENCES positions(id),
  current_value NUMERIC,
  proposed_value NUMERIC NOT NULL,
  rationale TEXT NOT NULL CHECK (
    (proposal_type = 'retire' AND char_length(rationale) >= 0) OR
    (char_length(rationale) >= 15)
  ), -- 0 chars for retirements, 15-char pub rationale for challenges
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'passed', 'failed', 'cancelled')),
  resolved_value NUMERIC,
  resolution_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '72 hours'),
  resolved_at TIMESTAMPTZ
);

ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Group members can view proposals"
  ON proposals FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM memberships m WHERE m.group_id = proposals.group_id AND m.user_id = auth.uid()
  ));

CREATE POLICY "Group members can create proposals"
  ON proposals FOR INSERT
  WITH CHECK (
    auth.uid() = proposer_id AND
    EXISTS (SELECT 1 FROM memberships m WHERE m.group_id = proposals.group_id AND m.user_id = auth.uid())
  );

CREATE POLICY "Group members can update proposals"
  ON proposals FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM memberships m WHERE m.group_id = proposals.group_id AND m.user_id = auth.uid()
  ));

-- 7. Votes
CREATE TABLE IF NOT EXISTS votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  voter_id UUID NOT NULL,
  voter_name TEXT NOT NULL,
  choice TEXT NOT NULL CHECK (choice IN ('support', 'challenge')),
  counter_value NUMERIC,
  rationale TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(proposal_id, voter_id)
);

ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Group members can view votes"
  ON votes FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM proposals p
    JOIN memberships m ON m.group_id = p.group_id
    WHERE p.id = votes.proposal_id AND m.user_id = auth.uid()
  ));

CREATE POLICY "Group members can cast vote"
  ON votes FOR INSERT
  WITH CHECK (
    auth.uid() = voter_id AND
    EXISTS (
      SELECT 1 FROM proposals p
      JOIN memberships m ON m.group_id = p.group_id
      WHERE p.id = votes.proposal_id AND m.user_id = auth.uid()
    )
  );

-- 8. Comments (Threaded debate)
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  author_id UUID NOT NULL,
  author_name TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Group members can view comments"
  ON comments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM proposals p
    JOIN memberships m ON m.group_id = p.group_id
    WHERE p.id = comments.proposal_id AND m.user_id = auth.uid()
  ));

CREATE POLICY "Group members can add comments"
  ON comments FOR INSERT
  WITH CHECK (
    auth.uid() = author_id AND
    EXISTS (
      SELECT 1 FROM proposals p
      JOIN memberships m ON m.group_id = p.group_id
      WHERE p.id = comments.proposal_id AND m.user_id = auth.uid()
    )
  );

-- 9. Snapshots (Immutable version history)
CREATE TABLE IF NOT EXISTS snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  version TEXT NOT NULL,
  title TEXT NOT NULL,
  data JSONB NOT NULL,
  created_by TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Group members can view snapshots"
  ON snapshots FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM memberships m WHERE m.group_id = snapshots.group_id AND m.user_id = auth.uid()
  ));

CREATE POLICY "Owner can create snapshots"
  ON snapshots FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM groups g WHERE g.id = snapshots.group_id AND g.owner_id = auth.uid()
  ));
