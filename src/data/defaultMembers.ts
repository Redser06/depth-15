import { Member } from '../types/depth';

export const DEFAULT_GROUP_CODE = 'IRE-2627-9F3K';

export const DEFAULT_MEMBERS: Member[] = [
  {
    id: 'm-conor',
    name: 'Conor Redmond',
    role: 'owner',
    initials: 'CR',
    color: '#0D6938', // Muted Irish Green
    province: 'Leinster',
  },
  {
    id: 'm-ronan',
    name: 'Ronan O’Shea',
    role: 'member',
    initials: 'RO',
    color: '#1E3A5F', // Deep Navy
    province: 'Munster',
  },
  {
    id: 'm-declan',
    name: 'Declan Murphy',
    role: 'member',
    initials: 'DM',
    color: '#0369A1', // Ocean
    province: 'Ulster',
  },
  {
    id: 'm-brian',
    name: 'Brian Kelly',
    role: 'member',
    initials: 'BK',
    color: '#047857', // Emerald
    province: 'Connacht',
  },
  {
    id: 'm-fiona',
    name: 'Fiona Walsh',
    role: 'member',
    initials: 'FW',
    color: '#B45309', // Amber
    province: 'Leinster',
  },
  {
    id: 'm-eoin',
    name: 'Eoin McCarthy',
    role: 'member',
    initials: 'EM',
    color: '#4338CA', // Indigo
    province: 'Munster',
  },
  {
    id: 'm-lurker',
    name: 'Pub Table Guest (Read-Only)',
    role: 'lurker',
    initials: 'PG',
    color: '#64748B', // Slate
  }
];
