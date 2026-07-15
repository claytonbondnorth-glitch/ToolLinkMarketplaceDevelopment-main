import { Wrench } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Footer() {
  const { navigate } = useApp();

  const handleInternalLinkClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    action: () => void
  ) => {
    const isModifiedClick = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
    if (isModifiedClick) return;
    event.preventDefault();
    action();
  };

  const buyLinks = [
    { label: 'Trade Tools & Equipment', href: '/browse', action: () => navigate('browse', { mainCategory: 'Trade Tools & Equipment' }) },
    { label: 'Civil & Construction Equipment', href: '/browse', action: () => navigate('browse', { mainCategory: 'Civil & Construction Equipment' }) },
    { label: 'Automotive & Workshop', href: '/browse', action: () => navigate('browse', { mainCategory: 'Automotive & Workshop' }) },
  ];

  const sellLinks = [
    { label: 'Create a Listing', href: '/create', action: () => navigate('create') },
    { label: 'Seller Guide', href: '/seller-guide', action: () => navigate('sellerGuide') },
  ];

  const companyLinks = [
    { label: 'About Us', href: '/about', action: () => navigate('about') },
    { label: 'Contact', href: '/contact', action: () => navigate('contact') },
    { label: 'Privacy Policy', href: '/privacy', action: () => navigate('privacy') },
    { label: 'Terms of Use', href: '/terms', action: () => navigate('terms') },
    { label: 'Help Centre', href: '/help', action: () => navigate('help') },
  ];

  return (
    <footer className="bg-[#111111] text-white pb-[calc(env(safe-area-inset-bottom,0px)+76px)] md:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <a
              href="/"
              onClick={(event) => handleInternalLinkClick(event, () => navigate('home'))}
              className="flex items-center gap-2 mb-4 group"
            >
              <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
                <Wrench className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">
                Tool<span className="text-primary">Link</span>
              </span>
            </a>
            <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
              Australia&apos;s trusted marketplace for tradies to buy, sell and discover quality professional tools and construction equipment. Built for the industry, by people who understand it.
            </p>
          </div>

          {/* Buy */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-300 mb-4">Buy</h4>
            <ul className="space-y-3">
              {buyLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    onClick={(event) => handleInternalLinkClick(event, link.action)}
                    className="block py-1.5 text-sm text-gray-400 hover:text-primary transition-colors min-h-[36px] whitespace-nowrap"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Sell */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-300 mb-4">Sell</h4>
            <ul className="space-y-3">
              {sellLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    onClick={(event) => handleInternalLinkClick(event, link.action)}
                    className="block py-1.5 text-sm text-gray-400 hover:text-primary transition-colors min-h-[36px] whitespace-nowrap"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-300 mb-4">Company</h4>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    onClick={(event) => handleInternalLinkClick(event, link.action)}
                    className="block py-1.5 text-sm text-gray-400 hover:text-primary transition-colors min-h-[36px] whitespace-nowrap"
                  >
                    {link.label}
                  </a>
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
