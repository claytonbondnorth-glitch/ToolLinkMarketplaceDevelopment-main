import { useState } from 'react';
import { Users, Package, Flag, Tag, BarChart2, TrendingUp, Eye, Trash2, CheckCircle, XCircle, AlertTriangle, ArrowUpRight, ShieldAlert, RefreshCw } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useApp } from '../context/AppContext';
import { ADMIN_ANALYTICS, CATEGORIES } from '../data/mockData';

type AdminTab = 'analytics' | 'users' | 'listings' | 'reported' | 'categories';

export default function AdminDashboard() {
  const { currentUser, users, listings, updateListingStatus, deleteListingAdmin, deleteUserAdmin, navigate } = useApp();
  const [tab, setTab] = useState<AdminTab>('analytics');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

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
  const flaggedListings = listings.filter((l) => l.reportCount > 0 || l.status === 'flagged');

  const statCards = [
    { label: 'Total Users', value: ADMIN_ANALYTICS.totalUsers.toLocaleString(), sub: `+${ADMIN_ANALYTICS.newUsersThisMonth} this month`, icon: Users, color: 'bg-blue-500' },
    { label: 'Active Listings', value: ADMIN_ANALYTICS.activeListings.toLocaleString(), sub: `of ${ADMIN_ANALYTICS.totalListings.toLocaleString()} total`, icon: Package, color: 'bg-green-500' },
    { label: 'Monthly GMV', value: `$${(ADMIN_ANALYTICS.gmvThisMonth / 1000).toFixed(0)}k`, sub: 'Tools traded this month', icon: TrendingUp, color: 'bg-primary' },
    { label: 'Reported', value: ADMIN_ANALYTICS.reportedListings.toString(), sub: 'Listings needing review', icon: Flag, color: 'bg-destructive' },
  ];

  const tabs: { id: AdminTab; label: string; icon: React.ElementType; count?: number }[] = [
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'users', label: 'Users', icon: Users, count: users.length },
    { id: 'listings', label: 'Listings', icon: Package, count: listings.length },
    { id: 'reported', label: 'Reported', icon: Flag, count: flaggedListings.length },
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
              Last updated: just now
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            {statCards.map(({ label, value, sub, icon: Icon, color }) => (
              <div key={label} className="bg-white/10 rounded-xl p-4 border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-gray-400 font-medium">{label}</span>
                  <div className={`w-8 h-8 ${color} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-xs text-gray-400 mt-1">{sub}</p>
              </div>
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-border p-6">
                <h3 className="text-base font-bold text-foreground mb-5">User Growth</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={ADMIN_ANALYTICS.monthlyData}>
                    <defs>
                      <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FF6A00" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#FF6A00" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6B6B6B' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#6B6B6B' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E5E5E5', fontSize: 12 }} />
                    <Area type="monotone" dataKey="users" stroke="#FF6A00" strokeWidth={2} fill="url(#userGrad)" name="Users" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-xl border border-border p-6">
                <h3 className="text-base font-bold text-foreground mb-5">Monthly Revenue (AUD)</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={ADMIN_ANALYTICS.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6B6B6B' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#6B6B6B' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E5E5E5', fontSize: 12 }} formatter={(v: number) => [`$${v.toLocaleString()}`, 'Revenue']} />
                    <Bar dataKey="revenue" fill="#FF6A00" radius={[6, 6, 0, 0]} name="Revenue" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-border p-6">
                <h3 className="text-base font-bold text-foreground mb-4">Listings by Category</h3>
                <div className="space-y-3">
                  {CATEGORIES.map((cat) => {
                    const pct = Math.round((cat.count / 8923) * 100);
                    return (
                      <div key={cat.id}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-foreground font-medium">{cat.name}</span>
                          <span className="text-muted-foreground">{cat.count.toLocaleString()} ({pct}%)</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-border p-6">
                <h3 className="text-base font-bold text-foreground mb-4">Platform Metrics</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Avg. listing price', value: '$847', change: '+12%' },
                    { label: 'Avg. days to sale', value: '4.2 days', change: '-8%' },
                    { label: 'Messages per listing', value: '3.7', change: '+5%' },
                    { label: 'Repeat buyers', value: '41%', change: '+3%' },
                    { label: 'Verified sellers', value: '68%', change: '+7%' },
                    { label: 'Mobile users', value: '73%', change: '+4%' },
                  ].map(({ label, value, change }) => (
                    <div key={label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <span className="text-sm text-muted-foreground">{label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">{value}</span>
                        <span className={`text-xs font-medium flex items-center gap-0.5 ${change.startsWith('+') ? 'text-green-600' : 'text-destructive'}`}>
                          <ArrowUpRight className="w-3 h-3" />{change}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
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
                          {user.verified && <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full w-fit"><CheckCircle className="w-3 h-3" />Verified</span>}
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
          </div>
        )}

        {/* Listings */}
        {tab === 'listings' && (
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h3 className="font-bold text-foreground">All Listings ({listings.length})</h3>
            </div>
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
                  {listings.map((listing) => {
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
          </div>
        )}

        {/* Reported */}
        {tab === 'reported' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-border p-6">
              <h3 className="font-bold text-foreground mb-5 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                Reported Listings ({flaggedListings.length})
              </h3>
              {flaggedListings.length === 0 ? (
                <div className="text-center py-10">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <p className="font-medium text-foreground">All clear — no reported listings</p>
                  <p className="text-sm text-muted-foreground mt-1">The community is well-behaved today.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {flaggedListings.map((listing) => {
                    const seller = users.find((u) => u.id === listing.sellerId);
                    return (
                      <div key={listing.id} className="flex items-start gap-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                        <img src={listing.images[0]} alt={listing.title} className="w-16 h-14 rounded-xl object-cover flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground line-clamp-1">{listing.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            By {seller?.name} · ${listing.price.toLocaleString()} · {listing.reportCount} report{listing.reportCount !== 1 ? 's' : ''}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button onClick={() => updateListingStatus(listing.id, 'active')} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 transition-colors">
                            <CheckCircle className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button onClick={() => deleteListingAdmin(listing.id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-destructive text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition-colors">
                            <XCircle className="w-3.5 h-3.5" /> Remove
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
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
                    <p className="text-lg font-bold text-primary">{cat.count.toLocaleString()}</p>
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
