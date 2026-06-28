class EventIndexDescriptor:
    def __init__(self, index_id: str, query_id: str, index_type: str, metadata: dict, trace_id: str):
        self.index_id = index_id
        self.query_id = query_id
        self.index_type = index_type
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "index_id": self.index_id,
            "query_id": self.query_id,
            "index_type": self.index_type,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }
