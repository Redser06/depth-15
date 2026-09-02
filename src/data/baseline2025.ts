import { Position, PlayerEntry } from '../types/depth';

export const POSITIONS: Position[] = [
  { id: 1,  num: '1',  name: 'Loosehead Prop',    abbr: 'LHP', group: 'Forwards' },
  { id: 2,  num: '2',  name: 'Hooker',             abbr: 'HOO', group: 'Forwards' },
  { id: 3,  num: '3',  name: 'Tighthead Prop',     abbr: 'THP', group: 'Forwards' },
  { id: 4,  num: '4',  name: 'Lock (L4)',          abbr: 'L4',  group: 'Forwards' },
  { id: 5,  num: '5',  name: 'Lock (L5)',          abbr: 'L5',  group: 'Forwards' },
  { id: 6,  num: '6',  name: 'Blindside Flanker',  abbr: 'BSF', group: 'Forwards' },
  { id: 7,  num: '7',  name: 'Openside Flanker',   abbr: 'OSF', group: 'Forwards' },
  { id: 8,  num: '8',  name: 'Number Eight',       abbr: 'N8',  group: 'Forwards' },
  { id: 9,  num: '9',  name: 'Scrum-Half',         abbr: 'SH',  group: 'Backs'    },
  { id: 10, num: '10', name: 'Fly-Half',           abbr: 'FH',  group: 'Backs'    },
  { id: 11, num: '11', name: 'Left Wing',          abbr: 'LW',  group: 'Backs'    },
  { id: 12, num: '12', name: 'Inside Centre',      abbr: 'IC',  group: 'Backs'    },
  { id: 13, num: '13', name: 'Outside Centre',     abbr: 'OC',  group: 'Backs'    },
  { id: 14, num: '14', name: 'Right Wing',         abbr: 'RW',  group: 'Backs'    },
  { id: 15, num: '15', name: 'Fullback',           abbr: 'FB',  group: 'Backs'    },
];

type Province = 'Leinster' | 'Munster' | 'Ulster' | 'Connacht' | 'Exile';

interface RawPlayer {
  name: string;
  pos: number;
  rating: number;
  province: Province;
}

