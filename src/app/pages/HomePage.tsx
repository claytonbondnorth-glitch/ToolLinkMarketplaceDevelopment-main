import { useState, useEffect, useRef } from 'react';
import { Search, ArrowRight, Shield, CheckCircle, MessageCircle, MapPin, Star, Zap, TrendingUp, ChevronRight, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '../context/AppContext';
import { CATEGORIES } from '../data/mockData';
import ListingCard from '../components/ListingCard';
import UserAvatar from '../components/UserAvatar';
import { supabase } from '../../lib/supabase';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';

/* Animated counter hook */
function useCounter(target: number, duration = 1800, start = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    const step = Math.ceil(target / (duration / 16));
    let current = 0;
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      setValue(current);
      if (current >= target) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, start]);
  return value;
}

function StatCounter({ value, label, suffix = '' }: { value: number; label: string; suffix?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);
  const count = useCounter(value, 1600, started);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStarted(true); }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className="text-center">
      <p className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-primary tabular-nums">
        {count.toLocaleString()}{suffix}
      </p>
      <p className="text-xs sm:text-sm text-gray-400 mt-1 font-medium">{label}</p>
    </div>
  );
}

const SUGGESTIONS = ['Milwaukee M18', 'DeWalt circular saw', 'Makita drill', 'Hilti hammer', 'Festool track saw', 'Bosch angle grinder', 'Paslode nailer', 'scaffolding'];

type TopSellerTestimonial = {
  sellerName: string;
  avatarUrl: string;
  averageRating: number;
  reviewCount: number;
  locationLabel: string;
  recentQuote: string;
};

const featureHighlights = [
  {
    icon: CheckCircle,
    title: 'Free Listings',
    description: 'List your tools for free with no hidden listing fees.',
  },
  {
    icon: Shield,
    title: 'Verified Sellers',
    description: 'Verified trade profiles help buyers purchase with confidence.',
  },
  {
    icon: MessageCircle,
    title: 'Secure Messaging',
    description: 'Communicate safely inside ToolLink before exchanging contact details.',
  },
  {
    icon: MapPin,
    title: 'Australia Wide',
    description: 'Buy and sell professional tools anywhere across Australia.',
  },
];

