import { DefaultExecutionKernel } from '../../engine/DefaultExecutionKernel';
import { ExecutionContext, CancellationToken } from '../../models/kernel';
import { IWorker } from '../../models/runtime_ports';
import { Command, OSEvent } from '../../models/protocol';
import { CancellationError } from '../../engine/kernel/CancellationExecutor';
import { TimeoutError } from '../../engine/kernel/TimeoutExecutor';
import { InMemoryExecutionLedger } from '../../engine/kernel/InMemoryExecutionLedger';

describe('Layer 6: Execution Kernel Foundation (Sprint X-21) + Ledger (Sprint X-22)', () => {
  let kernel: DefaultExecutionKernel;
  let ledger: InMemoryExecutionLedger;
  let mockWorker: jest.Mocked<IWorker>;
  let baseContext: ExecutionContext;

  const dummyCommand: Command = {
    commandId: 'cmd_1',
    type: 'TEST_COMMAND',
    version: '1.0',
    payload: {}
  };

  const successEvent: OSEvent = {
    eventId: 'res_1', traceId: 'trc_1', source: 'urn:worker',
    subject: 'urn:user:1', type: 'COMPLETED', schemaVersion: '1.0.0', occurredAt: '2026-07-14'
  };

  beforeEach(() => {
    ledger = new InMemoryExecutionLedger();
    kernel = new DefaultExecutionKernel(ledger);
    mockWorker = { execute: jest.fn(), workerId: 'test_worker' };
    
    let cancelCallback: (() => void) | undefined;
    
    baseContext = {
      executionId: 'exec_123',
      traceId: 'trace_456',
      startedAt: new Date().toISOString(),
      timeoutMs: 1000,
      maxRetries: 2,
      remainingBudget: 100,
      trustLevel: 'SYSTEM',
      cancellationToken: {
        isCancellationRequested: false,
        onCancellationRequested: (cb) => { cancelCallback = cb; }
      },
      metadata: {}
    };
  });

  it('Kernel-001: 正常実行 (Normal Execution)', async () => {
    mockWorker.execute.mockResolvedValue([successEvent]);

    const result = await kernel.execute(baseContext, dummyCommand, mockWorker);
    
    expect(result).toEqual([successEvent]);
    expect(mockWorker.execute).toHaveBeenCalledTimes(1);
    
    // Verify ExecutionAttempt passed to worker
    const passedAttempt = mockWorker.execute.mock.calls[0][1];
    expect(passedAttempt.executionId).toBe('exec_123');
    expect(passedAttempt.attempt).toBe(1);
  });

  it('Kernel-002: Timeout', async () => {
    // Worker hangs forever
    mockWorker.execute.mockImplementation(() => new Promise(() => {}));
    
    const contextWithShortTimeout = { ...baseContext, timeoutMs: 50 };

    await expect(kernel.execute(contextWithShortTimeout, dummyCommand, mockWorker))
      .rejects.toThrow(TimeoutError);
  });

  it('Kernel-003: Retry (Succeeds on 2nd attempt)', async () => {
    mockWorker.execute
      .mockRejectedValueOnce(new Error('Temporary Network Failure'))
      .mockResolvedValueOnce([successEvent]);

    const result = await kernel.execute(baseContext, dummyCommand, mockWorker);
    
    expect(result).toEqual([successEvent]);
    expect(mockWorker.execute).toHaveBeenCalledTimes(2);
    
    const attempt1 = mockWorker.execute.mock.calls[0][1];
    const attempt2 = mockWorker.execute.mock.calls[1][1];
    expect(attempt1.attempt).toBe(1);
    expect(attempt2.attempt).toBe(2);
  });

  it('Kernel-004: Exception Propagation (Fails after maxRetries)', async () => {
    mockWorker.execute.mockRejectedValue(new Error('Persistent Failure'));

    await expect(kernel.execute(baseContext, dummyCommand, mockWorker))
      .rejects.toThrow('Persistent Failure');

    // maxRetries = 2, so it should try 1 + 2 = 3 times
    expect(mockWorker.execute).toHaveBeenCalledTimes(3);
  });

  it('Kernel-005: Cancellation (Before Execution)', async () => {
    const cancelledContext: ExecutionContext = {
      ...baseContext,
      cancellationToken: {
        isCancellationRequested: true,
        onCancellationRequested: jest.fn()
      }
    };

    await expect(kernel.execute(cancelledContext, dummyCommand, mockWorker))
      .rejects.toThrow(CancellationError);
      
    expect(mockWorker.execute).not.toHaveBeenCalled();
  });

  it('Kernel-006: Metrics Recording (Temporal tracking via Attempt)', async () => {
    mockWorker.execute.mockResolvedValue([successEvent]);
    const contextWithTimeout = { ...baseContext, timeoutMs: 2500 };
    
    await kernel.execute(contextWithTimeout, dummyCommand, mockWorker);
    
    const attempt = mockWorker.execute.mock.calls[0][1];
    
    // Attempt should accurately capture temporal metrics for this execution
    expect(attempt.startedAt).toBeDefined();
    expect(attempt.timeoutAt).toBeDefined();
    
    const started = new Date(attempt.startedAt).getTime();
    const timeout = new Date(attempt.timeoutAt).getTime();
    
    // timeoutAt should be exactly startedAt + timeoutMs
    expect(timeout - started).toBe(2500);
  });

  // Sprint X-22: Ledger Tests
  
  it('Ledger-007: STARTED -> COMPLETED Timeline', async () => {
    mockWorker.execute.mockResolvedValue([successEvent]);
    await kernel.execute(baseContext, dummyCommand, mockWorker);
    
    const records = ledger.getRecords();
    expect(records.length).toBe(2);
    expect(records[0].phase).toBe('STARTED');
    expect(records[1].phase).toBe('COMPLETED');
    expect(records[0].attempt).toBe(1);
    expect(records[1].attempt).toBe(1);
  });

  it('Ledger-008: STARTED -> FAILED Timeline (with Retries)', async () => {
    mockWorker.execute.mockRejectedValue(new Error('Persistent Failure'));
    
    await expect(kernel.execute(baseContext, dummyCommand, mockWorker)).rejects.toThrow();

    const records = ledger.getRecords();
    // maxRetries = 2, meaning 3 total attempts
    // Each attempt should have a STARTED -> FAILED
    expect(records.length).toBe(6);
    
    expect(records[0].phase).toBe('STARTED');
    expect(records[0].attempt).toBe(1);
    expect(records[1].phase).toBe('FAILED');
    expect(records[1].attempt).toBe(1);
    
    expect(records[4].phase).toBe('STARTED');
    expect(records[4].attempt).toBe(3);
    expect(records[5].phase).toBe('FAILED');
    expect(records[5].attempt).toBe(3);
  });

  it('Ledger-009: STARTED -> TIMEOUT Timeline', async () => {
    mockWorker.execute.mockImplementation(() => new Promise(() => {}));
    const contextWithTimeout = { ...baseContext, timeoutMs: 50 };
    
    await expect(kernel.execute(contextWithTimeout, dummyCommand, mockWorker)).rejects.toThrow();

    const records = ledger.getRecords();
    expect(records[0].phase).toBe('STARTED');
    expect(records[1].phase).toBe('TIMEOUT');
  });

  it('Ledger-010: STARTED -> CANCELLED Timeline', async () => {
    let cancelCallback: (() => void) | undefined;
    const cancellableContext: ExecutionContext = {
      ...baseContext,
      cancellationToken: {
        isCancellationRequested: false,
        onCancellationRequested: (cb) => { cancelCallback = cb; }
      }
    };
    
    mockWorker.execute.mockImplementation(() => {
      // Simulate taking time, then getting cancelled
      if (cancelCallback) cancelCallback();
      return new Promise(() => {}); 
    });

    await expect(kernel.execute(cancellableContext, dummyCommand, mockWorker)).rejects.toThrow();

    const records = ledger.getRecords();
    expect(records.length).toBe(2);
    expect(records[0].phase).toBe('STARTED');
    expect(records[1].phase).toBe('CANCELLED');
  });
});
