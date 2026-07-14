export interface FlyerHoldingDto {
  readonly holdingId: string;
  readonly workspaceId: string;
  readonly location: string; // 保管場所
  readonly keeper: string; // 保管者
  readonly currentHoldings: number; // 現在保有枚数
  readonly updatedAt: string; // 更新日時 (ISO 8601 string)
}
