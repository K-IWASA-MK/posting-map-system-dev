import { TaskGateway } from '../../../../../sdk/gateway/TaskGateway';
import { CEODecisionInput, TaskGatewayResult } from '../../../../../sdk/gateway/models/TaskGatewayModels';

/**
 * AiosGatewayBridge
 * 
 * POSTING MAP から AIOS TaskGateway への唯一のブリッジエントリーポイント。
 * 
 * 規則 (Foundation Rules):
 * - Bridge は TaskContract の生成・変更・再生成を一切行わない。
 * - TaskContract の生成主体は AIOS TaskGateway のみとし、SSOT を遵守する。
 * - Bridge は単にリクエストを CEODecisionInput に整形し、TaskGateway.processCEODecision() へ転送する。
 */
export class AiosGatewayBridge {
  /**
   * POSTING MAP からのリクエストを受け取り、AIOS TaskGateway へ転送して TaskGatewayResult を取得する
   * 
   * @param action リクエストされたアクション名
   * @param payload リクエストパラメータ
   * @param timestamp 任意のリクエストタイムスタンプ (未指定時は TaskGateway 側に決定を委ねる)
   */
  public static acceptRequest(
    action: string, 
    payload: Record<string, any> = {}, 
    timestamp?: string
  ): TaskGatewayResult {
    const ceoInput = `POSTING_MAP_REQUEST: action=${action} payload=${JSON.stringify(payload)}`;
    
    const input: CEODecisionInput = {
      ceoInput,
      timestamp: timestamp || '',
      metadata: {
        source: 'POSTING_MAP_API',
        action,
        ...payload
      }
    };

    // AIOS Generation 10 の TaskGateway のみを唯一の生成源として呼び出す (SSOT)
    return TaskGateway.processCEODecision(input);
  }
}
