class RuntimeExecutionLogScheduler:
    def __init__(self, scheduler_id: str, engine_id: str, execution_batches: list, scheduler_state: str, metadata: dict, trace_id: str):
        self.scheduler_id = scheduler_id
        self.engine_id = engine_id
        self.execution_batches = execution_batches
        self.scheduler_state = scheduler_state
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "scheduler_id": self.scheduler_id,
            "engine_id": self.engine_id,
            "execution_batches": self.execution_batches,
            "scheduler_state": self.scheduler_state,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }
