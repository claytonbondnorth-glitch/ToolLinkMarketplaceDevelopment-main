export type Condition = 'New' | 'Used - Like New' | 'Used - Good' | 'Used - Fair' | 'For Parts';
export type AusState = 'NSW' | 'VIC' | 'QLD' | 'WA' | 'SA' | 'TAS' | 'NT' | 'ACT';
export type ListingStatus = 'active' | 'sold' | 'pending' | 'flagged';

export interface Category {
  id: string;
  name: string;
  count: number;
  image: string;
  description: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  location: string;
  state: AusState;
  memberSince: string;
  rating: number;
  reviewCount: number;
  totalListings: number;
  activeSales: number;
  verified: boolean;
  bio: string;
  isAdmin?: boolean;
  phone?: string;
  savedListings: string[];
}

export interface Listing {
  id: string;
  title: string;
  price: number;
  condition: Condition;
  brand: string;
  category: string;
  categoryId: string;
  location: string;
  state: AusState;
  description: string;
  images: string[];
  sellerId: string;
  dateListed: string;
  views: number;
  featured: boolean;
  status: ListingStatus;
  reportCount: number;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participantIds: [string, string];
  listingId: string;
  messages: Message[];
}

export const CATEGORIES: Category[] = [
  {
    id: 'power-tools',
    name: 'Power Tools',
    count: 1842,
    image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=500&h=350&fit=crop&auto=format',
    description: 'Drills, saws, grinders, routers and more',
  },
  {
    id: 'hand-tools',
    name: 'Hand Tools',
    count: 923,
    image: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=500&h=350&fit=crop&auto=format',
    description: 'Hammers, chisels, screwdrivers and spanners',
  },
  {
    id: 'heavy-equipment',
    name: 'Heavy Equipment',
    count: 312,
    image: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=500&h=350&fit=crop&auto=format',
    description: 'Excavators, skid steers and compactors',
  },
  {
    id: 'safety-gear',
    name: 'Safety Gear',
    count: 456,
    image: 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=500&h=350&fit=crop&auto=format',
    description: 'PPE, harnesses, hard hats and high-vis',
  },
  {
    id: 'measuring',
    name: 'Measuring & Layout',
    count: 287,
    image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=500&h=350&fit=crop&auto=format',
    description: 'Laser levels, tape measures, squares',
  },
  {
    id: 'welding',
    name: 'Welding',
    count: 198,
    image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=500&h=350&fit=crop&auto=format',
    description: 'MIG, TIG, stick welders and accessories',
  },
  {
    id: 'storage',
    name: 'Storage & Transport',
    count: 374,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=350&fit=crop&auto=format',
    description: 'Tool boxes, bags, racks and trailers',
  },
  {
    id: 'electrical',
    name: 'Electrical',
    count: 521,
    image: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=500&h=350&fit=crop&auto=format',
    description: 'Cable, conduit, meters and distribution',
  },
];

export const BRANDS = [
  'Milwaukee', 'DeWalt', 'Makita', 'Bosch', 'Hilti', 'Metabo',
  'Festool', 'Paslode', 'Ridgid', 'Snap-on', 'Stanley', 'Bahco',
  'Fluke', 'Leica', 'Lincoln Electric', 'ESAB', 'Kincrome', 'Other',
];

