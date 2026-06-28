class RuntimeExecutionLogExecutor:
    def __init__(self, executor_id: str, controller_id: str, lifecycle_state: str, execution_cursor: int, lifecycle_map: list, metadata: dict, trace_id: str):
        self.executor_id = executor_id
        self.controller_id = controller_id
        self.lifecycle_state = lifecycle_state
        self.execution_cursor = execution_cursor
        self.lifecycle_map = lifecycle_map
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "executor_id": self.executor_id,
            "controller_id": self.controller_id,
            "lifecycle_state": self.lifecycle_state,
            "execution_cursor": self.execution_cursor,
            "lifecycle_map": self.lifecycle_map,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }
