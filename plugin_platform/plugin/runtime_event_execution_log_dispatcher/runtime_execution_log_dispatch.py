class RuntimeExecutionLogDispatch:
    def __init__(self, dispatch_id: str, execution_log_persistence_id: str, dispatch_state: str, dispatch_route: list, metadata: dict, trace_id: str):
        self.dispatch_id = dispatch_id
        self.execution_log_persistence_id = execution_log_persistence_id
        self.dispatch_state = dispatch_state
        self.dispatch_route = dispatch_route
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "dispatch_id": self.dispatch_id,
            "execution_log_persistence_id": self.execution_log_persistence_id,
            "dispatch_state": self.dispatch_state,
            "dispatch_route": self.dispatch_route,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }
