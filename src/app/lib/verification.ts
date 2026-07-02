export type VerificationType = 'tradie' | 'business' | null;

export type VerificationBadgeLabel = 'Verified Member' | 'Verified Tradie' | 'Verified Business';

export interface VerificationBadgeUser {
  verified: boolean;
  verifiedMember?: boolean;
  verificationType?: VerificationType;
}

export function getVerificationBadgeLabel(user: VerificationBadgeUser): VerificationBadgeLabel | null {
  if (!user.verified) return null;

  if (user.verifiedMember) return 'Verified Member';
  if (user.verificationType === 'tradie') return 'Verified Tradie';
  if (user.verificationType === 'business') return 'Verified Business';

  return 'Verified Member';
}
