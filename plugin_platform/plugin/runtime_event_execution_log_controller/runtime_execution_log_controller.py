class RuntimeExecutionLogController:
    def __init__(self, controller_id: str, runtime_execution_log_runtime: any, control_state: str, control_policy_map: list, metadata: dict, trace_id: str):
        self.controller_id = controller_id
        self.runtime_execution_log_runtime = runtime_execution_log_runtime
        self.control_state = control_state
        self.control_policy_map = control_policy_map
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "controller_id": self.controller_id,
            "runtime_execution_log_runtime": self.runtime_execution_log_runtime.to_dict() if hasattr(self.runtime_execution_log_runtime, "to_dict") else self.runtime_execution_log_runtime,
            "control_state": self.control_state,
            "control_policy_map": self.control_policy_map,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }
