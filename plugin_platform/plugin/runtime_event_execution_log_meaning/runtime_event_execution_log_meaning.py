from plugin_platform.plugin.runtime_event_execution_log_receiver import RuntimeExecutionLogReceiverContext
from .runtime_execution_log_meaning import RuntimeExecutionLogMeaning

class RuntimeEventExecutionLogMeaning:
    def __init__(self, meaning_id: str, runtime_event_execution_log_receiver_router: RuntimeExecutionLogReceiverContext, meaning: RuntimeExecutionLogMeaning, metadata: dict, trace_id: str):
        self.meaning_id = meaning_id
        self.runtime_event_execution_log_receiver_router = runtime_event_execution_log_receiver_router
        self.meaning = meaning
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "meaning_id": self.meaning_id,
            "runtime_event_execution_log_receiver_router": self.runtime_event_execution_log_receiver_router.to_dict() if hasattr(self.runtime_event_execution_log_receiver_router, "to_dict") else self.runtime_event_execution_log_receiver_router,
            "meaning": self.meaning.to_dict() if hasattr(self.meaning, "to_dict") else self.meaning,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }
