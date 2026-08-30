export interface CampaignData {
  id: number;
  creator: `0x${string}`;
  title: string;
  category: string;
  description: string;
  imageUrl: string;
  ipfsHash: string;
  goal: bigint;
  raised: bigint;
  deadline: number;
  active: boolean;
  withdrawn: boolean;
  donorCount: number;
  voteCount: number;
  againstCount: number;
  createdAt: number;
  status: number;
}

// Use a fixed reference timestamp so SSR and CSR produce identical values.
// This avoids the Next.js hydration mismatch ("Server: 29d 23h left" vs "Client: 30d 0h left").
function futureTs(offsetSeconds: number): number {
  // Sept 30, 2026 00:00 UTC as a stable base
  const BASE = 1790812800;
  return BASE + offsetSeconds;
}
function pastTs(offsetSeconds: number): number {
  const BASE = 1790812800;
  return BASE - offsetSeconds;
}

export const DEMO_CAMPAIGNS: CampaignData[] = [
  {
    id: 1,
    creator: '0x1234567890123456789012345678901234567890',
    title: "UNICEF Emergency Children's Fund 2025",
    category: 'Healthcare',
    description: "UNICEF's emergency response fund provides life-saving support to children caught in crises — from war zones to natural disasters. Every donation provides vaccines, nutrition, clean water, and safe spaces for children in over 190 countries.",
    imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&auto=format',
    ipfsHash: '',
    goal: 50000000000000000000n, // 50 MNT
    raised: 38200000000000000000n, // 38.2 MNT
    deadline: futureTs(2592000),
    active: true,
    withdrawn: false,
    donorCount: 4821,
    voteCount: 3980,
    againstCount: 12,
    createdAt: pastTs(1296000),
    status: 0,
  },
  {
    id: 2,
    creator: '0x2345678901234567890123456789012345678901',
    title: 'Doctors Without Borders — Gaza Crisis Response',
    category: 'Healthcare',
    description: "Médecins Sans Frontières (MSF) delivers emergency medical aid in the world's most dangerous conflict zones. Funds support surgical care, trauma treatment, and mental health services for civilians injured in active conflict.",
    imageUrl: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=800&auto=format',
    ipfsHash: '',
    goal: 100000000000000000000n, // 100 MNT
    raised: 71500000000000000000n, // 71.5 MNT
    deadline: futureTs(1728000),
    active: true,
    withdrawn: false,
    donorCount: 8230,
    voteCount: 7200,
    againstCount: 5,
    createdAt: pastTs(864000),
    status: 0,
  },
  {
    id: 3,
    creator: '0x3456789012345678901234567890123456789012',
    title: 'WWF Amazon & Congo Rainforest Protection',
    category: 'Environment',
    description: "The World Wildlife Fund is protecting the world's two largest rainforests from illegal logging, agriculture expansion, and climate change. Your donation funds ranger patrols, satellite monitoring, and indigenous land rights advocacy.",
    imageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&auto=format',
    ipfsHash: '',
    goal: 75000000000000000000n,
    raised: 52100000000000000000n,
    deadline: futureTs(3888000),
    active: true,
    withdrawn: false,
    donorCount: 3412,
    voteCount: 3100,
    againstCount: 18,
    createdAt: pastTs(2592000),
    status: 0,
  },
  {
    id: 4,
    creator: '0x4567890123456789012345678901234567890123',
    title: 'Red Cross Ukraine Humanitarian Relief',
    category: 'Disaster Relief',
    description: 'The International Red Cross is providing urgent humanitarian assistance to millions of Ukrainians displaced by conflict. Funds cover food, shelter, medical care, and family reunification services across the region.',
    imageUrl: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800&auto=format',
    ipfsHash: '',
    goal: 200000000000000000000n,
    raised: 168000000000000000000n,
    deadline: futureTs(5184000),
    active: true,
    withdrawn: false,
    donorCount: 15820,
    voteCount: 14100,
    againstCount: 23,
    createdAt: pastTs(3888000),
    status: 0,
  },
  {
    id: 5,
    creator: '0x5678901234567890123456789012345678901234',
    title: 'WHO Global Health for All Initiative',
    category: 'Healthcare',
    description: "The World Health Organization's Health for All initiative expands access to primary healthcare in low-income countries. Funding supports vaccine deployment, disease surveillance, clean water programs, and training of 50,000 community health workers.",
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format',
    ipfsHash: '',
    goal: 80000000000000000000n,
    raised: 47300000000000000000n,
    deadline: futureTs(7776000),
    active: true,
    withdrawn: false,
    donorCount: 6100,
    voteCount: 5400,
    againstCount: 8,
    createdAt: pastTs(1728000),
    status: 0,
  },
  {
    id: 6,
    creator: '0x6789012345678901234567890123456789012345',
    title: 'Save the Children — Syria Education Access',
    category: 'Education',
    description: 'Save the Children is rebuilding schools, training teachers, and providing psychological first aid to children traumatized by war in Syria. Over 2.4 million Syrian children are currently out of school and need your help.',
    imageUrl: 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=800&auto=format',
    ipfsHash: '',
    goal: 40000000000000000000n,
    raised: 27800000000000000000n,
    deadline: futureTs(4320000),
    active: true,
    withdrawn: false,
    donorCount: 2890,
    voteCount: 2600,
    againstCount: 6,
    createdAt: pastTs(2160000),
    status: 0,
  },
  {
    id: 7,
    creator: '0x7890123456789012345678901234567890123456',
    title: 'Habitat for Humanity — Africa Housing Project',
    category: 'Community',
    description: 'Habitat for Humanity is building affordable, durable homes for families living in informal settlements across Kenya, Ethiopia, and South Africa. Each home costs approximately 3,500 USD and transforms a family\'s future.',
    imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format',
    ipfsHash: '',
    goal: 30000000000000000000n,
    raised: 19600000000000000000n,
    deadline: futureTs(6480000),
    active: true,
    withdrawn: false,
    donorCount: 1740,
    voteCount: 1550,
    againstCount: 4,
    createdAt: pastTs(1080000),
    status: 0,
  },
  {
    id: 8,
    creator: '0x8901234567890123456789012345678901234567',
    title: 'Ocean Conservancy — Great Pacific Cleanup 2025',
    category: 'Environment',
    description: 'Ocean Conservancy launched the largest coordinated ocean cleanup in history, targeting the Great Pacific Garbage Patch and coastlines in 60 countries. Your donation deploys cleanup vessels and funds local volunteer training.',
    imageUrl: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=800&auto=format',
    ipfsHash: '',
    goal: 60000000000000000000n,
    raised: 34100000000000000000n,
    deadline: futureTs(8640000),
    active: true,
    withdrawn: false,
    donorCount: 4230,
    voteCount: 3800,
    againstCount: 15,
    createdAt: pastTs(432000),
    status: 0,
  },
  {
    id: 9,
    creator: '0x9012345678901234567890123456789012345678',
    title: 'Khan Academy — Free Education for 1 Billion',
    category: 'Education',
    description: 'Khan Academy provides free, world-class education for anyone, anywhere. This campaign funds content translation into 40+ languages, AI tutoring tools for underserved students, and computing infrastructure for 1 billion learners.',
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format',
    ipfsHash: '',
    goal: 25000000000000000000n,
    raised: 25000000000000000000n,
    deadline: futureTs(259200),
    active: true,
    withdrawn: false,
    donorCount: 9870,
    voteCount: 9200,
    againstCount: 2,
    createdAt: pastTs(5184000),
    status: 1, // Completed
  }
];

