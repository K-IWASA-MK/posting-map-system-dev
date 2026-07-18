import { DataSourcePolicy } from "./DataSourcePolicy";

export interface ElectionHistoryRecord {
  type: string;
  year: number;
  turnout: number;
}

export class TurnoutDataResolver {
  private static readonly TURNOUT_DATABASE: Record<string, ElectionHistoryRecord[]> = {
    "武蔵野市": [
      { type: "衆議院", year: 2024, turnout: 58.2 },
      { type: "衆議院", year: 2021, turnout: 56.8 },
      { type: "参議院", year: 2022, turnout: 54.1 }
    ],
    "小金井市": [
      { type: "衆議院", year: 2024, turnout: 56.9 }
    ],
    "西東京市": [
      { type: "衆議院", year: 2024, turnout: 55.4 }
    ],
    "守口市": [
      { type: "衆議院", year: 2024, turnout: 51.2 }
    ]
  };

  public getTurnoutHistory(municipalityName: string): ElectionHistoryRecord[] {
    const data = TurnoutDataResolver.TURNOUT_DATABASE[municipalityName];
    
    if (!data) {
      console.warn(`[TurnoutDataResolver] No turnout history for '${municipalityName}'. Sourcing policy: ${DataSourcePolicy.fallbackBehavior}`);
      return []; // ポリシーに従い推論せず空配列を返す
    }

    return data;
  }
}
