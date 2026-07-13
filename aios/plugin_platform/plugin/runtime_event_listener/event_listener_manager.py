from .runtime_event_listener import RuntimeEventListener
from plugin_platform.plugin.runtime_event_gateway import RuntimeEventGateway
from plugin_platform.plugin.runtime_adapter import RuntimeContext

class EventListenerManager:
    @staticmethod
    def create_listener(gateway: RuntimeEventGateway, context: RuntimeContext) -> RuntimeEventListener:
        # Trace ID アサーション検証
        assert gateway.trace_id is not None, "RuntimeEventGateway trace_id must not be None"
        assert gateway.gateway_id is not None, "RuntimeEventGateway gateway_id must not be None"
        
        # 決定論的な listener_id 導出
        listener_id = f"listener:{gateway.gateway_id}"
        listener_type = "default"
        listening_events = []
        
        metadata = {
            "version": 1,
            "manager": "event_listener_manager_stub",
            "environment": context.environment
        }
        
        return RuntimeEventListener(
            listener_id=listener_id,
            runtime_event_gateway=gateway,
            listener_type=listener_type,
            listening_events=listening_events,
            metadata=metadata,
            trace_id=gateway.trace_id
        )
