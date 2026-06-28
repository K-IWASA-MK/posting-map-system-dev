from plugin_platform.plugin.runtime_event_persistence import RuntimeEventPersistence

class RuntimeEventSync:
    def __init__(self, sync_id: str, runtime_event_persistence: RuntimeEventPersistence, sync_type: str, sync_data: dict, metadata: dict, trace_id: str):
        self.sync_id = sync_id
        self.runtime_event_persistence = runtime_event_persistence
        self.sync_type = sync_type
        self.sync_data = sync_data
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "sync_id": self.sync_id,
            "runtime_event_persistence": self.runtime_event_persistence.to_dict() if hasattr(self.runtime_event_persistence, "to_dict") else self.runtime_event_persistence,
            "sync_type": self.sync_type,
            "sync_data": self.sync_data,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }
