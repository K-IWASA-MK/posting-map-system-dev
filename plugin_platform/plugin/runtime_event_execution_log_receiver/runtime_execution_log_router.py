from .runtime_execution_log_receiver import RuntimeEventExecutionLogReceiver

class RuntimeExecutionLogRouter:
    def __init__(self, router_id: str, receiver_id: str, routing_state: str, routing_context: list, metadata: dict, trace_id: str):
        self.router_id = router_id
        self.receiver_id = receiver_id
        self.routing_state = routing_state
        self.routing_context = routing_context
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "router_id": self.router_id,
            "receiver_id": self.receiver_id,
            "routing_state": self.routing_state,
            "routing_context": self.routing_context,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }

    @classmethod
    def from_dict(cls, data: dict) -> "RuntimeExecutionLogRouter":
        return cls(
            router_id=data.get("router_id"),
            receiver_id=data.get("receiver_id"),
            routing_state=data.get("routing_state"),
            routing_context=data.get("routing_context", []),
            metadata=data.get("metadata", {}),
            trace_id=data.get("trace_id")
        )

class RuntimeEventExecutionLogRouter:
    def __init__(self, router_id: str, runtime_event_execution_log_receiver: RuntimeEventExecutionLogReceiver, router: RuntimeExecutionLogRouter, metadata: dict, trace_id: str):
        self.router_id = router_id
        self.runtime_event_execution_log_receiver = runtime_event_execution_log_receiver
        self.router = router
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "router_id": self.router_id,
            "runtime_event_execution_log_receiver": self.runtime_event_execution_log_receiver.to_dict() if hasattr(self.runtime_event_execution_log_receiver, "to_dict") else self.runtime_event_execution_log_receiver,
            "router": self.router.to_dict() if hasattr(self.router, "to_dict") else self.router,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }

    @classmethod
    def from_dict(cls, data: dict) -> "RuntimeEventExecutionLogRouter":
        receiver_data = data.get("runtime_event_execution_log_receiver")
        if isinstance(receiver_data, dict):
            from .runtime_execution_log_receiver import RuntimeEventExecutionLogReceiver
            receiver_obj = RuntimeEventExecutionLogReceiver.from_dict(receiver_data)
        else:
            receiver_obj = receiver_data
            
        return cls(
            router_id=data.get("router_id"),
            runtime_event_execution_log_receiver=receiver_obj,
            router=RuntimeExecutionLogRouter.from_dict(data.get("router", {})) if isinstance(data.get("router"), dict) else data.get("router"),
            metadata=data.get("metadata", {}),
            trace_id=data.get("trace_id")
        )