export const USERS: User[] = [
  {
    id: 'u1',
    name: 'Jake Morrison',
    email: 'jake.morrison@email.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&auto=format',
    location: 'Parramatta, NSW',
    state: 'NSW',
    memberSince: '2022-03-15',
    rating: 4.9,
    reviewCount: 47,
    totalListings: 23,
    activeSales: 8,
    verified: true,
    bio: 'Licensed electrician with 15 years experience. Upgrading my kit regularly — always good quality gear.',
    phone: '0412 345 678',
    savedListings: ['l3', 'l7'],
  },
  {
    id: 'u2',
    name: 'Steve Pappas',
    email: 'steve.pappas@email.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&auto=format',
    location: 'Dandenong, VIC',
    state: 'VIC',
    memberSince: '2021-08-20',
    rating: 4.7,
    reviewCount: 82,
    totalListings: 51,
    activeSales: 12,
    verified: true,
    bio: 'Plumber and gasfitter running a small business in Melbourne\'s south-east. Selling off old stock.',
    phone: '0423 456 789',
    savedListings: ['l1', 'l5'],
  },
  {
    id: 'u3',
    name: 'Tony Ruccello',
    email: 'tony.r@email.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&auto=format',
    location: 'Ipswich, QLD',
    state: 'QLD',
    memberSince: '2023-01-10',
    rating: 4.5,
    reviewCount: 18,
    totalListings: 9,
    activeSales: 4,
    verified: false,
    bio: 'Builder and property renovator. Always buying and selling tools.',
    savedListings: [],
  },
  {
    id: 'u4',
    name: 'Lisa Walters',
    email: 'lisa.walters@email.com',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&auto=format',
    location: 'Fremantle, WA',
    state: 'WA',
    memberSince: '2022-11-05',
    rating: 5.0,
    reviewCount: 29,
    totalListings: 17,
    activeSales: 6,
    verified: true,
    bio: 'HVAC technician selling quality second-hand gear. Everything tested before listing.',
    phone: '0467 890 123',
    savedListings: ['l2', 'l9'],
  },
  {
    id: 'u5',
    name: 'Mark Chen',
    email: 'mark.chen@email.com',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&auto=format',
    location: 'Modbury, SA',
    state: 'SA',
    memberSince: '2020-06-22',
    rating: 4.8,
    reviewCount: 113,
    totalListings: 89,
    activeSales: 15,
    verified: true,
    bio: 'Tool dealer and ex-sparky. Specialising in Milwaukee and DeWalt. Wholesale lots available.',
    phone: '0489 012 345',
    savedListings: [],
  },
  {
    id: 'admin',
    name: 'Admin User',
    email: 'admin@toollink.com.au',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&auto=format',
    location: 'Sydney, NSW',
    state: 'NSW',
    memberSince: '2020-01-01',
    rating: 5.0,
    reviewCount: 0,
    totalListings: 0,
    activeSales: 0,
    verified: true,
    bio: 'ToolLink platform administrator.',
    isAdmin: true,
    savedListings: [],
  },
];

