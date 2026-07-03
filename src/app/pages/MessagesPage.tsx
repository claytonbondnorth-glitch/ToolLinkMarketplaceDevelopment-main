import { useState, useRef, useEffect } from 'react';
import { Send, Search, ArrowLeft, Package, MessageSquare, Tag, Star, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '../context/AppContext';
import { supabase } from '../../lib/supabase';
import UserAvatar from '../components/UserAvatar';
import { getVerificationBadgeLabel } from '../lib/verification';

const VERIFICATION_APPROVAL_PHRASE = 'Your ToolLink verification has been approved';

function isVerificationApprovalMessage(text: string) {
  return text.includes(VERIFICATION_APPROVAL_PHRASE);
}

function isToolLinkVerificationConversation(conversation: { listingId: string | null; messages: { text: string }[] }) {
  return !conversation.listingId && conversation.messages.some((message) => isVerificationApprovalMessage(message.text));
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <div className="w-7 h-7 rounded-full bg-[#F0F0F0] flex-shrink-0" />
      <div className="bg-white border border-[#EBEBEB] rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5 shadow-sm">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.15}s`, animationDuration: '0.9s' }}
          />
        ))}
      </div>
    </div>
  );
}

function formatTime(ts: string) {
  const d = new Date(ts);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 86400000) return d.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' });
  if (diff < 604800000) return d.toLocaleDateString('en-AU', { weekday: 'short' });
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
}

export default function MessagesPage() {
  const { currentUser, conversations, listings, sendMessage, navigate, openAuth, navParams, users, markConversationAsRead, refreshUserProfiles } = useApp();
  const [activeConvId, setActiveConvId] = useState<string | null>(navParams.conversationId ?? null);
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const [showOffer, setShowOffer] = useState(false);
  const [offerPrice, setOfferPrice] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [hasReviewedCurrentListing, setHasReviewedCurrentListing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConvId, conversations]);

  useEffect(() => {
    if (activeConvId) {
      markConversationAsRead(activeConvId);
    }
  }, [activeConvId, markConversationAsRead]);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-border p-10 text-center max-w-md w-full">
          <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-3">Sign in to view messages</h2>
          <button onClick={() => openAuth('login')} className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors">
            Sign In
          </button>
        </div>
      </div>
    );
  }

  const myConversations = conversations.filter((c) => c.participantIds.includes(currentUser.id));
  const filteredConvs = myConversations.filter((c) => {
    if (!search) return true;
    const listing = listings.find((l) => l.id === c.listingId);
    const otherId = c.participantIds.find((id) => id !== currentUser.id);
    const other = users.find((u) => u.id === otherId);
    const displayName = isToolLinkVerificationConversation(c) ? 'ToolLink' : other?.name ?? '';
    return (
      listing?.title.toLowerCase().includes(search.toLowerCase()) ||
      displayName.toLowerCase().includes(search.toLowerCase())
    );
  });

  const activeConv = conversations.find((c) => c.id === activeConvId);
  const activeListing = activeConv ? listings.find((l) => l.id === activeConv.listingId) : null;
  const otherParticipantId = activeConv?.participantIds.find((id) => id !== currentUser.id);
  const otherParticipant = users.find((u) => u.id === otherParticipantId);
  const isToolLinkConversation = Boolean(activeConv && isToolLinkVerificationConversation(activeConv));
  const otherParticipantVerificationBadge = otherParticipant ? getVerificationBadgeLabel(otherParticipant) : null;
  const isSaleConversation = Boolean(
    activeConv &&
    activeListing &&
    activeListing.status === 'sold' &&
    activeListing.soldToUserId &&
    activeConv.participantIds.includes(activeListing.sellerId) &&
    activeConv.participantIds.includes(activeListing.soldToUserId)
  );
  const isBuyerReview = Boolean(currentUser && activeListing && currentUser.id === activeListing.soldToUserId && currentUser.id !== activeListing.sellerId);
  const reviewTargetUser = isBuyerReview
    ? users.find((u) => u.id === activeListing?.sellerId)
    : users.find((u) => u.id === activeListing?.soldToUserId);

  const handleSend = () => {
    if (!input.trim() || !activeConvId) return;
    sendMessage(activeConvId, input.trim());
    setInput('');
    // Simulate other party typing
    setTimeout(() => setIsTyping(true), 800);
    setTimeout(() => setIsTyping(false), 3200);
  };

  const handleSendOffer = () => {
    if (!offerPrice || !activeConvId) return;
    sendMessage(activeConvId, `💰 Offer: $${Number(offerPrice).toLocaleString()} AUD — Let me know if this works for you.`);
    setShowOffer(false);
    setOfferPrice('');
    setTimeout(() => setIsTyping(true), 1000);
    setTimeout(() => setIsTyping(false), 3500);
  };

  useEffect(() => {
    setReviewOpen(false);
    setReviewComment('');
    setReviewRating(5);
    setHasReviewedCurrentListing(false);
  }, [activeConvId]);

  useEffect(() => {
    if (!currentUser || !activeListing?.id || activeListing.status !== 'sold' || !activeListing.soldToUserId) {
      setHasReviewedCurrentListing(false);
      return;
    }

    let isActive = true;
    async function checkExistingReview() {
      const { data } = await supabase
        .from('reviews')
        .select('id')
        .eq('listing_id', activeListing.id)
        .eq('reviewer_id', currentUser.id)
        .maybeSingle();

      if (isActive) {
        setHasReviewedCurrentListing(Boolean(data));
      }
    }

    checkExistingReview();
    return () => {
      isActive = false;
    };
  }, [currentUser?.id, activeListing?.id, activeListing?.status, activeListing?.soldToUserId]);

  const handleSubmitReview = async () => {
    if (!currentUser || !activeListing || !reviewTargetUser) return;

    if (reviewRating < 1 || reviewRating > 5) {
      toast.error('Please choose a rating from 1 to 5 stars.');
      return;
    }

    setReviewSubmitting(true);
    try {
      const { data: existingReview } = await supabase
        .from('reviews')
        .select('id')
        .eq('listing_id', activeListing.id)
        .eq('reviewer_id', currentUser.id)
        .maybeSingle();

      if (existingReview) {
        setHasReviewedCurrentListing(true);
        setReviewOpen(false);
        setReviewComment('');
        setReviewRating(5);
        toast.error('You have already left a review for this listing.');
        return;
      }

      const { error } = await supabase.from('reviews').insert({
        listing_id: activeListing.id,
        reviewer_id: currentUser.id,
        reviewed_user_id: reviewTargetUser.id,
        rating: reviewRating,
        comment: reviewComment.trim(),
      });

      if (error) {
        console.error('Review insert failed:', error);
        toast.error(error.message || 'Unable to save your review right now.');
        return;
      }

      const { data: reviewRows, error: statsError } = await supabase
        .from('reviews')
        .select('rating')
        .eq('reviewed_user_id', reviewTargetUser.id);

      if (statsError) {
        console.error('Review stats lookup failed:', statsError);
        toast.error(statsError.message || 'Your review was saved, but the profile could not be updated.');
        return;
      }

      const ratings = (reviewRows ?? []).map((row: any) => Number(row.rating));
      const reviewCount = ratings.length;
      const averageRating = reviewCount > 0 ? ratings.reduce((sum, value) => sum + value, 0) / reviewCount : 0;

      await supabase.from('profiles').update({ rating: Number(averageRating.toFixed(1)), review_count: reviewCount }).eq('id', reviewTargetUser.id);
      await refreshUserProfiles([reviewTargetUser.id]);
      setHasReviewedCurrentListing(true);
      setReviewOpen(false);
      setReviewComment('');
      setReviewRating(5);
      toast.success('Your review has been submitted.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <div className="h-[calc(100vh-64px)] bg-muted flex overflow-hidden">
      {/* Conversation list */}
      <div className={`${activeConvId ? 'hidden sm:flex' : 'flex'} flex-col w-full sm:w-80 lg:w-96 bg-white border-r border-border flex-shrink-0`}>
        <div className="px-4 py-4 border-b border-border">
          <h1 className="text-lg font-bold text-foreground mb-3">Messages</h1>
          <div className="flex items-center gap-2 bg-muted rounded-xl px-3 py-2">
            <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-sm border-none outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredConvs.length === 0 ? (
            <div className="p-8 text-center">
              <MessageSquare className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground mb-1">No conversations yet</p>
              <p className="text-xs text-muted-foreground">Contact a seller on any listing to start a conversation.</p>
            </div>
          ) : (
            filteredConvs.map((conv) => {
              const listing = listings.find((l) => l.id === conv.listingId);
              const otherId = conv.participantIds.find((id) => id !== currentUser.id);
              const other = users.find((u) => u.id === otherId);
              const isToolLinkSystemConversation = isToolLinkVerificationConversation(conv);
              const otherVerificationBadge = other ? getVerificationBadgeLabel(other) : null;
              const lastMsg = conv.messages[conv.messages.length - 1];
              const unread = conv.messages.filter((m) => m.senderId !== currentUser.id && !m.read).length;
              const isActive = conv.id === activeConvId;
              const displayName = isToolLinkSystemConversation ? 'ToolLink' : other?.name;
              const displayLocation = isToolLinkSystemConversation ? 'System notifications' : listing?.title;

              return (
                <button
                  key={conv.id}
                  onClick={() => setActiveConvId(conv.id)}
                  className={`w-full text-left px-4 py-3.5 border-b border-border transition-colors ${isActive ? 'bg-accent' : 'hover:bg-muted'}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative flex-shrink-0">
                      <UserAvatar
                        src={other?.avatar || undefined}
                        name={other?.name}
                        alt={other?.name ?? ''}
                        className="w-11 h-11 rounded-full object-cover"
                      />
                      {unread > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">{unread}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">{displayName}</p>
                          {otherVerificationBadge && !isToolLinkSystemConversation && (
                            <span className="text-[10px] text-primary font-semibold whitespace-nowrap">{otherVerificationBadge}</span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground flex-shrink-0 ml-2">{lastMsg && formatTime(lastMsg.timestamp)}</p>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{displayLocation}</p>
                      {lastMsg && (
                        <p className={`text-xs mt-0.5 truncate ${unread > 0 ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                          {lastMsg.senderId === currentUser.id ? 'You: ' : ''}{lastMsg.text}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className={`${activeConvId ? 'flex' : 'hidden sm:flex'} flex-1 flex-col min-w-0`}>
        {activeConvId && activeConv ? (
          <>
            {/* Chat header */}
            <div className="bg-white border-b border-border px-4 py-3 flex items-center gap-3 flex-shrink-0">
              <button onClick={() => setActiveConvId(null)} className="sm:hidden p-1.5 rounded-lg hover:bg-muted transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
              {otherParticipant && !isToolLinkConversation && (
                <button onClick={() => navigate('seller', { userId: otherParticipant.id })} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                  <UserAvatar src={otherParticipant.avatar || undefined} name={otherParticipant.name} alt={otherParticipant.name} className="w-9 h-9 rounded-full object-cover" />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-foreground">{otherParticipant.name}</p>
                    <p className="text-xs text-muted-foreground">{otherParticipant.location}</p>
                    {otherParticipantVerificationBadge && (
                      <p className="text-[11px] text-primary font-semibold">{otherParticipantVerificationBadge}</p>
                    )}
                  </div>
                </button>
              )}
              {isToolLinkConversation && (
                <div className="flex items-center gap-3">
                  <UserAvatar src={undefined} name="ToolLink" alt="ToolLink" className="w-9 h-9 rounded-full object-cover" />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-foreground">ToolLink</p>
                    <p className="text-xs text-muted-foreground">System notifications</p>
                  </div>
                </div>
              )}
              {activeListing && (
                <button
                  onClick={() => navigate('listing', { listingId: activeListing.id })}
                  className="ml-auto flex items-center gap-2 bg-muted rounded-xl px-3 py-2 hover:bg-secondary transition-colors"
                >
                  <img src={activeListing.images[0]} alt="" className="w-8 h-8 rounded-lg object-cover" />
                  <div className="text-left min-w-0 hidden sm:block">
                    <p className="text-xs font-semibold text-foreground truncate max-w-32">{activeListing.title}</p>
                    <p className="text-xs text-primary font-bold">${activeListing.price.toLocaleString()}</p>
                  </div>
                </button>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-3">
              {activeConv.messages.map((msg) => {
                const isMe = msg.senderId === currentUser.id;
                const sender = isMe ? currentUser : users.find((u) => u.id === msg.senderId);
                const showToolLinkSender = !isMe && isVerificationApprovalMessage(msg.text);
                const isOffer = msg.text.startsWith('💰 Offer:');
                return (
                  <div key={msg.id} className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                    {!isMe && (
                      <UserAvatar src={showToolLinkSender ? undefined : sender?.avatar || undefined} name={showToolLinkSender ? 'ToolLink' : sender?.name} alt="" className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                    )}
                    <div className={`max-w-xs sm:max-w-sm lg:max-w-md ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                      <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                        isOffer
                          ? isMe ? 'bg-green-600 text-white rounded-br-sm font-semibold' : 'bg-green-50 border-2 border-green-200 text-green-800 rounded-bl-sm font-semibold'
                          : isMe ? 'bg-primary text-white rounded-br-sm' : 'bg-white border border-[#EBEBEB] text-foreground rounded-bl-sm'
                      }`}>
                        {msg.text}
                      </div>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                        {formatTime(msg.timestamp)}
                        {isMe && <span className="text-primary">✓✓</span>}
                      </p>
                    </div>
                  </div>
                );
              })}
              {isTyping && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>

            {isSaleConversation && (
              <div className="bg-white border-b border-[#EBEBEB] px-4 py-3 flex-shrink-0">
                <div className="rounded-2xl border border-[#EBEBEB] bg-muted/70 p-4">
                  <div className="flex items-start gap-2">
                    <div className="rounded-full bg-primary/10 p-2 text-primary">
                      <Package className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">This item has been marked as sold.</p>
                      <p className="text-xs text-muted-foreground mt-1">Thanks for completing the transaction.</p>
                      {hasReviewedCurrentListing ? (
                        <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 text-sm font-semibold text-green-700">
                          <CheckCircle2 className="w-4 h-4" />
                          Review submitted
                        </div>
                      ) : reviewOpen ? (
                        <div className="mt-3 space-y-3">
                          <div>
                            <p className="text-sm font-semibold text-foreground mb-2">Your rating</p>
                            <div className="flex items-center gap-1.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button key={star} onClick={() => setReviewRating(star)} className="p-1">
                                  <Star className={`w-5 h-5 ${star <= reviewRating ? 'fill-primary text-primary' : 'text-border'}`} />
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-semibold text-foreground mb-2 block">Comment (optional)</label>
                            <textarea
                              value={reviewComment}
                              onChange={(e) => setReviewComment(e.target.value)}
                              rows={3}
                              className="w-full px-3 py-2.5 rounded-xl border border-[#EBEBEB] bg-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                              placeholder={`Tell us about your experience with ${reviewTargetUser?.name ?? 'this transaction'}`}
                            />
                          </div>
                          <button
                            onClick={handleSubmitReview}
                            disabled={reviewSubmitting}
                            className="w-full py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {reviewSubmitting ? 'Saving…' : `Leave Review for ${isBuyerReview ? 'Seller' : 'Buyer'}`}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setReviewOpen(true)}
                          className="mt-3 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-white px-3 py-1.5 text-sm font-semibold text-primary hover:bg-accent transition-colors"
                        >
                          <Star className="w-4 h-4 fill-current" />
                          {isBuyerReview ? 'Leave Review for Seller' : 'Leave Review for Buyer'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Input */}
            <div className="bg-white border-t border-[#EBEBEB] px-4 py-3 flex-shrink-0">
              {/* Offer panel */}
              {showOffer && (
                <div className="mb-3 p-4 bg-green-50 border border-green-200 rounded-2xl">
                  <p className="text-xs font-bold text-green-800 mb-2 flex items-center gap-1.5"><Tag className="w-3.5 h-3.5" /> Make an Offer</p>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-foreground">$</span>
                      <input type="number" value={offerPrice} onChange={(e) => setOfferPrice(e.target.value)} placeholder="Enter amount"
                        className="w-full pl-7 pr-3 py-2.5 rounded-xl border border-green-300 bg-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-green-400" />
                    </div>
                    <button onClick={handleSendOffer} disabled={!offerPrice} className="px-4 py-2.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors text-sm disabled:opacity-40">Send</button>
                    <button onClick={() => setShowOffer(false)} className="px-3 py-2.5 border border-green-200 text-green-700 rounded-xl hover:bg-green-100 transition-colors text-xs font-medium">Cancel</button>
                  </div>
                </div>
              )}
              <div className="flex items-end gap-2">
                <button onClick={() => setShowOffer(!showOffer)} title="Make an offer"
                  className={`p-2.5 rounded-xl border transition-all flex-shrink-0 ${showOffer ? 'bg-green-600 border-green-600 text-white' : 'border-[#EBEBEB] text-muted-foreground hover:border-green-400 hover:text-green-600'}`}>
                  <Tag className="w-5 h-5" />
                </button>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder="Type a message..."
                  rows={1}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-[#EBEBEB] bg-[#F9F9F9] focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary text-sm resize-none font-medium"
                  style={{ maxHeight: '120px' }}
                />
                <button onClick={handleSend} disabled={!input.trim()}
                  className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center hover:bg-orange-600 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 shadow-md shadow-primary/20">
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1.5 text-center">Enter to send · Shift+Enter for new line</p>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="font-bold text-foreground mb-2">Select a conversation</h3>
              <p className="text-sm text-muted-foreground">Choose from your existing conversations or contact a seller to get started.</p>
              <button onClick={() => navigate('browse')} className="mt-5 px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-orange-600 transition-colors">
                Browse Listings
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
