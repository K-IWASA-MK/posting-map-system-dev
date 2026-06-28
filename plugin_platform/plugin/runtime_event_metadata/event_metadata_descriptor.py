class EventMetadataDescriptor:
    def __init__(self, metadata_id: str, catalog_id: str, metadata_type: str, metadata: dict, trace_id: str):
        self.metadata_id = metadata_id
        self.catalog_id = catalog_id
        self.metadata_type = metadata_type
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "metadata_id": self.metadata_id,
            "catalog_id": self.catalog_id,
            "metadata_type": self.metadata_type,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }
