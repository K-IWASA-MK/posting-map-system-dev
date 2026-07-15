from .runtime_event_store import RuntimeEventStore
from plugin_platform.plugin.runtime_session_event import RuntimeSessionEvent
from plugin_platform.plugin.runtime_adapter import RuntimeContext

class EventStoreManager:
    @staticmethod
    def create_store(event: RuntimeSessionEvent, context: RuntimeContext) -> RuntimeEventStore:
        # Trace ID アサーション検証
        assert event.trace_id is not None, "RuntimeSessionEvent trace_id must not be None"
        assert event.event_id is not None, "RuntimeSessionEvent event_id must not be None"
        
        # 決定論的な store_id 導出
        store_id = f"store:{event.event_id}"
        storage_type = "memory"
        
        metadata = {
            "version": 1,
            "manager": "event_store_manager_stub",
            "environment": context.environment
        }
        
        return RuntimeEventStore(
            store_id=store_id,
            runtime_session_event=event,
            storage_type=storage_type,
            metadata=metadata,
            trace_id=event.trace_id
        )
