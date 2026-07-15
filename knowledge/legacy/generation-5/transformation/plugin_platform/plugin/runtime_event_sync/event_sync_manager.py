from .runtime_event_sync import RuntimeEventSync
from plugin_platform.plugin.runtime_event_persistence import RuntimeEventPersistence
from plugin_platform.plugin.runtime_adapter import RuntimeContext

class EventSyncManager:
    @staticmethod
    def create_sync(persistence: RuntimeEventPersistence, context: RuntimeContext) -> RuntimeEventSync:
        # Trace ID アサーション検証
        assert persistence.trace_id is not None, "RuntimeEventPersistence trace_id must not be None"
        assert persistence.persistence_id is not None, "RuntimeEventPersistence persistence_id must not be None"
        
        # 決定論的な sync_id 導出
        sync_id = f"sync:{persistence.persistence_id}"
        sync_type = "default"
        sync_data = {}
        
        metadata = {
            "version": 1,
            "manager": "event_sync_manager_stub",
            "environment": context.environment
        }
        
        return RuntimeEventSync(
            sync_id=sync_id,
            runtime_event_persistence=persistence,
            sync_type=sync_type,
            sync_data=sync_data,
            metadata=metadata,
            trace_id=persistence.trace_id
        )
