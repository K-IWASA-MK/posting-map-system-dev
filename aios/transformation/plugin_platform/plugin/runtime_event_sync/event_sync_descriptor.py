class EventSyncDescriptor:
    def __init__(self, sync_id: str, persistence_id: str, sync_type: str, metadata: dict, trace_id: str):
        self.sync_id = sync_id
        self.persistence_id = persistence_id
        self.sync_type = sync_type
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "sync_id": self.sync_id,
            "persistence_id": self.persistence_id,
            "sync_type": self.sync_type,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }

    @classmethod
    def from_dict(cls, data: dict) -> "EventSyncDescriptor":
        return cls(
            sync_id=data.get("sync_id"),
            persistence_id=data.get("persistence_id"),
            sync_type=data.get("sync_type"),
            metadata=data.get("metadata", {}),
            trace_id=data.get("trace_id")
        )

