from plugin_platform.plugin.runtime_event_execution_log_persistence import RuntimeEventExecutionLogPersistence
from .runtime_execution_log_dispatch import RuntimeExecutionLogDispatch

class RuntimeEventExecutionLogDispatcher:
    def __init__(self, dispatch_id: str, runtime_event_execution_log_persistence: RuntimeEventExecutionLogPersistence, dispatch: RuntimeExecutionLogDispatch, metadata: dict, trace_id: str):
        self.dispatch_id = dispatch_id
        self.runtime_event_execution_log_persistence = runtime_event_execution_log_persistence
        self.dispatch = dispatch
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "dispatch_id": self.dispatch_id,
            "runtime_event_execution_log_persistence": self.runtime_event_execution_log_persistence.to_dict() if hasattr(self.runtime_event_execution_log_persistence, "to_dict") else self.runtime_event_execution_log_persistence,
            "dispatch": self.dispatch.to_dict() if hasattr(self.dispatch, "to_dict") else self.dispatch,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }
