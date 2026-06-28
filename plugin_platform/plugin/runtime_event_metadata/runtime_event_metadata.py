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
