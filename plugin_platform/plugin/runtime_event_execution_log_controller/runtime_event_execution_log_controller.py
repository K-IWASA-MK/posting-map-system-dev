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
