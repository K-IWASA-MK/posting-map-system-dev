from plugin_platform.plugin.runtime_event_catalog import RuntimeEventCatalog

class RuntimeEventMetadata:
    def __init__(self, metadata_id: str, runtime_event_catalog: RuntimeEventCatalog, metadata_type: str, attributes: dict, metadata: dict, trace_id: str):
        self.metadata_id = metadata_id
        self.runtime_event_catalog = runtime_event_catalog
        self.metadata_type = metadata_type
        self.attributes = attributes
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "metadata_id": self.metadata_id,
            "runtime_event_catalog": self.runtime_event_catalog.to_dict() if hasattr(self.runtime_event_catalog, "to_dict") else self.runtime_event_catalog,
            "metadata_type": self.metadata_type,
            "attributes": self.attributes,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }

    @classmethod
    def from_dict(cls, data: dict) -> "RuntimeEventMetadata":
        catalog_data = data.get("runtime_event_catalog")
        if isinstance(catalog_data, dict):
            from plugin_platform.plugin.runtime_event_catalog.runtime_event_catalog import RuntimeEventCatalog
            catalog_obj = RuntimeEventCatalog.from_dict(catalog_data)
        else:
            catalog_obj = catalog_data
            
        return cls(
            metadata_id=data.get("metadata_id"),
            runtime_event_catalog=catalog_obj,
            metadata_type=data.get("metadata_type"),
            attributes=data.get("attributes", {}),
            metadata=data.get("metadata", {}),
            trace_id=data.get("trace_id")
        )

