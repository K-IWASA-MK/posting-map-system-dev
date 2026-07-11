export interface IndividualSummary {
  staffNo: string;
  monthlyQuantity: number;
}

export interface StaffRankingItem {
  staffNo: string;
  displayName: string;
  quantity: number;
}

export interface BranchSummary {
  workspaceId: string;
  monthlyTotal: number;
  rankings: StaffRankingItem[];
}

export interface BranchTotalItem {
  workspaceId: string;
  workspaceName: string;
  quantity: number;
}

export interface PrefectureSummary {
  prefecture: string;
  branchTotals: BranchTotalItem[];
  prefectureTotal: number;
}

export class DashboardApplicationService {
  constructor() {}

  public async getIndividualSummary(staffNo: string): Promise<IndividualSummary> {
    // Basic interface declaration. Detailed aggregation log queries will be implemented in subsequent phases.
    return {
      staffNo,
      monthlyQuantity: 1200
    };
  }

  public async getBranchSummary(workspaceId: string): Promise<BranchSummary> {
    return {
      workspaceId,
      monthlyTotal: 2500,
      rankings: [
        { staffNo: 'S001', displayName: 'Aさん', quantity: 1200 },
        { staffNo: 'S002', displayName: 'Bさん', quantity: 800 },
        { staffNo: 'S003', displayName: 'Cさん', quantity: 500 }
      ]
    };
  }

  public async getPrefectureSummary(prefectureName: string): Promise<PrefectureSummary> {
    return {
      prefecture: prefectureName,
      branchTotals: [
        { workspaceId: 'WS-01', workspaceName: '第1支部', quantity: 3000 },
        { workspaceId: 'WS-02', workspaceName: '第2支部', quantity: 2700 },
        { workspaceId: 'WS-03', workspaceName: '第3支部', quantity: 2500 }
      ],
      prefectureTotal: 8200
    };
  }
}
