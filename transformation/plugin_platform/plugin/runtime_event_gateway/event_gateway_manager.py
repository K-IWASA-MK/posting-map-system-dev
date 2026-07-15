from .runtime_event_gateway import RuntimeEventGateway
from plugin_platform.plugin.runtime_event_receiver import RuntimeEventReceiver
from plugin_platform.plugin.runtime_adapter import RuntimeContext

class EventGatewayManager:
    @staticmethod
    def create_gateway(receiver: RuntimeEventReceiver, context: RuntimeContext) -> RuntimeEventGateway:
        # Trace ID アサーション検証
        assert receiver.trace_id is not None, "RuntimeEventReceiver trace_id must not be None"
        assert receiver.receiver_id is not None, "RuntimeEventReceiver receiver_id must not be None"
        
        # 決定論的な gateway_id 導出
        gateway_id = f"gateway:{receiver.receiver_id}"
        gateway_type = "default"
        forwarded_events = []
        
        metadata = {
            "version": 1,
            "manager": "event_gateway_manager_stub",
            "environment": context.environment
        }
        
        return RuntimeEventGateway(
            gateway_id=gateway_id,
            runtime_event_receiver=receiver,
            gateway_type=gateway_type,
            forwarded_events=forwarded_events,
            metadata=metadata,
            trace_id=receiver.trace_id
        )
