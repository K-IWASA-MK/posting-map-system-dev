export interface RuntimeLock {
    lockId: string;
    lockOwner: string;
    lockScope: string;
    lockType: 'EXCLUSIVE' | 'SHARED';
    acquiredAt: string;
    expiresAt: string;
    renewable: boolean;
    targetRuntime: string;
}
