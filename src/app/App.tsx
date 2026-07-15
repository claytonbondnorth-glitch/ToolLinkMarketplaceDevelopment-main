import { Toaster } from 'sonner';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import MobileNav from './components/MobileNav';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import MarketplacePage from './pages/MarketplacePage';
import ListingDetailPage from './pages/ListingDetailPage';
import CreateListingPage from './pages/CreateListingPage';
import ProfilePage from './pages/ProfilePage';
import SellerProfilePage from './pages/SellerProfilePage';
import MessagesPage from './pages/MessagesPage';
import AdminDashboard from './pages/AdminDashboard';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import HelpPage from './pages/HelpPage';
import SellerGuidePage from './pages/SellerGuidePage';
import PricingPage from './pages/PricingPage';
import ShippingTipsPage from './pages/ShippingTipsPage';
import FinanceReferralDraftPage from './pages/FinanceReferralDraftPage';

function SchemaErrorBanner() {
  const { schemaError } = useApp();
  if (!schemaError) return null;
  return (
    <div className="fixed bottom-20 md:bottom-4 left-4 right-4 z-50 max-w-2xl mx-auto">
      <div className="bg-[#111111] text-white rounded-2xl p-4 shadow-2xl border border-white/10 flex items-start gap-3">
        <div className="w-7 h-7 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-primary font-bold text-sm">!</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold mb-0.5">Database setup required</p>
          <p className="text-xs text-gray-400 leading-relaxed">{schemaError}</p>
          <a
            href="https://supabase.com/dashboard/project/dnadllonpbpdifzjlbxq/sql/new"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-1.5 text-xs text-primary font-semibold hover:underline"
          >
            Open Supabase SQL Editor →
          </a>
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  const { currentPage, authLoading } = useApp();

  const noFooterPages: (typeof currentPage)[] = ['messages', 'auth'];
  const showFooter = !noFooterPages.includes(currentPage);
  const showMobileNav = currentPage !== 'auth';

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navbar always renders — never hidden behind a loading gate */}
      <Navbar />

      <main className="flex-1 pb-[72px] md:pb-0">
        {authLoading ? (
          /* Inline spinner — only the content area shows a loader, not the whole page */
          <div className="flex items-center justify-center py-32">
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground font-medium">Loading…</p>
            </div>
          </div>
        ) : (
          <>
            {currentPage === 'home'    && <HomePage />}
            {currentPage === 'browse'  && <MarketplacePage />}
            {currentPage === 'listing' && <ListingDetailPage />}
            {currentPage === 'create'  && <CreateListingPage />}
            {currentPage === 'profile' && <ProfilePage />}
            {currentPage === 'seller'  && <SellerProfilePage />}
            {currentPage === 'messages'&& <MessagesPage />}
            {currentPage === 'admin'   && <AdminDashboard />}
            {currentPage === 'finance-referral-draft' && <FinanceReferralDraftPage />}
            {currentPage === 'about'   && <AboutPage />}
            {currentPage === 'contact' && <ContactPage />}
            {currentPage === 'privacy' && <PrivacyPage />}
            {currentPage === 'terms'   && <TermsPage />}
            {currentPage === 'help'    && <HelpPage />}
            {currentPage === 'sellerGuide' && <SellerGuidePage />}
            {currentPage === 'pricing' && <PricingPage />}
            {currentPage === 'shippingTips' && <ShippingTipsPage />}
            {/* Auth is a real page route — no modal, no fixed overlay */}
            {currentPage === 'auth'    && <AuthPage />}
          </>
        )}
      </main>

      {showFooter && <Footer />}
      {showMobileNav && <MobileNav />}

      <SchemaErrorBanner />
      <Toaster
        richColors
        position="top-center"
        toastOptions={{
          style: { fontFamily: 'Inter, system-ui, sans-serif', borderRadius: '12px' },
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
