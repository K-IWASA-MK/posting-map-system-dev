class EventQueryDescriptor:
    def __init__(self, query_id: str, store_id: str, query_type: str, metadata: dict, trace_id: str):
        self.query_id = query_id
        self.store_id = store_id
        self.query_type = query_type
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "query_id": self.query_id,
            "store_id": self.store_id,
            "query_type": self.query_type,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }
