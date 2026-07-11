export type Edition = 'COMMUNITY' | 'STANDARD' | 'PROFESSIONAL' | 'ENTERPRISE';

export const Edition = {
  COMMUNITY: 'COMMUNITY' as Edition,
  STANDARD: 'STANDARD' as Edition,
  PROFESSIONAL: 'PROFESSIONAL' as Edition,
  ENTERPRISE: 'ENTERPRISE' as Edition
};

// Numeric priority mapping for edition validation checks
export const EditionRank: Record<Edition, number> = {
  COMMUNITY: 0,
  STANDARD: 1,
  PROFESSIONAL: 2,
  ENTERPRISE: 3
};
