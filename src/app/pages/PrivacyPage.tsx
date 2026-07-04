export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-muted">
      <section className="bg-[#111111] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">Legal</p>
          <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight">Privacy Policy</h1>
          <p className="text-gray-300 mt-4 text-sm">Effective date: 4 July 2026</p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
        <div className="bg-white border border-border rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <article>
            <h2 className="text-lg font-bold text-foreground mb-2">What information we collect</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We collect account details you provide, including your name, email address, profile information, and listing content.
              We also process transaction and messaging data needed to run the marketplace safely.
            </p>
          </article>

          <article>
            <h2 className="text-lg font-bold text-foreground mb-2">How we use your information</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              ToolLink uses your data to provide marketplace features, improve fraud prevention, support verification processes,
              and respond to customer support requests. We may also use de-identified usage data to improve product performance.
            </p>
          </article>

          <article>
            <h2 className="text-lg font-bold text-foreground mb-2">When we share data</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We share limited data with trusted service providers that help operate ToolLink, such as infrastructure, storage,
              and communications providers. We may disclose information where required by Australian law.
            </p>
          </article>

          <article>
            <h2 className="text-lg font-bold text-foreground mb-2">Your choices</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You can update profile details in your account and contact support to request account-related privacy assistance.
              Some records may be retained where required for legal, security, or dispute resolution reasons.
            </p>
          </article>
        </div>
      </section>
    </div>
  );
}
