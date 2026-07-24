/**
 * Yokkaichi City District Resolution Module
 * Enforces Public Offices Election Act (公職選挙法) Boundary Formula:
 * MIE-03 (Yokkaichi Part) = [All Yokkaichi City Areas] - [Mie 2nd District Yokkaichi List]
 */

export interface YokkaichiBoundaryResolution {
  totalYokkaichiTowns: number;
  mie2ndDistrictTowns: string[];
  mie3rdDistrictTowns: string[];
  formula: string;
}

export class YokkaichiDistrictResolver {
  // Official Mie 2nd District Yokkaichi Areas (四日市市のうち第2区に属する区域)
  private static readonly MIE_2ND_DISTRICT_YOKKAICHI_TOWNS = [
    '日永', '日永東', '日永西', '笹川', '楠町', '内部', '塩浜', '塩浜本町',
    '海蔵', '三重', '智積', '桜', '橋北', '四郷', '小山田', '水沢', '保々',
    '下シノギ', '平津', '坂部', '八河内'
  ];

  public static resolveYokkaichiBoundary(allYokkaichiTowns: string[]): YokkaichiBoundaryResolution {
    const mie2ndSet = new Set(this.MIE_2ND_DISTRICT_YOKKAICHI_TOWNS);
    
    // MIE-03 Yokkaichi Areas = All Yokkaichi Towns - Mie 2nd District List
    const mie3rdDistrictTowns = allYokkaichiTowns.filter(town => {
      return !Array.from(mie2ndSet).some(mie2Town => town.includes(mie2Town));
    });

    return {
      totalYokkaichiTowns: allYokkaichiTowns.length,
      mie2ndDistrictTowns: this.MIE_2ND_DISTRICT_YOKKAICHI_TOWNS,
      mie3rdDistrictTowns,
      formula: "四日市市全体 - 第2区所属地域 = 第3区所属地域"
    };
  }
}
