from .runtime_event_router import RuntimeEventRouter
from plugin_platform.plugin.runtime_event_dispatcher import RuntimeEventDispatcher
from plugin_platform.plugin.runtime_adapter import RuntimeContext

class EventRouterManager:
    @staticmethod
    def create_router(dispatcher: RuntimeEventDispatcher, context: RuntimeContext) -> RuntimeEventRouter:
        # Trace ID アサーション検証
        assert dispatcher.trace_id is not None, "RuntimeEventDispatcher trace_id must not be None"
        assert dispatcher.dispatcher_id is not None, "RuntimeEventDispatcher dispatcher_id must not be None"
        
        # 決定論的な router_id 導出
        router_id = f"router:{dispatcher.dispatcher_id}"
        router_type = "default"
        route_targets = []
        
        metadata = {
            "version": 1,
            "manager": "event_router_manager_stub",
            "environment": context.environment
        }
        
        return RuntimeEventRouter(
            router_id=router_id,
            runtime_event_dispatcher=dispatcher,
            router_type=router_type,
            route_targets=route_targets,
            metadata=metadata,
            trace_id=dispatcher.trace_id
        )
