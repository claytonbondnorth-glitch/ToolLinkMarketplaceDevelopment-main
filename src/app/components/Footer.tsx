import { Wrench } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Footer() {
  const { navigate } = useApp();

  return (
    <footer className="bg-[#111111] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <button
              onClick={() => navigate('home')}
              className="flex items-center gap-2 mb-4 group"
            >
              <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
                <Wrench className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">
                Tool<span className="text-primary">Link</span>
              </span>
            </button>
            <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
              Australia&apos;s trusted marketplace for tradies to buy, sell and discover quality professional tools and construction equipment. Built for the industry, by people who understand it.
            </p>
          </div>

          {/* Buy */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-300 mb-4">Buy</h4>
            <ul className="space-y-3">
              {[
                ['Browse Listings', () => navigate('browse')],
                ['Power Tools', () => navigate('browse', { categoryId: 'power-tools' })],
                ['Hand Tools', () => navigate('browse', { categoryId: 'hand-tools' })],
                ['Heavy Equipment', () => navigate('browse', { categoryId: 'heavy-equipment' })],
                ['Saved Listings', () => navigate('profile')],
              ].map(([label, action]) => (
                <li key={label as string}>
                  <button
                    onClick={action as () => void}
                    className="text-sm text-gray-400 hover:text-primary transition-colors"
                  >
                    {label as string}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Sell */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-300 mb-4">Sell</h4>
            <ul className="space-y-3">
              {[
                ['Create a Listing', () => navigate('create')],
                ['Seller Guide', () => navigate('sellerGuide')],
                ['Pricing', () => navigate('pricing')],
                ['Shipping Tips', () => navigate('shippingTips')],
              ].map(([label, action]) => (
                <li key={label as string}>
                  <button
                    onClick={action as () => void}
                    className="text-sm text-gray-400 hover:text-primary transition-colors"
                  >
                    {label as string}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-300 mb-4">Company</h4>
            <ul className="space-y-3">
              {[
                ['About Us', () => navigate('about')],
                ['Contact', () => navigate('contact')],
                ['Privacy Policy', () => navigate('privacy')],
                ['Terms of Use', () => navigate('terms')],
                ['Help Centre', () => navigate('help')],
              ].map(([label, action]) => (
                <li key={label as string}>
                  <button
                    onClick={action as () => void}
                    className="text-sm text-gray-400 hover:text-primary transition-colors"
                  >
                    {label as string}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            © 2026 ToolLink. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
