import { BoundaryEvidence } from '../resolver/DistrictBoundaryResolver';

export interface ExtractedAddressNode {
  municipality: string;
  townName: string;
  fullAddress: string;
}

export class AddressHierarchyExtractor {
  public extractHierarchy(evidence: BoundaryEvidence, rawSeedList: { city: string; town: string }[]): ExtractedAddressNode[] {
    // STEP 3: Address Hierarchy Extraction on Confirmed Boundary Areas Only
    const nodes: ExtractedAddressNode[] = [];
    const validMunSet = new Set(evidence.includedMunicipalities);

    rawSeedList.forEach(seed => {
      // Rule 1: Validate against Boundary Resolution Evidence
      const isMunValid = Array.from(validMunSet).some(m => seed.city.includes(m.replace(/（.*?）/g, '')));
      if (!isMunValid) return; // Strict rejection of out-of-boundary municipalities

      // Rule 2: Yokkaichi Subtraction Check
      if (seed.city.includes('四日市')) {
        const isMie2nd = evidence.yokkaichiResolution.mie2ndExcludedTowns.some(ex => seed.town.includes(ex));
        if (isMie2nd) return; // Reject Mie 2nd Yokkaichi areas
      }

      // Rule 3: Hierarchy Rule (Municipality + 1 Level Town)
      nodes.push({
        municipality: seed.city,
        townName: seed.town,
        fullAddress: `${seed.city}${seed.town}`
      });
    });

    return nodes;
  }
}
