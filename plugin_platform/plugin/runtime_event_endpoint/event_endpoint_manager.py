from .runtime_event_endpoint import RuntimeEventEndpoint
from plugin_platform.plugin.runtime_event_router import RuntimeEventRouter
from plugin_platform.plugin.runtime_adapter import RuntimeContext

class EventEndpointManager:
    @staticmethod
    def create_endpoint(router: RuntimeEventRouter, context: RuntimeContext) -> RuntimeEventEndpoint:
        # Trace ID アサーション検証
        assert router.trace_id is not None, "RuntimeEventRouter trace_id must not be None"
        assert router.router_id is not None, "RuntimeEventRouter router_id must not be None"
        
        # 決定論的な endpoint_id 導出
        endpoint_id = f"endpoint:{router.router_id}"
        endpoint_type = "default"
        endpoint_targets = []
        
        metadata = {
            "version": 1,
            "manager": "event_endpoint_manager_stub",
            "environment": context.environment
        }
        
        return RuntimeEventEndpoint(
            endpoint_id=endpoint_id,
            runtime_event_router=router,
            endpoint_type=endpoint_type,
            endpoint_targets=endpoint_targets,
            metadata=metadata,
            trace_id=router.trace_id
        )
