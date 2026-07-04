export default function TermsPage() {
  return (
    <div className="min-h-screen bg-muted">
      <section className="bg-[#111111] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">Legal</p>
          <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight">Terms of Use</h1>
          <p className="text-gray-300 mt-4 text-sm">Effective date: 4 July 2026</p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
        <div className="bg-white border border-border rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <article>
            <h2 className="text-lg font-bold text-foreground mb-2">Using ToolLink</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              By using ToolLink, you agree to follow these terms and all applicable laws. You must provide accurate account
              details and keep your login credentials secure.
            </p>
          </article>

          <article>
            <h2 className="text-lg font-bold text-foreground mb-2">Listings and conduct</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Sellers are responsible for accurate listing descriptions, legal ownership of listed items, and truthful condition
              information. Users must not upload misleading content, illegal items, or abusive messages.
            </p>
          </article>

          <article>
            <h2 className="text-lg font-bold text-foreground mb-2">Transactions and disputes</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              ToolLink facilitates buyer-seller connections but is not a direct party to private sales agreements.
              Users should confirm item condition, payment method, and pickup or delivery details before completing a transaction.
            </p>
          </article>

          <article>
            <h2 className="text-lg font-bold text-foreground mb-2">Account enforcement</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We may suspend or remove accounts that breach these terms, compromise platform safety, or engage in fraudulent behavior.
              We may update these terms from time to time, with changes posted on this page.
            </p>
          </article>
        </div>
      </section>
    </div>
  );
}
