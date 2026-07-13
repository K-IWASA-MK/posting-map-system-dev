export interface KnowledgeVersion {
    major: number;
    minor: number;
    patch: number;
    status: 'DRAFT' | 'VERIFIED' | 'APPROVED' | 'REUSABLE' | 'DEPRECATED' | 'ARCHIVED';
    revision: number;
    timestamp: string;
}

export const formatKnowledgeVersion = (version: KnowledgeVersion): string => {
    return `v${version.major}.${version.minor}.${version.patch}-${version.status.toLowerCase()}.${version.revision}`;
};
