import { BoundaryEvidence } from '../resolver/DistrictBoundaryResolver';

export interface AddressSeedNode {
  city: string;
  level1: string;
  level2?: string;
}

export interface ExtractedAddressNode {
  municipality: string;
  townName: string;
  fullAddress: string;
  extractionRule: 'RULE_V3_LEVEL1_COMPLETE' | 'RULE_V3_LEVEL2_COMPLETE';
}

export class AddressHierarchyExtractor {
  /**
   * Address Extraction Rule v3 Engine
   * Evaluates address string completeness rather than fixed level numbers.
   * If level1 contains "丁目", completes immediately at level 1.
   * Otherwise, combines level1 + level2 and completes at level 2.
   */
  public extractHierarchyNode(city: string, level1: string, level2?: string): ExtractedAddressNode {
    const cleanL1 = (level1 || '').trim();
    const cleanL2 = (level2 || '').trim();

    // Rule v3 Condition 1: If level 1 already contains "丁目", finish immediately at level 1
    if (cleanL1.includes('丁目') || cleanL1.includes('番地')) {
      return {
        municipality: city,
        townName: cleanL1,
        fullAddress: `${city}${cleanL1}`,
        extractionRule: 'RULE_V3_LEVEL1_COMPLETE'
      };
    }

    // Rule v3 Condition 2: Combine Level 1 + Level 2 for full address completeness
    const combinedTown = cleanL2 ? `${cleanL1}${cleanL2}` : cleanL1;
    return {
      municipality: city,
      townName: combinedTown,
      fullAddress: `${city}${combinedTown}`,
      extractionRule: 'RULE_V3_LEVEL2_COMPLETE'
    };
  }

  public extractHierarchy(evidence: BoundaryEvidence, rawSeeds: AddressSeedNode[]): ExtractedAddressNode[] {
    const nodes: ExtractedAddressNode[] = [];
    const validMunSet = new Set(evidence.includedMunicipalities);

    rawSeeds.forEach(seed => {
      // Step A: Boundary Evidence Verification
      const isMunValid = Array.from(validMunSet).some(m => seed.city.includes(m.replace(/（.*?）/g, '')));
      if (!isMunValid) return;

      // Step B: Yokkaichi Subtraction Check
      if (seed.city.includes('四日市')) {
        const isMie2nd = evidence.yokkaichiResolution.mie2ndExcludedTowns.some(ex => seed.level1.includes(ex));
        if (isMie2nd) return;
      }

      // Step C: Execute Rule v3 Engine
      const node = this.extractHierarchyNode(seed.city, seed.level1, seed.level2);
      nodes.push(node);
    });

    return nodes;
  }
}
