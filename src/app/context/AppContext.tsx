import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { supabase, EDGE_URL } from '../../lib/supabase';
import { CATEGORIES } from '../data/mockData';

// ── Types ──────────────────────────────────────────────────────────────────────

export type Page = 'home' | 'browse' | 'listing' | 'create' | 'profile' | 'seller' | 'messages' | 'admin' | 'auth' | 'about' | 'contact' | 'privacy' | 'terms' | 'help' | 'sellerGuide' | 'pricing' | 'shippingTips';
export type AuthMode = 'login' | 'register' | 'forgot';

const PAGE_TO_PATH: Record<Page, string> = {
  home: '/',
  browse: '/browse',
  listing: '/listing',
  create: '/create',
  profile: '/profile',
  seller: '/seller',
  messages: '/messages',
  admin: '/admin',
  auth: '/auth',
  about: '/about',
  contact: '/contact',
  privacy: '/privacy',
  terms: '/terms',
  help: '/help',
  sellerGuide: '/seller-guide',
  pricing: '/pricing',
  shippingTips: '/shipping-tips',
};

function pathToPage(pathname: string): Page {
  const cleanPath = pathname.replace(/\/+$/, '') || '/';

  switch (cleanPath) {
    case '/':
      return 'home';
    case '/browse':
      return 'browse';
    case '/listing':
      return 'listing';
    case '/create':
      return 'create';
    case '/profile':
      return 'profile';
    case '/seller':
      return 'seller';
    case '/messages':
      return 'messages';
    case '/admin':
      return 'admin';
    case '/auth':
      return 'auth';
    case '/about':
      return 'about';
    case '/contact':
      return 'contact';
    case '/privacy':
      return 'privacy';
    case '/terms':
      return 'terms';
    case '/help':
      return 'help';
    case '/seller-guide':
      return 'sellerGuide';
    case '/pricing':
      return 'pricing';
    case '/shipping-tips':
      return 'shippingTips';
    default:
      return 'home';
  }
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  location: string;
  state: string;
  bio: string;
  phone: string;
  verified: boolean;
  verifiedMember: boolean;
  verificationType: 'tradie' | 'business' | null;
  isAdmin: boolean;
  rating: number;
  reviewCount: number;
  totalListings: number;
  memberSince: string;
  savedListings: string[];
  activeSales: number;
}

export interface AppListing {
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
  soldToUserId?: string | null;
  soldAt?: string | null;
  completedAt?: string | null;
  dateListed: string;
  views: number;
  featured: boolean;
  status: string;
  reportCount: number;
}

export interface AppMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  read: boolean;
}

export interface AppConversation {
  id: string;
  participantIds: [string, string];
  listingId: string | null;
  messages: AppMessage[];
}

type ListingStatusUpdateResult = {
  success: boolean;
  errorMessage?: string;
};

interface NavParams {
  listingId?: string;
  userId?: string;
  conversationId?: string;
  categoryId?: string;
}

interface AppContextValue {
  currentPage: Page;
  navParams: NavParams;
  navigate: (page: Page, params?: NavParams) => void;

  currentUser: AppUser | null;
  authLoading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  register: (name: string, email: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<AppUser>) => Promise<void>;

  showAuth: boolean;        // true when currentPage === 'auth'
  authMode: AuthMode;
  openAuth: (mode?: AuthMode) => void;  // navigates to auth page
  closeAuth: () => void;                // navigates back to home

  listings: AppListing[];
  listingsLoading: boolean;
  savedIds: Set<string>;
  toggleSave: (listingId: string) => Promise<void>;
  addListing: (listing: Omit<AppListing, 'id' | 'dateListed' | 'views' | 'reportCount' | 'status'>) => Promise<string | null>;
  updateListing: (listingId: string, updates: {
    title: string;
    description: string;
    categoryId: string;
    brand: string;
    condition: string;
    price: number;
    location: string;
    state: string;
  }) => Promise<void>;
  deleteListing: (listingId: string) => Promise<void>;

  conversations: AppConversation[];
  sendMessage: (conversationId: string, text: string) => Promise<void>;
  startConversation: (listingId: string, sellerId: string, firstMessage: string) => Promise<string>;
  markConversationAsRead: (conversationId: string) => Promise<void>;
  unreadCount: number;

