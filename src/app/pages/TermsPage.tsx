import { useMemo, useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';

type LegalSection = {
  id: string;
  heading: string;
  paragraphs: string[];
};

export default function TermsPage() {
  const sections: LegalSection[] = [
    {
      id: 'about-these-terms',
      heading: 'About These Terms',
      paragraphs: [
        'By accessing or using ToolLink, you agree to these Terms and Conditions and all applicable Australian laws. If you do not agree, you must not use the platform.',
      ],
    },
    {
      id: 'eligibility-user-accounts',
      heading: 'Eligibility and User Accounts',
      paragraphs: [
        'You must be legally able to enter contracts in Australia to use ToolLink. You are responsible for keeping your account details accurate, protecting your login credentials, and all activity that occurs through your account.',
      ],
    },
    {
      id: 'marketplace-role',
      heading: 'ToolLink’s Marketplace Role',
      paragraphs: [
        'ToolLink provides an online platform that allows users to list, discover, and communicate about tools and equipment. ToolLink is generally not the buyer, seller, owner, manufacturer, delivery provider, or payment provider for user-listed items.',
      ],
    },
    {
      id: 'buyer-responsibilities',
      heading: 'Buyer Responsibilities',
      paragraphs: [
        'Buyers are responsible for their own decisions and conduct, including agreeing transaction terms, checking item details, and complying with laws and regulations that apply to their purchase.',
      ],
    },
    {
      id: 'seller-responsibilities',
      heading: 'Seller Responsibilities',
      paragraphs: [
        'Sellers are responsible for their own decisions and conduct, including agreeing transaction terms, checking item details, and complying with laws and regulations that apply to their sale.',
        'You may only list items that you lawfully own or are authorised to sell. By listing an item, you represent that you have the legal right to sell it and transfer ownership where applicable.',
      ],
    },
    {
      id: 'listings-item-descriptions',
      heading: 'Listings and Item Descriptions',
      paragraphs: [
        'Sellers must create truthful listings and must not post misleading, deceptive, or incomplete information. Listing details must accurately represent the item being offered.',
        'Sellers must provide clear photos and accurate descriptions, including known faults, wear, missing parts, and true condition. Prices must be genuine and must not be used to mislead users.',
      ],
    },
    {
      id: 'prohibited-restricted-items',
      heading: 'Prohibited and Restricted Items',
      paragraphs: [
        'Listings must not include stolen goods, unsafe goods, counterfeit goods, illegal goods, or goods restricted by law. ToolLink may remove listings and restrict accounts where prohibited content is detected or reported.',
      ],
    },
    {
      id: 'messages-user-conduct',
      heading: 'Messages and User Conduct',
      paragraphs: [
        'ToolLink messaging must be used lawfully and respectfully. Harassment, abuse, threats, scams, impersonation, spam, and other inappropriate conduct are not permitted.',
      ],
    },
    {
      id: 'payments-transactions',
      heading: 'Payments and Transactions',
      paragraphs: [
        'Payments and transaction terms are arranged directly between buyers and sellers. ToolLink does not currently process user transaction payments on behalf of users.',
      ],
    },
    {
      id: 'pickup-shipping-delivery',
      heading: 'Pickup, Shipping and Delivery',
      paragraphs: [
        'Pickup, shipping, freight, and delivery arrangements are the responsibility of buyers and sellers unless otherwise agreed between those users. Users should confirm timing, costs, risk transfer, and practical logistics before completion.',
      ],
    },
    {
      id: 'second-hand-tools-equipment',
      heading: 'Second-Hand Tools and Equipment',
      paragraphs: [
        'Where practical, buyers should inspect second-hand tools and equipment before finalising a purchase. Users are responsible for satisfying themselves about condition, suitability, and fitness for intended use.',
      ],
    },
    {
      id: 'disputes-between-users',
      heading: 'Disputes Between Users',
      paragraphs: [
        'Disputes are primarily between the buyer and seller. ToolLink may review reports and platform records but is not generally required to resolve private contractual disputes between users.',
      ],
    },
    {
      id: 'reviews-ratings',
      heading: 'Reviews and Ratings',
      paragraphs: [
        'ToolLink may allow users to leave reviews and ratings based on genuine experiences. Reviews must be honest and must not be defamatory, abusive, misleading, or manipulated.',
      ],
    },
    {
      id: 'account-suspension-removal',
      heading: 'Account Suspension and Removal',
      paragraphs: [
        'Users can report listings or behaviour that may breach these terms or applicable law. ToolLink may investigate reports and take action, including removal of content or account restrictions.',
        'ToolLink may suspend, restrict, or remove accounts and content where there is a breach of these terms, suspected fraud, unlawful activity, safety concerns, or repeated misuse of the platform.',
      ],
    },
    {
      id: 'intellectual-property',
      heading: 'Intellectual Property',
      paragraphs: [
        'ToolLink branding, logos, platform content, and software are protected by intellectual property laws. You must not copy, exploit, or use ToolLink intellectual property beyond permitted use without written permission.',
      ],
    },
    {
      id: 'privacy-personal-information',
      heading: 'Privacy and Personal Information',
      paragraphs: [
        'ToolLink handles personal information in line with its Privacy Policy. By using ToolLink, you acknowledge the data handling described in that policy.',
      ],
    },
    {
      id: 'website-availability-security',
      heading: 'Website Availability and Security',
      paragraphs: [
        'ToolLink works to maintain platform availability and security, but uninterrupted access cannot be guaranteed. Planned maintenance, outages, network issues, and third-party service interruptions may affect access from time to time.',
      ],
    },
    {
      id: 'liability-acl',
      heading: 'Liability and Australian Consumer Law',
      paragraphs: [
        'To the maximum extent permitted by law, ToolLink is not liable for losses arising from user-to-user transactions, user conduct, listing accuracy, or third-party services. Nothing in these terms excludes, restricts, or modifies rights or remedies that cannot lawfully be excluded under Australian law.',
        'These terms are subject to the Competition and Consumer Act 2010 (Cth), including the Australian Consumer Law. Statutory consumer guarantees and other non-excludable rights continue to apply where relevant.',
      ],
    },
    {
      id: 'finance-services',
      heading: 'Finance Services',
      paragraphs: [
        'ToolLink does not currently provide finance, make credit decisions or approve finance applications. Any future finance service will be subject to separate terms, eligibility requirements and the involvement of appropriately authorised finance providers.',
      ],
    },
    {
      id: 'commercial-sellers-future-partners',
      heading: 'Commercial Sellers and Future Partners',
      paragraphs: [
        'ToolLink may introduce additional account types for dealers, manufacturers, and commercial sellers in future. Any such offerings will be governed by separate or supplementary terms where required.',
      ],
    },
    {
      id: 'changes-to-terms',
      heading: 'Changes to These Terms',
      paragraphs: [
        'ToolLink may update these Terms and Conditions from time to time. Updated terms will be published on this page with a revised last updated date, and continued use of the platform indicates acceptance of the revised terms.',
      ],
    },
    {
      id: 'governing-law-contact',
      heading: 'Governing Law and Contact Details',
      paragraphs: [
        'These Terms and Conditions are governed by the laws of Queensland, Australia. You agree to submit to the non-exclusive jurisdiction of the courts of Queensland and relevant Australian courts.',
        'For support and terms-related enquiries, contact ToolLink at support@toollinkk.com. Legal entity details, ABN, and registered office details are currently pending owner review and should be added before final legal publication.',
      ],
    },
  ];

  const allSectionIds = useMemo(() => sections.map((section) => section.id), [sections]);
  const [openSections, setOpenSections] = useState<string[]>([sections[0].id]);

  return (
    <div className="min-h-screen bg-muted">
      <section className="bg-[#111111] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14 sm:py-18">
          <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">Legal</p>
          <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight">ToolLink Terms and Conditions</h1>
          <p className="text-gray-300 mt-3 text-sm">Last updated: 15 July 2026</p>
          <p className="text-gray-300 mt-4 max-w-3xl text-sm leading-relaxed">
            These terms set out how ToolLink operates as an online marketplace for tools and equipment in Australia, and the responsibilities of buyers and sellers when using the platform.
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10 pb-24 md:pb-10">
        <div className="bg-white border border-border rounded-2xl shadow-sm">
          <div className="px-4 sm:px-6 pt-5 pb-4 border-b border-border/80 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground">Use the sections below to view legal details.</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setOpenSections(allSectionIds)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-border text-foreground hover:bg-muted transition-colors"
              >
                Expand all
              </button>
              <button
                type="button"
                onClick={() => setOpenSections([])}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-border text-foreground hover:bg-muted transition-colors"
              >
                Collapse all
              </button>
            </div>
          </div>

          <div className="px-4 sm:px-6 pb-2">
            <Accordion type="multiple" value={openSections} onValueChange={setOpenSections} className="w-full">
              {sections.map((section) => (
                <AccordionItem key={section.id} value={section.id} className="border-border/80">
                  <AccordionTrigger className="py-4 text-base font-semibold text-foreground hover:no-underline">
                    <span className="pr-2 leading-snug break-words">{section.heading}</span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3">
                      {section.paragraphs.map((paragraph) => (
                        <p key={paragraph} className="text-sm text-muted-foreground leading-relaxed">
                          {paragraph}
                        </p>
                      ))}
                      {section.id === 'privacy-personal-information' && (
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Read the ToolLink Privacy Policy here:{' '}
                          <a href="/privacy" className="text-primary font-semibold hover:underline">
                            Privacy Policy
                          </a>
                          .
                        </p>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>
    </div>
  );
}
