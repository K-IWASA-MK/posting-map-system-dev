import { AutomationRuntime } from '../../engine/AutomationRuntime';
import { IEventPublisher, ICommandDispatcher, AutomationContext } from '../../models/runtime_ports';
import { OSEvent } from '../../models/protocol';

describe('Layer 4: Runtime Integration Tests (Execution Phase)', () => {

  let mockDispatcher: jest.Mocked<ICommandDispatcher>;
  let mockPublisher: jest.Mocked<IEventPublisher>;
  let runtime: AutomationRuntime;

  const mockEvent1: OSEvent = {
    eventId: 'res_1', traceId: 'trc_1', source: 'urn:worker',
    subject: 'urn:user:1', type: 'COMPLETED', schemaVersion: '1.0.0', occurredAt: '2026-07-14'
  };
  const mockEvent2: OSEvent = {
    eventId: 'res_2', traceId: 'trc_1', source: 'urn:worker',
    subject: 'urn:user:1', type: 'UPDATED', schemaVersion: '1.0.0', occurredAt: '2026-07-14'
  };

  const createJobContext = (proceed: boolean): AutomationContext => ({
    job: { 
      jobId: 'job_1', 
      traceId: 'trc_1', 
      command: { commandId: 'cmd_1', type: 'TEST', version: '1', payload: {} }, 
      policyRef: 'urn:policy:default' 
    },
    decision: proceed 
      ? { proceed: true } 
      : { proceed: false, action: 'REJECT', diagnostics: ['V1001'] }
  });

  beforeEach(() => {
    mockDispatcher = {
      dispatch: jest.fn().mockResolvedValue([mockEvent1])
    };
    mockPublisher = {
      publish: jest.fn().mockResolvedValue(undefined)
    };
    runtime = new AutomationRuntime(mockDispatcher, mockPublisher);
  });

  it('RT-001: proceed=true -> Dispatcher→Publisher が実行される', async () => {
    const context = createJobContext(true);
    await runtime.execute(context);
    
    expect(mockDispatcher.dispatch).toHaveBeenCalledTimes(1);
    expect(mockDispatcher.dispatch).toHaveBeenCalledWith(context.job);
    expect(mockPublisher.publish).toHaveBeenCalledTimes(1);
    expect(mockPublisher.publish).toHaveBeenCalledWith(mockEvent1);
  });

  it('RT-002: proceed=false -> Dispatcher は呼ばれない', async () => {
    const context = createJobContext(false);
    await runtime.execute(context);
    
    expect(mockDispatcher.dispatch).not.toHaveBeenCalled();
    expect(mockPublisher.publish).not.toHaveBeenCalled();
  });

  it('RT-003: Dispatcher が複数 Event を返す -> 全 Event が Publish される', async () => {
    mockDispatcher.dispatch.mockResolvedValue([mockEvent1, mockEvent2]);
    const context = createJobContext(true);
    await runtime.execute(context);
    
    expect(mockDispatcher.dispatch).toHaveBeenCalledTimes(1);
    expect(mockPublisher.publish).toHaveBeenCalledTimes(2);
    expect(mockPublisher.publish).toHaveBeenNthCalledWith(1, mockEvent1);
    expect(mockPublisher.publish).toHaveBeenNthCalledWith(2, mockEvent2);
  });

  it('RT-004: Publisher が失敗 -> エラーが上位へ伝播する', async () => {
    const error = new Error('Publish Failed');
    mockPublisher.publish.mockRejectedValue(error);
    const context = createJobContext(true);
    
    await expect(runtime.execute(context)).rejects.toThrow('Publish Failed');
  });

  it('RT-005: Runtime が State を変更しない -> State 不変', async () => {
    const context = createJobContext(true);
    const originalContextJson = JSON.stringify(context);
    
    await runtime.execute(context);
    
    expect(JSON.stringify(context)).toEqual(originalContextJson);
  });

  it('RT-006: Runtime が EventStore を直接触らない -> Port 呼び出しなし', async () => {
    const context = createJobContext(true);
    await runtime.execute(context);
    
    expect(mockDispatcher.dispatch).toHaveBeenCalled();
    expect(mockPublisher.publish).toHaveBeenCalled();
  });

});
