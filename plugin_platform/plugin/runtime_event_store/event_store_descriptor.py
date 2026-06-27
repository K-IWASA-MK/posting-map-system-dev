class EventStoreDescriptor:
    def __init__(self, store_id: str, event_id: str, session_id: str, lifecycle_id: str, metadata: dict, trace_id: str):
        self.store_id = store_id
        self.event_id = event_id
        self.session_id = session_id
        self.lifecycle_id = lifecycle_id
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "store_id": self.store_id,
            "event_id": self.event_id,
            "session_id": self.session_id,
            "lifecycle_id": self.lifecycle_id,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }
