import { ElectionHistoryRecord } from "./TurnoutDataResolver";

export interface MunicipalResearchResult {
  name: string;
  electionHistory: ElectionHistoryRecord[];
}

export interface ResearchCompilerOutput {
  district: {
    id: string;
    name: string;
  };
  municipalities: MunicipalResearchResult[];
  metadata: {
    source: string;
    version: string;
    generatedBy: string;
    generatedAt: string;
  };
}

export class ElectionResearchCompiler {
  public compile(
    districtId: string,
    districtName: string,
    municipalities: { name: string; history: ElectionHistoryRecord[] }[]
  ): ResearchCompilerOutput {
    return {
      district: {
        id: districtId,
        name: districtName
      },
      municipalities: municipalities.map((m) => ({
        name: m.name,
        electionHistory: m.history
      })),
      metadata: {
        source: "Election Master",
        version: "v1",
        generatedBy: "AIOS ElectionResearchRuntime",
        generatedAt: new Date().toISOString()
      }
    };
  }
}
