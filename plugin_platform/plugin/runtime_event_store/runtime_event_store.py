from plugin_platform.plugin.runtime_session_event import RuntimeSessionEvent

class RuntimeEventStore:
    def __init__(self, store_id: str, runtime_session_event: RuntimeSessionEvent, storage_type: str, metadata: dict, trace_id: str):
        self.store_id = store_id
        self.runtime_session_event = runtime_session_event
        self.storage_type = storage_type
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "store_id": self.store_id,
            "runtime_session_event": self.runtime_session_event.to_dict() if hasattr(self.runtime_session_event, "to_dict") else self.runtime_session_event,
            "storage_type": self.storage_type,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }
