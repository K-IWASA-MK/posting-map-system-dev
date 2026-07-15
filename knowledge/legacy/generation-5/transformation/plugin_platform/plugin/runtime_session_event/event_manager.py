from .runtime_session_event import RuntimeSessionEvent
from plugin_platform.plugin.runtime_session_lifecycle import RuntimeSessionLifecycle
from plugin_platform.plugin.runtime_adapter import RuntimeContext

class EventManager:
    @staticmethod
    def create_event(lifecycle: RuntimeSessionLifecycle, context: RuntimeContext) -> RuntimeSessionEvent:
        # Trace ID アサーション検証
        assert lifecycle.trace_id is not None, "RuntimeSessionLifecycle trace_id must not be None"
        assert lifecycle.lifecycle_id is not None, "RuntimeSessionLifecycle lifecycle_id must not be None"
        
        # 決定論的な event_id 導出
        event_id = f"event:{lifecycle.lifecycle_id}"
        event_type = "initialized"
        
        session_id = lifecycle.runtime_session.get("session_id") if isinstance(lifecycle.runtime_session, dict) else getattr(lifecycle.runtime_session, "session_id", None)
        payload = {
            "session_id": session_id,
            "state": lifecycle.state
        }
        
        metadata = {
            "version": 1,
            "manager": "event_manager_stub",
            "environment": context.environment
        }
        
        return RuntimeSessionEvent(
            event_id=event_id,
            runtime_session_lifecycle=lifecycle,
            event_type=event_type,
            payload=payload,
            metadata=metadata,
            trace_id=lifecycle.trace_id
        )
