from plugin_platform.plugin.runtime_event_snapshot import RuntimeEventSnapshot

class RuntimeEventAudit:
    def __init__(self, audit_id: str, runtime_event_snapshot: RuntimeEventSnapshot, audit_type: str, audit_data: dict, metadata: dict, trace_id: str):
        self.audit_id = audit_id
        self.runtime_event_snapshot = runtime_event_snapshot
        self.audit_type = audit_type
        self.audit_data = audit_data
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "audit_id": self.audit_id,
            "runtime_event_snapshot": self.runtime_event_snapshot.to_dict() if hasattr(self.runtime_event_snapshot, "to_dict") else self.runtime_event_snapshot,
            "audit_type": self.audit_type,
            "audit_data": self.audit_data,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }

    @classmethod
    def from_dict(cls, data: dict) -> "RuntimeEventAudit":
        snap_data = data.get("runtime_event_snapshot")
        if isinstance(snap_data, dict):
            from plugin_platform.plugin.runtime_event_snapshot.runtime_event_snapshot import RuntimeEventSnapshot
            snap_obj = RuntimeEventSnapshot.from_dict(snap_data)
        else:
            snap_obj = snap_data
            
        return cls(
            audit_id=data.get("audit_id"),
            runtime_event_snapshot=snap_obj,
            audit_type=data.get("audit_type"),
            audit_data=data.get("audit_data", {}),
            metadata=data.get("metadata", {}),
            trace_id=data.get("trace_id")
        )

