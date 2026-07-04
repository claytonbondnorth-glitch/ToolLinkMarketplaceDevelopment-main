import { Camera, ClipboardCheck, MessageSquare, BadgeCheck, Star, FileText } from 'lucide-react';
import { useApp } from '../context/AppContext';

const STEPS = [
  {
    title: 'Create your listing',
    icon: ClipboardCheck,
    body: 'Start from Create Listing, choose the right category, set a realistic price, and include key details like brand, model, condition, and location.',
  },
  {
    title: 'Write an honest description',
    icon: FileText,
    body: 'List exactly what buyers are getting. Include age, usage history, defects, missing accessories, and any repairs so there are no surprises at handover.',
  },
  {
    title: 'Upload clear photos',
    icon: Camera,
    body: 'Add multiple photos in good light: full item shots, close-ups of key parts, serial plates where relevant, and any wear points so buyers know exactly what to expect.',
  },
  {
    title: 'Message buyers in-app',
    icon: MessageSquare,
    body: 'Respond quickly to buyer questions inside ToolLink messages. Confirm condition, pickup or delivery details, and preferred payment timing before meeting.',
  },
  {
    title: 'Mark the item sold',
    icon: BadgeCheck,
    body: 'Once the transaction is complete, update the listing status to sold so buyers do not keep enquiring and your profile remains accurate.',
  },
  {
    title: 'Leave and receive reviews',
    icon: Star,
    body: 'After a successful sale, both parties can leave feedback. Clear communication, accurate listings, and reliable handover help you earn stronger seller reviews.',
  },
];

export default function SellerGuidePage() {
  const { navigate } = useApp();

  return (
    <div className="min-h-screen bg-muted">
      <section className="bg-[#111111] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">Resources</p>
          <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight">Seller Guide</h1>
          <p className="text-gray-300 mt-4 max-w-3xl leading-relaxed">
            A practical step-by-step guide for selling tools on ToolLink, from creating your first listing to collecting reviews after the sale.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
        <div className="mb-6">
          <button
            onClick={() => navigate('create')}
            className="inline-flex items-center justify-center rounded-xl bg-primary text-white px-5 py-3 text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Create a Listing
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {STEPS.map(({ title, icon: Icon, body }) => (
            <article key={title} className="bg-white border border-border rounded-2xl p-6 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-[#FFF0E6] text-primary flex items-center justify-center mb-4">
                <Icon className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-foreground mb-2">{title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
