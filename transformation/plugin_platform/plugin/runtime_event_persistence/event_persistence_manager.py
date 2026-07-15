from .runtime_event_persistence import RuntimeEventPersistence
from plugin_platform.plugin.runtime_event_audit import RuntimeEventAudit
from plugin_platform.plugin.runtime_adapter import RuntimeContext

class EventPersistenceManager:
    @staticmethod
    def create_persistence(audit: RuntimeEventAudit, context: RuntimeContext) -> RuntimeEventPersistence:
        # Trace ID アサーション検証
        assert audit.trace_id is not None, "RuntimeEventAudit trace_id must not be None"
        assert audit.audit_id is not None, "RuntimeEventAudit audit_id must not be None"
        
        # 決定論的な persistence_id 導出
        persistence_id = f"persistence:{audit.audit_id}"
        persistence_type = "default"
        persistence_data = {}
        
        metadata = {
            "version": 1,
            "manager": "event_persistence_manager_stub",
            "environment": context.environment
        }
        
        return RuntimeEventPersistence(
            persistence_id=persistence_id,
            runtime_event_audit=audit,
            persistence_type=persistence_type,
            persistence_data=persistence_data,
            metadata=metadata,
            trace_id=audit.trace_id
        )
