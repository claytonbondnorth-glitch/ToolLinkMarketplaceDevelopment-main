import { useState } from 'react';
import { ShieldAlert, FileText, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '../context/AppContext';
import { supabase } from '../../lib/supabase';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Checkbox } from '../components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

type ApplicantType = 'individual' | 'sole_trader' | 'partnership' | 'trust' | 'company' | '';
type IntendedUse = 'mainly_business_use' | 'mainly_personal_use' | '';
type StateOrTerritory = 'NSW' | 'VIC' | 'QLD' | 'WA' | 'SA' | 'TAS' | 'NT' | 'ACT' | '';

const APPLICANT_TYPES: { value: Exclude<ApplicantType, ''>; label: string }[] = [
  { value: 'individual', label: 'Individual' },
  { value: 'sole_trader', label: 'Sole trader' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'trust', label: 'Trust' },
  { value: 'company', label: 'Company' },
];

const STATES_AND_TERRITORIES: Exclude<StateOrTerritory, ''>[] = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'NT', 'ACT'];

const INTENDED_USE_OPTIONS: { value: Exclude<IntendedUse, ''>; label: string }[] = [
  { value: 'mainly_business_use', label: 'Mainly business use' },
  { value: 'mainly_personal_use', label: 'Mainly personal use' },
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function FinanceReferralDraftPage() {
  const { currentUser, navigate } = useApp();
  const [fullName, setFullName] = useState(currentUser?.name ?? '');
  const [accountEmail, setAccountEmail] = useState(currentUser?.email ?? '');
  const [phoneNumber, setPhoneNumber] = useState(currentUser?.phone ?? '');
  const [applicantType, setApplicantType] = useState<ApplicantType>('');
  const [stateOrTerritory, setStateOrTerritory] = useState<StateOrTerritory>('');
  const [toolOrEquipmentRequired, setToolOrEquipmentRequired] = useState('');
  const [estimatedPurchasePrice, setEstimatedPurchasePrice] = useState('');
  const [approximateFinanceAmountRequested, setApproximateFinanceAmountRequested] = useState('');
  const [intendedUse, setIntendedUse] = useState<IntendedUse>('');
  const [preferredContactTime, setPreferredContactTime] = useState('');
  const [wantsBrokerContact, setWantsBrokerContact] = useState(false);
  const [consentsToSharing, setConsentsToSharing] = useState(false);
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setFullName('');
    setAccountEmail('');
    setPhoneNumber('');
    setApplicantType('');
    setStateOrTerritory('');
    setToolOrEquipmentRequired('');
    setEstimatedPurchasePrice('');
    setApproximateFinanceAmountRequested('');
    setIntendedUse('');
    setPreferredContactTime('');
    setWantsBrokerContact(false);
    setConsentsToSharing(false);
  };

  const handleSaveDraft = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentUser?.isAdmin || !currentUser.id) {
      toast.error('Admin access is required to save this draft.');
      return;
    }

    const trimmedFullName = fullName.trim();
    const trimmedEmail = accountEmail.trim().toLowerCase();
    const trimmedPhone = phoneNumber.trim();
    const trimmedEquipmentDescription = toolOrEquipmentRequired.trim();
    const trimmedPreferredContactTime = preferredContactTime.trim();

    if (!trimmedFullName) {
      toast.error('Full name is required.');
      return;
    }
    if (!trimmedEmail || !EMAIL_PATTERN.test(trimmedEmail)) {
      toast.error('A valid email is required.');
      return;
    }
    if (!trimmedPhone) {
      toast.error('Phone number is required.');
      return;
    }
    if (!applicantType) {
      toast.error('Applicant type is required.');
      return;
    }
    if (!stateOrTerritory) {
      toast.error('State or territory is required.');
      return;
    }
    if (!trimmedEquipmentDescription) {
      toast.error('Tool or equipment required is mandatory.');
      return;
    }

    const purchasePriceValue = Number(estimatedPurchasePrice);
    const financeAmountValue = Number(approximateFinanceAmountRequested);

    if (estimatedPurchasePrice.trim() === '' || Number.isNaN(purchasePriceValue) || purchasePriceValue < 0) {
      toast.error('Estimated purchase price must be a valid non-negative number.');
      return;
    }
    if (approximateFinanceAmountRequested.trim() === '' || Number.isNaN(financeAmountValue) || financeAmountValue < 0) {
      toast.error('Approximate finance amount requested must be a valid non-negative number.');
      return;
    }
    if (!intendedUse) {
      toast.error('Intended use is required.');
      return;
    }
    if (!trimmedPreferredContactTime) {
      toast.error('Preferred contact time is required.');
      return;
    }
    if (!wantsBrokerContact) {
      toast.error('Please confirm the person genuinely wants broker contact.');
      return;
    }
    if (!consentsToSharing) {
      toast.error('Please confirm consent to share the enquiry with a future accredited finance partner.');
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from('finance_referral_drafts')
      .insert({
        created_by: currentUser.id,
        full_name: trimmedFullName,
        email: trimmedEmail,
        phone: trimmedPhone,
        applicant_type: applicantType,
        state: stateOrTerritory,
        equipment_description: trimmedEquipmentDescription,
        purchase_price: purchasePriceValue,
        finance_amount: financeAmountValue,
        intended_use: intendedUse,
        preferred_contact_time: trimmedPreferredContactTime,
        wants_broker_contact: wantsBrokerContact,
        consent_to_share: consentsToSharing,
        draft_status: 'draft',
      });

    setSaving(false);

    if (error) {
      toast.error('Unable to save draft enquiry right now. Please try again.');
      return;
    }

    toast.success('Draft enquiry saved.');
    resetForm();
  };

  if (!currentUser?.isAdmin) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-border p-10 text-center max-w-md">
          <ShieldAlert className="w-14 h-14 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">Access Denied</h2>
          <p className="text-sm text-muted-foreground mb-6">You need administrator privileges to view this page.</p>
          <button onClick={() => navigate('home')} className="px-6 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors text-sm">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted">
      <div className="bg-[#111111] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-red-300/30 bg-red-500/10 px-3 py-1 text-[11px] font-bold tracking-[0.18em] text-red-200 uppercase mb-4">
                DRAFT — NOT LIVE — BROKER AND COMPLIANCE APPROVAL REQUIRED
              </div>
              <h1 className="text-2xl font-bold">ToolLink Finance Referral Enquiry</h1>
              <p className="text-sm text-gray-400 mt-0.5">Internal draft form for future broker referral workflows only.</p>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('admin')}
              className="border-white/15 bg-white/10 text-white hover:bg-white/20 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Admin
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div className="bg-white rounded-xl border border-border p-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Draft Referral Interface</h2>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed max-w-3xl">
                This draft page is for internal preparation only. It does not perform a loan application, credit assessment, eligibility decision, lender recommendation, or finance approval workflow.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border p-6">
          <div className="mb-6">
            <h3 className="font-bold text-foreground">Referral Enquiry Details</h3>
            <p className="text-sm text-muted-foreground mt-1">Visual draft only. No information is being saved or shared in this version.</p>
          </div>

          <form className="space-y-6" onSubmit={handleSaveDraft}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="finance-full-name" className="block text-sm font-semibold text-foreground">Full name</label>
                <Input id="finance-full-name" value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Enter full name" />
              </div>

              <div className="space-y-2">
                <label htmlFor="finance-account-email" className="block text-sm font-semibold text-foreground">Account email</label>
                <Input id="finance-account-email" type="email" value={accountEmail} onChange={(event) => setAccountEmail(event.target.value)} placeholder="Enter account email" />
              </div>

              <div className="space-y-2">
                <label htmlFor="finance-phone-number" className="block text-sm font-semibold text-foreground">Phone number</label>
                <Input id="finance-phone-number" type="tel" value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value)} placeholder="Enter phone number" />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-foreground">Applicant type</label>
                <Select value={applicantType} onValueChange={(value) => setApplicantType(value as ApplicantType)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select applicant type" />
                  </SelectTrigger>
                  <SelectContent>
                    {APPLICANT_TYPES.map((option) => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-foreground">State or territory</label>
                <Select value={stateOrTerritory} onValueChange={(value) => setStateOrTerritory(value as StateOrTerritory)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select state or territory" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATES_AND_TERRITORIES.map((option) => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label htmlFor="finance-tool-required" className="block text-sm font-semibold text-foreground">Tool or equipment required</label>
                <Input id="finance-tool-required" value={toolOrEquipmentRequired} onChange={(event) => setToolOrEquipmentRequired(event.target.value)} placeholder="Describe the tool or equipment required" />
              </div>

              <div className="space-y-2">
                <label htmlFor="finance-estimated-price" className="block text-sm font-semibold text-foreground">Estimated purchase price</label>
                <Input id="finance-estimated-price" inputMode="decimal" value={estimatedPurchasePrice} onChange={(event) => setEstimatedPurchasePrice(event.target.value)} placeholder="e.g. 8500" />
              </div>

              <div className="space-y-2">
                <label htmlFor="finance-amount-requested" className="block text-sm font-semibold text-foreground">Approximate finance amount requested</label>
                <Input id="finance-amount-requested" inputMode="decimal" value={approximateFinanceAmountRequested} onChange={(event) => setApproximateFinanceAmountRequested(event.target.value)} placeholder="e.g. 7000" />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-foreground">Intended use</label>
                <Select value={intendedUse} onValueChange={(value) => setIntendedUse(value as IntendedUse)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select intended use" />
                  </SelectTrigger>
                  <SelectContent>
                    {INTENDED_USE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="finance-contact-time" className="block text-sm font-semibold text-foreground">Preferred contact time</label>
                <Input id="finance-contact-time" value={preferredContactTime} onChange={(event) => setPreferredContactTime(event.target.value)} placeholder="e.g. Weekdays after 3pm" />
              </div>
            </div>

            <div className="space-y-4 rounded-xl border border-border bg-muted/40 p-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="finance-broker-contact"
                  checked={wantsBrokerContact}
                  onCheckedChange={(checked) => setWantsBrokerContact(Boolean(checked))}
                  className="mt-0.5"
                />
                <label htmlFor="finance-broker-contact" className="text-sm text-foreground leading-relaxed cursor-pointer">
                  Checkbox confirming the person genuinely wants contact from a finance broker
                </label>
              </div>

              <div className="flex items-start gap-3">
                <Checkbox
                  id="finance-sharing-consent"
                  checked={consentsToSharing}
                  onCheckedChange={(checked) => setConsentsToSharing(Boolean(checked))}
                  className="mt-0.5"
                />
                <label htmlFor="finance-sharing-consent" className="text-sm text-foreground leading-relaxed cursor-pointer">
                  Checkbox consenting to ToolLink sharing the enquiry with a future accredited finance partner
                </label>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-accent/40 px-4 py-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                “This draft form is not a loan application, credit assessment, recommendation or indication of approval. ToolLink does not assess credit eligibility or provide finance. Any financial assessment would be completed by an appropriately authorised finance provider.”
              </p>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving Draft...' : 'Save Draft Enquiry'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}