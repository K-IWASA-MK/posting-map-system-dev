export interface FlyerStockRecord {
  id: string;
  ownerId: string;
  areaId: string;
  quantity: number;
  status: string;
  createdAt: number; // timestamp
  updatedAt: number; // timestamp
}
