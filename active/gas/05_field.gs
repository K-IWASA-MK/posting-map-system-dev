// =========================================
// Generated: active/gas/05_field.gs
// =========================================

// --- Source: src/domain/field/repositories/IDistributorRepository.ts ---

interface IDistributorRepository {
  findById(id: string): Promise<Distributor | undefined>;
  save(distributor: Distributor): Promise<void>;
}


// --- Source: src/domain/field/repositories/IFlyerRepository.ts ---

interface IFlyerRepository {
  findByOwner(ownerId: string): Promise<FlyerStock[]>;
  findById(id: string): Promise<FlyerStock | undefined>;
  save(flyer: FlyerStock): Promise<void>;
}


// --- Source: src/domain/field/events/FieldEvent.ts ---
interface FieldEvent {
  readonly eventId: string;
  readonly eventType: string;
  readonly occurredAt: Date;
  readonly aggregateId: string;
}

class FlyerStockCreatedEvent implements FieldEvent {
  public readonly eventId: string;
  public readonly eventType = 'FlyerStockCreatedEvent';
  public readonly occurredAt: Date;
  public readonly aggregateId: string;

  constructor(
    public readonly flyerStockId: string,
    public readonly ownerId: string,
    public readonly areaId: string,
    public readonly initialQuantity: number
  ) {
    this.aggregateId = flyerStockId;
    this.occurredAt = new Date();
    this.eventId = `EV-FSC-${flyerStockId}-${this.occurredAt.getTime()}`;
  }
}

class FlyerReservedEvent implements FieldEvent {
  public readonly eventId: string;
  public readonly eventType = 'FlyerReservedEvent';
  public readonly occurredAt: Date;
  public readonly aggregateId: string;

  constructor(
    public readonly flyerStockId: string,
    public readonly ownerId: string,
    public readonly reservedAmount: number,
    public readonly remainingAmount: number
  ) {
    this.aggregateId = flyerStockId;
    this.occurredAt = new Date();
    this.eventId = `EV-FR-${flyerStockId}-${this.occurredAt.getTime()}`;
  }
}


// --- Source: src/domain/field/services/DistributionDomainService.ts ---

class DistributionDomainService {
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


// --- Source: src/domain/field/entities/DistributionArea.ts ---

class DistributionArea {
  public readonly areaId: AreaId;
  public readonly name: string;
  public readonly postalCodes: string[];
  public readonly boundaries: Location[];

  constructor(params: {
    areaId: AreaId;
    name: string;
    postalCodes: string[];
    boundaries: Location[];
  }) {
    if (!params.name || params.name.trim().length === 0) {
      throw new Error("Area name cannot be empty");
    }
    this.areaId = params.areaId;
    this.name = params.name;
    this.postalCodes = [...params.postalCodes];
    this.boundaries = [...params.boundaries];
  }
}


// --- Source: src/domain/field/entities/Distributor.ts ---

type DistributorStatus = 'ACTIVE' | 'INACTIVE';

class Distributor {
  public readonly id: string;
  public readonly name: string;
  public readonly identityId: string;
  private areaIds: AreaId[];
  private status: DistributorStatus;

  constructor(params: {
    id: string;
    name: string;
    identityId: string;
    areaIds: AreaId[];
    status: DistributorStatus;
  }) {
    if (!params.id || params.id.trim().length === 0) {
      throw new Error("Distributor ID cannot be empty");
    }
    if (!params.name || params.name.trim().length === 0) {
      throw new Error("Distributor name cannot be empty");
    }
    if (!params.identityId || params.identityId.trim().length === 0) {
      throw new Error("Distributor identity ID cannot be empty");
    }
    this.id = params.id;
    this.name = params.name;
    this.identityId = params.identityId;
    this.areaIds = [...params.areaIds];
    this.status = params.status;
  }

  public getAreaIds(): AreaId[] {
    return [...this.areaIds];
  }

  public getStatus(): DistributorStatus {
    return this.status;
  }

  public activate(): void {
    this.status = 'ACTIVE';
  }

  public deactivate(): void {
    this.status = 'INACTIVE';
  }

  public assignArea(areaId: AreaId): void {
    if (this.areaIds.some(id => id.equals(areaId))) {
      return;
    }
    this.areaIds.push(areaId);
  }

  public unassignArea(areaId: AreaId): void {
    this.areaIds = this.areaIds.filter(id => !id.equals(areaId));
  }
}


// --- Source: src/domain/field/entities/FlyerStock.ts ---

type FlyerStockStatus = 'AVAILABLE' | 'RESERVED' | 'DEPLETED';

class FlyerStock {
  public readonly id: string;
  public readonly ownerId: string;
  public readonly areaId: AreaId;
  private quantity: Quantity;
  private status: FlyerStockStatus;
  public readonly createdAt: Date;
  private updatedAt: Date;