export const LISTINGS: Listing[] = [
  {
    id: 'l1',
    title: 'Milwaukee M18 FUEL 6-Piece Combo Kit — Perfect Condition',
    price: 1299,
    condition: 'Used - Like New',
    brand: 'Milwaukee',
    category: 'Power Tools',
    categoryId: 'power-tools',
    location: 'Parramatta, NSW',
    state: 'NSW',
    description: 'Selling my Milwaukee M18 FUEL 6-piece combo kit — purchased 18 months ago and barely used. Includes: M18 FUEL 13mm Drill/Driver, M18 FUEL ¼" Hex Impact Driver, M18 FUEL Circular Saw, M18 FUEL Angle Grinder, M18 FUEL Recip Saw, and M18 FUEL LED light tower. Comes with 2x 5.0Ah batteries, dual port charger, and heavy-duty bag. All tools in excellent condition with no damage. Receipts available. Happy to demo locally.',
    images: [
      'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&h=600&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800&h=600&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=800&h=600&fit=crop&auto=format',
    ],
    sellerId: 'u1',
    dateListed: '2024-12-10',
    views: 342,
    featured: true,
    status: 'active',
    reportCount: 0,
  },
  {
    id: 'l2',
    title: 'DeWalt DCS570 18V XR Circular Saw with 2x Batteries',
    price: 349,
    condition: 'Used - Good',
    brand: 'DeWalt',
    category: 'Power Tools',
    categoryId: 'power-tools',
    location: 'Dandenong, VIC',
    state: 'VIC',
    description: 'DeWalt DCS570 18V XR Brushless Circular Saw in good working condition. Saw cuts clean and straight. Includes 2 x 4.0Ah batteries and charger. Some scuffs on the housing but mechanically perfect. Great for carpenters, builders, or DIYers wanting quality at a fair price. Pick up from Dandenong or can freight at buyer\'s cost.',
    images: [
      'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800&h=600&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&h=600&fit=crop&auto=format',
    ],
    sellerId: 'u2',
    dateListed: '2024-12-08',
    views: 218,
    featured: true,
    status: 'active',
    reportCount: 0,
  },
  {
    id: 'l3',
    title: 'Hilti TE 60-ATC/AVR SDS-Max Demolition Hammer',
    price: 1850,
    condition: 'Used - Good',
    brand: 'Hilti',
    category: 'Power Tools',
    categoryId: 'power-tools',
    location: 'Ipswich, QLD',
    state: 'QLD',
    description: 'Hilti TE 60 SDS-Max in good condition with active vibration reduction. Used on commercial projects, has seen decent use but maintained properly and runs perfectly. Includes original carry case and a selection of SDS-Max chisels and bits. Ideal for demolition contractors or concreters. Will not disappoint.',
    images: [
      'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=800&h=600&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&h=600&fit=crop&auto=format',
    ],
    sellerId: 'u3',
    dateListed: '2024-12-05',
    views: 156,
    featured: false,
    status: 'active',
    reportCount: 0,
  },
  {
    id: 'l4',
    title: 'Makita DGA504 18V 125mm Angle Grinder Twin Pack',
    price: 280,
    condition: 'Used - Like New',
    brand: 'Makita',
    category: 'Power Tools',
    categoryId: 'power-tools',
    location: 'Fremantle, WA',
    state: 'WA',
    description: 'Two Makita DGA504 angle grinders, both in like-new condition. Barely run, bought as part of a tender kit that changed scope. Includes 2x 5.0Ah batteries and twin-port charger. One of the best 125mm grinders on the market — brushless motor runs cool and has immense runtime. Bundle deal only.',
    images: [
      'https://images.unsplash.com/photo-1590524164591-e92e2c4dd8cc?w=800&h=600&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&h=600&fit=crop&auto=format',
    ],
    sellerId: 'u4',
    dateListed: '2024-12-01',
    views: 89,
    featured: false,
    status: 'active',
    reportCount: 0,
  },
  {
    id: 'l5',
    title: 'Festool TS 55 REBQ Track Saw — Full Kit with Rails',
    price: 1650,
    condition: 'Used - Like New',
    brand: 'Festool',
    category: 'Power Tools',
    categoryId: 'power-tools',
    location: 'Modbury, SA',
    state: 'SA',
    description: 'Festool TS 55 REBQ track saw with 2x 1400mm rails, rail connectors, and systainer case. Purchased new 2 years ago from Festool dealer. Used lightly for a joinery project. Cuts are flawless. Includes MFT connector fittings and extra blades. This is the gold standard in track saws — not a cheap knockoff. Reason for sale: switching to CNC operation.',
    images: [
      'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800&h=600&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800&h=600&fit=crop&auto=format',
    ],
    sellerId: 'u5',
    dateListed: '2024-11-28',
    views: 405,
    featured: true,
    status: 'active',
    reportCount: 0,
  },
  {
    id: 'l6',
    title: 'Paslode IM350+ 34° Framing Nailer — Reconditioned',
    price: 420,
    condition: 'Used - Good',
    brand: 'Paslode',
    category: 'Power Tools',
    categoryId: 'power-tools',
    location: 'Parramatta, NSW',
    state: 'NSW',
    description: 'Paslode IM350+ framing nailer professionally reconditioned. New o-rings, driver blade, and fuel cell contacts. Fires consistently and drives to correct depth. Includes carry case and a pack of 90mm nails. Perfect for framers, concreters, and formwork carpenters. All Paslode 34-degree nails compatible.',
    images: [
      'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800&h=600&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&h=600&fit=crop&auto=format',
    ],
    sellerId: 'u1',
    dateListed: '2024-11-25',
    views: 127,
    featured: false,
    status: 'active',
    reportCount: 0,
  },
  {
    id: 'l7',
    title: 'Kincrome 368-Piece Monster Tool Kit',
    price: 895,
    condition: 'Used - Good',
    brand: 'Kincrome',
    category: 'Hand Tools',
    categoryId: 'hand-tools',
    location: 'Dandenong, VIC',
    state: 'VIC',
    description: '368-piece Kincrome EVA foam tool kit in Kincrome trolley case. Full socket set in metric and imperial, combination spanners, screwdrivers, hex keys, pliers, and much more. Some tools show light use. Great for workshops, garages, or mobile mechanics. Heavy freight item — local pick up preferred.',
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800&h=600&fit=crop&auto=format',
    ],
    sellerId: 'u2',
    dateListed: '2024-11-20',
    views: 203,
    featured: false,
    status: 'active',
    reportCount: 0,
  },
  {
    id: 'l8',
    title: 'Leica DISTO D810 Touch Laser Distance Meter',
    price: 590,
    condition: 'Used - Like New',
    brand: 'Leica',
    category: 'Measuring & Layout',
    categoryId: 'measuring',
    location: 'Fremantle, WA',
    state: 'WA',
    description: 'Leica DISTO D810 Touch in excellent condition. All functions working perfectly — Bluetooth, camera view, area/volume calculations, tilt sensor. Comes in original case with USB cable. Ideal for surveyors, estimators, project managers, and builders. Accurate to ±1mm. Batteries included.',
    images: [
      'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&h=600&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&h=600&fit=crop&auto=format',
    ],
    sellerId: 'u4',
    dateListed: '2024-11-18',
    views: 167,
    featured: false,
    status: 'active',
    reportCount: 0,
  },
  {
    id: 'l9',
    title: 'Lincoln Electric PowerMIG 210 MP MIG Welder',
    price: 1100,
    condition: 'Used - Good',
    brand: 'Lincoln Electric',
    category: 'Welding',
    categoryId: 'welding',
    location: 'Ipswich, QLD',
    state: 'QLD',
    description: 'Lincoln Electric PowerMIG 210 MP in good working order. Multi-process: MIG, STICK, TIG ready (torch not included). 240V single phase. Includes spool gun connector, standard MIG torch, earth clamp, and regulator. Some external scratches from workshop use but welds beautifully. Selling as upgrading to 3-phase unit.',
    images: [
      'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&h=600&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&h=600&fit=crop&auto=format',
    ],
    sellerId: 'u3',
    dateListed: '2024-11-15',
    views: 298,
    featured: false,
    status: 'active',
    reportCount: 0,
  },
  {
    id: 'l10',
    title: 'Milwaukee PACKOUT Modular Storage System — 5 Piece',
    price: 480,
    condition: 'Used - Like New',
    brand: 'Milwaukee',
    category: 'Storage & Transport',
    categoryId: 'storage',
    location: 'Modbury, SA',
    state: 'SA',
    description: '5-piece Milwaukee PACKOUT modular storage system. Includes: XL tool box, rolling chest, compact organiser, 22L rolling tool bag, and compact packout bag. All in excellent condition — fully compatible with PACKOUT system. IP65 rated. Selling because switching to a van shelving system. Can sell individual pieces.',
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800&h=600&fit=crop&auto=format',
    ],
    sellerId: 'u5',
    dateListed: '2024-11-12',
    views: 221,
    featured: true,
    status: 'active',
    reportCount: 0,
  },
  {
    id: 'l11',
    title: 'Bosch Professional GBH 36 VF-LI SDS-Plus Cordless Rotary Hammer',
    price: 320,
    condition: 'Used - Good',
    brand: 'Bosch',
    category: 'Power Tools',
    categoryId: 'power-tools',
    location: 'Parramatta, NSW',
    state: 'NSW',
    description: 'Bosch Professional GBH 36 VF-LI cordless SDS-plus hammer drill. Used for electrical rough-in work. Batteries hold charge well, hammer function is strong. Includes 2x 2.0Ah batteries, charger, 5x SDS-plus bits. A reliable drill for sparkies, plumbers, and builders doing concrete work.',
    images: [
      'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&h=600&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=800&h=600&fit=crop&auto=format',
    ],
    sellerId: 'u1',
    dateListed: '2024-11-08',
    views: 88,
    featured: false,
    status: 'active',
    reportCount: 0,
  },
  {
    id: 'l12',
    title: 'Scaffolding — Aluminium Mobile Tower 4m Working Height',
    price: 750,
    condition: 'Used - Good',
    brand: 'Other',
    category: 'Heavy Equipment',
    categoryId: 'heavy-equipment',
    location: 'Fremantle, WA',
    state: 'WA',
    description: 'Aluminium mobile scaffold tower with 4m working height, castors, outriggers, and 2x planks. Rated to 250kg. Ideal for painters, plasterers, electricians. In solid condition — some surface scratches but structurally sound. Complies with AS/NZS 4576. Pick up only from Fremantle.',
    images: [
      'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&h=600&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&h=600&fit=crop&auto=format',
    ],
    sellerId: 'u4',
    dateListed: '2024-11-05',
    views: 134,
    featured: false,
    status: 'active',
    reportCount: 1,
  },
];

