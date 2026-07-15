import { useCallback, useEffect, useRef, useState } from 'react';
import { Camera, Edit2, Save, MapPin, Star, Package, Heart, Settings, X, CheckCircle, Loader2, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '../context/AppContext';
import ListingCard from '../components/ListingCard';
import { supabase } from '../../lib/supabase';
import UserAvatar from '../components/UserAvatar';
import { getVerificationBadgeLabel } from '../lib/verification';
import { CATEGORIES, BRANDS } from '../data/mockData';
import type { AppListing } from '../context/AppContext';
import type { Condition } from '../data/mockData';

type Tab = 'listings' | 'saved' | 'settings';

const STATES = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'NT', 'ACT'];
const LISTING_CONDITIONS: Condition[] = ['New', 'Used - Like New', 'Used - Good', 'Used - Fair', 'For Parts'];

type VerificationApplicationStatus = 'pending' | 'approved' | 'rejected' | null;
type VerificationApplicationType = 'tradie' | 'business';

export default function ProfilePage() {
  const { currentUser, updateProfile, listings, savedIds, navigate, openAuth, logout, refreshUserProfiles, updateListing, deleteListing } = useApp();
  const [tab, setTab] = useState<Tab>('listings');
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [profileStats, setProfileStats] = useState({ reviewCount: 0, averageRating: 0 });
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [submittingVerification, setSubmittingVerification] = useState(false);
  const [showVerificationSuccessScreen, setShowVerificationSuccessScreen] = useState(false);
  const [showVerificationForm, setShowVerificationForm] = useState(false);
  const [latestVerificationStatus, setLatestVerificationStatus] = useState<VerificationApplicationStatus>(null);
  const [editingListing, setEditingListing] = useState<AppListing | null>(null);
  const [savingListingEdit, setSavingListingEdit] = useState(false);
  const [verificationForm, setVerificationForm] = useState({
    verificationType: 'tradie' as VerificationApplicationType,
    fullName: currentUser?.name ?? '',
    businessName: '',
    trade: '',
    abn: '',
    licenceNumber: '',
    state: currentUser?.state ?? 'NSW',
    website: '',
    notes: '',
  });
  const [verificationDocument, setVerificationDocument] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const verificationStatusCardRef = useRef<HTMLDivElement | null>(null);

  const [editForm, setEditForm] = useState({
    name: currentUser?.name ?? '',
    bio: currentUser?.bio ?? '',
    location: currentUser?.location?.split(',')[0]?.trim() ?? '',
    state: currentUser?.state ?? 'NSW',
    phone: currentUser?.phone ?? '',
  });
  const [listingEditForm, setListingEditForm] = useState({
    title: '',
    description: '',
    categoryId: '',
    brand: '',
    condition: '' as Condition | '',
    price: '',
    location: '',
    state: 'NSW',
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
  const verificationBadgeLabel = getVerificationBadgeLabel(currentUser);

  const verificationStatusDisplay = verificationBadgeLabel === 'Verified Tradie'
    ? '🟢 Verified Tradie'
    : verificationBadgeLabel === 'Verified Business'
      ? '🟢 Verified Business'
      : '⚪ Not Verified';
  const isVerifiedMember = Boolean(verificationBadgeLabel);
  const isVerificationPending = latestVerificationStatus === 'pending' || showVerificationSuccessScreen;

  const loadLatestVerificationApplication = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('verification_applications')
      .select('status')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      setLatestVerificationStatus(null);
      return;
    }

    setLatestVerificationStatus((data?.status as VerificationApplicationStatus) ?? null);
  }, []);

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

  useEffect(() => {
    if (!currentUser?.id) return;

    void loadLatestVerificationApplication(currentUser.id);

    const channel = supabase.channel(`verification-status-${currentUser.id}`);
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'verification_applications',
        filter: `user_id=eq.${currentUser.id}`,
      },
      () => {
        void loadLatestVerificationApplication(currentUser.id);
      }
    );

    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${currentUser.id}`,
      },
      () => {
        void refreshUserProfiles([currentUser.id]);
      }
    );

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser?.id, loadLatestVerificationApplication, refreshUserProfiles]);

  useEffect(() => {
    if (verificationBadgeLabel || latestVerificationStatus === 'pending') {
      setShowVerificationForm(false);
    }
  }, [verificationBadgeLabel, latestVerificationStatus]);

  const setEdit = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setEditForm((prev) => ({ ...prev, [field]: e.target.value }));

  const setListingEdit = (field: keyof typeof listingEditForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setListingEditForm((prev) => ({ ...prev, [field]: e.target.value }));

  const openListingEditor = (listing: AppListing) => {
    const [locationPart = listing.location, statePart = listing.state || 'NSW'] = listing.location.includes(',')
      ? listing.location.split(',').map((value) => value.trim())
      : [listing.location, listing.state || 'NSW'];

    setEditingListing(listing);
    setListingEditForm({
      title: listing.title,
      description: listing.description,
      categoryId: listing.categoryId,
      brand: listing.brand,
      condition: (LISTING_CONDITIONS.includes(listing.condition as Condition) ? listing.condition : 'Used - Good') as Condition,
      price: String(listing.price),
      location: locationPart,
      state: statePart || 'NSW',
    });
  };

  const closeListingEditor = () => {
    setEditingListing(null);
    setSavingListingEdit(false);
  };

  const handleSaveListingEdit = async () => {
    if (!editingListing || !currentUser || editingListing.sellerId !== currentUser.id) return;

    if (!listingEditForm.title.trim() || !listingEditForm.description.trim() || !listingEditForm.categoryId || !listingEditForm.brand || !listingEditForm.condition || !listingEditForm.location.trim() || !listingEditForm.state || Number(listingEditForm.price) <= 0) {
      toast.error('Please complete all required listing fields before saving.');
      return;
    }

    setSavingListingEdit(true);
    try {
      await updateListing(editingListing.id, {
        title: listingEditForm.title.trim(),
        description: listingEditForm.description.trim(),
        categoryId: listingEditForm.categoryId,
        brand: listingEditForm.brand,
        condition: listingEditForm.condition,
        price: Number(listingEditForm.price),
        location: listingEditForm.location.trim(),
        state: listingEditForm.state,
      });
      toast.success('Listing updated successfully.');
      closeListingEditor();
    } catch (error: any) {
      toast.error(error?.message || 'Unable to update your listing right now.');
      setSavingListingEdit(false);
    }
  };

  const handleDeleteListing = async (listing: AppListing) => {
    if (!currentUser || listing.sellerId !== currentUser.id) return;

    const confirmed = window.confirm(`Delete "${listing.title}"? This action cannot be undone.`);
    if (!confirmed) return;

    try {
      await deleteListing(listing.id);
      toast.success('Listing deleted successfully.');
      if (editingListing?.id === listing.id) closeListingEditor();
    } catch (error: any) {
      toast.error(error?.message || 'Unable to delete your listing right now.');
    }
  };

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

  const setVerificationField = (field: keyof typeof verificationForm) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setVerificationForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleVerificationDocumentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setVerificationDocument(file);
  };

  const handleSubmitVerification = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!currentUser?.id) {
      openAuth('login');
      return;
    }

    if (!verificationDocument) {
      toast.error('Please upload a supporting document or photo.');
      return;
    }

    setSubmittingVerification(true);
    setShowVerificationSuccessScreen(false);

    try {
      const ext = verificationDocument.name.split('.').pop() ?? 'jpg';
      const baseName = verificationDocument.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[^a-zA-Z0-9._-]/g, '_');
      const filePath = `${currentUser.id}/${Date.now()}-${baseName}.${ext}`;

      const { error: uploadError } = await supabase.storage.from('verification-documents').upload(filePath, verificationDocument, {
        cacheControl: '3600',
        upsert: true,
      });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from('verification-documents').getPublicUrl(filePath);

      const { error: insertError } = await supabase.from('verification_applications').insert({
        user_id: currentUser.id,
        verification_type: verificationForm.verificationType,
        full_name: verificationForm.fullName,
        business_name: verificationForm.businessName,
        trade: verificationForm.trade,
        abn: verificationForm.abn,
        licence_number: verificationForm.licenceNumber,
        state: verificationForm.state,
        website: verificationForm.website || null,
        notes: verificationForm.notes,
        document_url: publicUrlData.publicUrl,
        status: 'pending',
      });

      if (insertError) throw insertError;

      setLatestVerificationStatus('pending');
      setShowVerificationSuccessScreen(true);
      setShowVerificationForm(false);
      setVerificationDocument(null);
      setVerificationForm((prev) => ({ ...prev, website: '', notes: '' }));
    } catch (error: any) {
      toast.error(error?.message || 'Unable to submit verification right now.');
    } finally {
      setSubmittingVerification(false);
    }
  };

  const handleApplyForVerificationFromProfile = () => {
    setTab('settings');
    setShowVerificationForm(true);
    setTimeout(() => {
      verificationStatusCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 0);
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
                    {verificationBadgeLabel && (
                      <span className="flex items-center gap-1 text-xs text-primary font-medium">
                        <CheckCircle className="w-3.5 h-3.5" /> {verificationBadgeLabel}
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
          <div className="flex gap-4 sm:gap-6 border-b border-white/10 justify-around sm:justify-start">
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

          <div className="mt-4 mb-2 bg-white/10 border border-white/15 rounded-xl p-4">
            {isVerifiedMember ? (
              <div>
                <p className="text-sm font-semibold text-green-300">Verified Member</p>
                <p className="text-sm text-gray-300 mt-1">Your account has been verified.</p>
              </div>
            ) : isVerificationPending ? (
              <div>
                <p className="text-sm font-semibold text-amber-300">Verification Pending</p>
                <p className="text-sm text-gray-300 mt-1">We&apos;re reviewing your application.</p>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">Become a Verified Tradie or Business</p>
                  <p className="text-sm text-gray-300 mt-1">Verify your trade or business to build trust with buyers and sellers. Verified members receive a badge on their profile and listings.</p>
                </div>
                <button
                  type="button"
                  onClick={handleApplyForVerificationFromProfile}
                  className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-orange-600 transition-colors w-full sm:w-auto"
                >
                  Apply for Verification
                </button>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-0 overflow-x-auto">
            {(['listings', 'saved', 'settings'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors capitalize whitespace-nowrap ${tab === t ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-white'}`}
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
                {myListings.map((l) => (
                  <div key={l.id} className="space-y-2">
                    <ListingCard listing={l} />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openListingEditor(l)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-white px-3 py-2 text-xs font-semibold text-foreground hover:border-primary hover:text-primary transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Edit Listing
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteListing(l)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-destructive/30 bg-white px-3 py-2 text-xs font-semibold text-destructive hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete Listing
                      </button>
                    </div>
                  </div>
                ))}
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
                  <span className="font-medium">{currentUser.isAdmin ? 'Administrator' : verificationBadgeLabel ?? 'Standard'}</span>
                </div>
              </div>
            </div>

            <div ref={verificationStatusCardRef} className="bg-white rounded-xl border border-border p-6">
              <h3 className="font-bold text-foreground mb-2">Verification Status</h3>
              <p className="text-sm font-semibold text-foreground">{verificationStatusDisplay}</p>
            </div>

            <div className="bg-white rounded-xl border border-border p-6">
              <h3 className="font-bold text-foreground mb-1">Become Verified</h3>
              <p className="text-sm text-muted-foreground mb-4">Build trust and improve confidence on your profile and listings.</p>

              {verificationBadgeLabel ? (
                <div className="rounded-xl border border-green-200 bg-green-50 p-5">
                  <p className="text-sm font-semibold text-green-900 mb-1">{verificationStatusDisplay}</p>
                  <p className="text-sm text-green-800">Your account has been successfully verified.</p>
                </div>
              ) : latestVerificationStatus === 'pending' || showVerificationSuccessScreen ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
                  <h4 className="text-base font-bold text-amber-900 mb-1">Verification Pending</h4>
                  <p className="text-sm text-amber-800">We&apos;re currently reviewing your application. We&apos;ll notify you once it&apos;s been approved.</p>
                </div>
              ) : (
                <>
                  <div className="rounded-xl border border-border bg-muted/40 p-5 mb-4">
                    <h4 className="text-base font-bold text-foreground mb-2">Become a Verified Member</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Build trust with buyers and sellers by verifying your trade or business. Verified members receive a verification badge on their profile and listings, helping increase confidence and improve marketplace credibility.
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowVerificationForm((prev) => !prev)}
                      className="mt-4 px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-orange-600 transition-colors"
                    >
                      Apply for Verification
                    </button>
                  </div>

                  {showVerificationForm && (
                <form onSubmit={handleSubmitVerification} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">Verification type</label>
                    <select
                      value={verificationForm.verificationType}
                      onChange={setVerificationField('verificationType')}
                      className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      <option value="tradie">Verified Tradie</option>
                      <option value="business">Verified Business</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">Full name</label>
                    <input required value={verificationForm.fullName} onChange={setVerificationField('fullName')} className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">Business name</label>
                    <input value={verificationForm.businessName} onChange={setVerificationField('businessName')} className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">Trade/category</label>
                    <input required value={verificationForm.trade} onChange={setVerificationField('trade')} className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">ABN</label>
                    <input required value={verificationForm.abn} onChange={setVerificationField('abn')} className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">Licence number</label>
                    <input required value={verificationForm.licenceNumber} onChange={setVerificationField('licenceNumber')} className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">State/Territory</label>
                    <select value={verificationForm.state} onChange={setVerificationField('state')} className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                      {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">Website (optional)</label>
                    <input value={verificationForm.website} onChange={setVerificationField('website')} placeholder="https://" className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">Notes/message</label>
                    <textarea value={verificationForm.notes} onChange={setVerificationField('notes')} rows={3} className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">Upload supporting document/photo</label>
                    <input required type="file" accept="image/*,application/pdf" onChange={handleVerificationDocumentChange} className="w-full text-sm" />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingVerification}
                    className="w-full py-3 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-70"
                  >
                    {submittingVerification ? 'Submitting...' : 'Submit Verification'}
                  </button>
                </form>
                  )}
                </>
              )}
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

        {editingListing && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeListingEditor} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-bold text-foreground">Edit Listing</h3>
                  <p className="text-sm text-muted-foreground">Update your listing details.</p>
                </div>
                <button type="button" onClick={closeListingEditor} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">Title</label>
                  <input value={listingEditForm.title} onChange={setListingEdit('title')} className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">Description</label>
                  <textarea value={listingEditForm.description} onChange={setListingEdit('description')} rows={4} className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">Category</label>
                    <select value={listingEditForm.categoryId} onChange={setListingEdit('categoryId')} className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                      <option value="">Select a category</option>
                      {CATEGORIES.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">Brand</label>
                    <select value={listingEditForm.brand} onChange={setListingEdit('brand')} className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                      <option value="">Select a brand</option>
                      {BRANDS.map((brand) => <option key={brand} value={brand}>{brand}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">Condition</label>
                    <select value={listingEditForm.condition} onChange={setListingEdit('condition')} className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                      <option value="">Select condition</option>
                      {LISTING_CONDITIONS.map((condition) => <option key={condition} value={condition}>{condition}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">Price (AUD)</label>
                    <input type="number" min="1" value={listingEditForm.price} onChange={setListingEdit('price')} className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">Suburb / City</label>
                    <input value={listingEditForm.location} onChange={setListingEdit('location')} className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">State</label>
                    <select value={listingEditForm.state} onChange={setListingEdit('state')} className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                      {STATES.map((state) => <option key={state} value={state}>{state}</option>)}
                    </select>
                  </div>
                </div>

                {editingListing.images.length > 0 && (
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-2">Photos</label>
                    <div className="grid grid-cols-4 gap-2">
                      {editingListing.images.slice(0, 4).map((imageUrl, index) => (
                        <img key={index} src={imageUrl} alt="" className="h-16 w-full rounded-lg object-cover" />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button type="button" onClick={closeListingEditor} className="flex-1 py-3 border-2 border-[#EBEBEB] text-foreground font-semibold rounded-xl hover:border-primary transition-colors">Cancel</button>
                <button type="button" onClick={handleSaveListingEdit} disabled={savingListingEdit} className="flex-1 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed">{savingListingEdit ? 'Saving...' : 'Save Listing'}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
