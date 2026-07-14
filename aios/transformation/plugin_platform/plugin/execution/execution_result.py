class ExecutionResult:
    def __init__(self, execution_id: str, plan_id: str, status: str, started_at: str, finished_at: str, duration: float, plugin_results: list, metadata: dict, trace_id: str):
        self.execution_id = execution_id
        self.plan_id = plan_id
        self.status = status
        self.started_at = started_at
        self.finished_at = finished_at
        self.duration = duration
        self.plugin_results = plugin_results
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "execution_id": self.execution_id,
            "plan_id": self.plan_id,
            "status": self.status,
            "started_at": self.started_at,
            "finished_at": self.finished_at,
            "duration": self.duration,
            "plugin_results": self.plugin_results,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }
