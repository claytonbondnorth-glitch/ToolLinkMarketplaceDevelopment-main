export const BROWSE_QA_SEED_STORAGE_KEY = 'toollink.dev.seed.browse-qa-listings.v1';

export type QaSeedListing = {
  id: string;
  title: string;
  price: number;
  condition: string;
  brand: string;
  category: string;
  categoryId: string;
  location: string;
  state: string;
  description: string;
  images: string[];
  sellerId: string;
  dateListed: string;
  views: number;
  featured: boolean;
  status: string;
  reportCount: number;
};

export const BROWSE_QA_SEED_LISTINGS: QaSeedListing[] = [
  {
    id: 'qa-test-01',
    title: '[TEST] Milwaukee M18 Cordless Drill Driver Kit',
    price: 349,
    condition: 'Used - Good',
    brand: 'Milwaukee',
    category: 'Power Tools',
    categoryId: 'power-tools',
    location: 'Brisbane, QLD',
    state: 'QLD',
    description: 'Reliable cordless drill driver kit with two batteries and charger. Ideal for daily site work and general fit-out jobs. Category: Power Tools. Location: Brisbane, QLD.',
    images: ['https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&h=600&fit=crop&auto=format'],
    sellerId: 'admin',
    dateListed: '2026-07-01T10:00:00.000Z',
    views: 24,
    featured: false,
    status: 'active',
    reportCount: 0,
  },
  {
    id: 'qa-test-02',
    title: '[TEST] Makita 18V Circular Saw',
    price: 289,
    condition: 'Used - Like New',
    brand: 'Makita',
    category: 'Power Tools',
    categoryId: 'power-tools',
    location: 'Sydney, NSW',
    state: 'NSW',
    description: 'Compact circular saw with smooth blade action and clean cuts. Great option for carpentry and framing projects. Category: Power Tools. Location: Sydney, NSW.',
    images: ['https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800&h=600&fit=crop&auto=format'],
    sellerId: 'admin',
    dateListed: '2026-07-01T11:00:00.000Z',
    views: 15,
    featured: false,
    status: 'active',
    reportCount: 0,
  },
  {
    id: 'qa-test-03',
    title: '[TEST] DeWalt SDS Rotary Hammer Drill',
    price: 420,
    condition: 'Used - Good',
    brand: 'DeWalt',
    category: 'Power Tools',
    categoryId: 'power-tools',
    location: 'Melbourne, VIC',
    state: 'VIC',
    description: 'SDS rotary hammer in solid working condition with carry case. Suitable for concrete anchors and heavy-duty drilling. Category: Power Tools. Location: Melbourne, VIC.',
    images: ['https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=800&h=600&fit=crop&auto=format'],
    sellerId: 'admin',
    dateListed: '2026-07-01T12:00:00.000Z',
    views: 18,
    featured: false,
    status: 'active',
    reportCount: 0,
  },
  {
    id: 'qa-test-04',
    title: '[TEST] Sidchrome Socket Set 1/2 Inch Drive',
    price: 180,
    condition: 'Used - Good',
    brand: 'Sidchrome',
    category: 'Hand Tools',
    categoryId: 'hand-tools',
    location: 'Newcastle, NSW',
    state: 'NSW',
    description: 'Complete 1/2 inch drive socket set with ratchet and extension bars. Practical kit for workshop and mobile service work. Category: Hand Tools. Location: Newcastle, NSW.',
    images: ['https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800&h=600&fit=crop&auto=format'],
    sellerId: 'admin',
    dateListed: '2026-07-02T08:00:00.000Z',
    views: 11,
    featured: false,
    status: 'active',
    reportCount: 0,
  },
  {
    id: 'qa-test-05',
    title: '[TEST] Kincrome Spanner Set',
    price: 95,
    condition: 'Used - Fair',
    brand: 'Kincrome',
    category: 'Hand Tools',
    categoryId: 'hand-tools',
    location: 'Gold Coast, QLD',
    state: 'QLD',
    description: 'Mixed metric spanner set with normal signs of use. Suitable starter set for site kits and maintenance tasks. Category: Hand Tools. Location: Gold Coast, QLD.',
    images: ['https://images.unsplash.com/photo-1590524164591-e92e2c4dd8cc?w=800&h=600&fit=crop&auto=format'],
    sellerId: 'admin',
    dateListed: '2026-07-02T09:00:00.000Z',
    views: 9,
    featured: false,
    status: 'active',
    reportCount: 0,
  },
  {
    id: 'qa-test-06',
    title: '[TEST] Compact Plate Compactor',
    price: 1250,
    condition: 'Used - Good',
    brand: 'Honda',
    category: 'Heavy Equipment',
    categoryId: 'heavy-equipment',
    location: 'Geelong, VIC',
    state: 'VIC',
    description: 'Site-ready plate compactor with reliable startup and strong compaction performance for paving and landscaping prep. Category: Heavy Equipment. Location: Geelong, VIC.',
    images: ['https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&h=600&fit=crop&auto=format'],
    sellerId: 'admin',
    dateListed: '2026-07-02T10:00:00.000Z',
    views: 20,
    featured: false,
    status: 'active',
    reportCount: 0,
  },
  {
    id: 'qa-test-07',
    title: '[TEST] Safety Harness Kit',
    price: 220,
    condition: 'Used - Like New',
    brand: '3M',
    category: 'Safety Gear',
    categoryId: 'safety-gear',
    location: 'Perth, WA',
    state: 'WA',
    description: 'Full harness kit in clean condition, suitable for compliant height-access and maintenance work applications. Category: Safety Gear. Location: Perth, WA.',
    images: ['https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=800&h=600&fit=crop&auto=format'],
    sellerId: 'admin',
    dateListed: '2026-07-02T11:00:00.000Z',
    views: 14,
    featured: false,
    status: 'active',
    reportCount: 0,
  },
  {
    id: 'qa-test-08',
    title: '[TEST] Laser Level Kit',
    price: 310,
    condition: 'Used - Like New',
    brand: 'Bosch',
    category: 'Measuring & Layout',
    categoryId: 'measuring',
    location: 'Adelaide, SA',
    state: 'SA',
    description: 'Self-levelling laser level kit with tripod and carry case. Useful for framing, cabinetry and site set-out checks. Category: Measuring & Layout. Location: Adelaide, SA.',
    images: ['https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&h=600&fit=crop&auto=format'],
    sellerId: 'admin',
    dateListed: '2026-07-02T12:00:00.000Z',
    views: 17,
    featured: false,
    status: 'active',
    reportCount: 0,
  },
  {
    id: 'qa-test-09',
    title: '[TEST] MIG Welder 180 Amp',
    price: 690,
    condition: 'Used - Good',
    brand: 'Cigweld',
    category: 'Welding',
    categoryId: 'welding',
    location: 'Hobart, TAS',
    state: 'TAS',
    description: '180 amp MIG welder with smooth wire feed and stable arc performance. Includes leads and basic accessories. Category: Welding. Location: Hobart, TAS.',
    images: ['https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&h=600&fit=crop&auto=format'],
    sellerId: 'admin',
    dateListed: '2026-07-03T08:00:00.000Z',
    views: 12,
    featured: false,
    status: 'active',
    reportCount: 0,
  },
  {
    id: 'qa-test-10',
    title: '[TEST] Site Tool Box with Lock',
    price: 240,
    condition: 'Used - Fair',
    brand: 'Unbranded',
    category: 'Storage & Transport',
    categoryId: 'storage',
    location: 'Darwin, NT',
    state: 'NT',
    description: 'Heavy-duty steel site toolbox with lock points and internal tray. Practical storage for tools on active worksites. Category: Storage & Transport. Location: Darwin, NT.',
    images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&auto=format'],
    sellerId: 'admin',
    dateListed: '2026-07-03T09:00:00.000Z',
    views: 10,
    featured: false,
    status: 'active',
    reportCount: 0,
  },
  {
    id: 'qa-test-11',
    title: '[TEST] Electrician Test Meter',
    price: 260,
    condition: 'Used - Good',
    brand: 'Fluke',
    category: 'Electrical',
    categoryId: 'electrical',
    location: 'Canberra, ACT',
    state: 'ACT',
    description: 'Trade-grade electrical meter with clear display and reliable readings for diagnostics, fault finding and commissioning. Category: Electrical. Location: Canberra, ACT.',
    images: ['https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800&h=600&fit=crop&auto=format'],
    sellerId: 'admin',
    dateListed: '2026-07-03T10:00:00.000Z',
    views: 16,
    featured: false,
    status: 'active',
    reportCount: 0,
  },
  {
    id: 'qa-test-12',
    title: '[TEST] Paslode Framing Nail Gun',
    price: 520,
    condition: 'Used - Good',
    brand: 'Paslode',
    category: 'Power Tools',
    categoryId: 'power-tools',
    location: 'Townsville, QLD',
    state: 'QLD',
    description: 'Gas framing nail gun in good working condition with case and consumables. Suitable for framing and formwork jobs. Category: Power Tools. Location: Townsville, QLD.',
    images: ['https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800&h=600&fit=crop&auto=format'],
    sellerId: 'admin',
    dateListed: '2026-07-03T11:00:00.000Z',
    views: 19,
    featured: false,
    status: 'active',
    reportCount: 0,
  },
];

export function mergeListingsWithQaSeed<T extends { id: string }>(baseListings: T[], qaSeedEnabled: boolean): T[] {
  if (!qaSeedEnabled) {
    return baseListings;
  }

  const merged = [...(BROWSE_QA_SEED_LISTINGS as T[]), ...baseListings];
  const deduped = new Map<string, T>();

  for (const listing of merged) {
    if (!deduped.has(listing.id)) {
      deduped.set(listing.id, listing);
    }
  }

  return Array.from(deduped.values());
}
