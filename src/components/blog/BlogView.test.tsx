import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BlogView } from './BlogView';
import { INITIAL_BLOG_POSTS } from '../../data/initialBlogPosts';
import { BASELINE_PLAYERS, POSITIONS } from '../../data/baseline2025';
import { DEFAULT_MEMBERS } from '../../data/defaultMembers';
import { resolveStartingXV } from '../../lib/selectionRules';
import { generateConsensusDigestPost, filterBlogPosts } from '../../lib/blogGenerator';
import { calculateDepthScore, groupPlayersByPosition } from '../../lib/depthCalc';
import { Proposal } from '../../types/depth';

describe('Clubhouse Blog & Live Consensus Digest Engine', () => {
  it('generates a live Consensus Digest whose numbers match the resolved Starting XV and Depth Score maths', () => {
    const resolvedSelection = resolveStartingXV(
      groupPlayersByPosition(BASELINE_PLAYERS, POSITIONS),
      POSITIONS,
      {}
    );
    const openProposal: Proposal = {
      id: 'prop-test-10',
      type: 'rerate',
      targetPlayerName: 'Sam Prendergast',
      pos: 10,
      proposerId: 'm-conor',
      proposerName: 'Conor Redmond',
      createdAt: '2026-11-05T10:00:00Z',
      expiresAt: '2026-11-08T10:00:00Z',
      status: 'open',
      currentValue: 80,
      proposedValue: 86,
      rationale: 'Test ceiling at first receiver.',
      votes: [],
      comments: [],
    };

    const digest = generateConsensusDigestPost({
      players: BASELINE_PLAYERS,
      proposals: [openProposal],
      positions: POSITIONS,
      authorId: 'm-conor',
      authorName: 'Conor Redmond',
      resolvedSelection,
      nowIso: '2026-11-05T12:00:00Z',
    });

    expect(digest.category).toBe('Consensus Digest');
    expect(digest.title).toContain(String(resolvedSelection.startingXVAverageRating));
    expect(digest.subtitle).toContain('1 open pub debate');
    expect(digest.hotTake?.targetPlayerName).toBe('Sam Prendergast');
    expect(digest.hotTake?.proposedRating).toBe(86);

    // Verify strongest position embedded in Section 1 matches actual max Depth Score
    const embeddedPosId = digest.sections[0]?.embeddedPosId;
    expect(embeddedPosId).toBeDefined();
    const expectedScore = calculateDepthScore(
      resolvedSelection.adjustedLadders[embeddedPosId!] ?? []
    );
    expect(digest.sections[0]?.body).toContain(`Depth Score of ${expectedScore}`);
  });

  it('degrades honestly without NaN when there are 0 open proposals and vacant position ladders', () => {
    // Only populate Position 10 with a single player; all other 14 positions vacant
    const singlePlayer = BASELINE_PLAYERS.filter((p) => p.pos === 10).slice(0, 1);
    const resolvedSelection = resolveStartingXV(
      groupPlayersByPosition(singlePlayer, POSITIONS),
      POSITIONS,
      {}
    );

    const digest = generateConsensusDigestPost({
      players: singlePlayer,
      proposals: [],
      positions: POSITIONS,
      authorId: 'm-conor',
      authorName: 'Conor Redmond',
      resolvedSelection,
      nowIso: '2026-11-05T12:00:00Z',
    });

    expect(digest.title).not.toContain('NaN');
    expect(digest.sections.every((s) => !s.body.includes('NaN'))).toBe(true);
    expect(digest.sections[0]?.callout).toContain('14 position shirt(s) currently have no active contender');
    expect(digest.sections[2]?.body).toContain('0 open proposals');
  });

  it('filters blog posts accurately by category, linked position, and search query', () => {
    const deepDives = filterBlogPosts(INITIAL_BLOG_POSTS, {
      category: 'Positional Deep-Dive',
    });
    expect(deepDives.length).toBeGreaterThan(0);
    expect(deepDives.every((p) => p.category === 'Positional Deep-Dive')).toBe(true);

    const pos3Posts = filterBlogPosts(INITIAL_BLOG_POSTS, {
      positionId: 3,
    });
    expect(pos3Posts.some((p) => p.title.includes('Tighthead'))).toBe(true);
    expect(pos3Posts.every((p) => p.linkedPositions.includes(3))).toBe(true);

    const searchEdogbo = filterBlogPosts(INITIAL_BLOG_POSTS, {
      searchQuery: 'Edogbo',
    });
    expect(searchEdogbo).toHaveLength(1);
    expect(searchEdogbo[0]?.id).toBe('blog-breakthrough-radar-2026');
  });

  it('renders embedded live position ladders inside an article and wires Hot Take challenge to proposal callback', () => {
    const resolvedSelection = resolveStartingXV(
      groupPlayersByPosition(BASELINE_PLAYERS, POSITIONS),
      POSITIONS,
      {}
    );
    const onChallengePlayer = vi.fn();
    const onStartHotTakeDebate = vi.fn();
    const onOpenPubView = vi.fn();
    const onCreatePost = vi.fn();
    const onGenerateDigest = vi.fn();
    const onToggleLike = vi.fn();
    const onAddComment = vi.fn();
    const onSubscribeNewsletter = vi.fn((email: string) => email.includes('@'));

    render(
      <BlogView
        posts={INITIAL_BLOG_POSTS}
        positions={POSITIONS}
        players={BASELINE_PLAYERS}
        playersByPos={resolvedSelection.adjustedLadders}
        activeMember={DEFAULT_MEMBERS[0]!}
        newsletterSubscribers={[]}
        onChallengePlayer={onChallengePlayer}
        onStartHotTakeDebate={onStartHotTakeDebate}
        onOpenPubView={onOpenPubView}
        onCreatePost={onCreatePost}
        onGenerateDigest={onGenerateDigest}
        onToggleLike={onToggleLike}
        onAddComment={onAddComment}
        onSubscribeNewsletter={onSubscribeNewsletter}
      />
    );

    // Click the featured lead story to open Article Reader
    fireEvent.click(
      screen.getByText(/The Fly-Half Succession War/i)
    );

    // Verify embedded Position #10 live ladder is rendered inside the article
    expect(screen.getByText(/Live Depth Ladder · Fly-Half/i)).toBeDefined();
    expect(screen.getAllByText('Jack Crowley').length).toBeGreaterThanOrEqual(1);

    // Click the interactive Hot Take challenge button
    const hotTakeBtn = screen.getByRole('button', {
      name: /Challenge or Back This Take/i,
    });
    fireEvent.click(hotTakeBtn);

    expect(onStartHotTakeDebate).toHaveBeenCalledTimes(1);
    expect(onStartHotTakeDebate).toHaveBeenCalledWith(
      'Sam Prendergast',
      10,
      expect.stringContaining('Prendergast')
    );
  });

  it('validates newsletter subscription email and confirms valid recurring digest sign-ups', () => {
    const resolvedSelection = resolveStartingXV(
      groupPlayersByPosition(BASELINE_PLAYERS, POSITIONS),
      POSITIONS,
      {}
    );
    const onSubscribeNewsletter = vi.fn((email: string) => email.includes('@'));

    render(
      <BlogView
        posts={INITIAL_BLOG_POSTS}
        positions={POSITIONS}
        players={BASELINE_PLAYERS}
        playersByPos={resolvedSelection.adjustedLadders}
        activeMember={DEFAULT_MEMBERS[0]!}
        newsletterSubscribers={[]}
        onChallengePlayer={vi.fn()}
        onStartHotTakeDebate={vi.fn()}
        onOpenPubView={vi.fn()}
        onCreatePost={vi.fn()}
        onGenerateDigest={vi.fn()}
        onToggleLike={vi.fn()}
        onAddComment={vi.fn()}
        onSubscribeNewsletter={onSubscribeNewsletter}
      />
    );

    const subscribeBtn = screen.getByRole('button', { name: /Subscribe Free/i });

    // Submit empty/invalid email first (error path)
    fireEvent.click(subscribeBtn);
    expect(
      screen.getByText(/Please enter a valid email address/i)
    ).toBeDefined();

    // Enter valid email and submit
    const emailInput = screen.getByPlaceholderText('you@rugbyclub.ie');
    fireEvent.change(emailInput, { target: { value: 'analyst@leinsterrugby.ie' } });
    fireEvent.click(subscribeBtn);

    expect(onSubscribeNewsletter).toHaveBeenCalledWith('analyst@leinsterrugby.ie');
    expect(
      screen.getByText(/Subscribed \(analyst@leinsterrugby.ie\)/i)
    ).toBeDefined();
  });
});