  constructor(params: {
    id: string;
    ownerId: string;
    areaId: AreaId;
    quantity: Quantity;
    status: FlyerStockStatus;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    if (!params.id || params.id.trim().length === 0) {
      throw new Error("FlyerStock ID cannot be empty");
    }
    if (!params.ownerId || params.ownerId.trim().length === 0) {
      throw new Error("Owner ID cannot be empty");
    }
    this.id = params.id;
    this.ownerId = params.ownerId;
    this.areaId = params.areaId;
    this.quantity = params.quantity;
    this.status = params.status;
    this.createdAt = params.createdAt || new Date();
    this.updatedAt = params.updatedAt || new Date();
  }

  public getQuantity(): Quantity {
    return this.quantity;
  }

  public getStatus(): FlyerStockStatus {
    return this.status;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }

  public reserve(amount: Quantity): void {
    if (this.status === 'DEPLETED') {
      throw new Error("Cannot reserve from depleted stock");
    }
    if (this.quantity.getValue() < amount.getValue()) {
      throw new Error("Insufficient stock to reserve");
    }
    
    this.quantity = this.quantity.subtract(amount);
    
    if (this.quantity.getValue() === 0) {
      this.status = 'DEPLETED';
    } else {
      this.status = 'RESERVED';
    }
    this.updatedAt = new Date();
  }

  public replenish(amount: Quantity): void {
    this.quantity = this.quantity.add(amount);
    this.status = 'AVAILABLE';
    this.updatedAt = new Date();
  }
}


// --- Source: src/domain/field/valueobjects/AreaId.ts ---
class AreaId {
  private readonly value: string;

  constructor(value: string) {
    if (!value) {
      throw new Error("AreaId cannot be empty");
    }
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      throw new Error("AreaId cannot be empty or whitespace");
    }
    this.value = trimmed;
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: AreaId): boolean {
    return this.value === other.getValue();
  }
}


// --- Source: src/domain/field/valueobjects/Location.ts ---
class Location {
  public readonly latitude: number;
  public readonly longitude: number;
  public readonly accuracy: number;

  constructor(latitude: number, longitude: number, accuracy: number) {
    if (latitude < -90 || latitude > 90) {
      throw new Error("Latitude must be between -90 and 90 degrees");
    }
    if (longitude < -180 || longitude > 180) {
      throw new Error("Longitude must be between -180 and 180 degrees");
    }
    if (accuracy < 0) {
      throw new Error("Accuracy cannot be negative");
    }
    this.latitude = latitude;
    this.longitude = longitude;
    this.accuracy = accuracy;
  }

  public equals(other: Location): boolean {
    return this.latitude === other.latitude &&
           this.longitude === other.longitude &&
           this.accuracy === other.accuracy;
  }
}


// --- Source: src/domain/field/valueobjects/Quantity.ts ---
class Quantity {
  private readonly value: number;

  constructor(value: number) {
    if (!Number.isInteger(value)) {
      throw new Error("Quantity must be an integer");
    }
    if (value < 0) {
      throw new Error("Quantity cannot be negative");
    }
    this.value = value;
  }

  public getValue(): number {
    return this.value;
  }

  public add(other: Quantity): Quantity {
    return new Quantity(this.value + other.getValue());
  }

  public subtract(other: Quantity): Quantity {
    if (this.value < other.getValue()) {
      throw new Error("Resulting quantity cannot be negative");
    }
    return new Quantity(this.value - other.getValue());
  }

  public equals(other: Quantity): boolean {
    return this.value === other.getValue();
  }
}


// --- Source: src/application/events/ApplicationEventPublisher.ts ---

class ApplicationEventPublisher {
  public readonly publishedEvents: FieldEvent[] = [];

