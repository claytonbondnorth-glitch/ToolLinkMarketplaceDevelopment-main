import { useCallback, useEffect, useState } from 'react';
import { Users, Package, Flag, Tag, BarChart2, TrendingUp, Eye, Trash2, CheckCircle, XCircle, AlertTriangle, ShieldAlert, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '../context/AppContext';
import { CATEGORIES } from '../data/mockData';
import { supabase } from '../../lib/supabase';
import { getVerificationBadgeLabel } from '../lib/verification';

type AdminTab = 'analytics' | 'users' | 'listings' | 'reported' | 'verification' | 'categories';

type VerificationReviewStatus = 'pending' | 'approved' | 'rejected';
type ListingStatusFilter = 'all' | 'active' | 'sold';
type VerificationStatusFilter = 'pending' | 'approved' | 'rejected' | 'all';

interface VerificationApplication {
  id: string;
  userId: string;
  verificationType: 'tradie' | 'business';
  fullName: string;
  businessName: string;
  trade: string;
  abn: string;
  licenceNumber: string;
  state: string;
  website: string;
  notes: string;
  documentUrl: string;
  status: VerificationReviewStatus;
  createdAt: string;
  reviewedAt: string | null;
}

interface DashboardStats {
  totalUsers: number;
  activeListings: number;
  soldListings: number;
  pendingVerificationApplications: number;
  approvedVerificationApplications: number;
  rejectedVerificationApplications: number;
  verifiedTradies: number;
  verifiedBusinesses: number;
}

const EMPTY_DASHBOARD_STATS: DashboardStats = {
  totalUsers: 0,
  activeListings: 0,
  soldListings: 0,
  pendingVerificationApplications: 0,
  approvedVerificationApplications: 0,
  rejectedVerificationApplications: 0,
  verifiedTradies: 0,
  verifiedBusinesses: 0,
};

export default function AdminDashboard() {
  const { currentUser, users, listings, updateListingStatus, deleteListingAdmin, deleteUserAdmin, navigate, refreshUserProfiles } = useApp();
  const [tab, setTab] = useState<AdminTab>('analytics');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [verificationApplications, setVerificationApplications] = useState<VerificationApplication[]>([]);
  const [loadingVerificationApplications, setLoadingVerificationApplications] = useState(false);
  const [reviewingApplicationId, setReviewingApplicationId] = useState<string | null>(null);
  const [listingStatusFilter, setListingStatusFilter] = useState<ListingStatusFilter>('all');
  const [verificationStatusFilter, setVerificationStatusFilter] = useState<VerificationStatusFilter>('pending');
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>(EMPTY_DASHBOARD_STATS);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [statsLastUpdatedAt, setStatsLastUpdatedAt] = useState<Date | null>(null);

  if (!currentUser?.isAdmin) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-border p-10 text-center max-w-md">
          <ShieldAlert className="w-14 h-14 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">Access Denied</h2>
          <p className="text-sm text-muted-foreground mb-6">You need administrator privileges to view this page.</p>
          <button onClick={() => navigate('home')} className="px-6 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors text-sm">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const activeListings = listings.filter((l) => l.status === 'active');
  const soldListings = listings.filter((l) => l.status === 'sold');

  const categoryListingCounts = listings.reduce<Record<string, number>>((acc, listing) => {
    const key = listing.categoryId || listing.category;
    if (!key) return acc;
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  const loadDashboardStats = useCallback(async () => {
    setStatsLoading(true);
    const queryErrors: string[] = [];

    const readCount = async (
      key: keyof DashboardStats,
      queryBuilder: () => any
    ): Promise<[keyof DashboardStats, number]> => {
      try {
        const { count, error } = await queryBuilder();
        if (error) {
          queryErrors.push(error.message);
          return [key, 0];
        }
        return [key, count ?? 0];
      } catch (error: any) {
        queryErrors.push(error?.message || `Failed to load ${key}`);
        return [key, 0];
      }
    };

    const results = await Promise.all([
      readCount('totalUsers', () => supabase.from('profiles').select('*', { count: 'exact', head: true })),
      readCount('activeListings', () => supabase.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'active')),
      readCount('soldListings', () => supabase.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'sold')),
      readCount('pendingVerificationApplications', () => supabase.from('verification_applications').select('*', { count: 'exact', head: true }).eq('status', 'pending')),
      readCount('approvedVerificationApplications', () => supabase.from('verification_applications').select('*', { count: 'exact', head: true }).eq('status', 'approved')),
      readCount('rejectedVerificationApplications', () => supabase.from('verification_applications').select('*', { count: 'exact', head: true }).eq('status', 'rejected')),
      readCount('verifiedTradies', () => supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('verified', true).eq('verification_type', 'tradie')),
      readCount('verifiedBusinesses', () => supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('verified', true).eq('verification_type', 'business')),
    ]);

    const nextStats = { ...EMPTY_DASHBOARD_STATS };
    results.forEach(([key, value]) => {
      nextStats[key] = value;
    });

    setDashboardStats(nextStats);
    setStatsLastUpdatedAt(new Date());

    if (queryErrors.length > 0) {
      const uniqueErrors = Array.from(new Set(queryErrors));
      const firstError = uniqueErrors[0];
      setStatsError(firstError);
      toast.error(firstError);
    } else {
      setStatsError(null);
    }

    setStatsLoading(false);
  }, []);

  useEffect(() => {
    void loadDashboardStats();
  }, [loadDashboardStats]);

  const loadVerificationApplications = useCallback(async (statusFilter: VerificationStatusFilter) => {
    setLoadingVerificationApplications(true);
    let query = supabase
      .from('verification_applications')
      .select('*')
      .order('created_at', { ascending: true });

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    const { data, error } = await query;

    if (error) {
      toast.error('Unable to load verification applications.');
      setVerificationApplications([]);
      setLoadingVerificationApplications(false);
      return;
    }

    const mappedApplications: VerificationApplication[] = (data ?? []).map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      verificationType: row.verification_type,
      fullName: row.full_name,
      businessName: row.business_name ?? '',
      trade: row.trade ?? '',
      abn: row.abn ?? '',
      licenceNumber: row.licence_number ?? '',
      state: row.state ?? '',
      website: row.website ?? '',
      notes: row.notes ?? '',
      documentUrl: row.document_url ?? '',
      status: row.status,
      createdAt: row.created_at,
      reviewedAt: row.reviewed_at ?? null,
    }));

    setVerificationApplications(mappedApplications);
    setLoadingVerificationApplications(false);
  }, []);

  useEffect(() => {
    if (tab !== 'verification') return;
    void loadVerificationApplications(verificationStatusFilter);
  }, [tab, verificationStatusFilter, loadVerificationApplications]);

  const reviewVerificationApplication = async (application: VerificationApplication, status: Exclude<VerificationReviewStatus, 'pending'>) => {
    setReviewingApplicationId(application.id);
    try {
      const nowIso = new Date().toISOString();
      const { error: updateApplicationError } = await supabase
        .from('verification_applications')
        .update({ status, reviewed_at: nowIso })
        .eq('id', application.id);

      if (updateApplicationError) throw updateApplicationError;

      if (status === 'approved') {
        const profileUpdates = application.verificationType === 'tradie'
          ? { verified: true, verified_member: true, verification_type: 'tradie' }
          : { verified: true, verified_member: true, verification_type: 'business' };

        const { error: updateProfileError } = await supabase
          .from('profiles')
          .update(profileUpdates)
          .eq('id', application.userId);

        if (updateProfileError) throw updateProfileError;

        const verifiedBadgeLabel = application.verificationType === 'tradie' ? 'Verified Tradie' : 'Verified Business';
        const approvalMessage = `🎉 Congratulations! Your ToolLink verification has been approved. Your profile now displays your verified badge. You are now marked as ${verifiedBadgeLabel}.`;

        const { data: existingConversation, error: existingConversationError } = await supabase
          .from('conversations')
          .select('id')
          .eq('buyer_id', application.userId)
          .eq('seller_id', currentUser.id)
          .is('listing_id', null)
          .order('created_at', { ascending: false })
          .limit(1);

        if (existingConversationError) {
          throw existingConversationError;
        }

        let conversationId = existingConversation?.[0]?.id;

        if (!conversationId) {
          const { data: insertedConversation, error: insertConversationError } = await supabase
            .from('conversations')
            .insert({
              listing_id: null,
              buyer_id: application.userId,
              seller_id: currentUser.id,
            })
            .select('id')
            .single();

          if (insertConversationError || !insertedConversation) {
            throw insertConversationError ?? new Error('Unable to create ToolLink approval conversation.');
          }

          conversationId = insertedConversation.id;
        }

        const { error: insertMessageError } = await supabase
          .from('messages')
          .insert({
            conversation_id: conversationId,
            sender_id: currentUser.id,
            text: approvalMessage,
          });

        if (insertMessageError) {
          throw insertMessageError;
        }
      }

      setVerificationApplications((prev) => prev.filter((item) => item.id !== application.id));
      await refreshUserProfiles([application.userId]);
      await loadVerificationApplications(verificationStatusFilter);
      await loadDashboardStats();
      toast.success(`Application ${status}.`);
    } catch (error: any) {
      toast.error(error?.message || 'Unable to update this verification application.');
    } finally {
      setReviewingApplicationId(null);
    }
  };

  const statCards = [
    {
      label: 'Total Users',
      value: users.length.toLocaleString(),
      sub: 'Live from profiles table',
      icon: Users,
      color: 'bg-blue-500',
      onClick: () => setTab('users' as AdminTab),
    },
    {
      label: 'Active Listings',
      value: activeListings.length.toLocaleString(),
      sub: 'status = active',
      icon: Package,
      color: 'bg-green-500',
      onClick: () => {
        setListingStatusFilter('active');
        setTab('listings');
      },
    },
    {
      label: 'Sold Listings',
      value: soldListings.length.toLocaleString(),
      sub: 'status = sold',
      icon: TrendingUp,
      color: 'bg-primary',
      onClick: () => {
        setListingStatusFilter('sold');
        setTab('listings');
      },
    },
    {
      label: 'Pending Verification',
      value: dashboardStats.pendingVerificationApplications.toLocaleString(),
      sub: 'Awaiting review',
      icon: Flag,
      color: 'bg-destructive',
      onClick: () => {
        setVerificationStatusFilter('pending');
        setTab('verification');
      },
    },
  ];

  const filteredListings = listingStatusFilter === 'all'
    ? listings
    : listings.filter((listing) => listing.status === listingStatusFilter);

  const listingStatusFilterLabel = listingStatusFilter === 'all'
    ? 'All statuses'
    : `Status: ${listingStatusFilter}`;

  const verificationStatusFilterLabel = verificationStatusFilter === 'all'
    ? 'All applications'
    : `Status: ${verificationStatusFilter}`;

  const tabs: { id: AdminTab; label: string; icon: React.ElementType; count?: number }[] = [
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'users', label: 'Users', icon: Users, count: users.length },
    { id: 'listings', label: 'Listings', icon: Package, count: listings.length },
    { id: 'reported', label: 'Reported', icon: Flag, count: 0 },
    { id: 'verification', label: 'Verification', icon: CheckCircle, count: dashboardStats.pendingVerificationApplications },
    { id: 'categories', label: 'Categories', icon: Tag },
  ];

  return (
    <div className="min-h-screen bg-muted">
      {/* Header */}
      <div className="bg-[#111111] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-gray-400 mt-0.5">ToolLink Platform Management</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400 bg-white/10 px-3 py-2 rounded-xl">
              <RefreshCw className="w-3.5 h-3.5" />
              Last updated: {statsLastUpdatedAt ? statsLastUpdatedAt.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' }) : 'loading...'}
            </div>
            <button
              onClick={() => void loadDashboardStats()}
              disabled={statsLoading}
              className="flex items-center gap-2 text-xs text-gray-200 bg-white/10 px-3 py-2 rounded-xl hover:bg-white/20 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${statsLoading ? 'animate-spin' : ''}`} />
              Refresh Analytics
            </button>
            <button
              onClick={() => navigate('finance-referral-draft')}
              className="flex items-center gap-2 text-xs text-gray-200 bg-white/10 px-3 py-2 rounded-xl hover:bg-white/20 transition-colors"
            >
              Finance Referral Draft
            </button>
          </div>

          {statsError && (
            <div className="mt-4 rounded-xl border border-red-300 bg-red-500/10 px-4 py-2 text-xs text-red-200">
              {statsError}
            </div>
          )}

          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            {statCards.map(({ label, value, sub, icon: Icon, color, onClick }) => (
              <button
                key={label}
                onClick={onClick}
                className="bg-white/10 rounded-xl p-4 border border-white/10 text-left cursor-pointer hover:bg-white/15 hover:border-white/20 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-gray-400 font-medium">{label}</span>
                  <div className={`w-8 h-8 ${color} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-xs text-gray-400 mt-1">{statsLoading ? 'Loading...' : sub}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-border rounded-xl p-1 mb-6 overflow-x-auto">
          {tabs.map(({ id, label, icon: Icon, count }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${tab === id ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
            >
              <Icon className="w-4 h-4" />
              {label}
              {count !== undefined && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === id ? 'bg-white/20' : 'bg-muted text-muted-foreground'}`}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Analytics */}
        {tab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-border p-6">
              <h3 className="text-base font-bold text-foreground mb-4">Verification Overview</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { label: 'Pending Applications', value: dashboardStats.pendingVerificationApplications },
                  { label: 'Approved Applications', value: dashboardStats.approvedVerificationApplications },
                  { label: 'Rejected Applications', value: dashboardStats.rejectedVerificationApplications },
                  { label: 'Verified Tradies', value: dashboardStats.verifiedTradies },
                  { label: 'Verified Businesses', value: dashboardStats.verifiedBusinesses },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl border border-border bg-muted/40 px-4 py-3">
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{item.value.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Users */}
        {tab === 'users' && (
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-foreground">All Users ({users.length})</h3>
            </div>
            {users.length === 0 ? (
              <div className="text-center py-10 px-6">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="font-medium text-foreground">No users found</p>
                <p className="text-sm text-muted-foreground mt-1">There are no user profiles to display.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted">
                      <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">User</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Email</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Location</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Joined</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full object-cover border border-border flex-shrink-0" />
                            <div>
                              <p className="font-semibold text-foreground">{user.name}</p>
                              <p className="text-xs text-muted-foreground">{user.totalListings} listings · ★{user.rating}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-muted-foreground">{user.email}</td>
                        <td className="px-4 py-4 text-muted-foreground">{user.location}</td>
                        <td className="px-4 py-4">
                          <div className="flex flex-col gap-1">
                            {getVerificationBadgeLabel(user) && <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full w-fit"><CheckCircle className="w-3 h-3" />{getVerificationBadgeLabel(user)}</span>}
                            {user.isAdmin && <span className="inline-flex items-center gap-1 text-xs text-primary bg-accent px-2 py-0.5 rounded-full w-fit">Admin</span>}
                            {!user.verified && !user.isAdmin && <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full w-fit">Standard</span>}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-muted-foreground text-xs">{new Date(user.memberSince).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                        <td className="px-4 py-4">
                          {!user.isAdmin && user.id !== currentUser.id && (
                            <div className="flex items-center gap-2 justify-end">
                              <button
                                onClick={() => navigate('seller', { userId: user.id })}
                                className="p-1.5 text-muted-foreground hover:text-primary hover:bg-accent rounded-lg transition-colors"
                                title="View profile"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setConfirmDelete(user.id)}
                                className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete user"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Listings */}
        {tab === 'listings' && (
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between gap-3">
              <h3 className="font-bold text-foreground">Listings ({filteredListings.length})</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground">{listingStatusFilterLabel}</span>
                {listingStatusFilter !== 'all' && (
                  <button
                    onClick={() => setListingStatusFilter('all')}
                    className="text-xs text-primary hover:underline"
                  >
                    Show all
                  </button>
                )}
              </div>
            </div>
            {filteredListings.length === 0 ? (
              <div className="text-center py-10 px-6">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="font-medium text-foreground">No listings found</p>
                <p className="text-sm text-muted-foreground mt-1">No records match the selected listing status filter.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted">
                      <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Listing</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Price</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Seller</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Views</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {filteredListings.map((listing) => {
                      const seller = users.find((u) => u.id === listing.sellerId);
                      return (
                        <tr key={listing.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img src={listing.images[0]} alt={listing.title} className="w-10 h-10 rounded-xl object-cover border border-border flex-shrink-0" />
                              <div>
                                <p className="font-semibold text-foreground line-clamp-1 max-w-[200px]">{listing.title}</p>
                                <p className="text-xs text-muted-foreground">{listing.brand} · {listing.category}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 font-semibold text-primary">${listing.price.toLocaleString()}</td>
                          <td className="px-4 py-4 text-muted-foreground text-xs">{seller?.name}</td>
                          <td className="px-4 py-4">
                            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                              listing.status === 'active' ? 'bg-green-100 text-green-700' :
                              listing.status === 'sold' ? 'bg-blue-100 text-blue-700' :
                              listing.status === 'flagged' ? 'bg-red-100 text-red-700' :
                              'bg-muted text-muted-foreground'
                            }`}>
                              {listing.status}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-muted-foreground">{listing.views}</td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2 justify-end">
                              <button onClick={() => navigate('listing', { listingId: listing.id })} className="p-1.5 text-muted-foreground hover:text-primary hover:bg-accent rounded-lg transition-colors" title="View"><Eye className="w-4 h-4" /></button>
                              {listing.status !== 'active' ? (
                                <button onClick={() => updateListingStatus(listing.id, 'active')} className="p-1.5 text-muted-foreground hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Approve"><CheckCircle className="w-4 h-4" /></button>
                              ) : (
                                <button onClick={() => updateListingStatus(listing.id, 'flagged')} className="p-1.5 text-muted-foreground hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors" title="Flag"><Flag className="w-4 h-4" /></button>
                              )}
                              <button onClick={() => setConfirmDelete(listing.id)} className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-red-50 rounded-lg transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Reported */}
        {tab === 'reported' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-border p-6">
              <h3 className="font-bold text-foreground mb-5 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                Reported Listings
              </h3>
              <div className="rounded-xl border border-border bg-muted/40 px-4 py-5">
                <p className="font-medium text-foreground">Listing reports are currently handled by email.</p>
                <p className="text-sm text-muted-foreground mt-1">Reports sent through the website are directed to support@toollinkk.com. A full in-app reporting dashboard will be added later.</p>
                <a
                  href="mailto:support@toollinkk.com"
                  className="inline-flex items-center mt-4 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-orange-600 transition-colors"
                >
                  Open Support Email
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Verification */}
        {tab === 'verification' && (
          <div className="bg-white rounded-xl border border-border p-6">
            <div className="flex items-center justify-between gap-3 mb-5">
              <h3 className="font-bold text-foreground">Verification Applications ({verificationApplications.length})</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground">{verificationStatusFilterLabel}</span>
                {verificationStatusFilter !== 'pending' && (
                  <button
                    onClick={() => setVerificationStatusFilter('pending')}
                    className="text-xs text-primary hover:underline"
                  >
                    Show pending
                  </button>
                )}
              </div>
            </div>

            {loadingVerificationApplications ? (
              <p className="text-sm text-muted-foreground">Loading applications...</p>
            ) : verificationApplications.length === 0 ? (
              <div className="text-center py-10">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="font-medium text-foreground">No pending verification applications</p>
                <p className="text-sm text-muted-foreground mt-1">New submissions will appear here automatically.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {verificationApplications.map((application) => {
                  const applicant = users.find((user) => user.id === application.userId);
                  return (
                    <div key={application.id} className="rounded-xl border border-border p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold text-foreground">{application.fullName}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{application.verificationType === 'tradie' ? 'Verified Tradie' : 'Verified Business'} request</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Submitted {new Date(application.createdAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                          {applicant && <p className="text-xs text-muted-foreground mt-0.5">User: {applicant.name} ({applicant.email})</p>}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => reviewVerificationApplication(application, 'approved')}
                            disabled={reviewingApplicationId === application.id}
                            className="px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-70"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => reviewVerificationApplication(application, 'rejected')}
                            disabled={reviewingApplicationId === application.id}
                            className="px-3 py-1.5 bg-destructive text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-70"
                          >
                            Reject
                          </button>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div><span className="text-muted-foreground">Business:</span> <span className="text-foreground font-medium">{application.businessName || '-'}</span></div>
                        <div><span className="text-muted-foreground">Trade:</span> <span className="text-foreground font-medium">{application.trade}</span></div>
                        <div><span className="text-muted-foreground">ABN:</span> <span className="text-foreground font-medium">{application.abn}</span></div>
                        <div><span className="text-muted-foreground">Licence:</span> <span className="text-foreground font-medium">{application.licenceNumber}</span></div>
                        <div><span className="text-muted-foreground">State:</span> <span className="text-foreground font-medium">{application.state}</span></div>
                        <div><span className="text-muted-foreground">Website:</span> <span className="text-foreground font-medium">{application.website || '-'}</span></div>
                      </div>

                      {application.notes && (
                        <p className="text-xs text-muted-foreground mt-3">
                          <span className="font-semibold">Notes:</span> {application.notes}
                        </p>
                      )}

                      {application.documentUrl && (
                        <a href={application.documentUrl} target="_blank" rel="noreferrer" className="inline-flex mt-3 text-xs font-semibold text-primary hover:underline">
                          View supporting document
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Categories */}
        {tab === 'categories' && (
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-foreground">Manage Categories</h3>
              <button className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-orange-600 transition-colors">
                + Add Category
              </button>
            </div>
            <div className="divide-y divide-border">
              {CATEGORIES.map((cat) => (
                <div key={cat.id} className="flex items-center gap-4 px-6 py-4 hover:bg-muted/50 transition-colors">
                  <img src={cat.image} alt={cat.name} className="w-14 h-12 rounded-xl object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground">{cat.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{cat.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">{(categoryListingCounts[cat.id] ?? 0).toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">listings</p>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <button className="p-1.5 text-muted-foreground hover:text-primary hover:bg-accent rounded-lg transition-colors" title="Edit">
                      <Tag className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Delete confirm modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setConfirmDelete(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-7 h-7 text-destructive" />
            </div>
            <h3 className="font-bold text-foreground mb-2">Confirm Delete</h3>
            <p className="text-sm text-muted-foreground mb-6">This action cannot be undone. The item will be permanently removed.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 border border-border text-foreground rounded-xl hover:border-primary transition-colors text-sm font-medium">
                Cancel
              </button>
              <button
                onClick={() => {
                  const isUser = users.some((u) => u.id === confirmDelete);
                  if (isUser) deleteUserAdmin(confirmDelete);
                  else deleteListingAdmin(confirmDelete);
                  setConfirmDelete(null);
                }}
                className="flex-1 py-2.5 bg-destructive text-white rounded-xl hover:bg-red-700 transition-colors text-sm font-semibold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
