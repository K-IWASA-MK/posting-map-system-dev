class EventCatalogDescriptor:
    def __init__(self, catalog_id: str, index_id: str, catalog_type: str, metadata: dict, trace_id: str):
        self.catalog_id = catalog_id
        self.index_id = index_id
        self.catalog_type = catalog_type
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "catalog_id": self.catalog_id,
            "index_id": self.index_id,
            "catalog_type": self.catalog_type,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }

    @classmethod
    def from_dict(cls, data: dict) -> "EventCatalogDescriptor":
        return cls(
            catalog_id=data.get("catalog_id"),
            index_id=data.get("index_id"),
            catalog_type=data.get("catalog_type"),
            metadata=data.get("metadata", {}),
            trace_id=data.get("trace_id")
        )

