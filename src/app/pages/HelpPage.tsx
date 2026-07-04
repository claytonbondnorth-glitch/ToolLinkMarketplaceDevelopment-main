import { HelpCircle } from 'lucide-react';

const FAQS = [
  {
    question: 'How do I create a listing?',
    answer: 'Go to Create Listing, add clear photos, choose the right category, include condition details, and set a realistic price before publishing.',
  },
  {
    question: 'How do I message sellers?',
    answer: 'Open a listing and start a conversation from the listing or seller profile. Keep all negotiation and condition questions in-app for a clear record.',
  },
  {
    question: 'How does seller verification work?',
    answer: 'Sellers can submit verification details in their account flow. Verified badges are shown once checks are approved by the ToolLink process.',
  },
  {
    question: 'How do reviews work?',
    answer: 'After a completed transaction, buyers and sellers can leave ratings and comments. Reviews help other tradies assess reliability and service quality.',
  },
  {
    question: 'How do I reset my password?',
    answer: 'From the sign-in page, select Forgot Password and follow the email instructions to set a new password securely.',
  },
];

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-muted">
      <section className="bg-[#111111] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">Support</p>
          <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight">Help Centre</h1>
          <p className="text-gray-300 mt-4 max-w-2xl leading-relaxed">
            Answers to common ToolLink questions for buying, selling, account access, and trust features.
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
        <div className="space-y-4">
          {FAQS.map((faq) => (
            <article key={faq.question} className="bg-white border border-border rounded-2xl p-5 sm:p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <HelpCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-foreground">{faq.question}</h2>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{faq.answer}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
