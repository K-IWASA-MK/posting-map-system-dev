export interface NationalAddressMasterRecord {
  prefecture: string;
  municipality: string;
  level1: string;
  level2: string;
  postalCode: string;
  municipalityCode: string;
  isComplete: boolean;
}

export class AddressHierarchyParser {
  /**
   * National Address Hierarchy Parser (Rule v3 Engine)
   * Deconstructs raw address strings into Prefecture, Municipality, Level 1, Level 2
   */
  public static parseAddressRow(
    munCode: string,
    postalCode: string,
    prefecture: string,
    municipality: string,
    rawAddress: string
  ): NationalAddressMasterRecord {
    const cleanAddr = (rawAddress || '').replace(/"/g, '').trim();

    // Check if level 1 already contains 丁目 (Rule v3)
    if (cleanAddr.includes('丁目') || cleanAddr.includes('番地')) {
      return {
        prefecture,
        municipality,
        level1: cleanAddr,
        level2: '-',
        postalCode: postalCode.replace(/-/g, ''),
        municipalityCode: munCode,
        isComplete: true
      };
    }

    // Split compound addresses (e.g. 江場 1丁目 -> level1: 江場, level2: 1丁目)
    const spaceMatch = cleanAddr.split(/\s+/);
    if (spaceMatch.length >= 2) {
      return {
        prefecture,
        municipality,
        level1: spaceMatch[0],
        level2: spaceMatch.slice(1).join(' '),
        postalCode: postalCode.replace(/-/g, ''),
        municipalityCode: munCode,
        isComplete: true
      };
    }

    // Default 2-level breakdown
    return {
      prefecture,
      municipality,
      level1: cleanAddr,
      level2: '-',
      postalCode: postalCode.replace(/-/g, ''),
      municipalityCode: munCode,
      isComplete: true
    };
  }
}
