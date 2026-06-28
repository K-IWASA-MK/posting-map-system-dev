from plugin_platform.plugin.runtime_event_audit import RuntimeEventAudit

class RuntimeEventPersistence:
    def __init__(self, persistence_id: str, runtime_event_audit: RuntimeEventAudit, persistence_type: str, persistence_data: dict, metadata: dict, trace_id: str):
        self.persistence_id = persistence_id
        self.runtime_event_audit = runtime_event_audit
        self.persistence_type = persistence_type
        self.persistence_data = persistence_data
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "persistence_id": self.persistence_id,
            "runtime_event_audit": self.runtime_event_audit.to_dict() if hasattr(self.runtime_event_audit, "to_dict") else self.runtime_event_audit,
            "persistence_type": self.persistence_type,
            "persistence_data": self.persistence_data,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }
