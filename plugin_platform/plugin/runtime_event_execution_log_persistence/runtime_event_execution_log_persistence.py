from plugin_platform.plugin.runtime_event_execution_log import RuntimeEventExecutionLog
from .runtime_execution_log_persistence import RuntimeExecutionLogPersistence

class RuntimeEventExecutionLogPersistence:
    def __init__(self, persistence_id: str, runtime_event_execution_log: RuntimeEventExecutionLog, persistence: RuntimeExecutionLogPersistence, metadata: dict, trace_id: str):
        self.persistence_id = persistence_id
        self.runtime_event_execution_log = runtime_event_execution_log
        self.persistence = persistence
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "persistence_id": self.persistence_id,
            "runtime_event_execution_log": self.runtime_event_execution_log.to_dict() if hasattr(self.runtime_event_execution_log, "to_dict") else self.runtime_event_execution_log,
            "persistence": self.persistence.to_dict() if hasattr(self.persistence, "to_dict") else self.persistence,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }
