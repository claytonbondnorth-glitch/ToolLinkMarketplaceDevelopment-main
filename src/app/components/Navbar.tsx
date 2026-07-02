import { useState } from 'react';
import { Search, Heart, MessageSquare, Plus, User, ChevronDown, Menu, X, Wrench, LayoutDashboard, LogOut, Settings } from 'lucide-react';
import { useApp } from '../context/AppContext';
import UserAvatar from './UserAvatar';

export default function Navbar() {
  const { currentUser, navigate, openAuth, logout, unreadCount, savedIds } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => { navigate('home'); setMobileOpen(false); }}
            className="flex items-center gap-2 flex-shrink-0 group"
          >
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-sm group-hover:bg-orange-600 transition-colors">
              <Wrench className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">
              Tool<span className="text-primary">Link</span>
            </span>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => navigate('browse')}
              className="px-4 py-2 text-sm font-medium text-foreground hover:text-primary hover:bg-accent rounded-lg transition-colors"
            >
              Browse
            </button>
            <div className="relative group">
              <button className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-foreground hover:text-primary hover:bg-accent rounded-lg transition-colors">
                Categories <ChevronDown className="w-4 h-4" />
              </button>
              <div className="absolute top-full left-0 mt-1 bg-white border border-border rounded-xl shadow-lg py-2 min-w-[200px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150">
                {['Power Tools', 'Hand Tools', 'Heavy Equipment', 'Safety Gear', 'Measuring & Layout', 'Welding', 'Storage & Transport', 'Electrical'].map((cat, i) => {
                  const ids = ['power-tools', 'hand-tools', 'heavy-equipment', 'safety-gear', 'measuring', 'welding', 'storage', 'electrical'];
                  return (
                    <button
                      key={cat}
                      onClick={() => navigate('browse', { categoryId: ids[i] })}
                      className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-primary transition-colors"
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2">
            {currentUser ? (
              <>
                {/* Saved */}
                <button
                  onClick={() => navigate('profile')}
                  className="relative p-2 text-muted-foreground hover:text-primary hover:bg-accent rounded-lg transition-colors"
                  title="Saved listings"
                >
                  <Heart className="w-5 h-5" />
                  {savedIds.size > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {savedIds.size}
                    </span>
                  )}
                </button>
                {/* Messages */}
                <button
                  onClick={() => navigate('messages')}
                  className="relative p-2 text-muted-foreground hover:text-primary hover:bg-accent rounded-lg transition-colors"
                  title="Messages"
                >
                  <MessageSquare className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
                {/* Post Listing */}
                <button
                  onClick={() => navigate('create')}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Sell Your Tools
                </button>
                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-1 rounded-lg hover:bg-muted transition-colors"
                  >
                    <UserAvatar
                      src={currentUser.avatar || undefined}
                      name={currentUser.name}
                      alt={currentUser.name}
                      className="w-8 h-8 rounded-full object-cover border-2 border-border"
                    />
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </button>
                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                      <div className="absolute right-0 top-full mt-2 bg-white border border-border rounded-xl shadow-lg py-2 min-w-[200px] z-20">
                        <div className="px-4 py-2 border-b border-border mb-1">
                          <p className="text-sm font-semibold text-foreground">{currentUser.name}</p>
                          <p className="text-xs text-muted-foreground">{currentUser.email}</p>
                        </div>
                        <button
                          onClick={() => { navigate('profile'); setUserMenuOpen(false); }}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-primary transition-colors"
                        >
                          <Settings className="w-4 h-4" /> My Profile
                        </button>
                        <button
                          onClick={() => { navigate('messages'); setUserMenuOpen(false); }}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-primary transition-colors"
                        >
                          <MessageSquare className="w-4 h-4" /> Messages
                          {unreadCount > 0 && (
                            <span className="ml-auto bg-primary text-white text-xs rounded-full px-1.5 py-0.5">{unreadCount}</span>
                          )}
                        </button>
                        {currentUser.isAdmin && (
                          <button
                            onClick={() => { navigate('admin'); setUserMenuOpen(false); }}
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-primary transition-colors"
                          >
                            <LayoutDashboard className="w-4 h-4" /> Admin Dashboard
                          </button>
                        )}
                        <div className="border-t border-border mt-1 pt-1">
                          <button
                            onClick={() => { logout(); setUserMenuOpen(false); }}
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-destructive hover:bg-red-50 transition-colors"
                          >
                            <LogOut className="w-4 h-4" /> Sign Out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={() => openAuth('login')}
                  className="px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  Log In
                </button>
                <button
                  onClick={() => openAuth('register')}
                  className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-colors shadow-sm"
                >
                  Sign Up Free
                </button>
                <button
                  onClick={() => navigate('browse')}
                  className="flex items-center gap-2 px-4 py-2 border border-border text-sm font-medium text-foreground rounded-lg hover:border-primary hover:text-primary transition-colors"
                >
                  <Search className="w-4 h-4" /> Browse
                </button>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-foreground hover:bg-muted transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-white">
          <div className="px-4 py-4 space-y-2">
            {currentUser && (
              <div className="flex items-center gap-3 pb-3 mb-3 border-b border-border">
                <UserAvatar src={currentUser.avatar || undefined} name={currentUser.name} alt={currentUser.name} className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <p className="font-semibold text-sm">{currentUser.name}</p>
                  <p className="text-xs text-muted-foreground">{currentUser.email}</p>
                </div>
              </div>
            )}
            <button onClick={() => { navigate('browse'); setMobileOpen(false); }} className="w-full text-left px-3 py-2 text-sm font-medium rounded-lg hover:bg-muted transition-colors">Browse Listings</button>
            {currentUser ? (
              <>
                <button onClick={() => { navigate('profile'); setMobileOpen(false); }} className="w-full text-left px-3 py-2 text-sm font-medium rounded-lg hover:bg-muted transition-colors flex items-center gap-2"><User className="w-4 h-4" /> My Profile</button>
                <button onClick={() => { navigate('messages'); setMobileOpen(false); }} className="w-full text-left px-3 py-2 text-sm font-medium rounded-lg hover:bg-muted transition-colors flex items-center gap-2"><MessageSquare className="w-4 h-4" /> Messages {unreadCount > 0 && <span className="bg-primary text-white text-xs rounded-full px-1.5 py-0.5">{unreadCount}</span>}</button>
                {currentUser.isAdmin && <button onClick={() => { navigate('admin'); setMobileOpen(false); }} className="w-full text-left px-3 py-2 text-sm font-medium rounded-lg hover:bg-muted transition-colors flex items-center gap-2"><LayoutDashboard className="w-4 h-4" /> Admin</button>}
                <button onClick={() => { navigate('create'); setMobileOpen(false); }} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-colors mt-2">
                  <Plus className="w-4 h-4" /> Sell Your Tools
                </button>
                <button onClick={() => { logout(); setMobileOpen(false); }} className="w-full text-left px-3 py-2 text-sm text-destructive rounded-lg hover:bg-red-50 transition-colors">Sign Out</button>
              </>
            ) : (
              <>
                <button onClick={() => { openAuth('login'); setMobileOpen(false); }} className="w-full text-left px-3 py-2 text-sm font-medium rounded-lg hover:bg-muted transition-colors">Log In</button>
                <button onClick={() => { openAuth('register'); setMobileOpen(false); }} className="w-full flex items-center justify-center px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-colors mt-2">Sign Up Free</button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
