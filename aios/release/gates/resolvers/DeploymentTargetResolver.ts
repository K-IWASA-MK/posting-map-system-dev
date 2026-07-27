/**
 * DeploymentTargetResolver.ts
 * 
 * Deployment Target Verification Gate - Resolver Layer (Sprint DTVG-02)
 * デプロイ対象の実体情報（Git Repository, Branch, Publish Root）を解決・照合し、
 * Gate-001, Gate-002, Gate-003 の判定用データを提供する。
 */

import * as path from 'path';
import { execSync } from 'child_process';
import { GateResult, VerificationStatus } from '../types/DeploymentTargetGateTypes';

export interface ResolvedRepositoryInfo {
  remoteUrl: string;
  owner: string;
  name: string;
  fullRepository: string;
}

export interface ResolvedBranchInfo {
  currentBranch: string;
  targetBranch: string;
}

export interface PublishRootCheckResult {
  assetPath: string;
  publishRoot: string;
  isWithinRoot: boolean;
}

export class DeploymentTargetResolver {
  private readonly workspaceRoot: string;

  constructor(workspaceRoot?: string) {
    this.workspaceRoot = workspaceRoot ? path.resolve(workspaceRoot) : process.cwd();
  }

  /**
   * 1. Repository Resolver (Gate-001)
   * Git Remote URL および Owner/Repo 名を動的に解決する
   */
  public resolveRepositoryInfo(): ResolvedRepositoryInfo {
    try {
      const remoteUrl = execSync('git config --get remote.origin.url', {
        cwd: this.workspaceRoot,
        encoding: 'utf-8'
      }).trim();

      const match = remoteUrl.match(/(?:[:\/])([^\/]+)\/([^\/.]+)(?:\.git)?$/);
      const owner = match ? match[1] : '';
      const name = match ? match[2] : '';
      const fullRepository = owner && name ? `${owner}/${name}` : remoteUrl;

      return {
        remoteUrl,
        owner,
        name,
        fullRepository
      };
    } catch (err) {
      return {
        remoteUrl: '',
        owner: '',
        name: '',
        fullRepository: ''
      };
    }
  }

  /**
   * Gate-001: Repository Match 検証
   */
  public verifyRepositoryMatch(requestedRepository: string): GateResult {
    const info = this.resolveRepositoryInfo();
    const normalizedRequested = requestedRepository.trim().toLowerCase();
    const normalizedResolvedFull = info.fullRepository.trim().toLowerCase();
    const normalizedResolvedName = info.name.trim().toLowerCase();

    const isMatch = 
      normalizedRequested === normalizedResolvedFull ||
      normalizedRequested === normalizedResolvedName ||
      (info.remoteUrl !== '' && info.remoteUrl.toLowerCase().includes(normalizedRequested));

    const status: VerificationStatus = isMatch ? 'PASS' : 'FAIL';
    const detail = isMatch
      ? `Repository matched: requested '${requestedRepository}', resolved '${info.fullRepository}'`
      : `Repository mismatch: requested '${requestedRepository}', resolved '${info.fullRepository}' (Remote: ${info.remoteUrl})`;

    return {
      gateId: 'Gate-001',
      name: 'Repository Match',
      status,
      detail,
      timestamp: Date.now()
    };
  }

  /**
   * 2. Branch Resolver (Gate-002)
   * カレント Git ブランチを解決する
   */
  public resolveBranchInfo(): ResolvedBranchInfo {
    try {
      const currentBranch = execSync('git rev-parse --abbrev-ref HEAD', {
        cwd: this.workspaceRoot,
        encoding: 'utf-8'
      }).trim();

      return {
        currentBranch,
        targetBranch: currentBranch
      };
    } catch (err) {
      return {
        currentBranch: 'unknown',
        targetBranch: 'unknown'
      };
    }
  }

  /**
   * Gate-002: Branch Match 検証
   */
  public verifyBranchMatch(requestedBranch: string): GateResult {
    const info = this.resolveBranchInfo();
    const isMatch = info.currentBranch === requestedBranch.trim();

    const status: VerificationStatus = isMatch ? 'PASS' : 'FAIL';
    const detail = isMatch
      ? `Branch matched: requested '${requestedBranch}', resolved '${info.currentBranch}'`
      : `Branch mismatch: requested '${requestedBranch}', resolved '${info.currentBranch}'`;

    return {
      gateId: 'Gate-002',
      name: 'Branch Match',
      status,
      detail,
      timestamp: Date.now()
    };
  }

  /**
   * 3. Publish Root Resolver (Gate-003)
   * 編集対象・成果物パスが、指定された公開ルート内に存在するかを検証する
   */
  public verifyPublishRoot(assetPath: string, targetPublishRoot: string): GateResult {
    const absoluteAsset = path.isAbsolute(assetPath)
      ? path.resolve(assetPath)
      : path.resolve(this.workspaceRoot, assetPath);

    const absolutePublishRoot = path.isAbsolute(targetPublishRoot)
      ? path.resolve(targetPublishRoot)
      : path.resolve(this.workspaceRoot, targetPublishRoot);

    const relative = path.relative(absolutePublishRoot, absoluteAsset);

    const isWithinRoot = !relative.startsWith('..') && !path.isAbsolute(relative);

    const status: VerificationStatus = isWithinRoot ? 'PASS' : 'FAIL';
    const detail = isWithinRoot
      ? `Asset path '${assetPath}' is valid within publish root '${targetPublishRoot}'`
      : `Publish Root mismatch: Asset path '${assetPath}' does NOT belong to publish root '${targetPublishRoot}'`;

    return {
      gateId: 'Gate-003',
      name: 'Publish Root Match',
      status,
      detail,
      timestamp: Date.now()
    };
  }
}