  public publish(event: FieldEvent): void {
    // Stub implementation for S5-3.
    // In the future, this will forward events to the Monitoring/AIOS Event Bus.
    this.publishedEvents.push(event);
  }
}


// --- Source: src/application/field/index.ts ---
// Export DTOs
* from './dto/FlyerStockDto';
* from './dto/DistributorDto';
* from './dto/ReservationRequest';
* from './dto/ReservationResult';

// Export Commands
* from './commands/ReserveFlyerCommand';
* from './commands/CreateFlyerStockCommand';

// Export Services
* from './services/FlyerStockApplicationService';
* from './services/DistributionApplicationService';


// --- Source: src/application/field/dto/DistributorDto.ts ---
interface DistributorDto {
  id: string;
  name: string;
  identityId: string;
  status: string;
  areaIds: string[];
}


// --- Source: src/application/field/dto/FlyerStockDto.ts ---
interface FlyerStockDto {
  id: string;
  ownerId: string;
  areaId: string;
  quantity: number;
  status: string;
  updatedAt: string;
}


// --- Source: src/application/field/dto/ReservationRequest.ts ---
interface ReservationRequest {
  flyerStockId: string;
  distributorId: string;
  quantity: number;
}


// --- Source: src/application/field/dto/ReservationResult.ts ---

interface ReservationResult {
  success: boolean;
  stock?: FlyerStockDto;
  eventIds: string[];
  failureReason?: string;
}


// --- Source: src/application/field/commands/CreateFlyerStockCommand.ts ---
class CreateFlyerStockCommand {
  constructor(
    public readonly flyerStockId: string,
    public readonly ownerId: string,
    public readonly areaId: string,
    public readonly quantity: number
  ) {
    if (!flyerStockId || flyerStockId.trim().length === 0) {
      throw new Error("flyerStockId is required");
    }
    if (!ownerId || ownerId.trim().length === 0) {
      throw new Error("ownerId is required");
    }
    if (!areaId || areaId.trim().length === 0) {
      throw new Error("areaId is required");
    }
    if (quantity < 0) {
      throw new Error("quantity cannot be negative");
    }
  }
}


// --- Source: src/application/field/commands/ReserveFlyerCommand.ts ---
class ReserveFlyerCommand {
  constructor(
    public readonly flyerStockId: string,
    public readonly distributorId: string,
    public readonly quantity: number
  ) {
    if (!flyerStockId || flyerStockId.trim().length === 0) {
      throw new Error("flyerStockId is required");
    }
    if (!distributorId || distributorId.trim().length === 0) {
      throw new Error("distributorId is required");
    }
    if (quantity <= 0) {
      throw new Error("quantity must be greater than 0");
    }
  }
}


// --- Source: src/application/field/services/DistributionApplicationService.ts ---

class DistributionApplicationService {
  constructor(private distributorRepository: IDistributorRepository) {}

  public async getDistributor(id: string): Promise<DistributorDto | undefined> {
    const dist = await this.distributorRepository.findById(id);
    if (!dist) return undefined;
    return this.toDto(dist);
  }

  public async assignArea(distributorId: string, areaIdStr: string): Promise<DistributorDto> {
    const dist = await this.distributorRepository.findById(distributorId);
    if (!dist) {
      throw new Error(`Distributor not found: ${distributorId}`);
    }

    dist.assignArea(new AreaId(areaIdStr));
    await this.distributorRepository.save(dist);
    return this.toDto(dist);
  }

  public async activateDistributor(distributorId: string): Promise<DistributorDto> {
    const dist = await this.distributorRepository.findById(distributorId);
    if (!dist) {
      throw new Error(`Distributor not found: ${distributorId}`);
    }

    dist.activate();
    await this.distributorRepository.save(dist);
    return this.toDto(dist);
  }

  private toDto(dist: Distributor): DistributorDto {
    return {
      id: dist.id,
      name: dist.name,
      identityId: dist.identityId,
      status: dist.getStatus(),
      areaIds: dist.getAreaIds().map(id => id.getValue())
    };
  }
}


// --- Source: src/application/field/services/FlyerStockApplicationService.ts ---

class FlyerStockApplicationService {
  constructor(
    private flyerRepository: IFlyerRepository,
    private domainService: DistributionDomainService,
    private eventPublisher: ApplicationEventPublisher
  ) {}

  public async getStock(id: string): Promise<FlyerStockDto | undefined> {
    const stock = await this.flyerRepository.findById(id);
    if (!stock) return undefined;
    return this.toDto(stock);
  }

  public async createStock(command: CreateFlyerStockCommand): Promise<FlyerStockDto> {
    const existing = await this.flyerRepository.findById(command.flyerStockId);
    if (existing) {
      throw new Error(`Flyer stock with ID ${command.flyerStockId} already exists`);
    }

    const stock = new FlyerStock({
      id: command.flyerStockId,
      ownerId: command.ownerId,
      areaId: new AreaId(command.areaId),
      quantity: new Quantity(command.quantity),
      status: 'AVAILABLE'
    });

    await this.flyerRepository.save(stock);
    return this.toDto(stock);
  }

  public async reserveStock(command: ReserveFlyerCommand): Promise<ReservationResult> {
    try {
      const stock = await this.flyerRepository.findById(command.flyerStockId);
      if (!stock) {
        return {
          success: false,
          eventIds: [],
          failureReason: `Flyer stock not found: ${command.flyerStockId}`
        };
      }

      // Domain Rule evaluation and Entity transition delegated to Domain Service
      const event = this.domainService.reserveFromStock(stock, new Quantity(command.quantity));

      // Persistence
      await this.flyerRepository.save(stock);

      // Event Publish
      this.eventPublisher.publish(event);

      return {
        success: true,
        stock: this.toDto(stock),
        eventIds: [event.eventId]
      };
    } catch (e: any) {
      return {
        success: false,
        eventIds: [],
        failureReason: e.message || "Unknown error during reservation"
      };
    }
  }

  private toDto(stock: FlyerStock): FlyerStockDto {
    return {
      id: stock.id,
      ownerId: stock.ownerId,
      areaId: stock.areaId.getValue(),
      quantity: stock.getQuantity().getValue(),
      status: stock.getStatus(),
      updatedAt: stock.getUpdatedAt().toISOString()
    };
  }
}


// --- Source: src/infrastructure/spreadsheet/SpreadsheetClient.ts ---

class SpreadsheetClient {
  private static instance: SpreadsheetClient | null = null;
  private cachedSpreadsheet: any = null;
  private configProvider: GasConfigurationProvider;

