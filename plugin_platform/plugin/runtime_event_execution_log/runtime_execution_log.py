class RuntimeExecutionLog:
    def __init__(self, execution_log_id: str, pipeline_execution_id: str, log_state: str, log_entries: list, metadata: dict, trace_id: str):
        self.execution_log_id = execution_log_id
        self.pipeline_execution_id = pipeline_execution_id
        self.log_state = log_state
        self.log_entries = log_entries
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "execution_log_id": self.execution_log_id,
            "pipeline_execution_id": self.pipeline_execution_id,
            "log_state": self.log_state,
            "log_entries": self.log_entries,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }
