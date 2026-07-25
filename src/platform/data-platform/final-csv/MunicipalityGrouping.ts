import { AreaRecord } from '../schema/AreaSchema';

export interface MunicipalityGroupSummary {
  municipalityName: string;
  count: number;
  areaIds: string[];
}

export class MunicipalityGrouping {
  public static groupRecords(records: AreaRecord[]): Map<string, AreaRecord[]> {
    const map = new Map<string, AreaRecord[]>();
    records.forEach(r => {
      const cityKey = r.city || 'UNKNOWN';
      if (!map.has(cityKey)) map.set(cityKey, []);
      map.get(cityKey)!.push(r);
    });
    return map;
  }

  public static summarizeGroups(records: AreaRecord[]): MunicipalityGroupSummary[] {
    const map = this.groupRecords(records);
    const summaries: MunicipalityGroupSummary[] = [];

    map.forEach((recs, city) => {
      summaries.push({
        municipalityName: city,
        count: recs.length,
        areaIds: recs.map(r => r.areaId)
      });
    });

    return summaries;
  }
}