  private constructor() {
    this.configProvider = GasConfigurationProvider.getInstance();
  }

  public static getInstance(): SpreadsheetClient {
    if (!SpreadsheetClient.instance) {
      SpreadsheetClient.instance = new SpreadsheetClient();
    }
    return SpreadsheetClient.instance;
  }

  /**
   * For testing, allows injecting a mocked instance or setting cached spreadsheet.
   */
  public static setMockInstance(mock: SpreadsheetClient): void {
    SpreadsheetClient.instance = mock;
  }

  public getSpreadsheet(): any {
    if (this.cachedSpreadsheet) return this.cachedSpreadsheet;
    
    if (typeof SpreadsheetApp !== 'undefined') {
      const ssId = this.configProvider.getSpreadsheetId();
      this.cachedSpreadsheet = SpreadsheetApp.openById(ssId);
      return this.cachedSpreadsheet;
    }
    return null;
  }

  public setSpreadsheet(ss: any): void {
    this.cachedSpreadsheet = ss;
  }
}

declare const SpreadsheetApp: any;


// --- Source: src/infrastructure/spreadsheet/SpreadsheetReader.ts ---

class SpreadsheetReader {
  private client: SpreadsheetClient;

  constructor() {
    this.client = SpreadsheetClient.getInstance();
  }

  public readAll(sheetName: string): any[][] {
    const ss = this.client.getSpreadsheet();
    if (!ss) return [];

    try {
      const sheet = ss.getSheetByName(sheetName);
      if (!sheet) return [];

      const lastRow = sheet.getLastRow();
      const lastCol = sheet.getLastColumn();
      if (lastRow === 0 || lastCol === 0) return [];

      return sheet.getRange(1, 1, lastRow, lastCol).getValues();
    } catch (e) {
      console.error(`[SpreadsheetReader] Error reading sheet ${sheetName}:`, e);
      return [];
    }
  }

  public readRange(sheetName: string, startRow: number, startCol: number, numRows: number, numCols: number): any[][] {
    const ss = this.client.getSpreadsheet();
    if (!ss) return [];

    try {
      const sheet = ss.getSheetByName(sheetName);
      if (!sheet) return [];

      return sheet.getRange(startRow, startCol, numRows, numCols).getValues();
    } catch (e) {
      console.error(`[SpreadsheetReader] Error reading range from ${sheetName}:`, e);
      return [];
    }
  }
}


// --- Source: src/infrastructure/spreadsheet/SpreadsheetWriter.ts ---

class SpreadsheetWriter {
  private client: SpreadsheetClient;

  constructor() {
    this.client = SpreadsheetClient.getInstance();
  }

  public appendRows(sheetName: string, rows: any[][]): void {
    const ss = this.client.getSpreadsheet();
    if (!ss) return;

    try {
      const sheet = ss.getSheetByName(sheetName);
      if (!sheet) return;

      const lastRow = sheet.getLastRow();
      
      const targetRow = lastRow === 0 ? 1 : lastRow + 1;
      const targetCol = 1;
      
      if (rows.length === 0) return;
      sheet.getRange(targetRow, targetCol, rows.length, rows[0].length).setValues(rows);
    } catch (e) {
      console.error(`[SpreadsheetWriter] Error appending rows to ${sheetName}:`, e);
    }
  }

  public updateRange(sheetName: string, startRow: number, startCol: number, values: any[][]): void {
    const ss = this.client.getSpreadsheet();
    if (!ss) return;

    try {
      const sheet = ss.getSheetByName(sheetName);
      if (!sheet) return;

      if (values.length === 0) return;
      sheet.getRange(startRow, startCol, values.length, values[0].length).setValues(values);
    } catch (e) {
      console.error(`[SpreadsheetWriter] Error updating range in ${sheetName}:`, e);
    }
  }
}


// --- Source: src/infrastructure/repository/field/DistributorRepositoryMapper.ts ---

class DistributorRepositoryMapper {
  public static toEntity(record: DistributorRecord): Distributor {
    const status = record.status.toUpperCase();
    if (status !== 'ACTIVE' && status !== 'INACTIVE') {
      throw new Error(`Invalid distributor status: ${record.status}`);
    }

    const areaIds = record.areaIds.map(id => new AreaId(id));

    return new Distributor({
      id: record.id,
      name: record.name,
      identityId: record.identityId,
      areaIds,
      status: status as DistributorStatus
    });
  }

