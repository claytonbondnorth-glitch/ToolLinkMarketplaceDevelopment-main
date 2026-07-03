import { useEffect, useState } from 'react';
import { Heart, MapPin, Eye, Share2, Flag, ChevronLeft, ChevronRight, Star, MessageSquare, Phone, CheckCircle, Clock, Package } from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '../context/AppContext';
import ListingCard from '../components/ListingCard';
import UserAvatar from '../components/UserAvatar';
import { getVerificationBadgeLabel } from '../lib/verification';

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)} days ago`;
  return new Date(dateStr).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function ListingDetailPage() {
  const { navParams, navigate, listings, toggleSave, savedIds, currentUser, openAuth, startConversation, users, conversations, updateListingStatus } = useApp();
  const listing = listings.find((l) => l.id === navParams.listingId) ?? listings[0];
  const seller = users.find((u) => u.id === listing?.sellerId);
  const verificationBadgeLabel = seller ? getVerificationBadgeLabel(seller) : null;

  const [imgIndex, setImgIndex] = useState(0);
  const [showContact, setShowContact] = useState(false);
  const [message, setMessage] = useState(`Hi ${seller?.name?.split(' ')[0]}, I'm interested in your listing "${listing.title}". Is it still available?`);
  const [sent, setSent] = useState(false);
  const [showSoldModal, setShowSoldModal] = useState(false);
  const [selectedBuyerId, setSelectedBuyerId] = useState('');
  const [isMarkingSold, setIsMarkingSold] = useState(false);

  const isSaved = savedIds.has(listing.id);
  const related = listings.filter((l) => l.categoryId === listing?.categoryId && l.id !== listing?.id).slice(0, 3);
  const eligibleBuyers = conversations
    .filter((conversation) => conversation.listingId === listing?.id)
    .map((conversation) => conversation.participantIds.find((id) => id !== currentUser?.id))
    .filter((id): id is string => Boolean(id) && id !== listing?.sellerId)
    .map((id) => users.find((user) => user.id === id))
    .filter((user): user is NonNullable<typeof user> => Boolean(user));

  const conditionColor: Record<string, string> = {
    'New': 'text-green-700 bg-green-100',
    'Used - Like New': 'text-blue-700 bg-blue-100',
    'Used - Good': 'text-yellow-700 bg-yellow-100',
    'Used - Fair': 'text-orange-700 bg-orange-100',
    'For Parts': 'text-red-700 bg-red-100',
  };

  const handleContact = () => {
    if (!currentUser) {
      openAuth('login');
      return;
    }
    if (currentUser.id === listing.sellerId) return;
    setShowContact(true);
  };

  const handleSendMessage = () => {
    if (!currentUser || !seller) return;
    const convId = startConversation(listing.id, seller.id, message);
    setSent(true);
    setTimeout(() => {
      setShowContact(false);
      setSent(false);
      navigate('messages', { conversationId: convId });
    }, 1500);
  };

  useEffect(() => {
    if (eligibleBuyers.length > 0 && !selectedBuyerId) {
      setSelectedBuyerId(eligibleBuyers[0].id);
    }
  }, [eligibleBuyers, selectedBuyerId]);

  const handleOpenSoldModal = () => {
    if (!listing || currentUser?.id !== listing.sellerId) return;
    if (eligibleBuyers.length === 0) {
      toast.error('No buyer has messaged about this listing yet.');
      return;
    }
    setSelectedBuyerId(eligibleBuyers[0].id);
    setShowSoldModal(true);
  };

  const handleMarkAsSold = async () => {
    if (!listing || currentUser?.id !== listing.sellerId) return;

    if (!selectedBuyerId) {
      toast.error('Please select the buyer who purchased this listing.');
      return;
    }

    setIsMarkingSold(true);
    try {
      const result = await updateListingStatus(listing.id, 'sold', selectedBuyerId);
      if (!result.success) {
        toast.error(result.errorMessage || 'Unable to mark listing as sold right now.');
        return;
      }
      setShowSoldModal(false);
      toast.success('Sale marked as sold.');
    } finally {
      setIsMarkingSold(false);
    }
  };

  if (!listing) return null;

  return (
    <div className="min-h-screen bg-muted">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <button onClick={() => navigate('home')} className="hover:text-primary transition-colors">Home</button>
            <span>/</span>
            <button onClick={() => navigate('browse')} className="hover:text-primary transition-colors">Browse</button>
            <span>/</span>
            <button onClick={() => navigate('browse', { categoryId: listing.categoryId })} className="hover:text-primary transition-colors">{listing.category}</button>
            <span>/</span>
            <span className="text-foreground truncate max-w-xs">{listing.title}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image gallery */}
            <div className="bg-white rounded-xl overflow-hidden border border-border">
              <div className="relative aspect-[4/3] bg-muted">
                <img
                  src={listing.images[imgIndex]}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
                {listing.featured && (
                  <div className="absolute top-4 left-4 bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full">Featured</div>
                )}
                {listing.images.length > 1 && (
                  <>
                    <button
                      onClick={() => setImgIndex((i) => (i - 1 + listing.images.length) % listing.images.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setImgIndex((i) => (i + 1) % listing.images.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full">
                      {imgIndex + 1} / {listing.images.length}
                    </div>
                  </>
                )}
              </div>
              {listing.images.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto">
                  {listing.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setImgIndex(i)}
                      className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-colors ${i === imgIndex ? 'border-primary' : 'border-transparent hover:border-border'}`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Listing info */}
            <div className="bg-white rounded-xl border border-border p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1 min-w-0">
                  <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-2 ${conditionColor[listing.condition] ?? 'bg-muted text-muted-foreground'}`}>
                    {listing.condition}
                  </span>
                  <h1 className="text-xl sm:text-2xl font-bold text-foreground leading-tight">{listing.title}</h1>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => toggleSave(listing.id)}
                    className={`p-2.5 rounded-xl border transition-all ${isSaved ? 'bg-primary border-primary text-white' : 'border-border text-muted-foreground hover:border-primary hover:text-primary'}`}
                  >
                    <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
                  </button>
                  <button className="p-2.5 rounded-xl border border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="text-3xl font-bold text-primary mb-4">
                ${listing.price.toLocaleString()}
                <span className="text-sm font-normal text-muted-foreground ml-1">AUD</span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-6">
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{listing.location}</span>
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{timeAgo(listing.dateListed)}</span>
                <span className="flex items-center gap-1.5"><Eye className="w-4 h-4" />{listing.views} views</span>
              </div>

              {/* Specs grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                {[
                  { label: 'Brand', value: listing.brand },
                  { label: 'Category', value: listing.category },
                  { label: 'Condition', value: listing.condition },
                  { label: 'Location', value: listing.location },
                  { label: 'State', value: listing.state },
                  { label: 'Listed', value: new Date(listing.dateListed).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }) },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-muted rounded-xl px-4 py-3">
                    <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
                    <p className="text-sm font-semibold text-foreground">{value}</p>
                  </div>
                ))}
              </div>

              <h2 className="text-base font-bold text-foreground mb-3">Description</h2>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{listing.description}</p>

              <div className="mt-6 pt-5 border-t border-border">
                <button
                  onClick={() => navigate('browse', { categoryId: listing.categoryId })}
                  className="text-sm text-primary hover:underline font-medium"
                >
                  Report this listing
                </button>
              </div>
            </div>
          </div>

          {/* Right column — Seller + CTA */}
          <div className="space-y-5">
            {/* Price + CTA card */}
            <div className="bg-white rounded-xl border border-border p-5 sticky top-24">
              <div className="text-2xl font-bold text-primary mb-1">${listing.price.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mb-5">Price is firm unless stated otherwise</p>

              {currentUser?.id === listing.sellerId ? (
                <>
                  <button
                    onClick={handleOpenSoldModal}
                    disabled={isMarkingSold || listing.status === 'sold'}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <Package className="w-4 h-4" />
                    {listing.status === 'sold' ? 'Sold' : 'Mark as Sold'}
                  </button>
                  <div className="mt-3 p-3 bg-muted rounded-xl text-sm text-center text-muted-foreground">
                    This is your listing
                  </div>
                </>
              ) : (
                <>
                  <button
                    onClick={handleContact}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors mb-3"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Contact Seller
                  </button>
                  {seller?.phone && (
                    <button className="w-full flex items-center justify-center gap-2 py-3 border-2 border-border text-foreground font-semibold rounded-xl hover:border-primary hover:text-primary transition-colors text-sm">
                      <Phone className="w-4 h-4" />
                      Show Phone Number
                    </button>
                  )}
                </>
              )}

              <div className="mt-4 pt-4 border-t border-border space-y-2.5">
                {[
                  { icon: Package, text: 'Inspect before you buy' },
                  { icon: CheckCircle, text: 'Meet in a safe public location' },
                  { icon: Flag, text: 'Never pay via gift cards' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2.5 text-xs text-muted-foreground">
                    <Icon className="w-3.5 h-3.5 flex-shrink-0 text-primary" />
                    {text}
                  </div>
                ))}
              </div>
            </div>

            {/* Seller card */}
            {seller && (
              <div
                className="bg-white rounded-xl border border-border p-5 cursor-pointer hover:border-primary/30 transition-colors"
                onClick={() => navigate('seller', { userId: seller.id })}
              >
                <h3 className="text-sm font-semibold text-foreground mb-4">About the Seller</h3>
                <div className="flex items-center gap-3 mb-4">
                  <UserAvatar src={seller.avatar || undefined} name={seller.name} alt={seller.name} className="w-14 h-14 rounded-full object-cover border-2 border-border" />
                  <div>
                    <p className="font-bold text-foreground">{seller.name}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star className="w-3.5 h-3.5 fill-primary text-primary" />
                      <span className="text-sm font-semibold">{seller.rating}</span>
                      <span className="text-xs text-muted-foreground">({seller.reviewCount} reviews)</span>
                    </div>
                    {verificationBadgeLabel && (
                      <div className="flex items-center gap-1 mt-1">
                        <CheckCircle className="w-3 h-3 text-primary" />
                        <span className="text-xs text-primary font-medium">{verificationBadgeLabel}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5" />
                    {seller.location}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" />
                    Member since {new Date(seller.memberSince).toLocaleDateString('en-AU', { month: 'long', year: 'numeric' })}
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="w-3.5 h-3.5" />
                    {seller.totalListings} total listings
                  </div>
                </div>
                <button className="w-full mt-4 py-2 text-sm text-primary font-semibold border border-primary/30 rounded-xl hover:bg-accent transition-colors">
                  View Profile
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Related listings */}
        {related.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-bold text-foreground mb-5">Similar Listings</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {related.map((l) => <ListingCard key={l.id} listing={l} />)}
            </div>
          </div>
        )}
      </div>

      {showSoldModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowSoldModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-foreground">Mark as sold</h3>
                <p className="text-sm text-muted-foreground">Choose the buyer for this listing.</p>
              </div>
              <button onClick={() => setShowSoldModal(false)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            <label className="text-sm font-semibold text-foreground mb-2 block">Buyer</label>
            <select
              value={selectedBuyerId}
              onChange={(event) => setSelectedBuyerId(event.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm mb-5"
            >
              {eligibleBuyers.map((buyer) => (
                <option key={buyer.id} value={buyer.id}>{buyer.name}</option>
              ))}
            </select>

            <button
              onClick={handleMarkAsSold}
              disabled={isMarkingSold || !selectedBuyerId}
              className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isMarkingSold ? 'Saving…' : 'Confirm Sale'}
            </button>
          </div>
        </div>
      )}

      {/* Contact modal */}
      {showContact && seller && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowContact(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            {sent ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-bold text-foreground mb-1">Message sent!</h3>
                <p className="text-sm text-muted-foreground">Taking you to your messages...</p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-5">
                  <UserAvatar src={seller.avatar || undefined} name={seller.name} alt={seller.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <p className="font-semibold text-sm">{seller.name}</p>
                    <p className="text-xs text-muted-foreground">Usually responds within a few hours</p>
                  </div>
                  <button onClick={() => setShowContact(false)} className="ml-auto p-1.5 rounded-lg hover:bg-muted transition-colors">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
                <div className="bg-muted rounded-xl p-3 mb-4 text-xs text-muted-foreground">
                  <span className="font-semibold">Listing:</span> {listing.title} · ${listing.price.toLocaleString()}
                </div>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm resize-none mb-4"
                />
                <button
                  onClick={handleSendMessage}
                  className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors text-sm"
                >
                  Send Message
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
