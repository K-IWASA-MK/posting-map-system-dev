from plugin_platform.plugin.runtime_event_store import RuntimeEventStore

class RuntimeEventQuery:
    def __init__(self, query_id: str, runtime_event_store: RuntimeEventStore, query_type: str, result: list, metadata: dict, trace_id: str):
        self.query_id = query_id
        self.runtime_event_store = runtime_event_store
        self.query_type = query_type
        self.result = result
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "query_id": self.query_id,
            "runtime_event_store": self.runtime_event_store.to_dict() if hasattr(self.runtime_event_store, "to_dict") else self.runtime_event_store,
            "query_type": self.query_type,
            "result": self.result,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }

    @classmethod
    def from_dict(cls, data: dict) -> "RuntimeEventQuery":
        store_data = data.get("runtime_event_store")
        if isinstance(store_data, dict):
            from plugin_platform.plugin.runtime_event_store.runtime_event_store import RuntimeEventStore
            store_obj = RuntimeEventStore.from_dict(store_data)
        else:
            store_obj = store_data
            
        return cls(
            query_id=data.get("query_id"),
            runtime_event_store=store_obj,
            query_type=data.get("query_type"),
            result=data.get("result", []),
            metadata=data.get("metadata", {}),
            trace_id=data.get("trace_id")
        )

