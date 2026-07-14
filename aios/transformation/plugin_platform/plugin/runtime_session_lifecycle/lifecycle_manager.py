from .runtime_session_lifecycle import RuntimeSessionLifecycle
from plugin_platform.plugin.runtime_session import RuntimeSession
from plugin_platform.plugin.runtime_adapter import RuntimeContext

class LifecycleManager:
    @staticmethod
    def create_lifecycle(session: RuntimeSession, context: RuntimeContext) -> RuntimeSessionLifecycle:
        # Trace ID アサーション検証
        assert session.trace_id is not None, "RuntimeSession trace_id must not be None"
        assert session.session_id is not None, "RuntimeSession session_id must not be None"
        
        # 決定論的な lifecycle_id 導出
        lifecycle_id = f"lifecycle:{session.session_id}"
        state = "initialized"
        
        metadata = {
            "version": 1,
            "manager": "lifecycle_manager_stub",
            "environment": context.environment
        }
        
        return RuntimeSessionLifecycle(
            lifecycle_id=lifecycle_id,
            runtime_session=session,
            state=state,
            metadata=metadata,
            trace_id=session.trace_id
        )