  users: AppUser[];
  refreshUserProfiles: (userIds?: string[]) => Promise<void>;
  updateListingStatus: (listingId: string, status: string, soldToUserId?: string | null) => Promise<ListingStatusUpdateResult>;
  deleteListingAdmin: (listingId: string) => Promise<void>;
  deleteUserAdmin: (userId: string) => Promise<void>;

  schemaReady: boolean;
  schemaError: string | null;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function rowToUser(row: any): AppUser {
  return {
    id: row.id,
    name: row.name ?? '',
    email: row.email ?? '',
    avatar: row.avatar_url ?? '',
    location: row.location ?? 'Australia',
    state: row.state ?? 'NSW',
    bio: row.bio ?? '',
    phone: row.phone ?? '',
    verified: row.verified ?? false,
    verifiedMember: row.verified_member ?? false,
    verificationType: row.verification_type ?? null,
    isAdmin: row.is_admin ?? false,
    rating: row.rating ?? 0,
    reviewCount: row.review_count ?? 0,
    totalListings: row.total_listings ?? 0,
    memberSince: row.created_at ?? new Date().toISOString(),
    savedListings: [],
    activeSales: 0,
  };
}

function rowToListing(row: any): AppListing {
  return {
    id: row.id,
    title: row.title ?? '',
    price: Number(row.price) ?? 0,
    condition: row.condition ?? 'Used - Good',
    brand: row.brand ?? 'Other',
    category: row.category ?? '',
    categoryId: row.category_id ?? '',
    location: row.location ?? '',
    state: row.state ?? '',
    description: row.description ?? '',
    images: row.images ?? [],
    sellerId: row.seller_id ?? '',
    soldToUserId: row.sold_to_user_id ?? null,
    soldAt: row.sold_at ?? null,
    completedAt: row.completed_at ?? null,
    dateListed: row.created_at ?? new Date().toISOString(),
    views: row.views ?? 0,
    featured: row.featured ?? false,
    status: row.status ?? 'active',
    reportCount: row.report_count ?? 0,
  };
}

// ── Context ────────────────────────────────────────────────────────────────────

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const EMAIL_VERIFICATION_REQUIRED_MESSAGE = 'Please verify your email before signing in. Check your inbox for the verification link.';
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [navParams, setNavParams] = useState<NavParams>({});

  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // showAuth is derived — true whenever the user is on the auth page
  const [authMode, setAuthMode] = useState<AuthMode>('login');

