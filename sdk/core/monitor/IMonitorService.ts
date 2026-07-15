export interface IMonitorService {
  name(): string;
  query(): Promise<Record<string, any>>;
  supports(queryType: string): boolean;
}
