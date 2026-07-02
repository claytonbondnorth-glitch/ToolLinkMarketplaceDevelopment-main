import { Heart, MapPin, Eye, Star, ArrowRight, CheckCircle } from 'lucide-react';
import { useApp, AppListing } from '../context/AppContext';
import UserAvatar from './UserAvatar';
import { getVerificationBadgeLabel } from '../lib/verification';

interface ListingCardProps {
  listing: AppListing;
  compact?: boolean;
}

const conditionColors: Record<string, string> = {
  'New': 'bg-green-500 text-white',
  'Used - Like New': 'bg-blue-500 text-white',
  'Used - Good': 'bg-amber-500 text-white',
  'Used - Fair': 'bg-orange-500 text-white',
  'For Parts': 'bg-red-500 text-white',
};

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return `${Math.floor(diff / 2592000)}mo ago`;
}

export default function ListingCard({ listing, compact = false }: ListingCardProps) {
  const { navigate, toggleSave, savedIds, users } = useApp();
  const isSaved = savedIds.has(listing.id);
  const seller = users.find((u) => u.id === listing.sellerId);
  const verificationBadgeLabel = seller ? getVerificationBadgeLabel(seller) : null;

  return (
    <article
      className="group bg-white rounded-2xl border border-[#EBEBEB] hover:border-primary/20 hover:shadow-2xl hover:shadow-black/8 hover:-translate-y-1.5 transition-all duration-300 cursor-pointer overflow-hidden"
      onClick={() => navigate('listing', { listingId: listing.id })}
    >
      {/* Image */}
      <div className="relative aspect-[16/11] bg-[#F5F5F5] overflow-hidden">
        <img
          src={listing.images[0]}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Featured badge */}
        {listing.featured && (
          <div className="absolute top-3 left-3 bg-primary text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md tracking-wide uppercase">
            Featured
          </div>
        )}

        {/* Condition badge */}
        <div className={`absolute top-3 ${listing.featured ? 'left-[88px]' : 'left-3'} text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md ${conditionColors[listing.condition] ?? 'bg-gray-600 text-white'}`}>
          {listing.condition}
        </div>

        {/* Save button */}
        <button
          onClick={(e) => { e.stopPropagation(); toggleSave(listing.id); }}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 ${
            isSaved
              ? 'bg-primary text-white scale-110'
              : 'bg-white/95 text-gray-500 hover:text-primary hover:scale-110'
          }`}
          title={isSaved ? 'Remove from saved' : 'Save listing'}
        >
          <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
        </button>

        {/* Multiple images count */}
        {listing.images.length > 1 && (
          <div className="absolute bottom-3 left-3 bg-black/60 text-white text-[11px] font-medium px-2.5 py-1 rounded-full backdrop-blur-sm">
            {listing.images.length} photos
          </div>
        )}

        {/* View listing button — revealed on hover */}
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-center pb-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <span className="flex items-center gap-1.5 bg-white text-[#111111] text-xs font-bold px-4 py-2 rounded-full shadow-xl">
            View Listing <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pb-5">
        {/* Price row */}
        <div className="flex items-center justify-between mb-2">
          <p className="text-xl font-extrabold text-primary tracking-tight">
            ${listing.price.toLocaleString()}
            <span className="text-xs font-normal text-muted-foreground ml-1">AUD</span>
          </p>
          <span className="text-xs bg-[#F5F5F5] text-muted-foreground px-2.5 py-1 rounded-full font-medium">
            {listing.brand}
          </span>
        </div>

        {/* Title */}
        <h3 className={`font-semibold text-[#111111] leading-snug mb-3 ${compact ? 'text-sm line-clamp-1' : 'text-sm line-clamp-2'}`}>
          {listing.title}
        </h3>

        {/* Location + meta */}
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            {listing.location}
          </span>
          <div className="flex items-center gap-2.5">
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />{listing.views}
            </span>
            <span>{timeAgo(listing.dateListed)}</span>
          </div>
        </div>

        {/* Seller row */}
        {!compact && seller && (
          <div
            className="flex items-center gap-2 pt-3 border-t border-[#F0F0F0]"
            onClick={(e) => { e.stopPropagation(); navigate('seller', { userId: seller.id }); }}
          >
            <UserAvatar src={seller.avatar || undefined} name={seller.name} alt={seller.name} className="w-6 h-6 rounded-full object-cover flex-shrink-0 ring-1 ring-border" />
            <span className="text-xs text-muted-foreground hover:text-primary transition-colors flex-1 truncate">{seller.name}</span>
            {verificationBadgeLabel && (
              <span className="flex items-center gap-1 text-[11px] text-primary font-semibold flex-shrink-0">
                <CheckCircle className="w-3 h-3 fill-primary text-white" />
                {verificationBadgeLabel}
              </span>
            )}
            {seller.rating > 0 && (
              <span className="flex items-center gap-0.5 text-[11px] text-muted-foreground flex-shrink-0">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                {seller.rating}
              </span>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
