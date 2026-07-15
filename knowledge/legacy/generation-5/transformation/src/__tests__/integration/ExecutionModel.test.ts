import { DefaultWorkerProvider } from '../../engine/DefaultWorkerProvider';
import { DefaultCommandDispatcher } from '../../engine/DefaultCommandDispatcher';
import { IWorker, IExecutionLedger } from '../../models/runtime_ports';
import { Command, AutomationJob, OSEvent } from '../../models/protocol';

describe('Layer 5: Execution Model Foundation (Sprint X-20)', () => {

  const mockEvent1: OSEvent = {
    eventId: 'res_1', traceId: 'trc_1', source: 'urn:worker',
    subject: 'urn:user:1', type: 'COMPLETED', schemaVersion: '1.0.0', occurredAt: '2026-07-14'
  };

  const mockEvent2: OSEvent = {
    eventId: 'res_2', traceId: 'trc_1', source: 'urn:worker',
    subject: 'urn:user:1', type: 'FAILED', schemaVersion: '1.0.0', occurredAt: '2026-07-14'
  };

  let mockWorkerA: jest.Mocked<IWorker>;
  let mockWorkerB: jest.Mocked<IWorker>;
  let provider: DefaultWorkerProvider;
  let dispatcher: DefaultCommandDispatcher;

  beforeEach(() => {
    mockWorkerA = { execute: jest.fn().mockResolvedValue([mockEvent1]), workerId: 'worker_a' };
    mockWorkerB = { execute: jest.fn().mockResolvedValue([mockEvent2]), workerId: 'worker_b' };
    mockLedger = { append: jest.fn().mockResolvedValue(undefined) };
    
    provider = new DefaultWorkerProvider();
    
    // Create a mock kernel to satisfy the dispatcher dependency
    const mockKernel = {
      execute: jest.fn().mockImplementation((context, command, worker) => {
        // Just directly call the worker to simulate dispatching
        return worker.execute(command, { executionId: context.executionId, attempt: 1, startedAt: 'mock', timeoutAt: 'mock' });
      })
    };
    dispatcher = new DefaultCommandDispatcher(provider, mockKernel);
  });

  describe('Plugin Registration Tests', () => {
    it('should allow registering multiple workers by command type', () => {
      provider.register('CreateCustomer', mockWorkerA);
      provider.register('GenerateVideo', mockWorkerB);

      const cmdA: Command = { commandId: 'c1', type: 'CreateCustomer', version: '1', payload: {} };
      const cmdB: Command = { commandId: 'c2', type: 'GenerateVideo', version: '1', payload: {} };

      expect(provider.get(cmdA)).toBe(mockWorkerA);
      expect(provider.get(cmdB)).toBe(mockWorkerB);
    });
  });

  describe('Worker Resolution Tests', () => {
    it('should throw an error if no worker is registered for a command type', () => {
      const unknownCmd: Command = { commandId: 'c3', type: 'UnknownCommand', version: '1', payload: {} };
      
      expect(() => provider.get(unknownCmd)).toThrow('Worker not found for command type: UnknownCommand');
    });

    it('should resolve the correct worker based on command type dynamically', () => {
      provider.register('PublishArticle', mockWorkerA);
      const cmd: Command = { commandId: 'c4', type: 'PublishArticle', version: '1', payload: { articleId: 123 } };
      
      const resolvedWorker = provider.get(cmd);
      expect(resolvedWorker).toBe(mockWorkerA);
    });
  });

  describe('Dispatcher Integration Tests', () => {
    it('should extract Command from AutomationJob, resolve Worker, and execute', async () => {
      provider.register('TrainModel', mockWorkerA);

      const command: Command = {
        commandId: 'c10',
        type: 'TrainModel',
        version: '2.0',
        payload: { dataset: 'mnist' }
      };

      const job: AutomationJob = {
        jobId: 'job_1',
        traceId: 'trc_1',
        command: command,
        policyRef: 'urn:policy:default'
      };

      const resultEvents = await dispatcher.dispatch(job);

      expect(mockWorkerA.execute).toHaveBeenCalledTimes(1);
      expect(mockWorkerA.execute).toHaveBeenCalledWith(command, expect.objectContaining({ attempt: 1 }));
      expect(resultEvents).toEqual([mockEvent1]);
    });
  });
});
