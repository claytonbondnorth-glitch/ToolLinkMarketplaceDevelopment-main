import { Mail, Clock3, MapPin } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-muted">
      <section className="bg-[#111111] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">Company</p>
          <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight">Contact ToolLink</h1>
          <p className="text-gray-300 mt-4 max-w-2xl leading-relaxed">
            Our support team is here to help with account issues, listing questions, and marketplace safety concerns.
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
        <div className="bg-white border border-border rounded-2xl p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <h2 className="text-base font-bold text-foreground">Support email</h2>
              <a href="mailto:support@toollinkk.com" className="text-primary font-semibold hover:underline">
                support@toollinkk.com
              </a>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock3 className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <h2 className="text-base font-bold text-foreground">Support hours</h2>
              <p className="text-sm text-muted-foreground">Monday to Friday, 8:30 AM to 5:30 PM (AEST/AEDT)</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <h2 className="text-base font-bold text-foreground">Service area</h2>
              <p className="text-sm text-muted-foreground">ToolLink supports buyers and sellers across all Australian states and territories.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
