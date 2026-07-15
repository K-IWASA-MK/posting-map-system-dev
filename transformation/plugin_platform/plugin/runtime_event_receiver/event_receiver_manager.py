from .runtime_event_receiver import RuntimeEventReceiver
from plugin_platform.plugin.runtime_event_handler import RuntimeEventHandler
from plugin_platform.plugin.runtime_adapter import RuntimeContext

class EventReceiverManager:
    @staticmethod
    def create_receiver(handler: RuntimeEventHandler, context: RuntimeContext) -> RuntimeEventReceiver:
        # Trace ID アサーション検証
        assert handler.trace_id is not None, "RuntimeEventHandler trace_id must not be None"
        assert handler.handler_id is not None, "RuntimeEventHandler handler_id must not be None"
        
        # 決定論的な receiver_id 導出
        receiver_id = f"receiver:{handler.handler_id}"
        receiver_type = "default"
        received_events = []
        
        metadata = {
            "version": 1,
            "manager": "event_receiver_manager_stub",
            "environment": context.environment
        }
        
        return RuntimeEventReceiver(
            receiver_id=receiver_id,
            runtime_event_handler=handler,
            receiver_type=receiver_type,
            received_events=received_events,
            metadata=metadata,
            trace_id=handler.trace_id
        )
