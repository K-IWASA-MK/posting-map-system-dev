from .runtime_event_audit import RuntimeEventAudit
from plugin_platform.plugin.runtime_event_snapshot import RuntimeEventSnapshot
from plugin_platform.plugin.runtime_adapter import RuntimeContext

class EventAuditManager:
    @staticmethod
    def create_audit(snapshot: RuntimeEventSnapshot, context: RuntimeContext) -> RuntimeEventAudit:
        # Trace ID アサーション検証
        assert snapshot.trace_id is not None, "RuntimeEventSnapshot trace_id must not be None"
        assert snapshot.snapshot_id is not None, "RuntimeEventSnapshot snapshot_id must not be None"
        
        # 決定論的な audit_id 導出
        audit_id = f"audit:{snapshot.snapshot_id}"
        audit_type = "default"
        audit_data = {}
        
        metadata = {
            "version": 1,
            "manager": "event_audit_manager_stub",
            "environment": context.environment
        }
        
        return RuntimeEventAudit(
            audit_id=audit_id,
            runtime_event_snapshot=snapshot,
            audit_type=audit_type,
            audit_data=audit_data,
            metadata=metadata,
            trace_id=snapshot.trace_id
        )
