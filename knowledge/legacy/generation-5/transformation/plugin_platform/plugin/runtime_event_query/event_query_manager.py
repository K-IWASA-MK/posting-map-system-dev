from .runtime_event_query import RuntimeEventQuery
from plugin_platform.plugin.runtime_event_store import RuntimeEventStore
from plugin_platform.plugin.runtime_adapter import RuntimeContext

class EventQueryManager:
    @staticmethod
    def create_query(store: RuntimeEventStore, context: RuntimeContext) -> RuntimeEventQuery:
        # Trace ID アサーション検証
        assert store.trace_id is not None, "RuntimeEventStore trace_id must not be None"
        assert store.store_id is not None, "RuntimeEventStore store_id must not be None"
        
        # 決定論的な query_id 導出
        query_id = f"query:{store.store_id}"
        query_type = "lookup"
        result = []
        
        metadata = {
            "version": 1,
            "manager": "event_query_manager_stub",
            "environment": context.environment
        }
        
        return RuntimeEventQuery(
            query_id=query_id,
            runtime_event_store=store,
            query_type=query_type,
            result=result,
            metadata=metadata,
            trace_id=store.trace_id
        )