export const CONVERSATIONS: Conversation[] = [
  {
    id: 'c1',
    participantIds: ['u1', 'u2'],
    listingId: 'l2',
    messages: [
      {
        id: 'm1',
        senderId: 'u1',
        text: "Hey Steve, is the DeWalt circular saw still available? Would you take $320?",
        timestamp: '2024-12-09T09:15:00',
        read: true,
      },
      {
        id: 'm2',
        senderId: 'u2',
        text: "G\'day Jake! Yes still available. Best I can do is $335 — it comes with 2 x 4.0Ah batteries worth $150 each new. Quality kit.",
        timestamp: '2024-12-09T10:02:00',
        read: true,
      },
      {
        id: 'm3',
        senderId: 'u1',
        text: "Fair enough. Can I come have a look tomorrow arvo? I\'m in Melbourne for work.",
        timestamp: '2024-12-09T10:45:00',
        read: true,
      },
      {
        id: 'm4',
        senderId: 'u2',
        text: "Absolutely. Any time after 3pm works. Shoot me your number and I\'ll send you the address.",
        timestamp: '2024-12-09T11:00:00',
        read: false,
      },
    ],
  },
  {
    id: 'c2',
    participantIds: ['u1', 'u5'],
    listingId: 'l10',
    messages: [
      {
        id: 'm5',
        senderId: 'u1',
        text: "Mate, is the PACKOUT system still up for grabs? Would you sell the rolling chest separately?",
        timestamp: '2024-12-08T14:30:00',
        read: true,
      },
      {
        id: 'm6',
        senderId: 'u5',
        text: "Hey Jake. Prefer to sell as a set but could do the rolling chest alone for $220. It\'s in perfect nick.",
        timestamp: '2024-12-08T15:05:00',
        read: true,
      },
    ],
  },
];

export const ADMIN_ANALYTICS = {
  totalUsers: 12847,
  newUsersThisMonth: 342,
  totalListings: 8923,
  activeListings: 6241,
  totalTransactions: 4102,
  gmvThisMonth: 187420,
  reportedListings: 14,
  monthlyData: [
    { month: 'Jul', users: 8200, listings: 5100, revenue: 112000 },
    { month: 'Aug', users: 8900, listings: 5600, revenue: 128000 },
    { month: 'Sep', users: 9400, listings: 6000, revenue: 141000 },
    { month: 'Oct', users: 10200, listings: 6500, revenue: 155000 },
    { month: 'Nov', users: 11500, listings: 7200, revenue: 168000 },
    { month: 'Dec', users: 12847, listings: 8923, revenue: 187420 },
  ],
};
