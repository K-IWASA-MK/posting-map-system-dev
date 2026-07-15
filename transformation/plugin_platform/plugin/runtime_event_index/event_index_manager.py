from .runtime_event_index import RuntimeEventIndex
from plugin_platform.plugin.runtime_event_query import RuntimeEventQuery
from plugin_platform.plugin.runtime_adapter import RuntimeContext

class EventIndexManager:
    @staticmethod
    def create_index(query: RuntimeEventQuery, context: RuntimeContext) -> RuntimeEventIndex:
        # Trace ID アサーション検証
        assert query.trace_id is not None, "RuntimeEventQuery trace_id must not be None"
        assert query.query_id is not None, "RuntimeEventQuery query_id must not be None"
        
        # 決定論的な index_id 導出
        index_id = f"index:{query.query_id}"
        index_type = "memory"
        entries = []
        
        metadata = {
            "version": 1,
            "manager": "event_index_manager_stub",
            "environment": context.environment
        }
        
        return RuntimeEventIndex(
            index_id=index_id,
            runtime_event_query=query,
            index_type=index_type,
            entries=entries,
            metadata=metadata,
            trace_id=query.trace_id
        )
