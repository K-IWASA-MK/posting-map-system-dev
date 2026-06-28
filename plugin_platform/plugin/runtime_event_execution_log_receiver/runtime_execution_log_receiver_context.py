from plugin_platform.plugin.runtime_event_execution_log_endpoint import RuntimeExecutionLogEndpointBoundary
from .runtime_execution_log_receiver import RuntimeEventExecutionLogReceiver
from .runtime_execution_log_router import RuntimeEventExecutionLogRouter

class RuntimeExecutionLogReceiverContext:
    def __init__(self, receiver_context_id: str, runtime_event_execution_log_endpoint_boundary: RuntimeExecutionLogEndpointBoundary, runtime_event_execution_log_receiver: RuntimeEventExecutionLogReceiver, runtime_event_execution_log_router: RuntimeEventExecutionLogRouter, interpretation_state: str, metadata: dict, trace_id: str):
        self.receiver_context_id = receiver_context_id
        self.runtime_event_execution_log_endpoint_boundary = runtime_event_execution_log_endpoint_boundary
        self.runtime_event_execution_log_receiver = runtime_event_execution_log_receiver
        self.runtime_event_execution_log_router = runtime_event_execution_log_router
        self.interpretation_state = interpretation_state
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "receiver_context_id": self.receiver_context_id,
            "runtime_event_execution_log_endpoint_boundary": self.runtime_event_execution_log_endpoint_boundary.to_dict() if hasattr(self.runtime_event_execution_log_endpoint_boundary, "to_dict") else self.runtime_event_execution_log_endpoint_boundary,
            "runtime_event_execution_log_receiver": self.runtime_event_execution_log_receiver.to_dict() if hasattr(self.runtime_event_execution_log_receiver, "to_dict") else self.runtime_event_execution_log_receiver,
            "runtime_event_execution_log_router": self.runtime_event_execution_log_router.to_dict() if hasattr(self.runtime_event_execution_log_router, "to_dict") else self.runtime_event_execution_log_router,
            "interpretation_state": self.interpretation_state,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }
