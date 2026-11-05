import { BlogPost } from '../types/depth';

export const INITIAL_BLOG_POSTS: BlogPost[] = [
  {
    id: 'blog-fh-succession-2026',
    slug: 'fly-half-succession-war-prendergast-crowley-2026',
    title: "The Fly-Half Succession War: Prendergast's Ceiling vs Crowley's Test Floor Entering 2026–27",
    subtitle:
      'Only five rating points separate Jack Crowley (85) and Sam Prendergast (80) on the consensus ladder—but our voter spread at #10 is the widest in the entire squad.',
    category: 'Positional Deep-Dive',
    authorId: 'm-conor',
    authorName: 'Conor Redmond',
    authorRole: 'Lead Tactical Analyst',
    publishedAt: '2026-11-04T09:30:00Z',
    readTimeMinutes: 5,
    featured: true,
    tags: ['Fly-Half', 'Pos 10', 'Sam Prendergast', 'Jack Crowley', 'Six Nations'],
    linkedPositions: [10, 15],
    spotlightPlayerNames: ['Jack Crowley', 'Sam Prendergast', 'Ciarán Frawley', 'Harry Byrne'],
    hotTake: {
      targetPlayerName: 'Sam Prendergast',
      pos: 10,
      proposedRating: 86,
      rationale:
        'Editorial Hot Take: Prendergast’s cross-field kick accuracy and time-on-the-ball against blitz defenses give Ireland a higher attacking ceiling than any other 10 option.',
    },
    sections: [
      {
        heading: 'The Five-Point Gap That Divides Every Pub in Ireland',
        body: 'Look at the Depth 15 Fly-Half ladder today and you see a deceptively calm headline: Jack Crowley sits at #1 on 85, followed by Sam Prendergast on 80, Ciarán Frawley on 78, and Harry Byrne on 77. Yet beneath that 5-point cushion lies the fiercest ideological split in our consensus model. Half the panel views Crowley’s physicality at the gainline and temperament in hostile European knockouts as non-negotiable for test rugby. The other half sees Prendergast’s elite passing range at first and second receiver as the key to unlocking Ireland’s backline ahead of the 2027 World Cup.',
        callout:
          'Key Metric: Position #10 carries a ±4.2 rating spread across active voters—the highest disagreement index of any backline shirt.',
        embeddedPosId: 10,
      },
      {
        heading: 'Why the 6–2 Bench Split Changes Frawley’s Value',
        body: 'Whenever Andy Farrell leans toward a 6–2 bench split against heavyweight packs like South Africa or France, Ciarán Frawley’s multi-position utility across #10, #12, and #15 becomes priceless. However, our opportunity-cost engine shows that treating Frawley purely as a utility insurance policy suppresses his rhythm as an out-and-out playmaker. If Hugo Keenan or Jamie Osborne locks down the #15 jersey, the #22 shirt becomes a straight shootout between pure orchestration (Prendergast) and hybrid coverage (Frawley).',
        embeddedPosId: 15,
      },
      {
        heading: 'Verdict: What Moves the Chip This Month?',
        body: 'For Prendergast to overtake Crowley on the Depth 15 consensus board during the Autumn Nations Series, the metric to watch is not highlight-reel distribution—it is defensive frontline completion against ball-carrying centres running down the 10 channel. Until then, Crowley holds the #1 shirt by virtue of his test-match floor, while Prendergast remains the highest-upside challenger in Irish rugby.',
      },
    ],
    likes: ['m-conor', 'm-declan', 'm-fiona'],
    comments: [
      {
        id: 'bc-1',
        memberId: 'm-ronan',
        memberName: 'Ronan O’Shea',
        text: 'Crowley won a Six Nations as the main man and went toe-to-toe with the Springboks in Durban. Moving Prendergast above 83 before he bosses a Champions Cup semi-final is premature.',
        timestamp: '2026-11-04T11:15:00Z',
      },
      {
        id: 'bc-2',
        memberId: 'm-declan',
        memberName: 'Declan Murphy',
        text: 'Watch how flat Prendergast plays to the line though—he buys Ringrose and Lowe an extra half-yard on the outside arc every single phase.',
        timestamp: '2026-11-04T12:05:00Z',
      },
    ],
  },
  {
    id: 'blog-tighthead-evolution-2026',
    slug: 'tighthead-crisis-or-evolution-furlong-clarkson-bealham',
    title: 'Tighthead Crisis or Evolution? Why Minute-Managing Furlong Reshapes the Entire Front Row',
    subtitle:
      'With Tadhg Furlong (88) on managed minutes and Tom Clarkson (82) surging past Finlay Bealham (78), Position #3 is undergoing its biggest generational handover in a decade.',
    category: 'Matchday Analysis',
    authorId: 'm-declan',
    authorName: 'Declan Murphy',
    authorRole: 'Set-Piece & Pack Columnist',
    publishedAt: '2026-11-02T16:00:00Z',
    readTimeMinutes: 4,
    featured: false,
    tags: ['Tighthead Prop', 'Pos 3', 'Tadhg Furlong', 'Tom Clarkson', 'Front Row'],
    linkedPositions: [3, 1],
    spotlightPlayerNames: ['Tadhg Furlong', 'Tom Clarkson', 'Finlay Bealham', 'Andrew Porter'],
    hotTake: {
      targetPlayerName: 'Tom Clarkson',
      pos: 3,
      proposedRating: 85,
      rationale:
        'Editorial Hot Take: Clarkson’s scrum stability and 65-minute workrate in the URC and Champions Cup justify elevating him to 85 as a true co-starter.',
    },
    sections: [
      {
        heading: 'The 50-Minute Reality of Modern Test Props',
        body: 'In international rugby, no tighthead prop can be judged in isolation from their 52nd-minute replacement. Tadhg Furlong remains an 88-rated world-class operator when fully fit, capable of dismantling tier-one looseheads and acting as a tip-pass pivot in midfield. Yet calf and hamstring management over the past 14 months has turned the #3 ladder from a one-man monarchy into a genuine relay race.',
        callout:
          'Depth Decay Alert: Under our 35/25/20/13/7% positional depth formula, the #2 and #3 ranked props account for 45% of Ireland’s Tighthead resilience score.',
        embeddedPosId: 3,
      },
      {
        heading: 'Clarkson’s Ascent and O’Toole’s Cross-Prop Utility',
        body: 'Tom Clarkson’s rise to 82 on the consensus chart is the biggest forward mover of the 2026 cycle. Paired with Finlay Bealham’s veteran scrummaging craft (78) and Tom O’Toole’s ability to cover both sides of the scrum alongside Andrew Porter (92) and Paddy McCarthy (82) at Loosehead, Ireland finally has the beginnings of a post-Furlong succession blueprint.',
        embeddedPosId: 1,
      },
    ],
    likes: ['m-declan', 'm-brian'],
    comments: [
      {
        id: 'bc-3',
        memberId: 'm-brian',
        memberName: 'Brian Kelly',
        text: 'Do not sleep on Scott Wilson coming through in Ulster either—his scrummaging profile for a young tighthead is legit.',
        timestamp: '2026-11-02T18:40:00Z',
      },
    ],
  },
  {
    id: 'blog-breakthrough-radar-2026',
    slug: '2026-breakthrough-radar-five-prospects-gatecrashing-depth-chart',
    title: "2026 Breakthrough Radar: Five Young Guns Ready to Gatecrash Andy Farrell's Depth Chart",
    subtitle:
      'From Edwin Edogbo and Brian Gleeson in Munster to Gus McCarthy, Hugh Gavin, and Jude Postlethwaite—how the U20 conveyor belt is reshaping our tier-3 and tier-4 ladders.',
    category: 'U20 & Breakthrough Watch',
    authorId: 'm-fiona',
    authorName: 'Fiona Walsh',
    authorRole: 'Pathways & Academy Editor',
    publishedAt: '2026-10-29T10:15:00Z',
    readTimeMinutes: 6,
    featured: false,
    tags: ['Breakthroughs', 'U20 Pathway', 'Edwin Edogbo', 'Brian Gleeson', 'Gus McCarthy'],
    linkedPositions: [4, 8, 2],
    spotlightPlayerNames: ['Edwin Edogbo', 'Brian Gleeson', 'Gus McCarthy', 'Hugh Gavin', 'Jude Postlethwaite'],
    hotTake: {
      targetPlayerName: 'Edwin Edogbo',
      pos: 4,
      proposedRating: 85,
      rationale:
        'Editorial Hot Take: Edogbo gives Ireland a true high-mass tight-five enforcer alongside Joe McCarthy—warranting a jump to 85 International Starter contention.',
    },
    sections: [
      {
        heading: 'Ball-Carrying Mass: Why Edogbo & Gleeson Change the Geometry',
        body: 'For years, the fair critique of Ireland’s depth pathways was an abundance of high-engine, mobile back-five forwards and a scarcity of 120kg+ collision winners. Edwin Edogbo (81 at L4) and Brian Gleeson (64 at #8) directly answer that gap. Edogbo’s maul destruction and post-contact metres in Munster colors have already pushed him into #3 on the Lock (L4) ladder right behind Joe McCarthy (90) and James Ryan (90).',
        embeddedPosId: 4,
      },
      {
        heading: 'Hooker & Midfield: Gus McCarthy and the Centre Wave',
        body: 'At Hooker (#2), Gus McCarthy (78) has established himself as the clear #3 behind Dan Sheehan (95) and Ronan Kelleher (88), stabilizing lineout throwing under pressure. Meanwhile in midfield, Connacht’s Hugh Gavin and Ulster’s Jude Postlethwaite provide the exact power-and-offload profile needed as Bundee Aki, Robbie Henshaw, and Stuart McCloskey enter the latter stages of their test careers.',
        callout:
          'Tip: Use the "+ Add 2026 Breakthrough" button on the main chart whenever an Academy or Emerging Ireland standout earns senior European minutes.',
        embeddedPosId: 8,
      },
    ],
    likes: ['m-fiona', 'm-conor', 'm-ronan'],
    comments: [],
  },
  {
    id: 'blog-beirne-hybrid-dilemma',
    slug: 'hybrid-lock-backrow-dilemma-tadhg-beirne-ryan-baird',
    title: 'The Hybrid Lock & Back-Row Conundrum: Where Does Tadhg Beirne Deliver Maximum Net Squad Value?',
    subtitle:
      'Our Opportunity Cost Engine crunches the numbers on starting Tadhg Beirne (95) at Lock #5 vs Blindside #6—and what it means for Ryan Baird (88), Tom Ahern (78), and Cormac Izuchukwu (80).',
    category: 'Positional Deep-Dive',
    authorId: 'm-conor',
    authorName: 'Conor Redmond',
    authorRole: 'Lead Tactical Analyst',
    publishedAt: '2026-10-24T14:00:00Z',
    readTimeMinutes: 5,
    featured: false,
    tags: ['Tadhg Beirne', 'Ryan Baird', 'Pos 5', 'Pos 6', 'Opportunity Cost'],
    linkedPositions: [5, 6],
    spotlightPlayerNames: ['Tadhg Beirne', 'Ryan Baird', 'Tom Ahern', 'Cormac Izuchukwu'],
    hotTake: {
      targetPlayerName: 'Ryan Baird',
      pos: 6,
      proposedRating: 91,
      rationale:
        'Editorial Hot Take: Baird’s lineout steals and corner-flag-to-corner-flag pace make him a 91-rated Test starter at #6, freeing Beirne to anchor the #5 engine room.',
    },
    sections: [
      {
        heading: 'What the Selection Trade-Off Maths Reveal',
        body: 'When a player is rated 95 at Lock (L5) and is also an elite option at Blindside Flanker (#6), the naive question is "Where is Tadhg Beirne better?" The analyst question is: "Which combination of #5 and #6 maximizes total Starting XV quality?" At #5, dropping from Tadhg Beirne (95) to the next contender Tom Ahern (78) is a steep 17-point drop-off. At #6, Ryan Baird already sits at 88 with Cian Prendergast (81) and Cormac Izuchukwu (80) pressing hard behind him.',
        callout:
          'Net Squad Delta: Starting Beirne at #5 + Baird at #6 yields a combined unit rating of 183, outscoring Beirne at #6 + Ahern at #5 by +10 net rating points.',
        embeddedPosId: 5,
      },
      {
        heading: 'The Lineout Calling Factor',
        body: 'Keeping Beirne in the second row alongside Joe McCarthy also preserves Ireland’s premier lineout calling axis while allowing Ryan Baird or Cormac Izuchukwu to operate as a third primary jumper on the blindside flank—turning opposition defensive lineouts into a nightmare.',
        embeddedPosId: 6,
      },
    ],
    likes: ['m-conor', 'm-declan'],
    comments: [],
  },
  {
    id: 'blog-scrumhalf-cliff-edge-audit',
    slug: 'state-of-the-squad-scrum-half-vulnerability-audit',
    title: 'State of the Squad: Why Scrum-Half (#9) Remains Our Highest Cliff-Edge Vulnerability',
    subtitle:
      'Jamison Gibson-Park (98) and Caelan Doris (98) are Ireland’s joint-highest rated players—but the 13-point gulf between Gibson-Park and Craig Casey (85) shapes every tactical plan.',
    category: 'Consensus Digest',
    authorId: 'm-ronan',
    authorName: 'Ronan O’Shea',
    authorRole: 'Data & Vulnerability Editor',
    publishedAt: '2026-10-18T08:45:00Z',
    readTimeMinutes: 4,
    featured: false,
    tags: ['Scrum-Half', 'Pos 9', 'Jamison Gibson-Park', 'Craig Casey', 'Vulnerability'],
    linkedPositions: [9, 8],
    spotlightPlayerNames: ['Jamison Gibson-Park', 'Craig Casey', 'Nathan Doak', 'Caelan Doris'],
    hotTake: {
      targetPlayerName: 'Craig Casey',
      pos: 9,
      proposedRating: 88,
      rationale:
        'Editorial Hot Take: Casey’s tempo-setting as Munster captain and fearless box-kicking in tough away venues have closed the gap on Gibson-Park to 88.',
    },
    sections: [
      {
        heading: 'The Tempo Multiplier at #9',
        body: 'Ireland’s phase attack relies on sub-2.8-second ruck speed. Jamison Gibson-Park (98) is not merely a scrum-half; he is the system’s metronome. While Craig Casey (85) has taken massive strides in game management and Nathan Doak (74) and Ben Murphy (59) bring exciting provincial form, the 13-point cliff edge between #1 and #2 at Scrum-Half remains one of the sharpest single-injury risks on our Vulnerability Radar.',
        embeddedPosId: 9,
      },
      {
        heading: 'Compare That With #8 Resilience',
        body: 'Contrast #9 with Number Eight (#8): Caelan Doris also sits at 98, yet Jack Conan stands right behind him at 94—a tiny 4-point starter drop-off that gives Ireland seamless continuity in the back row even when injuries strike.',
        embeddedPosId: 8,
      },
    ],
    likes: ['m-ronan', 'm-brian', 'm-fiona'],
    comments: [],
  },
];
