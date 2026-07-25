import * as crypto from 'crypto';

export interface AddressMasterRecord {
  prefecture: string;
  municipality: string;
  addressLevel1: string;
  addressLevel2: string; // "NULL" if level 1 is complete
  postalCode: string;
  source: string;
  hash: string;
}

export class NationalAddressHierarchyParser {
  /**
   * National Address Hierarchy Parser (Rule v3 Engine)
   * Schema: prefecture, municipality, address_level_1, address_level_2, postal_code, source, hash
   * Note: Municipality name is NOT an address level (自治体名は階層に含まない).
   */
  public static parseAddressRow(
    prefecture: string,
    municipality: string,
    rawAddress: string,
    postalCode: string,
    source: string = 'POSTAL+ADMIN'
  ): AddressMasterRecord {
    const cleanAddr = (rawAddress || '').replace(/"/g, '').trim();

    let level1 = '';
    let level2 = 'NULL';

    // Case 1: Check if raw address has 丁目
    if (cleanAddr.includes('丁目') || cleanAddr.includes('番地')) {
      const parts = cleanAddr.split(/(\d+丁目)/);
      const prefix = (parts[0] || '').trim();
      const chomePart = (parts[1] || '').trim();

      if (prefix.length > 0) {
        // e.g. "江場 1丁目" -> level1: 江場, level2: 1丁目
        level1 = prefix;
        level2 = chomePart || 'NULL';
      } else {
        // e.g. "1丁目" -> level1: 1丁目, level2: NULL
        level1 = cleanAddr;
        level2 = 'NULL';
      }
    } else {
      // Case 2: Level 1 is town/azatacho name (e.g. 長島町 千倉 -> level1: 長島町, level2: 千倉)
      const spaceParts = cleanAddr.split(/\s+/);
      if (spaceParts.length >= 2) {
        level1 = spaceParts[0].trim();
        level2 = spaceParts.slice(1).join(' ').trim();
      } else {
        level1 = cleanAddr;
        level2 = 'NULL';
      }
    }

    const cleanPostal = postalCode.replace(/-/g, '');
    const payload = `${prefecture}|${municipality}|${level1}|${level2}|${cleanPostal}|${source}`;
    const hash = crypto.createHash('sha256').update(payload).digest('hex');

    return {
      prefecture,
      municipality,
      addressLevel1: level1,
      addressLevel2: level2,
      postalCode: cleanPostal,
      source,
      hash
    };
  }
}
