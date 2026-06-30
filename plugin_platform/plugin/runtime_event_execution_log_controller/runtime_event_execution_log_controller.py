from plugin_platform.plugin.runtime_event_execution_log_runtime import RuntimeEventExecutionLogRuntime
from .runtime_execution_log_controller import RuntimeExecutionLogController

class RuntimeEventExecutionLogController:
    def __init__(self, controller_id: str, runtime_event_execution_log_runtime: RuntimeEventExecutionLogRuntime, controller: RuntimeExecutionLogController, metadata: dict, trace_id: str):
        self.controller_id = controller_id
        self.runtime_event_execution_log_runtime = runtime_event_execution_log_runtime
        self.controller = controller
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "controller_id": self.controller_id,
            "runtime_event_execution_log_runtime": self.runtime_event_execution_log_runtime.to_dict() if hasattr(self.runtime_event_execution_log_runtime, "to_dict") else self.runtime_event_execution_log_runtime,
            "controller": self.controller.to_dict() if hasattr(self.controller, "to_dict") else self.controller,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }

    @classmethod
    def from_dict(cls, data: dict) -> "RuntimeEventExecutionLogController":
        runtime_data = data.get("runtime_event_execution_log_runtime")
        if isinstance(runtime_data, dict):
            from plugin_platform.plugin.runtime_event_execution_log_runtime.runtime_event_execution_log_runtime import RuntimeEventExecutionLogRuntime
            runtime_obj = RuntimeEventExecutionLogRuntime.from_dict(runtime_data)
        else:
            runtime_obj = runtime_data
            
        return cls(
            controller_id=data.get("controller_id"),
            runtime_event_execution_log_runtime=runtime_obj,
            controller=RuntimeExecutionLogController.from_dict(data.get("controller", {})) if isinstance(data.get("controller"), dict) else data.get("controller"),
            metadata=data.get("metadata", {}),
            trace_id=data.get("trace_id")
        )