const RAW_PRIMARY: RawPlayer[] = [
  // 1. Loosehead Prop
  { name: 'Andrew Porter',       pos: 1,  rating: 92, province: 'Leinster' },
  { name: 'Paddy McCarthy',      pos: 1,  rating: 82, province: 'Leinster' },
  { name: 'Jack Boyle',          pos: 1,  rating: 82, province: 'Leinster' },
  { name: "Tom O'Toole",         pos: 1,  rating: 80, province: 'Ulster'   },
  { name: 'Jeremy Loughman',     pos: 1,  rating: 76, province: 'Munster'  },
  { name: 'Michael Milne',       pos: 1,  rating: 60, province: 'Leinster' },
  { name: 'Billy Bohan',         pos: 1,  rating: 55, province: 'Connacht' },
  // 2. Hooker
  { name: 'Dan Sheehan',         pos: 2,  rating: 95, province: 'Leinster' },
  { name: 'Ronan Kelleher',      pos: 2,  rating: 88, province: 'Leinster' },
  { name: 'Gus McCarthy',        pos: 2,  rating: 78, province: 'Leinster' },
  { name: 'Tom Stewart',         pos: 2,  rating: 60, province: 'Ulster'   },
  { name: 'Lee Barron *',        pos: 2,  rating: 50, province: 'Leinster' },
  // 3. Tighthead Prop
  { name: 'Tadhg Furlong',       pos: 3,  rating: 88, province: 'Leinster' },
  { name: 'Tom Clarkson',        pos: 3,  rating: 82, province: 'Leinster' },
  { name: 'Finlay Bealham',      pos: 3,  rating: 78, province: 'Connacht' },
  { name: 'Jack Aungier',        pos: 3,  rating: 62, province: 'Connacht' },
  { name: 'Scott Wilson *',      pos: 3,  rating: 52, province: 'Ulster'   },
  // 4. Lock L4
  { name: 'Joe McCarthy',        pos: 4,  rating: 90, province: 'Leinster' },
  { name: 'James Ryan',          pos: 4,  rating: 90, province: 'Leinster' },
  { name: 'Edwin Edogbo',        pos: 4,  rating: 81, province: 'Munster'  },
  { name: 'Iain Henderson',      pos: 4,  rating: 78, province: 'Ulster'   },
  // 5. Lock L5
  { name: 'Tadhg Beirne',        pos: 5,  rating: 95, province: 'Munster'  },
  { name: 'Tom Ahern',           pos: 5,  rating: 78, province: 'Munster'  },
  { name: 'Darragh Murray',      pos: 5,  rating: 76, province: 'Connacht' },
  { name: 'Josh Murphy *',       pos: 5,  rating: 58, province: 'Connacht' },
  { name: 'Diarmuid Mangan *',   pos: 5,  rating: 55, province: 'Leinster' },
  // 6. Blindside Flanker
  { name: 'Ryan Baird',          pos: 6,  rating: 88, province: 'Leinster' },
  { name: 'Cian Prendergast',    pos: 6,  rating: 81, province: 'Connacht' },
  { name: 'Cormac Izuchukwu',    pos: 6,  rating: 80, province: 'Ulster'   },
  { name: 'Max Deegan',          pos: 6,  rating: 77, province: 'Leinster' },
  { name: "Jack O'Donoghue",     pos: 6,  rating: 68, province: 'Munster'  },
  { name: 'David McCann',        pos: 6,  rating: 65, province: 'Ulster'   },
  { name: 'James McNabney',      pos: 6,  rating: 55, province: 'Ulster'   },
  // 7. Openside Flanker
  { name: 'Josh van der Flier',  pos: 7,  rating: 92, province: 'Leinster' },
  { name: 'Nick Timoney',        pos: 7,  rating: 85, province: 'Ulster'   },
  { name: 'Will Conners',        pos: 7,  rating: 75, province: 'Leinster' },
  { name: 'Scott Penny *',       pos: 7,  rating: 70, province: 'Leinster' },
  { name: 'Alex Kendellen',      pos: 7,  rating: 69, province: 'Munster'  },
  { name: 'John Hodnett *',      pos: 7,  rating: 62, province: 'Munster'  },
  { name: 'Bryn Ward',           pos: 7,  rating: 58, province: 'Ulster'   },
  // 8. Number Eight
  { name: 'Caelan Doris',        pos: 8,  rating: 98, province: 'Leinster' },
  { name: 'Jack Conan',          pos: 8,  rating: 94, province: 'Leinster' },
  { name: 'Gavin Coombes',       pos: 8,  rating: 69, province: 'Munster'  },
  { name: 'Brian Gleeson',       pos: 8,  rating: 64, province: 'Munster'  },
  // 9. Scrum-Half
  { name: 'Jamison Gibson-Park', pos: 9,  rating: 98, province: 'Leinster' },
  { name: 'Craig Casey',         pos: 9,  rating: 85, province: 'Munster'  },
  { name: 'Nathan Doak',         pos: 9,  rating: 74, province: 'Ulster'   },
  { name: 'Caolin Blade',        pos: 9,  rating: 68, province: 'Connacht' },
  { name: 'Fintan Gunne',        pos: 9,  rating: 63, province: 'Leinster' },
  { name: 'Ben Murphy',          pos: 9,  rating: 59, province: 'Connacht' },
  // 10. Fly-Half
  { name: 'Jack Crowley',        pos: 10, rating: 85, province: 'Munster'  },
  { name: 'Sam Prendergast',     pos: 10, rating: 80, province: 'Leinster' },
  { name: 'Ciarán Frawley',      pos: 10, rating: 78, province: 'Leinster' },
  { name: 'Harry Byrne',         pos: 10, rating: 77, province: 'Leinster' },
  // 11. Left Wing
  { name: 'James Lowe',          pos: 11, rating: 86, province: 'Leinster' },
  { name: 'Jacob Stockdale',     pos: 11, rating: 80, province: 'Ulster'   },
  { name: 'Shayne Bolton',       pos: 11, rating: 61, province: 'Connacht' },
  { name: 'JJ Kenny',            pos: 11, rating: 60, province: 'Connacht' },
  { name: 'Zac Ward',            pos: 11, rating: 59, province: 'Ulster'   },
  // 12. Inside Centre
  { name: 'Robbie Henshaw',      pos: 12, rating: 87, province: 'Leinster' },
  { name: 'Stuart McCloskey',    pos: 12, rating: 87, province: 'Ulster'   },
  { name: 'Bundee Aki',          pos: 12, rating: 86, province: 'Connacht' },
  { name: 'Charlie Tector',      pos: 12, rating: 60, province: 'Leinster' },
  { name: 'Hugh Gavin',          pos: 12, rating: 57, province: 'Connacht' },
  // 13. Outside Centre
  { name: 'Garry Ringrose',      pos: 13, rating: 92, province: 'Leinster' },
  { name: 'Tom Farrell',         pos: 13, rating: 80, province: 'Munster'  },
  { name: 'Dan Kelly',           pos: 13, rating: 67, province: 'Exile'    },
  { name: 'Jude Postlethwaite',  pos: 13, rating: 63, province: 'Ulster'   },
  { name: 'Cathal Forde',        pos: 13, rating: 56, province: 'Connacht' },
  // 14. Right Wing
  { name: 'Mack Hansen',         pos: 14, rating: 90, province: 'Connacht' },
  { name: 'Robert Baloucoune',   pos: 14, rating: 89, province: 'Ulster'   },
  { name: "Tommy O'Brien",       pos: 14, rating: 85, province: 'Leinster' },
  { name: 'Calvin Nash',         pos: 14, rating: 83, province: 'Munster'  },
  { name: 'Jordan Larmour',      pos: 14, rating: 75, province: 'Leinster' },
  { name: 'Diarmuid Kilgallen',  pos: 14, rating: 60, province: 'Munster'  },
  // 15. Fullback
  { name: 'Hugo Keenan',         pos: 15, rating: 94, province: 'Leinster' },
  { name: 'Jamie Osborne',       pos: 15, rating: 85, province: 'Leinster' },
  { name: "Jimmy O'Brien",       pos: 15, rating: 76, province: 'Leinster' },
  { name: 'Mike Haley',          pos: 15, rating: 70, province: 'Munster'  },
  { name: 'Mike Lowry',          pos: 15, rating: 68, province: 'Ulster'   },
];

