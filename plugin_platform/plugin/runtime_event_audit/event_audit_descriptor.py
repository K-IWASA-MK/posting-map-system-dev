class EventAuditDescriptor:
    def __init__(self, audit_id: str, snapshot_id: str, audit_type: str, metadata: dict, trace_id: str):
        self.audit_id = audit_id
        self.snapshot_id = snapshot_id
        self.audit_type = audit_type
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "audit_id": self.audit_id,
            "snapshot_id": self.snapshot_id,
            "audit_type": self.audit_type,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }
