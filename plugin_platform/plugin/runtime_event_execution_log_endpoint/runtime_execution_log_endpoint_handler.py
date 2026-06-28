from plugin_platform.plugin.runtime_event_execution_log_routing import RuntimeEventExecutionLogRouting
from .runtime_execution_log_endpoint import RuntimeEventExecutionLogEndpoint
from .runtime_execution_log_handler import RuntimeEventExecutionLogHandler

class RuntimeExecutionLogEndpointBoundary:
    def __init__(self, execution_boundary_id: str, runtime_event_execution_log_routing: RuntimeEventExecutionLogRouting, runtime_event_execution_log_endpoint: RuntimeEventExecutionLogEndpoint, runtime_event_execution_log_handler: RuntimeEventExecutionLogHandler, boundary_state: str, metadata: dict, trace_id: str):
        self.execution_boundary_id = execution_boundary_id
        self.runtime_event_execution_log_routing = runtime_event_execution_log_routing
        self.runtime_event_execution_log_endpoint = runtime_event_execution_log_endpoint
        self.runtime_event_execution_log_handler = runtime_event_execution_log_handler
        self.boundary_state = boundary_state
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "execution_boundary_id": self.execution_boundary_id,
            "runtime_event_execution_log_routing": self.runtime_event_execution_log_routing.to_dict() if hasattr(self.runtime_event_execution_log_routing, "to_dict") else self.runtime_event_execution_log_routing,
            "runtime_event_execution_log_endpoint": self.runtime_event_execution_log_endpoint.to_dict() if hasattr(self.runtime_event_execution_log_endpoint, "to_dict") else self.runtime_event_execution_log_endpoint,
            "runtime_event_execution_log_handler": self.runtime_event_execution_log_handler.to_dict() if hasattr(self.runtime_event_execution_log_handler, "to_dict") else self.runtime_event_execution_log_handler,
            "boundary_state": self.boundary_state,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }

# エイリアスの定義
RuntimeExecutionLogEndpointHandler = RuntimeExecutionLogEndpointBoundary
