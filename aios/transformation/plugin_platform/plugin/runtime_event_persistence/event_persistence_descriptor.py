class EventPersistenceDescriptor:
    def __init__(self, persistence_id: str, audit_id: str, persistence_type: str, metadata: dict, trace_id: str):
        self.persistence_id = persistence_id
        self.audit_id = audit_id
        self.persistence_type = persistence_type
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "persistence_id": self.persistence_id,
            "audit_id": self.audit_id,
            "persistence_type": self.persistence_type,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }

    @classmethod
    def from_dict(cls, data: dict) -> "EventPersistenceDescriptor":
        return cls(
            persistence_id=data.get("persistence_id"),
            audit_id=data.get("audit_id"),
            persistence_type=data.get("persistence_type"),
            metadata=data.get("metadata", {}),
            trace_id=data.get("trace_id")
        )

