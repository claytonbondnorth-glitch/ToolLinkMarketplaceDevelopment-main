import { Package, ShieldCheck, Truck, Handshake, Info } from 'lucide-react';

const TIPS = [
  {
    title: 'Safe pickup first',
    icon: ShieldCheck,
    body: 'Local pickup is recommended for most ToolLink sales. Meet in a well-lit public location where practical, or at a secure worksite during business hours.',
  },
  {
    title: 'Agree delivery terms before payment',
    icon: Truck,
    body: 'If delivery is needed, buyer and seller should confirm suburb, timing, unloading responsibility, and condition checks before any payment is made.',
  },
  {
    title: 'Package tools properly',
    icon: Package,
    body: 'Use strong cartons, edge protection, and internal padding for loose parts. Seal and label parcels clearly, and share tracking details as soon as shipped.',
  },
  {
    title: 'Set buyer and seller agreement',
    icon: Handshake,
    body: 'Before finalising, both parties should confirm item condition, inspection expectations, agreed price, and when ownership transfers.',
  },
];

export default function ShippingTipsPage() {
  return (
    <div className="min-h-screen bg-muted">
      <section className="bg-[#111111] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">Resources</p>
          <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight">Shipping Tips</h1>
          <p className="text-gray-300 mt-4 max-w-3xl leading-relaxed">
            Practical guidance to keep ToolLink transactions safer and clearer for both buyers and sellers when arranging pickup or delivery.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {TIPS.map(({ title, icon: Icon, body }) => (
            <article key={title} className="bg-white border border-border rounded-2xl p-6 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-[#FFF0E6] text-primary flex items-center justify-center mb-4">
                <Icon className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-foreground mb-2">{title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
            </article>
          ))}
        </div>

        <article className="bg-white border border-border rounded-2xl p-6 shadow-sm mt-5">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <h2 className="text-lg font-bold text-foreground mb-2">Important platform note</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                ToolLink currently does not handle shipping logistics or process payments directly. Buyers and sellers are responsible for agreeing on transport, payment method, and meetup safety.
              </p>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}