  public static toRecord(entity: Distributor): DistributorRecord {
    return {
      id: entity.id,
      name: entity.name,
      identityId: entity.identityId,
      areaIds: entity.getAreaIds().map(id => id.getValue()),
      status: entity.getStatus()
    };
  }
}


// --- Source: src/infrastructure/repository/field/FlyerRepositoryMapper.ts ---

class FlyerRepositoryMapper {
  public static toEntity(record: FlyerStockRecord): FlyerStock {
    // 不正データ防御 (Spreadsheetは外部入力)
    if (record.quantity < 0) {
      throw new Error(`Invalid stock quantity: ${record.quantity}. Must be non-negative.`);
    }
    const status = record.status.toUpperCase();
    if (status !== 'AVAILABLE' && status !== 'RESERVED' && status !== 'DEPLETED') {
      throw new Error(`Invalid stock status: ${record.status}`);
    }

    return new FlyerStock({
      id: record.id,
      ownerId: record.ownerId,
      areaId: new AreaId(record.areaId),
      quantity: new Quantity(record.quantity),
      status: status as FlyerStockStatus,
      createdAt: new Date(record.createdAt),
      updatedAt: new Date(record.updatedAt)
    });
  }

  public static toRecord(entity: FlyerStock): FlyerStockRecord {
    return {
      id: entity.id,
      ownerId: entity.ownerId,
      areaId: entity.areaId.getValue(),
      quantity: entity.getQuantity().getValue(),
      status: entity.getStatus(),
      createdAt: entity.createdAt.getTime(),
      updatedAt: entity.getUpdatedAt().getTime()
    };
  }
}


// --- Source: src/infrastructure/repository/field/SpreadsheetDistributorRepository.ts ---

class SpreadsheetDistributorRepository implements IDistributorRepository {
  private reader: SpreadsheetReader;
  private writer: SpreadsheetWriter;
  private sheetName = 'Distributors';

  constructor() {
    this.reader = new SpreadsheetReader();
    this.writer = new SpreadsheetWriter();
  }

  public async findById(id: string): Promise<Distributor | undefined> {
    const rows = this.reader.readAll(this.sheetName);
    if (rows.length <= 1) return undefined;

    const headers = rows[0];
    const idIdx = headers.indexOf('ID');
    const nameIdx = headers.indexOf('Name');
    const identityIdx = headers.indexOf('Identity ID');
    const areaIdsIdx = headers.indexOf('Area IDs');
    const statusIdx = headers.indexOf('Status');

    if (idIdx === -1) return undefined;

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (String(row[idIdx]) === id) {
        const rawAreaIds = areaIdsIdx !== -1 && row[areaIdsIdx] 
          ? String(row[areaIdsIdx]).split(',').map(s => s.trim()).filter(s => s.length > 0)
          : [];
        const record: DistributorRecord = {
          id: String(row[idIdx]),
          name: nameIdx !== -1 ? String(row[nameIdx]) : '',
          identityId: identityIdx !== -1 ? String(row[identityIdx]) : '',
          areaIds: rawAreaIds,
          status: statusIdx !== -1 ? String(row[statusIdx]) : 'INACTIVE'
        };
        return DistributorRepositoryMapper.toEntity(record);
      }
    }
    return undefined;
  }

  public async findByArea(areaId: AreaId): Promise<Distributor[]> {
    const rows = this.reader.readAll(this.sheetName);
    if (rows.length <= 1) return [];

    const headers = rows[0];
    const idIdx = headers.indexOf('ID');
    const nameIdx = headers.indexOf('Name');
    const identityIdx = headers.indexOf('Identity ID');
    const areaIdsIdx = headers.indexOf('Area IDs');
    const statusIdx = headers.indexOf('Status');

    const list: Distributor[] = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const rawAreaIds = areaIdsIdx !== -1 && row[areaIdsIdx] 
        ? String(row[areaIdsIdx]).split(',').map(s => s.trim()).filter(s => s.length > 0)
        : [];
      if (rawAreaIds.includes(areaId.getValue())) {
        const record: DistributorRecord = {
          id: idIdx !== -1 ? String(row[idIdx]) : '',
          name: nameIdx !== -1 ? String(row[nameIdx]) : '',
          identityId: identityIdx !== -1 ? String(row[identityIdx]) : '',
          areaIds: rawAreaIds,
          status: statusIdx !== -1 ? String(row[statusIdx]) : 'INACTIVE'
        };
        list.push(DistributorRepositoryMapper.toEntity(record));
      }
    }
    return list;
  }

  public async save(distributor: Distributor): Promise<void> {
    const rows = this.reader.readAll(this.sheetName);
    const record = DistributorRepositoryMapper.toRecord(distributor);

    const headers = rows.length > 0 ? rows[0] : ['ID', 'Name', 'Identity ID', 'Area IDs', 'Status'];
    
    const idIdx = headers.indexOf('ID');
    const nameIdx = headers.indexOf('Name');
    const identityIdx = headers.indexOf('Identity ID');
    const areaIdsIdx = headers.indexOf('Area IDs');
    const statusIdx = headers.indexOf('Status');

    // Find row index to update
    let rowIndex = -1;
    if (idIdx !== -1) {
      for (let i = 1; i < rows.length; i++) {
        if (String(rows[i][idIdx]) === distributor.id) {
          rowIndex = i + 1; // 1-indexed and header-inclusive
          break;
        }
      }
    }

    const rowValues = headers.map(h => {
      if (h === 'ID') return record.id;
      if (h === 'Name') return record.name;
      if (h === 'Identity ID') return record.identityId;
      if (h === 'Area IDs') return record.areaIds.join(',');
      if (h === 'Status') return record.status;
      return '';
    });

    if (rowIndex !== -1) {
      // Update existing
      this.writer.updateRange(this.sheetName, rowIndex, 1, [rowValues]);
    } else {
      // Append new
      if (rows.length === 0) {
        this.writer.appendRows(this.sheetName, [headers, rowValues]);
      } else {
        this.writer.appendRows(this.sheetName, [rowValues]);
      }
    }
  }
}


