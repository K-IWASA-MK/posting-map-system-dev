from .runtime_session import RuntimeSession
from plugin_platform.plugin.runtime_factory import RuntimeInstance
from plugin_platform.plugin.runtime_adapter import RuntimeContext

class SessionManager:
    @staticmethod
    def create_session(instance: RuntimeInstance, context: RuntimeContext) -> RuntimeSession:
        # Trace ID アサーション検証
        assert instance.trace_id is not None, "RuntimeInstance trace_id must not be None"
        assert instance.instance_id is not None, "RuntimeInstance instance_id must not be None"
        
        # 決定論的な session_id 導出
        session_id = f"session:{instance.instance_id}"
        state = "initialized"
        
        metadata = {
            "version": 1,
            "manager": "session_manager_stub",
            "environment": context.environment
        }
        
        return RuntimeSession(
            session_id=session_id,
            runtime_instance=instance,
            state=state,
            configuration=context.configuration,
            metadata=metadata,
            trace_id=instance.trace_id
        )
