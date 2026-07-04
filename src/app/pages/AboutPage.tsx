import { Wrench, ShieldCheck, Users, Sparkles } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-muted">
      <section className="bg-[#111111] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">Company</p>
          <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight">About ToolLink</h1>
          <p className="text-gray-300 mt-4 max-w-2xl leading-relaxed">
            ToolLink is a marketplace built for Australian tradies to buy, sell, and trade professional tools with confidence.
            We focus on practical features that help quality gear move faster between real worksites.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[
            {
              title: 'Built for trade work',
              desc: 'Every listing workflow is designed around real trade equipment, condition details, and clear pricing.',
              icon: Wrench,
            },
            {
              title: 'Trust and accountability',
              desc: 'Seller profiles, reviews, and verification tools are designed to keep transactions transparent.',
              icon: ShieldCheck,
            },
            {
              title: 'Community-first marketplace',
              desc: 'We are focused on helping independent tradies and small businesses unlock value from unused gear.',
              icon: Users,
            },
            {
              title: 'Practical innovation',
              desc: 'ToolLink invests in features that reduce listing friction and improve buyer decision-making.',
              icon: Sparkles,
            },
          ].map(({ title, desc, icon: Icon }) => (
            <article key={title} className="bg-white border border-border rounded-2xl p-6 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-[#FFF0E6] text-primary flex items-center justify-center mb-4">
                <Icon className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-foreground mb-2">{title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
