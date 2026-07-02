import { Home, Search, Plus, MessageSquare, User } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function MobileNav() {
  const { currentPage, navigate, currentUser, openAuth, unreadCount } = useApp();

  const items = [
    { icon: Home, label: 'Home', page: 'home' as const },
    { icon: Search, label: 'Browse', page: 'browse' as const },
    { icon: Plus, label: 'Sell', page: 'create' as const, primary: true },
    { icon: MessageSquare, label: 'Messages', page: 'messages' as const, badge: unreadCount },
    { icon: User, label: 'Profile', page: 'profile' as const },
  ];

  const handleTap = (page: typeof items[number]['page'], isPrimary?: boolean) => {
    if (isPrimary && !currentUser) { openAuth('register'); return; }
    if ((page === 'messages' || page === 'profile') && !currentUser) { openAuth('login'); return; }
    navigate(page);
  };

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white border-t border-[#EBEBEB] safe-area-inset-bottom shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-around px-2 py-2 pb-[env(safe-area-inset-bottom,8px)]">
        {items.map(({ icon: Icon, label, page, primary, badge }) => {
          const isActive = currentPage === page;
          return (
            <button
              key={label}
              onClick={() => handleTap(page, primary)}
              className={`relative flex flex-col items-center justify-center gap-1 min-w-[60px] py-1 rounded-xl transition-all duration-200 ${
                primary
                  ? 'bg-primary text-white w-14 h-14 rounded-2xl shadow-lg shadow-primary/30 -mt-5 active:scale-95'
                  : isActive
                  ? 'text-primary'
                  : 'text-muted-foreground active:text-primary'
              }`}
            >
              <div className="relative">
                <Icon className={`${primary ? 'w-6 h-6' : 'w-5 h-5'} transition-transform duration-200 ${isActive && !primary ? 'scale-110' : ''}`} />
                {badge != null && badge > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-primary text-white text-[9px] font-extrabold rounded-full flex items-center justify-center">
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
              </div>
              {!primary && (
                <span className={`text-[10px] font-semibold leading-none ${isActive ? 'text-primary' : ''}`}>
                  {label}
                </span>
              )}
              {/* Active dot */}
              {isActive && !primary && (
                <span className="absolute bottom-0.5 w-1 h-1 bg-primary rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
