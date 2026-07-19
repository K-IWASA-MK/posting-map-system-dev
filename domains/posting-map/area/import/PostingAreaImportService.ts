import { PostingAreaSchema } from "../contracts/PostingAreaContract";

export interface ImportAddressEntry {
  readonly address: string;
  readonly municipalityCode: string;
  readonly municipalityName: string;
}

export class PostingAreaImportService {
  /**
   * Imports raw addresses, sorts them by municipality name and address alphabetically,
   * chunks them into sheets of 10, generates areaIds and formats ranges.
   */
  public importAddresses(
    entries: readonly ImportAddressEntry[]
  ): PostingAreaSchema[] {
    if (!entries || entries.length === 0) {
      return [];
    }

    // Group entries by municipalityCode
    const groups: Record<string, {
      code: string;
      name: string;
      addresses: string[];
    }> = {};

    for (const entry of entries) {
      if (!groups[entry.municipalityCode]) {
        groups[entry.municipalityCode] = {
          code: entry.municipalityCode,
          name: entry.municipalityName,
          addresses: []
        };
      }
      groups[entry.municipalityCode].addresses.push(entry.address);
    }

    // Get sorted municipalities list (Japanese hiragana/alphabetical order by name)
    const sortedMunicipalities = Object.values(groups).sort((a, b) =>
      a.name.localeCompare(b.name, "ja")
    );

    const areas: PostingAreaSchema[] = [];

    for (const muni of sortedMunicipalities) {
      // Sort addresses within the municipality alphabetically
      const sortedAddresses = [...muni.addresses].sort((a, b) =>
        a.localeCompare(b, "ja")
      );

      // Chunk into sheets of 10
      const chunkSize = 10;
      let sheetNumber = 1;

      for (let i = 0; i < sortedAddresses.length; i += chunkSize) {
        const chunk = sortedAddresses.slice(i, i + chunkSize);
        
        const areaId = `${muni.code}-${sheetNumber.toString().padStart(4, "0")}`;
        const firstAddr = chunk[0];
        const lastAddr = chunk[chunk.length - 1];
        const addressRange = chunk.length === 1 ? firstAddr : `${firstAddr}〜${lastAddr}`;

        areas.push({
          areaId,
          municipalityCode: muni.code,
          municipalityName: muni.name,
          sheetNumber,
          addressRange,
          addressCount: chunk.length,
          managementNumber: areaId, // Map sheet code to managementNumber
          distributionStatus: "UNASSIGNED",
          assignee: undefined,
          sourceAddresses: chunk
        });

        sheetNumber++;
      }
    }

    return areas;
  }
}
