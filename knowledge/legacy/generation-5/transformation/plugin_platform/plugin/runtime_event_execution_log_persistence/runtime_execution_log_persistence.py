class RuntimeExecutionLogPersistence:
    def __init__(self, persistence_id: str, execution_log_id: str, persistence_state: str, persistence_entries: list, metadata: dict, trace_id: str):
        self.persistence_id = persistence_id
        self.execution_log_id = execution_log_id
        self.persistence_state = persistence_state
        self.persistence_entries = persistence_entries
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "persistence_id": self.persistence_id,
            "execution_log_id": self.execution_log_id,
            "persistence_state": self.persistence_state,
            "persistence_entries": self.persistence_entries,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }
