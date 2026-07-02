import { useEffect, useState, useCallback } from 'react';
import { MapPin, Star, CheckCircle, Package, Calendar, MessageSquare, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import ListingCard from '../components/ListingCard';
import { supabase } from '../../lib/supabase';
import UserAvatar from '../components/UserAvatar';

const REVIEWS = [
  { id: 'r1', reviewer: 'Dave K.', rating: 5, text: 'Gear was exactly as described. Fast to respond, easy transaction. Would buy again.', date: '2024-11-20' },
  { id: 'r2', reviewer: 'Sarah M.', rating: 5, text: 'Great seller — honest about condition, good price. Highly recommend.', date: '2024-10-15' },
  { id: 'r3', reviewer: 'Pete J.', rating: 4, text: 'Good kit, fair deal. Took a day to respond but got there in the end.', date: '2024-09-02' },
];

export default function SellerProfilePage() {
  const { navParams, listings, navigate, currentUser, openAuth, startConversation, users } = useApp();
  const seller = users.find((u) => u.id === navParams.userId);
  const [sellerStats, setSellerStats] = useState({ reviewCount: 0, averageRating: 0 });

  const loadSellerStats = useCallback(async (userId: string) => {
    if (!userId) {
      setSellerStats({ reviewCount: 0, averageRating: 0 });
      return;
    }

    const { data, error } = await supabase
      .from('reviews')
      .select('rating')
      .eq('reviewed_user_id', userId);

    if (error) {
      console.error('Failed to load seller review stats:', error);
      setSellerStats({ reviewCount: 0, averageRating: 0 });
      return;
    }

    const ratings = (data ?? [])
      .map((row: any) => Number(row.rating))
      .filter((value) => Number.isFinite(value));

    const reviewCount = ratings.length;
    const averageRating = reviewCount > 0 ? ratings.reduce((sum, value) => sum + value, 0) / reviewCount : 0;

    setSellerStats({ reviewCount, averageRating });
  }, []);

  useEffect(() => {
    if (!seller?.id) return;

    loadSellerStats(seller.id);

    const channel = supabase.channel(`seller-stats-${seller.id}`);
    channel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'reviews',
        filter: `reviewed_user_id=eq.${seller.id}`,
      },
      () => loadSellerStats(seller.id)
    );

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [seller?.id, loadSellerStats]);

  if (!seller) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-foreground mb-2">Seller not found</h2>
          <button onClick={() => navigate('browse')} className="text-primary hover:underline text-sm">Back to browse</button>
        </div>
      </div>
    );
  }

  const parsedRating = Number.isFinite(sellerStats.averageRating) ? sellerStats.averageRating : 0;
  const parsedReviewCount = Number.isFinite(sellerStats.reviewCount) ? Math.max(0, sellerStats.reviewCount) : 0;
  const sellerListings = listings.filter((l) => l.sellerId === seller.id && l.status === 'active');
  const isOwnProfile = currentUser?.id === seller.id;
  const hasReviews = parsedReviewCount > 0;
  const formattedRating = parsedRating.toFixed(1);

  const handleContact = () => {
    if (!currentUser) { openAuth('login'); return; }
    const firstListing = sellerListings[0];
    if (!firstListing) return;
    const convId = startConversation(firstListing.id, seller.id, `Hi ${seller.name.split(' ')[0]}, I saw your profile on ToolLink. Do you have any other tools available?`);
    navigate('messages', { conversationId: convId });
  };

  const stars = (rating: number) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`w-4 h-4 ${s <= Math.round(rating) ? 'fill-primary text-primary' : 'text-border'}`} />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-muted">
      {/* Header */}
      <div className="bg-[#111111] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 pb-8">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <UserAvatar
              src={seller.avatar || undefined}
              name={seller.name}
              alt={seller.name}
              className="w-24 h-24 rounded-2xl object-cover border-4 border-white/20 flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h1 className="text-2xl font-bold">{seller.name}</h1>
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      {hasReviews ? (
                        <>
                          {stars(parsedRating)}
                          <span className="text-sm font-semibold">{formattedRating}</span>
                          <span className="text-sm text-gray-400">({parsedReviewCount} reviews)</span>
                        </>
                      ) : (
                        <span className="text-sm text-gray-400">New Seller</span>
                      )}
                    </div>
                    {seller.verified && (
                      <span className="flex items-center gap-1 text-xs text-primary font-medium">
                        <CheckCircle className="w-3.5 h-3.5" /> Verified Tradie
                      </span>
                    )}
                  </div>
                </div>
                {!isOwnProfile && (
                  <button
                    onClick={handleContact}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors text-sm flex-shrink-0"
                  >
                    <MessageSquare className="w-4 h-4" /> Contact Seller
                  </button>
                )}
              </div>

              {seller.bio && <p className="text-sm text-gray-300 mt-3 max-w-xl">{seller.bio}</p>}

              <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-400">
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{seller.location}</span>
                <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />Member since {new Date(seller.memberSince).toLocaleDateString('en-AU', { month: 'long', year: 'numeric' })}</span>
                <span className="flex items-center gap-1.5"><Package className="w-4 h-4" />{seller.totalListings} tools listed</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-6 mt-6 pt-6 border-t border-white/10">
            <div>
              <p className="text-xl font-bold text-primary">{hasReviews ? formattedRating : '0.0'}</p>
              <p className="text-xs text-gray-400">Rating</p>
            </div>
            <div>
              <p className="text-xl font-bold text-primary">{parsedReviewCount}</p>
              <p className="text-xs text-gray-400">Reviews</p>
            </div>
            <div>
              <p className="text-xl font-bold text-primary">{sellerListings.length}</p>
              <p className="text-xs text-gray-400">Active listings</p>
            </div>
            <div>
              <p className="text-xl font-bold text-primary">{seller.totalListings}</p>
              <p className="text-xs text-gray-400">Total sold</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Listings */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-foreground">Active Listings ({sellerListings.length})</h2>
            </div>
            {sellerListings.length === 0 ? (
              <div className="bg-white rounded-xl border border-border p-12 text-center">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="font-medium text-foreground mb-1">No active listings</p>
                <p className="text-sm text-muted-foreground">This seller has no current listings.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {sellerListings.map((l) => <ListingCard key={l.id} listing={l} compact />)}
              </div>
            )}
          </div>

          {/* Reviews sidebar */}
          <div>
            <h2 className="text-lg font-bold text-foreground mb-5">Reviews</h2>
            <div className="space-y-4">
              {REVIEWS.map((review) => (
                <div key={review.id} className="bg-white rounded-xl border border-border p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-foreground">{review.reviewer}</p>
                    <div className="flex items-center gap-0.5">
                      {[...Array(review.rating)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-primary text-primary" />)}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{review.text}</p>
                  <p className="text-xs text-muted-foreground mt-2">{new Date(review.date).toLocaleDateString('en-AU', { month: 'short', year: 'numeric' })}</p>
                </div>
              ))}
              <div className="bg-white rounded-xl border border-border p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Showing 3 of {parsedReviewCount} reviews
                </p>
                <button className="flex items-center gap-1 text-sm text-primary font-medium mx-auto mt-2 hover:underline">
                  View all reviews <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
