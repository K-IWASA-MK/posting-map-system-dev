export interface ComponentDescriptor {
  readonly name: string;
  readonly status: 'ACTIVE' | 'INACTIVE' | 'ERROR';
  readonly version: string;
  readonly initialized: boolean;
}
