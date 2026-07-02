import { useCallback, useEffect, useRef, useState } from 'react';
import { Camera, Edit2, Save, MapPin, Star, Package, Heart, Settings, X, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '../context/AppContext';
import ListingCard from '../components/ListingCard';
import { supabase } from '../../lib/supabase';
import UserAvatar from '../components/UserAvatar';

type Tab = 'listings' | 'saved' | 'settings';

const STATES = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'NT', 'ACT'];

export default function ProfilePage() {
  const { currentUser, updateProfile, listings, savedIds, navigate, openAuth, logout } = useApp();
  const [tab, setTab] = useState<Tab>('listings');
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [profileStats, setProfileStats] = useState({ reviewCount: 0, averageRating: 0 });
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [editForm, setEditForm] = useState({
    name: currentUser?.name ?? '',
    bio: currentUser?.bio ?? '',
    location: currentUser?.location?.split(',')[0]?.trim() ?? '',
    state: currentUser?.state ?? 'NSW',
    phone: currentUser?.phone ?? '',
  });

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-border p-10 text-center max-w-md w-full">
          <h2 className="text-xl font-bold text-foreground mb-3">Sign in to view your profile</h2>
          <button onClick={() => openAuth('login')} className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors">
            Sign In
          </button>
        </div>
      </div>
    );
  }

  const myListings = listings.filter((l) => l.sellerId === currentUser.id);
  const savedListings = listings.filter((l) => savedIds.has(l.id));
  const hasReviews = profileStats.reviewCount > 0;
  const formattedRating = profileStats.averageRating.toFixed(1);

  const loadProfileStats = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('reviews')
      .select('rating')
      .eq('reviewed_user_id', userId);

    if (error) {
      console.error('Failed to load profile review stats:', error);
      setProfileStats({ reviewCount: 0, averageRating: 0 });
      return;
    }

    const ratings = (data ?? [])
      .map((row: any) => Number(row.rating))
      .filter((value) => Number.isFinite(value));

    const reviewCount = ratings.length;
    const averageRating = reviewCount > 0 ? ratings.reduce((sum, value) => sum + value, 0) / reviewCount : 0;

    setProfileStats({ reviewCount, averageRating });
  }, []);

  useEffect(() => {
    if (!currentUser?.id) return;

    loadProfileStats(currentUser.id);

    const channel = supabase.channel(`profile-stats-${currentUser.id}`);
    channel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'reviews',
        filter: `reviewed_user_id=eq.${currentUser.id}`,
      },
      () => loadProfileStats(currentUser.id)
    );

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser?.id, loadProfileStats]);

  const setEdit = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setEditForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSave = async () => {
    await updateProfile({
      name: editForm.name,
      bio: editForm.bio,
      location: `${editForm.location}, ${editForm.state}`,
      state: editForm.state,
      phone: editForm.phone,
    });
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentUser?.id) return;

    const ext = file.name.split('.').pop() ?? 'jpg';
    const filePath = `${currentUser.id}/${Date.now()}.${ext}`;

    setUploadingAvatar(true);
    try {
      const { error: uploadError } = await supabase.storage.from('profile-avatars').upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage.from('profile-avatars').getPublicUrl(filePath);
      const publicUrl = publicUrlData.publicUrl;

      await updateProfile({ avatar: publicUrl });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (error: any) {
      console.error('Avatar upload failed:', error);
      toast.error(error?.message || 'Unable to save your profile photo right now.');
    } finally {
      setUploadingAvatar(false);
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  return (
    <div className="min-h-screen bg-muted">
      {/* Profile header */}
      <div className="bg-[#111111] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5 pb-6">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <UserAvatar
                src={currentUser.avatar || undefined}
                name={currentUser.name}
                alt={currentUser.name}
                className="w-24 h-24 rounded-2xl object-cover border-4 border-white/20"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Upload profile picture"
                className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-md hover:bg-orange-600 transition-colors"
                disabled={uploadingAvatar}
              >
                {uploadingAvatar ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Camera className="w-4 h-4 text-white" />}
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-bold">{currentUser.name}</h1>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="flex items-center gap-1 text-sm text-gray-400">
                      <MapPin className="w-3.5 h-3.5" />{currentUser.location}
                    </span>
                    {hasReviews ? (
                      <span className="flex items-center gap-1 text-sm text-gray-400">
                        <Star className="w-3.5 h-3.5 fill-primary text-primary" />
                        {formattedRating} ({profileStats.reviewCount} reviews)
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">New User</span>
                    )}
                    {currentUser.verified && (
                      <span className="flex items-center gap-1 text-xs text-primary font-medium">
                        <CheckCircle className="w-3.5 h-3.5" /> Verified
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setEditing(!editing)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium transition-colors flex-shrink-0"
                >
                  {editing ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                  {editing ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>
              {currentUser.bio && <p className="text-sm text-gray-300 mt-2 max-w-lg">{currentUser.bio}</p>}
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-6 border-b border-white/10">
            <div className="py-3 text-center">
              <p className="text-lg font-bold text-primary">{myListings.length}</p>
              <p className="text-xs text-gray-400">Listings</p>
            </div>
            <div className="py-3 text-center">
              <p className="text-lg font-bold text-primary">{savedListings.length}</p>
              <p className="text-xs text-gray-400">Saved</p>
            </div>
            <div className="py-3 text-center">
              <p className="text-lg font-bold text-primary">{profileStats.reviewCount}</p>
              <p className="text-xs text-gray-400">Reviews</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-0">
            {(['listings', 'saved', 'settings'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors capitalize ${tab === t ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-white'}`}
              >
                {t === 'listings' && <Package className="w-4 h-4 inline mr-1.5" />}
                {t === 'saved' && <Heart className="w-4 h-4 inline mr-1.5" />}
                {t === 'settings' && <Settings className="w-4 h-4 inline mr-1.5" />}
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Saved toast */}
        {saved && (
          <div className="fixed top-20 right-4 z-50 bg-green-600 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm font-medium">
            <CheckCircle className="w-4 h-4" /> Profile updated
          </div>
        )}

        {/* Edit form */}
        {editing && (
          <div className="bg-white rounded-xl border border-border p-6 mb-6 space-y-4">
            <h2 className="font-bold text-foreground">Edit Profile</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Full Name</label>
                <input value={editForm.name} onChange={setEdit('name')} className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Phone (optional)</label>
                <input value={editForm.phone} onChange={setEdit('phone')} placeholder="04XX XXX XXX" className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Suburb / City</label>
                <input value={editForm.location} onChange={setEdit('location')} className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">State</label>
                <select value={editForm.state} onChange={setEdit('state')} className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                  {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Bio</label>
              <textarea value={editForm.bio} onChange={setEdit('bio')} rows={3} placeholder="Tell buyers about your trade and experience..." className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div className="flex gap-3">
              <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors text-sm">
                <Save className="w-4 h-4" /> Save Changes
              </button>
              <button onClick={() => setEditing(false)} className="px-5 py-2.5 border border-border text-foreground rounded-xl hover:border-primary transition-colors text-sm">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Listings tab */}
        {tab === 'listings' && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-foreground">My Listings ({myListings.length})</h2>
              <button onClick={() => navigate('create')} className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-orange-600 transition-colors">
                + New Listing
              </button>
            </div>
            {myListings.length === 0 ? (
              <div className="bg-white rounded-xl border border-border p-14 text-center">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-bold text-foreground mb-2">No listings yet</h3>
                <p className="text-sm text-muted-foreground mb-5">You haven&apos;t listed any tools yet. It&apos;s free and takes 2 minutes.</p>
                <button onClick={() => navigate('create')} className="px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-orange-600 transition-colors">
                  List Your First Tool
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {myListings.map((l) => <ListingCard key={l.id} listing={l} />)}
              </div>
            )}
          </div>
        )}

        {/* Saved tab */}
        {tab === 'saved' && (
          <div>
            <h2 className="text-lg font-bold text-foreground mb-5">Saved Listings ({savedListings.length})</h2>
            {savedListings.length === 0 ? (
              <div className="bg-white rounded-xl border border-border p-14 text-center">
                <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-bold text-foreground mb-2">No saved listings</h3>
                <p className="text-sm text-muted-foreground mb-5">Tap the heart icon on any listing to save it for later.</p>
                <button onClick={() => navigate('browse')} className="px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-orange-600 transition-colors">Browse Listings</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedListings.map((l) => <ListingCard key={l.id} listing={l} />)}
              </div>
            )}
          </div>
        )}

        {/* Settings tab */}
        {tab === 'settings' && (
          <div className="space-y-4 max-w-lg">
            <div className="bg-white rounded-xl border border-border p-6">
              <h3 className="font-bold text-foreground mb-4">Account Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium">{currentUser.email}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Member since</span>
                  <span className="font-medium">{new Date(currentUser.memberSince).toLocaleDateString('en-AU', { month: 'long', year: 'numeric' })}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Account type</span>
                  <span className="font-medium">{currentUser.isAdmin ? 'Administrator' : currentUser.verified ? 'Verified Tradie' : 'Standard'}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-border p-6">
              <h3 className="font-bold text-foreground mb-4">Notifications</h3>
              {[
                'New message from a buyer',
                'Someone saves your listing',
                'Price drop on saved listings',
                'ToolLink tips and promotions',
              ].map((item) => (
                <label key={item} className="flex items-center justify-between py-3 border-b border-border last:border-0 cursor-pointer">
                  <span className="text-sm text-foreground">{item}</span>
                  <input type="checkbox" defaultChecked={!item.includes('promotions')} className="w-4 h-4 accent-primary" />
                </label>
              ))}
            </div>

            <button
              onClick={logout}
              className="w-full py-3 border-2 border-destructive/30 text-destructive text-sm font-semibold rounded-xl hover:bg-red-50 transition-colors"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