// --- Source: src/infrastructure/repository/field/SpreadsheetFlyerRepository.ts ---

class SpreadsheetFlyerRepository implements IFlyerRepository {
  private reader: SpreadsheetReader;
  private writer: SpreadsheetWriter;
  private sheetName = 'Flyers';

  constructor() {
    this.reader = new SpreadsheetReader();
    this.writer = new SpreadsheetWriter();
  }

  public async findByOwner(ownerId: string): Promise<FlyerStock[]> {
    const rows = this.reader.readAll(this.sheetName);
    if (rows.length <= 1) return [];

    const headers = rows[0];
    const idIdx = headers.indexOf('ID');
    const ownerIdx = headers.indexOf('Owner ID');
    const areaIdx = headers.indexOf('Area ID');
    const qtyIdx = headers.indexOf('Quantity');
    const statusIdx = headers.indexOf('Status');
    const createdIdx = headers.indexOf('Created At');
    const updatedIdx = headers.indexOf('Updated At');

    const list: FlyerStock[] = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (ownerIdx !== -1 && String(row[ownerIdx]) === ownerId) {
        const record: FlyerStockRecord = {
          id: idIdx !== -1 ? String(row[idIdx]) : '',
          ownerId: String(row[ownerIdx]),
          areaId: areaIdx !== -1 ? String(row[areaIdx]) : '',
          quantity: qtyIdx !== -1 ? Number(row[qtyIdx]) : 0,
          status: statusIdx !== -1 ? String(row[statusIdx]) : 'AVAILABLE',
          createdAt: createdIdx !== -1 ? Number(row[createdIdx]) : Date.now(),
          updatedAt: updatedIdx !== -1 ? Number(row[updatedIdx]) : Date.now()
        };
        list.push(FlyerRepositoryMapper.toEntity(record));
      }
    }
    return list;
  }

  public async findById(id: string): Promise<FlyerStock | undefined> {
    const rows = this.reader.readAll(this.sheetName);
    if (rows.length <= 1) return undefined;

    const headers = rows[0];
    const idIdx = headers.indexOf('ID');
    const ownerIdx = headers.indexOf('Owner ID');
    const areaIdx = headers.indexOf('Area ID');
    const qtyIdx = headers.indexOf('Quantity');
    const statusIdx = headers.indexOf('Status');
    const createdIdx = headers.indexOf('Created At');
    const updatedIdx = headers.indexOf('Updated At');

    if (idIdx === -1) return undefined;

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (String(row[idIdx]) === id) {
        const record: FlyerStockRecord = {
          id: String(row[idIdx]),
          ownerId: ownerIdx !== -1 ? String(row[ownerIdx]) : '',
          areaId: areaIdx !== -1 ? String(row[areaIdx]) : '',
          quantity: qtyIdx !== -1 ? Number(row[qtyIdx]) : 0,
          status: statusIdx !== -1 ? String(row[statusIdx]) : 'AVAILABLE',
          createdAt: createdIdx !== -1 ? Number(row[createdIdx]) : Date.now(),
          updatedAt: updatedIdx !== -1 ? Number(row[updatedIdx]) : Date.now()
        };
        return FlyerRepositoryMapper.toEntity(record);
      }
    }
    return undefined;
  }

  public async findAvailable(areaId: AreaId): Promise<FlyerStock[]> {
    const rows = this.reader.readAll(this.sheetName);
    if (rows.length <= 1) return [];

    const headers = rows[0];
    const idIdx = headers.indexOf('ID');
    const ownerIdx = headers.indexOf('Owner ID');
    const areaIdx = headers.indexOf('Area ID');
    const qtyIdx = headers.indexOf('Quantity');
    const statusIdx = headers.indexOf('Status');
    const createdIdx = headers.indexOf('Created At');
    const updatedIdx = headers.indexOf('Updated At');

    const list: FlyerStock[] = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (areaIdx !== -1 && String(row[areaIdx]) === areaId.getValue()) {
        const status = statusIdx !== -1 ? String(row[statusIdx]).toUpperCase() : '';
        if (status === 'AVAILABLE' || status === 'RESERVED') {
          const record: FlyerStockRecord = {
            id: idIdx !== -1 ? String(row[idIdx]) : '',
            ownerId: ownerIdx !== -1 ? String(row[ownerIdx]) : '',
            areaId: String(row[areaIdx]),
            quantity: qtyIdx !== -1 ? Number(row[qtyIdx]) : 0,
            status,
            createdAt: createdIdx !== -1 ? Number(row[createdIdx]) : Date.now(),
            updatedAt: updatedIdx !== -1 ? Number(row[updatedIdx]) : Date.now()
          };
          list.push(FlyerRepositoryMapper.toEntity(record));
        }
      }
    }
    return list;
  }

  public async exists(id: string): Promise<boolean> {
    const flyer = await this.findById(id);
    return flyer !== undefined;
  }

  public async save(stock: FlyerStock): Promise<void> {
    const rows = this.reader.readAll(this.sheetName);
    const record = FlyerRepositoryMapper.toRecord(stock);

    const headers = rows.length > 0 ? rows[0] : ['ID', 'Owner ID', 'Area ID', 'Quantity', 'Status', 'Created At', 'Updated At'];
    
    const idIdx = headers.indexOf('ID');
    const ownerIdx = headers.indexOf('Owner ID');
    const areaIdx = headers.indexOf('Area ID');
    const qtyIdx = headers.indexOf('Quantity');
    const statusIdx = headers.indexOf('Status');
    const createdIdx = headers.indexOf('Created At');
    const updatedIdx = headers.indexOf('Updated At');

    // Find row index to update
    let rowIndex = -1;
    if (idIdx !== -1) {
      for (let i = 1; i < rows.length; i++) {
        if (String(rows[i][idIdx]) === stock.id) {
          rowIndex = i + 1; // 1-indexed and header-inclusive
          break;
        }
      }
    }

    const rowValues = headers.map(h => {
      if (h === 'ID') return record.id;
      if (h === 'Owner ID') return record.ownerId;
      if (h === 'Area ID') return record.areaId;
      if (h === 'Quantity') return record.quantity;
      if (h === 'Status') return record.status;
      if (h === 'Created At') return record.createdAt;
      if (h === 'Updated At') return record.updatedAt;
      return '';
    });

    if (rowIndex !== -1) {
      // Update existing
      this.writer.updateRange(this.sheetName, rowIndex, 1, [rowValues]);
    } else {
      // Append new
      if (rows.length === 0) {
        // If sheet is empty, write headers first
        this.writer.appendRows(this.sheetName, [headers, rowValues]);
      } else {
        this.writer.appendRows(this.sheetName, [rowValues]);
      }
    }
  }
}