const RAW_SECONDARY: RawPlayer[] = [
  { name: 'Andrew Porter',       pos: 3,  rating: 80, province: 'Leinster' },
  { name: 'Tadhg Beirne',        pos: 6,  rating: 96, province: 'Munster'  },
  { name: 'Ryan Baird',          pos: 5,  rating: 85, province: 'Leinster' },
  { name: 'Caelan Doris',        pos: 7,  rating: 94, province: 'Leinster' },
  { name: 'Caelan Doris',        pos: 6,  rating: 96, province: 'Leinster' },
  { name: 'Jamison Gibson-Park', pos: 14, rating: 85, province: 'Leinster' },
  { name: 'Jack Crowley',        pos: 15, rating: 80, province: 'Munster'  },
  { name: 'Garry Ringrose',      pos: 14, rating: 87, province: 'Leinster' },
  { name: 'Hugo Keenan',         pos: 14, rating: 87, province: 'Leinster' },
  { name: 'Paddy McCarthy',      pos: 3,  rating: 80, province: 'Leinster' },
  { name: 'Tom Ahern',           pos: 6,  rating: 77, province: 'Munster'  },
  { name: 'Cian Prendergast',    pos: 8,  rating: 79, province: 'Connacht' },
  { name: 'James Ryan',          pos: 5,  rating: 90, province: 'Leinster' },
  { name: 'Cian Prendergast',    pos: 5,  rating: 77, province: 'Connacht' },
  { name: 'Nick Timoney',        pos: 8,  rating: 81, province: 'Ulster'   },
  { name: 'Jack Conan',          pos: 6,  rating: 92, province: 'Leinster' },
  { name: 'Jacob Stockdale',     pos: 15, rating: 78, province: 'Ulster'   },
  { name: 'Bundee Aki',          pos: 13, rating: 80, province: 'Connacht' },
  { name: 'Jamie Osborne',       pos: 14, rating: 78, province: 'Leinster' },
  { name: 'Jamie Osborne',       pos: 12, rating: 81, province: 'Leinster' },
  { name: 'Cormac Izuchukwu',    pos: 5,  rating: 77, province: 'Ulster'   },
  { name: 'Ciarán Frawley',      pos: 12, rating: 78, province: 'Leinster' },
  { name: 'Ciarán Frawley',      pos: 15, rating: 78, province: 'Leinster' },
  { name: 'Robbie Henshaw',      pos: 13, rating: 80, province: 'Leinster' },
  { name: 'Mack Hansen',         pos: 15, rating: 88, province: 'Connacht' },
  { name: "Jimmy O'Brien",       pos: 14, rating: 76, province: 'Leinster' },
  { name: "Jimmy O'Brien",       pos: 13, rating: 72, province: 'Leinster' },
  { name: 'Max Deegan',          pos: 8,  rating: 77, province: 'Leinster' },
  { name: 'Josh Murphy *',       pos: 6,  rating: 60, province: 'Connacht' },
  { name: 'Charlie Tector',      pos: 10, rating: 60, province: 'Leinster' },
  { name: 'Jordan Larmour',      pos: 15, rating: 75, province: 'Leinster' },
  { name: 'Mike Lowry',          pos: 10, rating: 68, province: 'Ulster'   },
  { name: "Tom O'Toole",         pos: 3,  rating: 80, province: 'Ulster'   },
  { name: "Jack O'Donoghue",     pos: 7,  rating: 68, province: 'Munster'  },
];

