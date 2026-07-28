/**
 * EvidenceIntegrityManager.ts
 * 
 * AIOS Evidence Integrity & Tamper Prevention Manager
 * 
 * SHA-256 暗号学的ハッシュによる証跡パッケージ全体の完全性検証および改ざん検知を行う。
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

export interface FileIntegrityEntry {
  readonly relativePath: string;
  readonly sha256: string;
}

export interface EvidenceIntegrityManifest {
  readonly packageId: string;
  readonly createdAt: string;
  readonly packageHash: string;
  readonly files: readonly FileIntegrityEntry[];
}

export class EvidenceIntegrityManager {
  /**
   * 文字列または Buffer の SHA-256 ハッシュを計算する
   */
  static calculateHash(content: string | Buffer): string {
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  /**
   * ディレクトリ配下の全証跡ファイルのハッシュマップおよび全体ハッシュマニフェストを生成する
   */
  static generateManifest(packageId: string, baseDir: string): EvidenceIntegrityManifest {
    const files: FileIntegrityEntry[] = [];
    this.collectFilesRecursive(baseDir, baseDir, files);

    // 安定した決定論的並び順
    files.sort((a, b) => a.relativePath.localeCompare(b.relativePath));

    const combinedHashes = files.map((f) => `${f.relativePath}:${f.sha256}`).join('\n');
    const packageHash = this.calculateHash(combinedHashes);

    return Object.freeze({
      packageId,
      createdAt: new Date().toISOString(),
      packageHash,
      files: Object.freeze(files)
    });
  }

  /**
   * 保存済みマニフェストと実際のディスク上ファイル群を突き合わせ、改ざんを検証する
   */
  static verifyIntegrity(baseDir: string, manifest: EvidenceIntegrityManifest): { valid: boolean; tamperedFiles: string[]; reason?: string } {
    const tamperedFiles: string[] = [];

    for (const entry of manifest.files) {
      const fullPath = path.join(baseDir, entry.relativePath);
      if (!fs.existsSync(fullPath)) {
        tamperedFiles.push(`${entry.relativePath} (MISSING)`);
        continue;
      }

      try {
        const fileBuffer = fs.readFileSync(fullPath);
        const actualHash = this.calculateHash(fileBuffer);
        if (actualHash !== entry.sha256) {
          tamperedFiles.push(`${entry.relativePath} (HASH_MISMATCH)`);
        }
      } catch (err: any) {
        tamperedFiles.push(`${entry.relativePath} (READ_ERROR: ${err.message})`);
      }
    }

    const currentManifest = this.generateManifest(manifest.packageId, baseDir);
    const valid = tamperedFiles.length === 0 && currentManifest.packageHash === manifest.packageHash;

    return {
      valid,
      tamperedFiles,
      ...(valid ? {} : { reason: `Integrity verification failed for ${tamperedFiles.length} file(s)` })
    };
  }

  private static collectFilesRecursive(currentDir: string, baseDir: string, results: FileIntegrityEntry[]): void {
    if (!fs.existsSync(currentDir)) return;

    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        this.collectFilesRecursive(fullPath, baseDir, results);
      } else if (entry.isFile() && entry.name !== 'integrity_manifest.json') {
        const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
        const content = fs.readFileSync(fullPath);
        const sha256 = this.calculateHash(content);
        results.push({ relativePath, sha256 });
      }
    }
  }
}
