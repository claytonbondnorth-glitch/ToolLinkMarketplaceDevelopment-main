import { BadgeDollarSign, CircleCheckBig } from 'lucide-react';
import { useApp } from '../context/AppContext';

const INCLUDED = [
  'Create and publish listings for tools and equipment',
  'Message buyers and sellers directly in-app',
  'Manage active, sold, and completed listing status',
  'Build trust through profile activity and reviews',
];

export default function PricingPage() {
  const { navigate } = useApp();

  return (
    <div className="min-h-screen bg-muted">
      <section className="bg-[#111111] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">Resources</p>
          <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight">Pricing</h1>
          <p className="text-gray-300 mt-4 max-w-2xl leading-relaxed">
            ToolLink is currently in launch phase. Core marketplace features are available now while we continue expanding seller tools and safety systems.
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
        <div className="bg-white border border-border rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-start gap-3">
            <BadgeDollarSign className="w-6 h-6 text-primary mt-0.5" />
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-foreground">Listings are currently free</h2>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                ToolLink is currently free to use during launch. Sellers can create listings at no cost, and there are no listing fees right now for standard marketplace posts.
              </p>
              <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                In future, optional paid features may be introduced for advanced promotion and business tools, but basic browsing and listing are currently free for everyone.
              </p>
            </div>
          </div>

          <div className="border-t border-border mt-6 pt-6">
            <h3 className="text-sm font-bold uppercase tracking-wide text-foreground mb-4">What is included right now</h3>
            <ul className="space-y-3">
              {INCLUDED.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CircleCheckBig className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t border-border mt-6 pt-6">
            <button
              onClick={() => navigate('create')}
              className="inline-flex items-center justify-center rounded-xl bg-primary text-white px-5 py-3 text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Start Selling
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