export default function HomePage() {
  const { navigate, openAuth, currentUser, listings } = useApp();
  const [query, setQuery] = useState('');
  const [searchState, setSearchState] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [heroLoaded, setHeroLoaded] = useState(false);
  const [financeModalOpen, setFinanceModalOpen] = useState(false);
  const [financeEmail, setFinanceEmail] = useState('');
  const [financeSubmitting, setFinanceSubmitting] = useState(false);
  const [topSellerTestimonial, setTopSellerTestimonial] = useState<TopSellerTestimonial | null>(null);
  const [testimonialLoaded, setTestimonialLoaded] = useState(false);

  useEffect(() => { setTimeout(() => setHeroLoaded(true), 50); }, []);

  useEffect(() => {
    let isActive = true;

    const loadTopSellerTestimonial = async () => {
      setTestimonialLoaded(false);

      const { data: reviewRows, error: reviewError } = await supabase
        .from('reviews')
        .select('reviewed_user_id, rating, comment, created_at')
        .order('created_at', { ascending: false });

      if (reviewError || !reviewRows) {
        if (!isActive) return;
        setTopSellerTestimonial(null);
        setTestimonialLoaded(true);
        return;
      }

      type SellerAggregate = {
        reviewedUserId: string;
        ratings: number[];
        comments: { comment: string; createdAt: string }[];
        latestReviewAt: string;
      };

      const grouped = new Map<string, SellerAggregate>();

      for (const row of reviewRows) {
        const reviewedUserId = row.reviewed_user_id;
        const parsedRating = Number(row.rating);
        if (!reviewedUserId || !Number.isFinite(parsedRating)) continue;

        const createdAt = row.created_at ?? '';
        const existing = grouped.get(reviewedUserId) ?? {
          reviewedUserId,
          ratings: [],
          comments: [],
          latestReviewAt: createdAt,
        };

        existing.ratings.push(parsedRating);
        if (row.comment?.trim()) {
          existing.comments.push({ comment: row.comment.trim(), createdAt });
        }

        if (!existing.latestReviewAt || createdAt > existing.latestReviewAt) {
          existing.latestReviewAt = createdAt;
        }

        grouped.set(reviewedUserId, existing);
      }

      const ranked = Array.from(grouped.values())
        .map((entry) => {
          const reviewCount = entry.ratings.length;
          const averageRating = reviewCount > 0
            ? entry.ratings.reduce((sum, rating) => sum + rating, 0) / reviewCount
            : 0;

          const recentQuote = entry.comments
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0]?.comment ?? '';

          return {
            reviewedUserId: entry.reviewedUserId,
            averageRating,
            reviewCount,
            latestReviewAt: entry.latestReviewAt,
            recentQuote,
          };
        })
        .filter((entry) => entry.reviewCount > 0)
        .sort((a, b) => {
          if (b.averageRating !== a.averageRating) return b.averageRating - a.averageRating;
          if (b.reviewCount !== a.reviewCount) return b.reviewCount - a.reviewCount;
          return b.latestReviewAt.localeCompare(a.latestReviewAt);
        });

      if (ranked.length === 0) {
        if (!isActive) return;
        setTopSellerTestimonial(null);
        setTestimonialLoaded(true);
        return;
      }

      const candidateIds = ranked.map((entry) => entry.reviewedUserId);
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, name, avatar_url, location, state')
        .in('id', candidateIds);

      if (profileError || !profiles) {
        if (!isActive) return;
        setTopSellerTestimonial(null);
        setTestimonialLoaded(true);
        return;
      }

      const profilesById = new Map(profiles.map((profile) => [profile.id, profile]));

      const selected = ranked.find((entry) => {
        const profile = profilesById.get(entry.reviewedUserId);
        return Boolean(profile?.name?.trim());
      });

      if (!selected) {
        if (!isActive) return;
        setTopSellerTestimonial(null);
        setTestimonialLoaded(true);
        return;
      }

      const profile = profilesById.get(selected.reviewedUserId);
      if (!profile) {
        if (!isActive) return;
        setTopSellerTestimonial(null);
        setTestimonialLoaded(true);
        return;
      }

      const location = profile.location?.trim() ?? '';
      const state = profile.state?.trim() ?? '';
      const locationLabel = location
        ? (state && !location.toLowerCase().includes(state.toLowerCase()) ? `${location}, ${state}` : location)
        : state;

      if (!isActive) return;

      setTopSellerTestimonial({
        sellerName: profile.name.trim(),
        avatarUrl: profile.avatar_url ?? '',
        averageRating: selected.averageRating,
        reviewCount: selected.reviewCount,
        locationLabel,
        recentQuote: selected.recentQuote,
      });
      setTestimonialLoaded(true);
    };

    loadTopSellerTestimonial();

    return () => {
      isActive = false;
    };
  }, []);

  const activeListings = listings.filter((l) => l.status === 'active');
  const activeListingCount = activeListings.length;
  const browseListingsCtaLabel = activeListingCount > 0
    ? `Browse All ${activeListingCount.toLocaleString()} Listings`
    : 'Browse Current Listings';
  const getCategoryListingLabel = (count: number) => (count > 0 ? `${count.toLocaleString()} listings` : 'Listings coming soon');
  const categoryCounts = activeListings.reduce<Record<string, number>>((acc, listing) => {
    if (!listing.categoryId) return acc;
    acc[listing.categoryId] = (acc[listing.categoryId] ?? 0) + 1;
    return acc;
  }, {});

  const featuredListings = listings.filter((l) => l.featured || l.status === 'active').slice(0, 6);
  const filtered = SUGGESTIONS.filter((s) => query && s.toLowerCase().includes(query.toLowerCase()));

  const whyItems = [
    { icon: Shield, title: 'Trusted Community', desc: 'Verified tradie profiles and ratings from real trade professionals.' },
    { icon: CheckCircle, title: 'Verified Sellers', desc: 'Every seller is reviewed. Honest listings, verified condition grading.' },
    { icon: MapPin, title: 'Australia Wide', desc: 'Buyers and sellers across every state. Local pickup or nationwide freight.' },
    { icon: MessageCircle, title: 'Safe Messaging', desc: 'Negotiate in-app without sharing your personal number until you\'re ready.' },
    { icon: Zap, title: 'Free Listings', desc: 'List your tools for free. No subscription. No hidden fees.' },
    { icon: TrendingUp, title: 'Best Prices', desc: 'Market-informed pricing data to help you buy smart and sell faster.' },
  ];

  const financeFeatures = [
    'Equipment Finance',
    'Tool Finance',
    'Fast Online Applications',
    'Personal & Business Options',
    'Trusted Australian Finance Partners',
  ];

  const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const joinFinanceWaitlist = async (emailInput: string, userId?: string) => {
    const normalizedEmail = emailInput.trim().toLowerCase();
    if (!isValidEmail(normalizedEmail)) {
      toast.error('Please enter a valid email address.');
      return;
    }

    setFinanceSubmitting(true);
    const payload: { email: string; user_id?: string; source: string } = {
      email: normalizedEmail,
      source: 'homepage_finance_section',
    };

    if (userId) payload.user_id = userId;

    const { error } = await supabase
      .from('finance_waitlist')
      .insert(payload);

    setFinanceSubmitting(false);

    if (error) {
      if (error.code === '23505') {
        toast('You’re already on the ToolLink Finance waiting list.');
        setFinanceModalOpen(false);
        return;
      }

      toast.error('Unable to join the ToolLink Finance waiting list right now. Please try again.');
      return;
    }

    toast.success('You’re on the list! We’ll email you when ToolLink Finance becomes available.');
    setFinanceModalOpen(false);
    setFinanceEmail('');
  };

  const handleFinanceNotifyClick = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (user?.email?.trim()) {
      await joinFinanceWaitlist(user.email, user.id);
      return;
    }

    setFinanceEmail('');
    setFinanceModalOpen(true);
  };

  const handleFinanceGuestSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await joinFinanceWaitlist(financeEmail);
  };

  return (
    <div className="min-h-screen overflow-x-hidden">

      {/* ─── HERO ─── */}
      <section className="relative min-h-[92vh] flex items-center bg-[#0A0A0A] text-white overflow-hidden">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-700"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1800&h=1000&fit=crop&auto=format)',
            opacity: heroLoaded ? 0.22 : 0,
          }}
        />
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/80 via-[#0A0A0A]/50 to-[#0A0A0A]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A]/60 via-transparent to-transparent" />

        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 py-24 md:py-32 flex flex-col items-center text-center">

          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 bg-primary/15 border border-primary/25 rounded-full px-5 py-2 text-sm text-primary font-semibold mb-8 backdrop-blur-sm"
            style={{ animation: 'fadeDown 0.6s ease both' }}
          >
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            Australia's Dedicated Trade Marketplace
          </div>

          {/* Heading */}
          <h1
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[1.0] max-w-5xl mb-6"
            style={{ animation: 'fadeUp 0.7s 0.1s ease both' }}
          >
            Australia's Marketplace<br />
            <span className="text-primary">for Tradies</span>
          </h1>

          {/* Subheading */}
          <p
            className="text-lg sm:text-xl md:text-2xl text-gray-300 max-w-2xl mb-12 leading-relaxed font-light"
            style={{ animation: 'fadeUp 0.7s 0.2s ease both' }}
          >
            Buy, sell and trade quality professional tools and construction equipment across Australia.
          </p>

          {/* ── SEARCH BAR ── */}
          <div
            className="w-full max-w-3xl mb-8"
            style={{ animation: 'fadeUp 0.7s 0.3s ease both' }}
          >
            <div className="relative flex flex-col sm:flex-row bg-white rounded-2xl shadow-2xl shadow-black/40 overflow-hidden border border-white/10">
              {/* Query input */}
              <div className="flex-1 flex items-center gap-3 px-5 py-4 relative">
                <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="What tools are you looking for?"
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true); }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  onKeyDown={(e) => e.key === 'Enter' && navigate('browse')}
                  className="flex-1 text-foreground bg-transparent border-none outline-none placeholder:text-gray-400 text-base font-medium"
                />
                {/* Inline suggestions */}
                {showSuggestions && filtered.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-border rounded-xl shadow-xl mt-2 py-2 z-50">
                    {filtered.map((s) => (
                      <button
                        key={s}
                        onMouseDown={() => { setQuery(s); setShowSuggestions(false); navigate('browse'); }}
                        className="w-full text-left px-5 py-2.5 text-sm text-foreground hover:bg-accent hover:text-primary transition-colors"
                      >
                        <Search className="w-3.5 h-3.5 inline mr-2 text-muted-foreground" />
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="hidden sm:block w-px bg-gray-200 my-3" />

              {/* State selector */}
              <div className="flex items-center gap-1 px-4 py-4 border-t sm:border-t-0 border-gray-100">
                <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <select
                  value={searchState}
                  onChange={(e) => setSearchState(e.target.value)}
                  className="bg-transparent text-sm font-medium text-foreground focus:outline-none cursor-pointer pr-1 appearance-none"
                >
                  <option value="">All States</option>
                  {['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'NT', 'ACT'].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </div>

              {/* Search button */}
              <button
                onClick={() => navigate('browse')}
                className="flex items-center justify-center gap-2 m-2 px-7 py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-orange-600 active:scale-[0.98] transition-all text-sm shadow-lg shadow-primary/30"
              >
                <Search className="w-4 h-4" />
                Search
              </button>
            </div>

            {/* Quick filter chips */}
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              {['Power Tools', 'Hand Tools', 'Welding', 'Safety Gear', 'Heavy Equipment'].map((tag) => {
                const ids: Record<string, string> = { 'Power Tools': 'power-tools', 'Hand Tools': 'hand-tools', 'Welding': 'welding', 'Safety Gear': 'safety-gear', 'Heavy Equipment': 'heavy-equipment' };
                return (
                  <button
                    key={tag}
                    onClick={() => navigate('browse', { categoryId: ids[tag] })}
                    className="px-4 py-1.5 bg-white/10 hover:bg-primary/80 border border-white/15 hover:border-primary rounded-full text-xs text-white/80 hover:text-white font-medium transition-all backdrop-blur-sm"
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* CTA buttons */}
          <div
            className="flex flex-col sm:flex-row gap-3 mb-16"
            style={{ animation: 'fadeUp 0.7s 0.4s ease both' }}
          >
            <button
              onClick={() => navigate('browse')}
              className="flex items-center justify-center gap-2 px-8 py-4 bg-white text-[#111111] font-bold rounded-2xl hover:bg-gray-50 active:scale-[0.98] transition-all text-sm shadow-xl"
            >
              Browse Listings <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => currentUser ? navigate('create') : openAuth('register')}
              className="flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white font-bold rounded-2xl hover:bg-orange-600 active:scale-[0.98] transition-all text-sm shadow-xl shadow-primary/30 border border-primary/40"
            >
              Sell Your Tools <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Scroll hint */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-40">
            <ChevronDown className="w-5 h-5 animate-bounce" />
          </div>
        </div>
      </section>

      {/* ─── TOOLLINK FINANCE ─── */}
      <section className="relative py-20 md:py-24 bg-[#0E0E0E] text-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,115,0,0.16),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.06),transparent_50%)]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#171717] via-[#141414] to-[#0F0F0F] p-7 sm:p-10 md:p-12 shadow-2xl shadow-black/40">
            <div className="max-w-3xl">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-2">ToolLink Finance</h2>
              <p className="text-primary font-semibold italic text-base sm:text-lg mb-6">Coming Soon</p>

              <p className="text-sm sm:text-base text-gray-300 leading-relaxed mb-7">
                ToolLink is expanding beyond buying and selling tools. We are currently partnering with accredited Australian finance professionals to offer equipment and tool finance directly through the platform.
              </p>
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed mb-8">
                Whether you&apos;re a sole trader, business owner or individual, ToolLink Finance will make it easier to purchase the tools and equipment you need.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
                {financeFeatures.map((feature) => (
                  <div key={feature} className="flex items-center gap-2.5 text-sm sm:text-base text-white/95">
                    <CheckCircle className="w-4.5 h-4.5 text-primary flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={handleFinanceNotifyClick}
                disabled={financeSubmitting}
                className="inline-flex items-center justify-center px-8 py-4 bg-primary text-white font-bold rounded-2xl hover:bg-orange-600 active:scale-[0.98] transition-all text-sm sm:text-base shadow-lg shadow-primary/25"
              >
                {financeSubmitting ? 'Joining Waitlist...' : 'Notify Me When Finance Launches'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── STATS BAR ─── */}
      <section className="bg-[#111111] border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {featureHighlights.map(({ icon: Icon, title, description }) => (
              <div key={title} className="text-center">
                <div className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-primary/15 border border-primary/20 text-primary mb-3">
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-sm sm:text-base font-semibold text-white">{title}</p>
                <p className="text-xs sm:text-sm text-gray-400 mt-1 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURED LISTINGS ─── */}
      <section className="py-20 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Hand-Picked</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground leading-tight">Featured Listings</h2>
              <p className="text-muted-foreground mt-2">Quality tools from verified sellers across Australia</p>
            </div>
            <button
              onClick={() => navigate('browse')}
              className="hidden sm:flex items-center gap-1.5 text-primary font-semibold text-sm hover:underline"
            >
              View all <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between mt-10 gap-4">
            <button onClick={() => navigate('browse')} className="sm:hidden flex items-center gap-1.5 text-primary font-semibold text-sm hover:underline">
              View all listings <ChevronRight className="w-4 h-4" />
            </button>
            <div className="hidden sm:block" />
            <button
              onClick={() => navigate('browse')}
              className="inline-flex items-center gap-2 px-8 py-3.5 border-2 border-[#111111] text-[#111111] font-bold rounded-2xl hover:bg-[#111111] hover:text-white transition-all text-sm"
            >
              {browseListingsCtaLabel} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ─── CATEGORIES ─── */}
      <section className="py-20 md:py-24 bg-[#F7F7F7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Every Trade</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground">Browse by Category</h2>
            <p className="text-muted-foreground mt-2">Find exactly what you need across all trade categories</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => navigate('browse', { categoryId: cat.id })}
                className="group relative rounded-2xl overflow-hidden aspect-[4/3] bg-[#111111] cursor-pointer border-2 border-transparent hover:border-primary transition-all duration-300"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover opacity-55 group-hover:opacity-40 group-hover:scale-110 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-end p-4 text-left">
                  <h3 className="text-white font-bold text-sm sm:text-base leading-tight">{cat.name}</h3>
                  <p className="text-gray-300 text-xs mt-0.5">{getCategoryListingLabel(categoryCounts[cat.id] ?? 0)}</p>
                </div>
                <div className="absolute inset-0 border-2 border-primary rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute top-3 right-3 w-7 h-7 bg-primary rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg">
                  <ArrowRight className="w-3.5 h-3.5 text-white" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ─── WHY TOOLLINK ─── */}
      <section className="py-20 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Built for Tradies</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-3">Why ToolLink?</h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-base">
              Every feature is designed around the way Australian tradies actually buy, sell and work.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {whyItems.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="group p-7 rounded-2xl border border-border hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 cursor-default"
              >
                <div className="w-12 h-12 bg-[#FFF0E6] rounded-2xl flex items-center justify-center mb-5 group-hover:bg-primary transition-colors duration-300">
                  <Icon className="w-6 h-6 text-primary group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="font-bold text-foreground text-base mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-20 md:py-24 bg-[#111111] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Simple Process</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-3">How It Works</h2>
            <p className="text-gray-400">From listing to sold in four simple steps</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Create Your Account', desc: 'Sign up free in under a minute. Add your trade and location to build trust.' },
              { step: '02', title: 'List Your Tools', desc: 'Upload photos. Our AI suggests your price, brand, and description instantly.' },
              { step: '03', title: 'Connect & Negotiate', desc: 'Tradies message you directly. Discuss condition and agree on a fair price.' },
              { step: '04', title: 'Complete the Sale', desc: 'Exchange payment and goods safely. Leave a review and build your reputation.' },
            ].map(({ step, title, desc }, i) => (
              <div key={step} className="relative">
                {i < 3 && <div className="hidden lg:block absolute top-7 left-[calc(100%-1rem)] w-8 h-px bg-white/10 z-0" />}
                <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-xl font-extrabold mb-5 shadow-lg shadow-primary/30">
                  {step}
                </div>
                <h3 className="font-bold text-lg mb-2">{title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIAL / CTA ─── */}
      <section className="py-20 md:py-24 bg-[#FFF0E6]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          {testimonialLoaded && topSellerTestimonial ? (
            <>
              <div className="flex items-center justify-center gap-0.5 mb-6" aria-label={`${topSellerTestimonial.averageRating.toFixed(1)} star rating`}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${star <= Math.round(topSellerTestimonial.averageRating) ? 'fill-primary text-primary' : 'text-primary/30'}`}
                  />
                ))}
              </div>

              {topSellerTestimonial.recentQuote && (
                <blockquote className="text-2xl sm:text-3xl font-bold text-foreground mb-8 leading-snug">
                  &ldquo;{topSellerTestimonial.recentQuote}&rdquo;
                </blockquote>
              )}

              <div className="flex items-center justify-center gap-3 mb-12">
                <UserAvatar
                  src={topSellerTestimonial.avatarUrl || undefined}
                  name={topSellerTestimonial.sellerName}
                  alt={topSellerTestimonial.sellerName}
                  className="w-12 h-12 rounded-full object-cover border-2 border-primary shadow-md"
                />
                <div className="text-left">
                  <p className="font-bold text-foreground text-sm">{topSellerTestimonial.sellerName}</p>
                  <p className="text-xs text-muted-foreground">
                    {topSellerTestimonial.locationLabel ? `${topSellerTestimonial.locationLabel} · ` : ''}
                    ⭐ {topSellerTestimonial.averageRating.toFixed(1)} ({topSellerTestimonial.reviewCount} review{topSellerTestimonial.reviewCount === 1 ? '' : 's'})
                  </p>
                </div>
              </div>
            </>
          ) : testimonialLoaded ? (
            <p className="text-base sm:text-lg text-muted-foreground mb-12">Real seller reviews will appear here soon.</p>
          ) : null}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => currentUser ? navigate('create') : openAuth('register')}
              className="px-10 py-4 bg-primary text-white font-extrabold rounded-2xl hover:bg-orange-600 active:scale-[0.98] transition-all text-sm shadow-xl shadow-primary/25"
            >
              Start Selling Today — It&apos;s Free
            </button>
            <button
              onClick={() => navigate('browse')}
              className="px-10 py-4 bg-white text-foreground font-bold rounded-2xl hover:bg-gray-50 transition-all text-sm border border-border shadow-md"
            >
              Browse Listings
            </button>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeDown { from { opacity: 0; transform: translateY(-12px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <Dialog open={financeModalOpen} onOpenChange={setFinanceModalOpen}>
        <DialogContent className="max-w-xl rounded-2xl border border-border bg-background px-6 py-7 sm:px-8 sm:py-8">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl font-extrabold text-foreground">ToolLink Finance is coming soon.</DialogTitle>
            <DialogDescription className="text-sm sm:text-base text-muted-foreground leading-relaxed pt-2">
              We are currently finalising partnerships with accredited finance professionals. Register your interest today and we&apos;ll notify you when ToolLink Finance becomes available.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleFinanceGuestSubmit} className="mt-4 space-y-3">
            <label htmlFor="finance-waitlist-email" className="text-sm font-semibold text-foreground block">
              Email Address
            </label>
            <input
              id="finance-waitlist-email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              value={financeEmail}
              onChange={(event) => setFinanceEmail(event.target.value)}
              className="w-full h-11 rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/35"
            />
            <button
              type="submit"
              disabled={financeSubmitting}
              className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3 bg-primary text-white font-bold rounded-xl hover:bg-orange-600 active:scale-[0.98] transition-all text-sm disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {financeSubmitting ? 'Joining Waitlist...' : 'Join Finance Waitlist'}
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
