from .runtime_event_handler import RuntimeEventHandler
from plugin_platform.plugin.runtime_event_endpoint import RuntimeEventEndpoint
from plugin_platform.plugin.runtime_adapter import RuntimeContext

class EventHandlerManager:
    @staticmethod
    def create_handler(endpoint: RuntimeEventEndpoint, context: RuntimeContext) -> RuntimeEventHandler:
        # Trace ID アサーション検証
        assert endpoint.trace_id is not None, "RuntimeEventEndpoint trace_id must not be None"
        assert endpoint.endpoint_id is not None, "RuntimeEventEndpoint endpoint_id must not be None"
        
        # 決定論的な handler_id 導出
        handler_id = f"handler:{endpoint.endpoint_id}"
        handler_type = "default"
        handler_actions = []
        
        metadata = {
            "version": 1,
            "manager": "event_handler_manager_stub",
            "environment": context.environment
        }
        
        return RuntimeEventHandler(
            handler_id=handler_id,
            runtime_event_endpoint=endpoint,
            handler_type=handler_type,
            handler_actions=handler_actions,
            metadata=metadata,
            trace_id=endpoint.trace_id
        )
