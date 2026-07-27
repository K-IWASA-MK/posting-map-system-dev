/**
 * SmokeTestTypes.ts
 * 
 * Deployment Target Verification Gate - Gate-008 Deployment Smoke Test Types (Sprint DTVG-07)
 * デプロイ後の公開環境・エンドポイントを直接検証する Smoke Test 用の型および契約定義。
 */

import { VerificationStatus } from '../types/DeploymentTargetGateTypes';

export type SmokeStatus = VerificationStatus;

export type SmokeTestCheckId =
  | 'Test-001' // Public Endpoint Check
  | 'Test-002' // Published Asset Check
  | 'Test-003' // Runtime Config Check
  | 'Test-004' // Backend Health Check
  | 'Test-005' // Version Match
  | 'Test-006' // Fingerprint Verification
  | 'Test-007' // Critical Asset Check
  | 'Test-008'; // Cache Validation

export interface SmokeCheckResult {
  checkId: SmokeTestCheckId;
  name: string;
  status: SmokeStatus;
  detail: string;
  timestamp: number;
}

export interface SmokeTestRequest {
  releaseId: string;
  version: string;
  publicUrl: string;
  expectedBackendEndpoint: string;
  expectedVersion: string;
  expectedFingerprintHash?: string;
  criticalAssets?: string[];
  headers?: Record<string, string>;
}

export interface SmokeTestResult {
  releaseId: string;
  gateId: 'Gate-008';
  overallStatus: SmokeStatus;
  checks: SmokeCheckResult[];
  publicFingerprintHash?: string;
  timestamp: number;
}
