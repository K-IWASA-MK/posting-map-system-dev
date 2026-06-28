from .runtime_event_catalog import RuntimeEventCatalog
from plugin_platform.plugin.runtime_event_index import RuntimeEventIndex
from plugin_platform.plugin.runtime_adapter import RuntimeContext

class EventCatalogManager:
    @staticmethod
    def create_catalog(index: RuntimeEventIndex, context: RuntimeContext) -> RuntimeEventCatalog:
        # Trace ID アサーション検証
        assert index.trace_id is not None, "RuntimeEventIndex trace_id must not be None"
        assert index.index_id is not None, "RuntimeEventIndex index_id must not be None"
        
        # 決定論的な catalog_id 導出
        catalog_id = f"catalog:{index.index_id}"
        catalog_type = "default"
        entries = []
        
        metadata = {
            "version": 1,
            "manager": "event_catalog_manager_stub",
            "environment": context.environment
        }
        
        return RuntimeEventCatalog(
            catalog_id=catalog_id,
            runtime_event_index=index,
            catalog_type=catalog_type,
            entries=entries,
            metadata=metadata,
            trace_id=index.trace_id
        )