export const BASELINE_PLAYERS: PlayerEntry[] = [
  ...RAW_PRIMARY.map((p, idx) => {
    const isUncapped = p.name.includes('*');
    const cleanName = p.name.replace(' *', '').trim();
    return {
      id: `p-${p.pos}-${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      name: cleanName,
      pos: p.pos,
      rating: p.rating,
      secondary: false,
      uncapped: isUncapped,
      province: p.province,
      status: 'active' as const,
      lastReviewed: '2025 Baseline',
      spread: {
        min: Math.max(40, p.rating - (idx % 3 === 0 ? 6 : 2)),
        max: Math.min(99, p.rating + (idx % 3 === 0 ? 5 : 2)),
        stdDev: idx % 3 === 0 ? 3.8 : 1.4,
        voteCount: 6,
      },
      isContested: cleanName === 'Sam Prendergast' || cleanName === 'Jack Crowley' || cleanName === 'Tadhg Furlong',
      disputeCount: cleanName === 'Sam Prendergast' ? 4 : (cleanName === 'Jack Crowley' ? 3 : 0),
    };
  }),
  ...RAW_SECONDARY.map(p => {
    const isUncapped = p.name.includes('*');
    const cleanName = p.name.replace(' *', '').trim();
    return {
      id: `s-${p.pos}-${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      name: cleanName,
      pos: p.pos,
      rating: p.rating,
      secondary: true,
      uncapped: isUncapped,
      province: p.province,
      status: 'active' as const,
      lastReviewed: '2025 Baseline',
      spread: {
        min: Math.max(40, p.rating - 3),
        max: Math.min(99, p.rating + 3),
        stdDev: 2.1,
        voteCount: 5,
      },
      isContested: false,
      disputeCount: 0,
    };
  })
];

export const IMMUTABLE_2025_SNAPSHOT = {
  id: 'snapshot-2025-baseline',
  version: '2025.baseline',
  title: '2025 Season Baseline (Starting Dataset)',
  createdAt: '2025-09-01T12:00:00Z',
  createdBy: 'Conor Redmond (Owner)',
  players: BASELINE_PLAYERS,
  notes: 'Original 80 primary + 34 secondary entries representing the starting consensus state.',
};
