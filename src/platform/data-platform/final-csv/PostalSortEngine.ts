import { AreaRecord } from '../schema/AreaSchema';

export class PostalSortEngine {
  public static sortAscending(records: AreaRecord[]): AreaRecord[] {
    return [...records].sort((a, b) => {
      const pA = (a.postalCode || '').replace(/-/g, '');
      const pB = (b.postalCode || '').replace(/-/g, '');
      if (pA !== pB) {
        return pA.localeCompare(pB, undefined, { numeric: true });
      }
      return a.areaId.localeCompare(b.areaId, undefined, { numeric: true });
    });
  }
}