// --- Source: src/api/field/DistributorHandler.ts ---

class DistributorHandler implements EndpointHandler {
  constructor(private distributionAppService: DistributionApplicationService) {}

  public async execute(request: ApiRequest, context: ApiExecutionContext): Promise<ApiResponse> {
    try {
      const id = request.pathParams.id;
      if (!id || id.trim().length === 0) {
        throw new Error('id is required');
      }

      const dto = await this.distributionAppService.getDistributor(id);
      if (!dto) {
        throw new Error(`Distributor not found: ${id}`);
      }

      return FieldApiMapper.toSuccessResponse(dto, request, context);
    } catch (error: any) {
      const apiException = FieldApiMapper.toApiException(error, request.requestId);
      return ExceptionMapper.toResponse(apiException, request, context);
    }
  }
}


// --- Source: src/api/field/FieldApiException.ts ---

class FieldApiException extends ApiException {
  public readonly category: ExceptionCategory;
  public readonly code: string;
  public readonly status: number;

  constructor(params: {
    category: ExceptionCategory;
    code: string;
    status: number;
    internalMessage: string;
    externalMessage: string;
    requestId: string;
  }) {
    super({
      internalMessage: params.internalMessage,
      externalMessage: params.externalMessage,
      metadata: {
        timestamp: Date.now(),
        requestId: params.requestId
      }
    });
    this.category = params.category;
    this.code = params.code;
    this.status = params.status;
  }
}


// --- Source: src/api/field/FieldApiMapper.ts ---

class FieldApiMapper {
  /**
   * Translates arbitrary domain/application errors into unified FieldApiException.
   */
  public static toApiException(error: Error, requestId: string): FieldApiException {
    const message = error.message || 'Unknown field operations error';
    
    // 404 Not Found mappings
    if (message.includes('not found') || message.includes('notFound')) {
      return new FieldApiException({
        category: ExceptionCategory.VALIDATION,
        code: 'ENTITY_NOT_FOUND',
        status: 404,
        internalMessage: message,
        externalMessage: message,
        requestId
      });
    }

    // 409 Conflict / Business Rule violations mappings
    if (
      message.includes('Insufficient stock') ||
      message.includes('Cannot reserve') ||
      message.includes('already exists') ||
      message.includes('depleted')
    ) {
      return new FieldApiException({
        category: ExceptionCategory.VALIDATION,
        code: 'BUSINESS_RULE_VIOLATION',
        status: 409,
        internalMessage: message,
        externalMessage: message,
        requestId
      });
    }

    // 400 Bad Request mappings (validation errors)
    if (
      message.includes('required') ||
      message.includes('must be') ||
      message.includes('cannot be negative') ||
      message.includes('empty')
    ) {
      return new FieldApiException({
        category: ExceptionCategory.VALIDATION,
        code: 'INVALID_INPUT',
        status: 400,
        internalMessage: message,
        externalMessage: message,
        requestId
      });
    }

    // Default Fallback: 500 Internal Server Error represented as ApiException
    return new FieldApiException({
      category: ExceptionCategory.SYSTEM,
      code: 'INTERNAL_SERVER_ERROR',
      status: 500,
      internalMessage: message,
      externalMessage: 'An internal server error occurred.',
      requestId
    });
  }

