/**
 * TaskIntakeRequestModel.ts
 * 
 * AIOS Task Intake Request Model
 * 
 * 外部業務アプリケーションからAIOS Execution Runtimeへ
 * 業務依頼を行う標準リクエストインターフェースおよび型定義。
 */

import { VerificationCapabilityType } from '../../verification';
import { ExecutionTaskPriority } from '../ExecutionTaskModel';

export interface TaskIntakeRequest {
  readonly requestId: string;
  readonly sourceApplication: string;
  readonly title: string;
  readonly description: string;
  readonly priority: ExecutionTaskPriority;
  readonly requiredCapabilities: readonly VerificationCapabilityType[];
  readonly metadata?: Readonly<Record<string, any>>;
  readonly requestedAt: string;
}