export const DEMO_LEADERBOARD = [
  { address: '0xAbCd1234567890abcdef1234567890AbCd123456' as `0x${string}`, total: 12500000000000000000n, count: 23, badge: 'Diamond' },
  { address: '0xBcDe2345678901bcdef2345678901BcDe234567' as `0x${string}`, total: 8200000000000000000n, count: 15, badge: 'Diamond' },
  { address: '0xCdEf3456789012cdef3456789012CdEf345678' as `0x${string}`, total: 5400000000000000000n, count: 31, badge: 'Gold' },
  { address: '0xDeF04567890123def04567890123DeF0456789' as `0x${string}`, total: 3100000000000000000n, count: 9, badge: 'Gold' },
  { address: '0xEf015678901234ef015678901234Ef01567890' as `0x${string}`, total: 1750000000000000000n, count: 7, badge: 'Gold' },
  { address: '0xF0126789012345f0126789012345F012678901' as `0x${string}`, total: 950000000000000000n, count: 12, badge: 'Silver' },
  { address: '0x01237890123456012378901234560123789012' as `0x${string}`, total: 420000000000000000n, count: 4, badge: 'Silver' },
  { address: '0x12348901234567123489012345671234890123' as `0x${string}`, total: 180000000000000000n, count: 2, badge: 'Bronze' },
];
