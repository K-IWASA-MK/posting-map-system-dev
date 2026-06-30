from plugin_platform.plugin.runtime_event_execution_log_controller import RuntimeEventExecutionLogController
from .runtime_execution_log_executor import RuntimeExecutionLogExecutor

class RuntimeEventExecutionLogExecutor:
    def __init__(self, executor_id: str, runtime_event_execution_log_controller: RuntimeEventExecutionLogController, executor: RuntimeExecutionLogExecutor, metadata: dict, trace_id: str):
        self.executor_id = executor_id
        self.runtime_event_execution_log_controller = runtime_event_execution_log_controller
        self.executor = executor
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "executor_id": self.executor_id,
            "runtime_event_execution_log_controller": self.runtime_event_execution_log_controller.to_dict() if hasattr(self.runtime_event_execution_log_controller, "to_dict") else self.runtime_event_execution_log_controller,
            "executor": self.executor.to_dict() if hasattr(self.executor, "to_dict") else self.executor,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }

    @classmethod
    def from_dict(cls, data: dict) -> "RuntimeEventExecutionLogExecutor":
        ctrl_data = data.get("runtime_event_execution_log_controller")
        if isinstance(ctrl_data, dict):
            from plugin_platform.plugin.runtime_event_execution_log_controller.runtime_event_execution_log_controller import RuntimeEventExecutionLogController
            ctrl_obj = RuntimeEventExecutionLogController.from_dict(ctrl_data)
        else:
            ctrl_obj = ctrl_data
            
        return cls(
            executor_id=data.get("executor_id"),
            runtime_event_execution_log_controller=ctrl_obj,
            executor=RuntimeExecutionLogExecutor.from_dict(data.get("executor", {})) if isinstance(data.get("executor"), dict) else data.get("executor"),
            metadata=data.get("metadata", {}),
            trace_id=data.get("trace_id")
        )

