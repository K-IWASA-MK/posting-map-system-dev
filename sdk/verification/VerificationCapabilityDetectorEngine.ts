/**
 * VerificationCapabilityDetectorEngine.ts
 * 
 * AIOS Verification Capability Detector Engine
 * 
 * 登録されたすべての Capability Detector を統合実行し、得られた診断結果を
 * VerificationCapabilityRegistry に安全に登録・更新した上、
 * 最新環境スナップショット（VerificationCapabilitySnapshot）をキャプチャ保存する。
 */

import { ICapabilityDetector, VerificationCapabilityDetectionResult } from './VerificationCapabilityDetector';
import { VerificationCapabilityFactory } from './VerificationCapabilityFactory';
import { VerificationCapabilityRegistry } from './VerificationCapabilityRegistry';
import { VerificationCapabilitySnapshot } from './VerificationCapabilityModel';
import { CDPDetector } from './detectors/CDPDetector';
import { GitDetector } from './detectors/GitDetector';
import { FilesystemDetector } from './detectors/FilesystemDetector';
import { APIDetector } from './detectors/APIDetector';

export interface DetectorEngineOptions {
  readonly detectors?: readonly ICapabilityDetector[];
  readonly autoRegisterDefaults?: boolean;
}

export class VerificationCapabilityDetectorEngine {
  private readonly detectors: ICapabilityDetector[];

  constructor(options: DetectorEngineOptions = {}) {
    if (options.detectors && options.detectors.length > 0) {
      this.detectors = [...options.detectors];
    } else if (options.autoRegisterDefaults !== false) {
      this.detectors = [
        new CDPDetector(),
        new GitDetector(),
        new FilesystemDetector(),
        new APIDetector()
      ];
    } else {
      this.detectors = [];
    }
  }

  /**
   * カスタム Detector を追加登録する
   */
  addDetector(detector: ICapabilityDetector): void {
    if (!detector) {
      throw new Error('[VerificationCapabilityDetectorEngine] Detector cannot be empty');
    }
    this.detectors.push(detector);
  }

  /**
   * 全 Detector を順次/並列実行し、環境自己診断を実施する
   * 得られた結果を Registry に自動反映し、最新スナップショットを返却する
   */
  async runDetection(): Promise<VerificationCapabilitySnapshot> {
    const resultsLists = await Promise.all(
      this.detectors.map(async (detector) => {
        try {
          return await detector.detect();
        } catch (err: any) {
          // 致命的例外が発生した場合でも Engine 全体を落とさず、障害Resultに変換
          return Object.freeze([]);
        }
      })
    );

    const allResults: VerificationCapabilityDetectionResult[] = resultsLists.flat();

    for (const res of allResults) {
      const existingCaps = VerificationCapabilityRegistry.getByType(res.type);
      
      if (existingCaps.length > 0) {
        // 既存 Capability のステータスおよびメタデータを更新
        const targetCap = existingCaps[0];
        VerificationCapabilityRegistry.updateStatus(targetCap.id, res.status, {
          ...(res.metadata || {}),
          ...(res.endpoint ? { endpoint: res.endpoint } : {}),
          ...(res.permission ? { permission: res.permission } : {}),
          ...(res.error ? { lastDetectionError: res.error } : {})
        });
      } else {
        // 新規 Capability の生成と登録
        const newCap = VerificationCapabilityFactory.createCapability({
          id: res.id,
          type: res.type,
          status: res.status,
          endpoint: res.endpoint,
          permission: res.permission,
          metadata: {
            ...(res.metadata || {}),
            ...(res.error ? { lastDetectionError: res.error } : {})
          }
        });
        VerificationCapabilityRegistry.register(newCap);
      }
    }

    // 診断反映後の最新全体スナップショットを生成・保存して返却
    return VerificationCapabilityRegistry.captureSnapshot();
  }

  /**
   * 現在登録されている Detector の一覧を取得する
   */
  getRegisteredDetectors(): readonly ICapabilityDetector[] {
    return Object.freeze([...this.detectors]);
  }
}
