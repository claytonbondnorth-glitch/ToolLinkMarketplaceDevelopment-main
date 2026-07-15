import { useMemo, useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';

type PrivacySection = {
  id: string;
  heading: string;
  paragraphs: string[];
};

export default function PrivacyPage() {
  const sections: PrivacySection[] = [
    {
      id: 'about-this-policy',
      heading: 'About This Privacy Policy',
      paragraphs: [
        'This Privacy Policy explains how ToolLink collects, uses, stores, and shares personal information when you use the ToolLink platform.',
      ],
    },
    {
      id: 'information-collected',
      heading: 'Information ToolLink Collects',
      paragraphs: [
        'We collect account details you provide, including your name, email address, profile information, and listing content. We also process transaction and messaging data needed to run the marketplace safely.',
      ],
    },
    {
      id: 'account-profile-information',
      heading: 'Account and Profile Information',
      paragraphs: [
        'Account and profile information may include contact details, profile images, location details, and verification-related information that users choose to submit.',
      ],
    },
    {
      id: 'listings-messages-reviews',
      heading: 'Listings, Messages and Reviews',
      paragraphs: [
        'ToolLink processes listing details, in-platform messages, and review content to support marketplace functionality, trust features, and dispute or safety investigations where required.',
      ],
    },
    {
      id: 'finance-waitlist-information',
      heading: 'Finance Waitlist Information',
      paragraphs: [
        'If you submit details to the ToolLink Finance waitlist, ToolLink may store contact and interest information so users can be notified about future finance-related updates.',
      ],
    },
    {
      id: 'how-information-is-used',
      heading: 'How ToolLink Uses Information',
      paragraphs: [
        'ToolLink uses your data to provide marketplace features, improve fraud prevention, support verification processes, and respond to customer support requests. We may also use de-identified usage data to improve product performance.',
      ],
    },
    {
      id: 'when-information-shared',
      heading: 'When Information May Be Shared',
      paragraphs: [
        'We share limited data with trusted service providers that help operate ToolLink, such as infrastructure, storage, and communications providers. We may disclose information where required by Australian law.',
      ],
    },
    {
      id: 'supabase-hosting-providers',
      heading: 'Supabase, Hosting and Service Providers',
      paragraphs: [
        'ToolLink uses third-party service providers, including Supabase and related infrastructure or communication providers, to support hosting, storage, authentication, and operational messaging.',
      ],
    },
    {
      id: 'cookies-analytics',
      heading: 'Cookies and Website Analytics',
      paragraphs: [
        'ToolLink may use cookies or similar technologies to maintain sessions, support security, and understand platform performance and usage trends.',
      ],
    },
    {
      id: 'security-of-information',
      heading: 'Security of Personal Information',
      paragraphs: [
        'ToolLink takes reasonable steps to protect personal information. However, no online platform can guarantee absolute security.',
      ],
    },
    {
      id: 'access-correction',
      heading: 'Accessing or Correcting Information',
      paragraphs: [
        'You can update profile details in your account and contact support to request account-related privacy assistance.',
      ],
    },
    {
      id: 'deletion-retention',
      heading: 'Account Deletion and Data Retention',
      paragraphs: [
        'Some records may be retained where required for legal, security, fraud prevention, or dispute resolution reasons.',
      ],
    },
    {
      id: 'overseas-data-handling',
      heading: 'Overseas Data Handling',
      paragraphs: [
        'Depending on service provider infrastructure, personal information may be processed or stored in jurisdictions outside Australia. ToolLink aims to use providers with appropriate privacy and security safeguards.',
      ],
    },
    {
      id: 'children-privacy',
      heading: 'Children’s Privacy',
      paragraphs: [
        'ToolLink is intended for users who are legally eligible to use marketplace services. If we become aware that personal information has been provided inappropriately, we may take steps to remove or restrict that data.',
      ],
    },
    {
      id: 'changes-to-policy',
      heading: 'Changes to This Privacy Policy',
      paragraphs: [
        'ToolLink may update this Privacy Policy from time to time. Updates will be published on this page with a revised last updated date.',
      ],
    },
    {
      id: 'privacy-contact',
      heading: 'Privacy Questions and Contact Details',
      paragraphs: [
        'For privacy enquiries, contact ToolLink at support@toollinkk.com.',
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
          <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight">Privacy Policy</h1>
          <p className="text-gray-300 mt-3 text-sm">Last updated: 15 July 2026</p>
          <p className="text-gray-300 mt-4 max-w-3xl text-sm leading-relaxed">
            This document describes how ToolLink handles personal information across accounts, listings, messages, reviews, and related platform services.
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10 pb-24 md:pb-10">
        <div className="bg-white border border-border rounded-2xl shadow-sm">
          <div className="px-4 sm:px-6 pt-5 pb-4 border-b border-border/80 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground">Expand a section to view privacy details.</p>
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
