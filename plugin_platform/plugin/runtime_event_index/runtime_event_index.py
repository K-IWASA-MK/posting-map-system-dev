from plugin_platform.plugin.runtime_event_query import RuntimeEventQuery

class RuntimeEventIndex:
    def __init__(self, index_id: str, runtime_event_query: RuntimeEventQuery, index_type: str, entries: list, metadata: dict, trace_id: str):
        self.index_id = index_id
        self.runtime_event_query = runtime_event_query
        self.index_type = index_type
        self.entries = entries
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "index_id": self.index_id,
            "runtime_event_query": self.runtime_event_query.to_dict() if hasattr(self.runtime_event_query, "to_dict") else self.runtime_event_query,
            "index_type": self.index_type,
            "entries": self.entries,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }

    @classmethod
    def from_dict(cls, data: dict) -> "RuntimeEventIndex":
        query_data = data.get("runtime_event_query")
        if isinstance(query_data, dict):
            from plugin_platform.plugin.runtime_event_query.runtime_event_query import RuntimeEventQuery
            query_obj = RuntimeEventQuery.from_dict(query_data)
        else:
            query_obj = query_data
            
        return cls(
            index_id=data.get("index_id"),
            runtime_event_query=query_obj,
            index_type=data.get("index_type"),
            entries=data.get("entries", []),
            metadata=data.get("metadata", {}),
            trace_id=data.get("trace_id")
        )