  /**
   * Helper to format a successful DTO into ApiResponse.
   */
  public static toSuccessResponse(data: any, request: ApiRequest, context: ApiExecutionContext): ApiResponse {
    const metadata = {
      requestId: request.requestId,
      serverTimestamp: context.getStartTimestamp(),
      processingTime: context.getElapsedTime(),
      version: request.version
    };
    return ApiResponse.successResponse(data, 200, metadata);
  }
}


// --- Source: src/api/field/FieldStockHandler.ts ---

class FieldStockHandler implements EndpointHandler {
  constructor(private flyerStockAppService: FlyerStockApplicationService) {}

  public async execute(request: ApiRequest, context: ApiExecutionContext): Promise<ApiResponse> {
    try {
      const id = request.pathParams.id;
      if (!id || id.trim().length === 0) {
        throw new Error('id is required');
      }

      const dto = await this.flyerStockAppService.getStock(id);
      if (!dto) {
        throw new Error(`Flyer stock not found: ${id}`);
      }

      return FieldApiMapper.toSuccessResponse(dto, request, context);
    } catch (error: any) {
      const apiException = FieldApiMapper.toApiException(error, request.requestId);
      return ExceptionMapper.toResponse(apiException, request, context);
    }
  }
}


// --- Source: src/api/field/ReservationHandler.ts ---

class ReservationHandler implements EndpointHandler {
  constructor(private flyerStockAppService: FlyerStockApplicationService) {}

  public async execute(request: ApiRequest, context: ApiExecutionContext): Promise<ApiResponse> {
    try {
      const { flyerStockId, distributorId, quantity } = request.body;

      // Command instantiation will execute input validation rules
      const command = new ReserveFlyerCommand(flyerStockId, distributorId, Number(quantity));

      const result = await this.flyerStockAppService.reserveStock(command);

      return FieldApiMapper.toSuccessResponse(result, request, context);
    } catch (error: any) {
      const apiException = FieldApiMapper.toApiException(error, request.requestId);
      return ExceptionMapper.toResponse(apiException, request, context);
    }
  }
}


// --- Source: src/api/registry/FieldEndpoints.ts ---
interface EndpointConfig {
  path: string;
  method: string;
  version: string;
  handler: string;
}

const FIELD_ENDPOINTS: EndpointConfig[] = [
  {
    path: '/field/stocks/{id}',
    method: 'GET',
    version: 'v2',
    handler: 'FieldStockHandler'
  },
  {
    path: '/field/reservation',
    method: 'POST',
    version: 'v2',
    handler: 'ReservationHandler'
  },
  {
    path: '/field/distributors/{id}',
    method: 'GET',
    version: 'v2',
    handler: 'DistributorHandler'
  }
];


// --- Source: src/infrastructure/bootstrap/FieldApiBootstrap.ts ---

let initialized = false;

function bootstrapFieldApis(): void {
  if (initialized) return;

  const registry = EndpointRegistry.getInstance();

  // Instantiate Concrete Infrastructure and Domain / Application services
  const flyerRepo = new SpreadsheetFlyerRepository();
  const distRepo = new SpreadsheetDistributorRepository();
  const domainService = new DistributionDomainService();
  const eventPublisher = new ApplicationEventPublisher();

  const flyerStockAppService = new FlyerStockApplicationService(flyerRepo, domainService, eventPublisher);
  const distributionAppService = new DistributionApplicationService(distRepo);

  // Map of handlers for composition resolution
  const handlers: Record<string, any> = {
    FieldStockHandler: new FieldStockHandler(flyerStockAppService),
    DistributorHandler: new DistributorHandler(distributionAppService),
    ReservationHandler: new ReservationHandler(flyerStockAppService)
  };

  // Dynamic endpoint registration
  for (const config of FIELD_ENDPOINTS) {
    const handlerInstance = handlers[config.handler];
    if (!handlerInstance) {
      throw new Error(`Bootstrap resolution failed: Handler class '${config.handler}' not mapped in FieldApiBootstrap`);
    }
    registry.register(config.method, config.version, config.path, handlerInstance);
  }

  initialized = true;
}