  const [listings, setListings] = useState<AppListing[]>([]);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());


  const [conversations, setConversations] = useState<AppConversation[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);

  const [schemaReady, setSchemaReady] = useState(false);
  const [schemaError, setSchemaError] = useState<string | null>(null);

  // ── Schema setup ─────────────────────────────────────────────────────────────
  useEffect(() => {
    async function ensureSchema() {
      try {
        // Check if schema is ready via edge function
        const res = await fetch(`${EDGE_URL}/schema-status`).catch(() => null);
        if (res?.ok) {
          const data = await res.json();
          if (data.ready) {
            setSchemaReady(true);
            return;
          }
        }

        // Attempt automatic setup
        const setupRes = await fetch(`${EDGE_URL}/setup-schema`, { method: 'POST' }).catch(() => null);
        if (setupRes?.ok) {
          const setupData = await setupRes.json();
          if (setupData.ok) {
            setSchemaReady(true);
            return;
          }
          // Setup ran but returned SQL fallback — tables might still be fine
          // Try querying listings directly
        }

        // Direct check — if listings table is accessible, we're good
        const { error } = await supabase.from('listings').select('id').limit(1);
        if (!error || !error.message.includes('does not exist')) {
          setSchemaReady(true);
        } else {
          setSchemaError('Run supabase/migrations/001_schema.sql in the Supabase SQL Editor, then refresh.');
        }
      } catch {
        // Schema might still be fine — try anyway
        setSchemaReady(true);
      }
    }
    ensureSchema();
  }, []);

  // ── Auth state ────────────────────────────────────────────────────────────────
  useEffect(() => {
    // Restore existing session on page load via getSession (most reliable)
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        await loadProfile(session.user.id);
      } else {
        setAuthLoading(false);
      }
    });

    // Listen only for sign-out and token refresh; sign-in is handled directly in login()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setSavedIds(new Set());
        setAuthLoading(false);
      }
      // TOKEN_REFRESHED keeps the session alive silently — no UI action needed
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loadProfile(userId: string): Promise<AppUser | null> {
    let { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();

    // Profile row may not exist yet — create it from auth metadata
    if (!data || error) {
      const { data: authData } = await supabase.auth.getUser();
      const authUser = authData?.user;
      if (authUser) {
        const fallbackName =
          authUser.user_metadata?.name ||
          authUser.email?.split('@')[0] ||
          'Tradie';
        const { data: created } = await supabase
          .from('profiles')
          .upsert({ id: userId, name: fallbackName, email: authUser.email }, { onConflict: 'id' })
          .select()
          .single();
        data = created;
      }
    }

    setAuthLoading(false);

    if (!data) return null;

    const user = rowToUser(data);
    const { data: saved } = await supabase
      .from('saved_listings')
      .select('listing_id')
      .eq('user_id', userId);
    user.savedListings = saved?.map((s: any) => s.listing_id) ?? [];
    setSavedIds(new Set(user.savedListings));
    setCurrentUser(user);
    return user;
  }

  // ── Fetch listings ────────────────────────────────────────────────────────────
  const fetchListings = useCallback(async () => {
    setListingsLoading(true);
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .order('created_at', { ascending: false });

    if (data && !error) {
      setListings(data.map(rowToListing));
    } else {
      setListings([]);
    }
    setListingsLoading(false);
  }, []);

  useEffect(() => {
    if (!schemaReady) return;
    fetchListings();
  }, [schemaReady, fetchListings]);

  const refreshUserProfiles = useCallback(async (userIds?: string[]) => {
    try {
      let query = supabase.from('profiles').select('*');
      if (userIds?.length) {
        query = query.in('id', userIds);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error || !data) return;

      const refreshedUsers = data.map(rowToUser);
      setUsers((prev) => {
        const merged = new Map(prev.map((user) => [user.id, user]));
        refreshedUsers.forEach((user) => merged.set(user.id, user));
        return Array.from(merged.values());
      });

      if (currentUser?.id && (!userIds || userIds.includes(currentUser.id))) {
        const refreshedCurrentUser = refreshedUsers.find((user) => user.id === currentUser.id);
        if (refreshedCurrentUser) {
          setCurrentUser((prev) => (prev ? { ...prev, ...refreshedCurrentUser } : refreshedCurrentUser));
        }
      }
    } catch {
      // Ignore refresh failures; the seller profile can still render with the last known values.
    }
  }, [currentUser?.id]);

  // ── Fetch users (for admin / seller profiles) ─────────────────────────────────
  useEffect(() => {
    if (!schemaReady) return;
    refreshUserProfiles();
  }, [schemaReady, refreshUserProfiles]);

  // ── Fetch conversations ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!currentUser || !schemaReady) return;
    fetchConversations();
  }, [currentUser?.id, schemaReady]);

  useEffect(() => {
    if (!currentUser || !schemaReady) return;

    const channel = supabase.channel(`conversations-live-${currentUser.id}`);

    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'messages',
      },
      () => {
        fetchConversations();
      }
    );

    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'conversations',
      },
      () => {
        fetchConversations();
      }
    );

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser?.id, schemaReady]);

  async function fetchConversations() {
    if (!currentUser) return;
    const { data } = await supabase
      .from('conversations')
      .select('*, messages(*)')
      .or(`buyer_id.eq.${currentUser.id},seller_id.eq.${currentUser.id}`)
      .order('created_at', { ascending: false });

    if (data) {
      const convs: AppConversation[] = data.map((c: any) => ({
        id: c.id,
        participantIds: [c.buyer_id, c.seller_id],
        listingId: c.listing_id,
        messages: (c.messages ?? [])
          .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
          .map((m: any): AppMessage => ({
            id: m.id,
            senderId: m.sender_id,
            text: m.text,
            timestamp: m.created_at,
            read: m.read,
          })),
      }));
      setConversations(convs);
    }
  }

  useEffect(() => {
    const syncPageFromLocation = () => {
      const mappedPage = pathToPage(window.location.pathname);
      setCurrentPage(mappedPage);
      setNavParams({});
    };

    syncPageFromLocation();
    window.addEventListener('popstate', syncPageFromLocation);

    return () => {
      window.removeEventListener('popstate', syncPageFromLocation);
    };
  }, []);

  // ── Navigation ────────────────────────────────────────────────────────────────
  const navigate = useCallback((page: Page, params?: NavParams) => {
    setCurrentPage(page);
    setNavParams(params ?? {});

    const nextPath = PAGE_TO_PATH[page] ?? '/';
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, '', nextPath);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // ── Auth ──────────────────────────────────────────────────────────────────────
  const login = useCallback(async (email: string, password: string): Promise<string | null> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      if (error.message.toLowerCase().includes('email not confirmed')) {
        return EMAIL_VERIFICATION_REQUIRED_MESSAGE;
      }
      return error.message;
    }

    if (!data.user?.email_confirmed_at) {
      await supabase.auth.signOut();
      return EMAIL_VERIFICATION_REQUIRED_MESSAGE;
    }

    // Success — load profile, close auth page, go home
    const user = data.user ? await loadProfile(data.user.id) : null;
    setCurrentPage('home');
    setNavParams({});

    if (user) {
      const firstName = user.name.split(' ')[0];
      toast.success(`Welcome back, ${firstName}!`, {
        description: 'You are now signed in to ToolLink.',
        duration: 4000,
      });
    }

    return null;
  }, []);

  const register = useCallback(async (name: string, email: string, password: string): Promise<string | null> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });

    if (error) return error.message;

    await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        redirectTo: window.location.origin,
      },
    }).catch(() => null);

    if (data.session) {
      await supabase.auth.signOut();
    }

    return null;
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setSavedIds(new Set());
    setCurrentPage('home');
  }, []);

  const updateProfile = useCallback(async (updates: Partial<AppUser>) => {
    if (!currentUser) return;
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.avatar !== undefined) dbUpdates.avatar_url = updates.avatar;
    if (updates.location !== undefined) dbUpdates.location = updates.location;
    if (updates.state !== undefined) dbUpdates.state = updates.state;
    if (updates.bio !== undefined) dbUpdates.bio = updates.bio;
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone;

    const { error } = await supabase.from('profiles').update(dbUpdates).eq('id', currentUser.id);
    if (error) throw error;

    await refreshUserProfiles([currentUser.id]);
  }, [currentUser, refreshUserProfiles]);

  // Navigate to the auth page — same mechanism as all other navigation
  const openAuth = useCallback((mode: AuthMode = 'login') => {
    setAuthMode(mode);
    setCurrentPage('auth');
    setNavParams({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Go back home from the auth page
  const closeAuth = useCallback(() => {
    setCurrentPage('home');
    setNavParams({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // ── Listings ──────────────────────────────────────────────────────────────────
  const toggleSave = useCallback(async (listingId: string) => {
    if (!currentUser) { openAuth('login'); return; }
    const isSaved = savedIds.has(listingId);

    // Optimistic update
    setSavedIds(prev => {
      const next = new Set(prev);
      if (isSaved) next.delete(listingId); else next.add(listingId);
      return next;
    });

    if (isSaved) {
      await supabase.from('saved_listings')
        .delete()
        .eq('user_id', currentUser.id)
        .eq('listing_id', listingId);
    } else {
      await supabase.from('saved_listings')
        .insert({ user_id: currentUser.id, listing_id: listingId });
    }
  }, [currentUser, savedIds, openAuth]);

  const addListing = useCallback(async (
    listing: Omit<AppListing, 'id' | 'dateListed' | 'views' | 'reportCount' | 'status'>
  ): Promise<string | null> => {
    if (!currentUser) return null;

    const { data, error } = await supabase
      .from('listings')
      .insert({
        title: listing.title,
        description: listing.description,
        price: listing.price,
        condition: listing.condition,
        brand: listing.brand,
        category: listing.category,
        category_id: listing.categoryId,
        location: listing.location,
        state: listing.state,
        images: listing.images,
        seller_id: currentUser.id,
        featured: listing.featured,
        status: 'active',
      })
      .select()
      .single();

    if (data && !error) {
      const newListing = rowToListing(data);
      setListings(prev => [newListing, ...prev]);
      // Update total_listings count
      await supabase.from('profiles')
        .update({ total_listings: (currentUser.totalListings ?? 0) + 1 })
        .eq('id', currentUser.id);
      setCurrentUser(prev => prev ? { ...prev, totalListings: (prev.totalListings ?? 0) + 1 } : prev);
      return data.id;
    }
    return null;
  }, [currentUser]);

  const updateListing = useCallback(async (listingId: string, updates: {
    title: string;
    description: string;
    categoryId: string;
    brand: string;
    condition: string;
    price: number;
    location: string;
    state: string;
  }) => {
    if (!currentUser?.id) {
      throw new Error('You must be signed in to edit this listing.');
    }

    const selectedCategory = CATEGORIES.find((category) => category.id === updates.categoryId);

    const { data, error } = await supabase
      .from('listings')
      .update({
        title: updates.title,
        description: updates.description,
        category_id: updates.categoryId,
        category: selectedCategory?.name ?? updates.categoryId,
        brand: updates.brand,
        condition: updates.condition,
        price: updates.price,
        location: `${updates.location}, ${updates.state}`,
        state: updates.state,
      })
      .eq('id', listingId)
      .eq('seller_id', currentUser.id)
      .select('*')
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error('Listing update failed: listing not found or permission denied.');
    }

    setListings((prev) => prev.map((listing) => (
      listing.id === listingId ? rowToListing(data) : listing
    )));
  }, [currentUser?.id]);

  const deleteListing = useCallback(async (listingId: string) => {
    if (!currentUser?.id) {
      throw new Error('You must be signed in to delete this listing.');
    }

    const { error, count } = await supabase
      .from('listings')
      .delete({ count: 'exact' })
      .eq('id', listingId)
      .eq('seller_id', currentUser.id);

    if (error) {
      throw new Error(error.message);
    }

    if (!count) {
      throw new Error('Listing deletion failed: listing not found or permission denied.');
    }

    setListings(prev => prev.filter(l => l.id !== listingId));
  }, [currentUser]);

  // ── Messages ──────────────────────────────────────────────────────────────────
  const sendMessage = useCallback(async (conversationId: string, text: string) => {
    if (!currentUser) return;
    const { data } = await supabase
      .from('messages')
      .insert({ conversation_id: conversationId, sender_id: currentUser.id, text })
      .select()
      .single();

    if (data) {
      const msg: AppMessage = {
        id: data.id,
        senderId: data.sender_id,
        text: data.text,
        timestamp: data.created_at,
        read: false,
      };
      setConversations(prev => prev.map(c =>
        c.id === conversationId ? { ...c, messages: [...c.messages, msg] } : c
      ));
    }
  }, [currentUser]);

  const startConversation = useCallback(async (
    listingId: string,
    sellerId: string,
    firstMessage: string
  ): Promise<string> => {
    if (!currentUser) return '';

    // Check for existing conversation
    const existing = conversations.find(c =>
      c.listingId === listingId &&
      c.participantIds.includes(currentUser.id) &&
      c.participantIds.includes(sellerId)
    );
    if (existing) {
      await sendMessage(existing.id, firstMessage);
      return existing.id;
    }

    // Create new conversation
    const { data: conv } = await supabase
      .from('conversations')
      .insert({ listing_id: listingId, buyer_id: currentUser.id, seller_id: sellerId })
      .select()
      .single();

    if (!conv) return '';

    const { data: msg } = await supabase
      .from('messages')
      .insert({ conversation_id: conv.id, sender_id: currentUser.id, text: firstMessage })
      .select()
      .single();

    const newConv: AppConversation = {
      id: conv.id,
      participantIds: [conv.buyer_id, conv.seller_id],
      listingId: conv.listing_id,
      messages: msg ? [{
        id: msg.id,
        senderId: msg.sender_id,
        text: msg.text,
        timestamp: msg.created_at,
        read: false,
      }] : [],
    };
    setConversations(prev => [newConv, ...prev]);
    return conv.id;
  }, [currentUser, conversations, sendMessage]);

  const markConversationAsRead = useCallback(async (conversationId: string) => {
    if (!currentUser) return;

    const conversation = conversations.find((c) => c.id === conversationId);
    if (!conversation) return;

    const unreadMessageIds = conversation.messages
      .filter((message) => message.senderId !== currentUser.id && !message.read)
      .map((message) => message.id);

    if (unreadMessageIds.length === 0) return;

    await supabase.from('messages').update({ read: true }).in('id', unreadMessageIds);

    setConversations(prev => prev.map((c) => c.id === conversationId ? {
      ...c,
      messages: c.messages.map((message) => unreadMessageIds.includes(message.id) ? { ...message, read: true } : message),
    } : c));
  }, [currentUser, conversations]);

  // ── Admin ─────────────────────────────────────────────────────────────────────
  const updateListingStatus = useCallback(async (listingId: string, status: string, soldToUserId?: string | null): Promise<ListingStatusUpdateResult> => {
    const targetStatus = status;
    const listing = listings.find((item) => item.id === listingId);

    if (targetStatus === 'sold' && !currentUser?.id) {
      return { success: false, errorMessage: 'You must be signed in to mark a listing as sold.' };
    }

    const listingUpdatePayload: Record<string, any> = {
      status: targetStatus,
      sold_to_user_id: soldToUserId ?? null,
    };

    if (targetStatus === 'sold') {
      listingUpdatePayload.sold_at = new Date().toISOString();
    }

    let listingStatusQuery = supabase
      .from('listings')
      .update(listingUpdatePayload)
      .eq('id', listingId);

    if (targetStatus === 'sold') {
      // Sold transitions must be saved by the listing owner only.
      listingStatusQuery = listingStatusQuery.eq('seller_id', currentUser!.id);
    }

    const { data: updatedListingRow, error: listingUpdateError } = await listingStatusQuery
      .select('*')
      .maybeSingle();

    if (listingUpdateError) {
      console.error('Failed to update listing status:', listingUpdateError);
      return { success: false, errorMessage: listingUpdateError.message };
    }

    if (!updatedListingRow) {
      const notFoundMessage = 'Listing update failed: listing not found or permission denied.';
      console.error(notFoundMessage);
      return { success: false, errorMessage: notFoundMessage };
    }

    const { data: persistedListingRow, error: persistedListingError } = await supabase
      .from('listings')
      .select('*')
      .eq('id', listingId)
      .maybeSingle();

    if (persistedListingError) {
      console.error('Failed to refetch listing after status update:', persistedListingError);
      return { success: false, errorMessage: persistedListingError.message };
    }

    if (!persistedListingRow) {
      const missingListingMessage = 'Listing update failed: could not confirm listing after update.';
      console.error(missingListingMessage);
      return { success: false, errorMessage: missingListingMessage };
    }

    if (targetStatus === 'sold') {
      const soldPersisted = persistedListingRow.status === 'sold' && persistedListingRow.sold_to_user_id === (soldToUserId ?? null);
      if (!soldPersisted) {
        const mismatchMessage = 'Listing update failed: sold status was not persisted correctly.';
        console.error(mismatchMessage, {
          persistedStatus: persistedListingRow.status,
          persistedSoldToUserId: persistedListingRow.sold_to_user_id,
        });
        return { success: false, errorMessage: mismatchMessage };
      }
    }

    setListings((prev) => prev.map((item) => item.id === listingId ? {
      ...rowToListing(persistedListingRow),
    } : item));

    const transitionedToSold = targetStatus === 'sold' && listing?.status !== 'sold';
    if (!transitionedToSold || !listing?.sellerId) return { success: true };

    // Notify only users connected to this listing when it first transitions to sold.
    try {
      const sellerId = listing.sellerId;

      const ensureConversationIdForRecipient = async (recipientUserId: string): Promise<string | null> => {
        const { data: existingConversation, error: existingConversationError } = await supabase
          .from('conversations')
          .select('id')
          .eq('listing_id', listingId)
          .eq('seller_id', sellerId)
          .eq('buyer_id', recipientUserId)
          .maybeSingle();

        if (existingConversationError) {
          console.error('Failed to load conversation for sold notification:', existingConversationError);
          return null;
        }

        if (existingConversation?.id) return existingConversation.id;

        const { data: insertedConversation, error: insertConversationError } = await supabase
          .from('conversations')
          .insert({ listing_id: listingId, buyer_id: recipientUserId, seller_id: sellerId })
          .select('id')
          .maybeSingle();

        if (insertConversationError || !insertedConversation?.id) {
          console.error('Failed to create conversation for sold notification:', insertConversationError);
          return null;
        }

        return insertedConversation.id;
      };

      const sendNotificationMessage = async (recipientUserId: string, text: string) => {
        const conversationId = await ensureConversationIdForRecipient(recipientUserId);
        if (!conversationId) return;

        const { error: insertMessageError } = await supabase
          .from('messages')
          .insert({
            conversation_id: conversationId,
            sender_id: sellerId,
            text,
          });

        if (insertMessageError) {
          console.error('Failed to send sold notification message:', insertMessageError);
        }
      };

      if (soldToUserId && soldToUserId !== sellerId) {
        await sendNotificationMessage(
          soldToUserId,
          'Congratulations — this item has been marked as sold to you. You can now leave a review in your messages for this listing.'
        );
      }

      const connectedUserIds = new Set<string>();

      const { data: conversationRows, error: conversationRowsError } = await supabase
        .from('conversations')
        .select('buyer_id')
        .eq('listing_id', listingId)
        .eq('seller_id', sellerId);

      if (conversationRowsError) {
        console.error('Failed to read listing conversations for sold notifications:', conversationRowsError);
      } else {
        (conversationRows ?? []).forEach((row: any) => {
          if (row?.buyer_id) connectedUserIds.add(row.buyer_id);
        });
      }

      const { data: savedRows, error: savedRowsError } = await supabase
        .from('saved_listings')
        .select('user_id')
        .eq('listing_id', listingId);

      if (savedRowsError) {
        console.error('Failed to read saved users for sold notifications:', savedRowsError);
      } else {
        (savedRows ?? []).forEach((row: any) => {
          if (row?.user_id) connectedUserIds.add(row.user_id);
        });
      }

      connectedUserIds.delete(sellerId);
      if (soldToUserId) connectedUserIds.delete(soldToUserId);

      for (const recipientUserId of connectedUserIds) {
        await sendNotificationMessage(recipientUserId, 'This listing has now been sold.');
      }
    } catch (notificationError) {
      console.error('Sold notification flow failed:', notificationError);
    }

    const { data: profileRow, error: profileSelectError } = await supabase
      .from('profiles')
      .select('total_listings')
      .eq('id', listing.sellerId)
      .single();

    if (profileSelectError) {
      console.error('Failed to read seller sold count:', profileSelectError);
      return { success: true };
    }

    const nextTotalSold = (profileRow?.total_listings ?? 0) + 1;
    const { error: profileUpdateError } = await supabase
      .from('profiles')
      .update({ total_listings: nextTotalSold })
      .eq('id', listing.sellerId);

    if (profileUpdateError) {
      console.error('Failed to update seller sold count:', profileUpdateError);
      return { success: true };
    }

    setUsers((prev) => prev.map((user) => user.id === listing.sellerId ? { ...user, totalListings: nextTotalSold } : user));
    setCurrentUser((prev) => prev && prev.id === listing.sellerId ? { ...prev, totalListings: nextTotalSold } : prev);
    return { success: true };
  }, [listings, currentUser?.id]);

  const deleteListingAdmin = useCallback(async (listingId: string) => {
    await supabase.from('listings').delete().eq('id', listingId);
    setListings(prev => prev.filter(l => l.id !== listingId));
  }, []);

  const deleteUserAdmin = useCallback(async (userId: string) => {
    // Soft: just remove from local state; actual auth user delete needs service role
    setUsers(prev => prev.filter(u => u.id !== userId));
    setListings(prev => prev.filter(l => l.sellerId !== userId));
  }, []);

  const unreadCount = conversations.reduce((acc, c) => {
    if (!currentUser) return acc;
    return acc + c.messages.filter(m => m.senderId !== currentUser.id && !m.read).length;
  }, 0);

  // showAuth is derived — true when the user is on the auth page
  const showAuth = currentPage === 'auth';

  return (
    <AppContext.Provider value={{
      currentPage, navParams, navigate,
      currentUser, authLoading, login, register, logout, updateProfile,
      showAuth, authMode, openAuth, closeAuth,
      listings, listingsLoading, savedIds, toggleSave, addListing, updateListing, deleteListing,
      conversations, sendMessage, startConversation, markConversationAsRead, unreadCount,
      users, refreshUserProfiles, updateListingStatus, deleteListingAdmin, deleteUserAdmin,
      schemaReady, schemaError,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
