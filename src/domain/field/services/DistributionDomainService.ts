import { FlyerStock } from '../entities/FlyerStock';
import { Quantity } from '../valueobjects/Quantity';
import { FlyerReservedEvent } from '../events/FieldEvent';

export class DistributionDomainService {
  /**
   * 現場配布用のチラシ予約処理
   * ドメイン不変条件（在庫不足チェック、状態チェック）を評価し、Entity の状態を更新してドメインイベントを返す
   */
  public reserveFromStock(stock: FlyerStock, amount: Quantity): FlyerReservedEvent {
    if (stock.getStatus() === 'DEPLETED') {
      throw new Error("Cannot reserve from depleted stock");
    }

    if (stock.getQuantity().getValue() < amount.getValue()) {
      throw new Error("Insufficient stock to reserve");
    }

    // Entity 内部で状態遷移と数量の減算を実行
    stock.reserve(amount);

    return new FlyerReservedEvent(
      stock.id,
      stock.ownerId,
      amount.getValue(),
      stock.getQuantity().getValue()
    );
  }
}
