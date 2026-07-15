from .runtime_event_dispatcher import RuntimeEventDispatcher
from plugin_platform.plugin.runtime_event_stream import RuntimeEventStream
from plugin_platform.plugin.runtime_adapter import RuntimeContext

class EventDispatcherManager:
    @staticmethod
    def create_dispatcher(stream: RuntimeEventStream, context: RuntimeContext) -> RuntimeEventDispatcher:
        # Trace ID アサーション検証
        assert stream.trace_id is not None, "RuntimeEventStream trace_id must not be None"
        assert stream.stream_id is not None, "RuntimeEventStream stream_id must not be None"
        
        # 決定論的な dispatcher_id 導出
        dispatcher_id = f"dispatcher:{stream.stream_id}"
        dispatcher_type = "default"
        dispatch_targets = []
        
        metadata = {
            "version": 1,
            "manager": "event_dispatcher_manager_stub",
            "environment": context.environment
        }
        
        return RuntimeEventDispatcher(
            dispatcher_id=dispatcher_id,
            runtime_event_stream=stream,
            dispatcher_type=dispatcher_type,
            dispatch_targets=dispatch_targets,
            metadata=metadata,
            trace_id=stream.trace_id
        )
