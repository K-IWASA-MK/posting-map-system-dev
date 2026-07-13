from plugin_platform.plugin.runtime_event_execution_log_dispatcher import RuntimeEventExecutionLogDispatcher
from .runtime_execution_log_routing import RuntimeExecutionLogRouting

class RuntimeEventExecutionLogRouting:
    def __init__(self, routing_id: str, runtime_event_execution_log_dispatcher: RuntimeEventExecutionLogDispatcher, routing: RuntimeExecutionLogRouting, metadata: dict, trace_id: str):
        self.routing_id = routing_id
        self.runtime_event_execution_log_dispatcher = runtime_event_execution_log_dispatcher
        self.routing = routing
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "routing_id": self.routing_id,
            "runtime_event_execution_log_dispatcher": self.runtime_event_execution_log_dispatcher.to_dict() if hasattr(self.runtime_event_execution_log_dispatcher, "to_dict") else self.runtime_event_execution_log_dispatcher,
            "routing": self.routing.to_dict() if hasattr(self.routing, "to_dict") else self.routing,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }

    @classmethod
    def from_dict(cls, data: dict) -> "RuntimeEventExecutionLogRouting":
        dispatcher_data = data.get("runtime_event_execution_log_dispatcher")
        if isinstance(dispatcher_data, dict):
            from plugin_platform.plugin.runtime_event_execution_log_dispatcher.runtime_execution_log_dispatcher import RuntimeEventExecutionLogDispatcher
            dispatcher_obj = RuntimeEventExecutionLogDispatcher.from_dict(dispatcher_data)
        else:
            dispatcher_obj = dispatcher_data
            
        return cls(
            routing_id=data.get("routing_id"),
            runtime_event_execution_log_dispatcher=dispatcher_obj,
            routing=RuntimeExecutionLogRouting.from_dict(data.get("routing", {})) if isinstance(data.get("routing"), dict) else data.get("routing"),
            metadata=data.get("metadata", {}),
            trace_id=data.get("trace_id")
        )

