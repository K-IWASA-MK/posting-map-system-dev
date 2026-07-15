import { FlyerStockDto } from './FlyerStockDto';

export interface ReservationResult {
  success: boolean;
  stock?: FlyerStockDto;
  eventIds: string[];
  failureReason?: string;
}
