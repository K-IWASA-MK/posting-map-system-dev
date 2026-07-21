import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import { ElectionMasterResolver } from "./ElectionMasterResolver";
import { TurnoutDataResolver } from "./TurnoutDataResolver";
import { ElectionResearchCompiler } from "./ElectionResearchCompiler";
import { ResearchValidator } from "./ResearchValidator";
import { PostingMapPathResolver } from "../../shared/PostingMapPathResolver";

export interface ResearchRequestedEvent {
  type: string;
  missionId: string;
  districtName: string;
}

export interface ResearchCompletedEvent {
  type: string;
  missionId: string;
  districtId: string;
  districtName: string;
  result: {
    path: string;
    checksum: string;
  };
}

export class ElectionResearchRuntime {
  private localWorkspaceRoot: string;
  private masterResolver: ElectionMasterResolver;
  private turnoutResolver: TurnoutDataResolver;
  private compiler: ElectionResearchCompiler;
  private validator: ResearchValidator;

  constructor(localWorkspaceRoot: string) {
    this.localWorkspaceRoot = localWorkspaceRoot;
    this.masterResolver = new ElectionMasterResolver();
    this.turnoutResolver = new TurnoutDataResolver();
    this.compiler = new ElectionResearchCompiler();
    this.validator = new ResearchValidator();
  }

  public async processEvent(event: ResearchRequestedEvent): Promise<{ success: boolean; event?: ResearchCompletedEvent; error?: string }> {
    if (!event.districtName || event.districtName.trim() === "") {
      return { success: false, error: "Invalid or empty districtName provided." };
    }

    try {
      console.log(`[ElectionResearch] Starting research for: ${event.districtName} (Mission: ${event.missionId})`);

      // 1. 選挙区 ID と市町村一覧の解決
      const mapping = this.masterResolver.resolveDistrict(event.districtName);

      // 2. 市町村別の投票率履歴データの取得
      const municipalitiesData = mapping.municipalities.map((name) => {
        const history = this.turnoutResolver.getTurnoutHistory(name);
        return { name, history };
      });

      // 3. 結果の構造化コンパイル
      const compiledResult = this.compiler.compile(
        mapping.id,
        event.districtName,
        municipalitiesData
      );

      // 4. 責任境界バリデーション（戦略・計画キーの混入ブロック）
      const isValid = this.validator.validate(compiledResult);
      if (!isValid) {
        throw new Error("Validation failed: compiled data contains unauthorized decision-making properties.");
      }

      // 出力先パスの特定
      const pathResolver = new PostingMapPathResolver(this.localWorkspaceRoot);
      const branchFolder = pathResolver.getBranchDirectory(event.districtName);
      const outputJsonPath = path.join(branchFolder, "election-research-result.json");

      // フォルダが存在しない場合は作成
      if (!fs.existsSync(branchFolder)) {
        fs.mkdirSync(branchFolder, { recursive: true });
      }

      const jsonString = JSON.stringify(compiledResult, null, 2);
      fs.writeFileSync(outputJsonPath, jsonString, "utf-8");
      console.log(`[ElectionResearch] Succeeded. Written result to ${outputJsonPath}`);

      // 5. SHA-256 チェックサムの算出
      const hash = crypto.createHash("sha256");
      hash.update(jsonString);
      const checksum = hash.digest("hex");

      // 相対パスの構築
      const relativeResultPath = `03_BRANCH/${event.districtName}/election-research-result.json`;

      // 6. 完了イベントオブジェクトの返却
      const completedEvent: ResearchCompletedEvent = {
        type: "ELECTION_RESEARCH_COMPLETED",
        missionId: event.missionId,
        districtId: mapping.id,
        districtName: event.districtName,
        result: {
          path: relativeResultPath,
          checksum
        }
      };

      return { success: true, event: completedEvent };
    } catch (err: any) {
      console.error(`[ElectionResearch] Failed. Error: ${err.message}`);
      return { success: false, error: err.message };
    }
  }
}
