import { MonitoringEvent } from './MonitoringEvent';

export interface MonitoringListener {
  onEvent(event: MonitoringEvent): void;
}
