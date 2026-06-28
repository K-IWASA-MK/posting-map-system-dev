from plugin_platform.plugin.runtime_event_index import RuntimeEventIndex

class RuntimeEventCatalog:
    def __init__(self, catalog_id: str, runtime_event_index: RuntimeEventIndex, catalog_type: str, entries: list, metadata: dict, trace_id: str):
        self.catalog_id = catalog_id
        self.runtime_event_index = runtime_event_index
        self.catalog_type = catalog_type
        self.entries = entries
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "catalog_id": self.catalog_id,
            "runtime_event_index": self.runtime_event_index.to_dict() if hasattr(self.runtime_event_index, "to_dict") else self.runtime_event_index,
            "catalog_type": self.catalog_type,
            "entries": self.entries,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }
