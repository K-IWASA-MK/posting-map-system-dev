from plugin_platform.plugin.runtime_event_execution_log_activation import RuntimeEventExecutionLogActivation

class RuntimeExecutionLogRun:
    """
    RuntimeExecutionLogRun
    
    【設計定義】
    - Run: 実行資格の有効化ゲート(Activation)を通過した後の、実行の開始・初期状態を表現します。
    - run_state: 開始可能状態を示す "ready_to_run" などの状態値を決定論的に保持します。
    """
    def __init__(self, run_id: str, activation_id: str, run_state: str, run_map: list, metadata: dict, trace_id: str):
        self.run_id = run_id
        self.activation_id = activation_id
        self.run_state = run_state
        self.run_map = run_map
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "run_id": self.run_id,
            "activation_id": self.activation_id,
            "run_state": self.run_state,
            "run_map": self.run_map,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }

    @classmethod
    def from_dict(cls, data: dict) -> "RuntimeExecutionLogRun":
        return cls(
            run_id=data.get("run_id"),
            activation_id=data.get("activation_id"),
            run_state=data.get("run_state"),
            run_map=data.get("run_map", []),
            metadata=data.get("metadata", {}),
            trace_id=data.get("trace_id")
        )

class RuntimeEventExecutionLogRun:
    def __init__(self, run_id: str, runtime_event_execution_log_activation: RuntimeEventExecutionLogActivation, run: RuntimeExecutionLogRun, metadata: dict, trace_id: str):
        self.run_id = run_id
        self.runtime_event_execution_log_activation = runtime_event_execution_log_activation
        self.run = run
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "run_id": self.run_id,
            "runtime_event_execution_log_activation": self.runtime_event_execution_log_activation.to_dict() if hasattr(self.runtime_event_execution_log_activation, "to_dict") else self.runtime_event_execution_log_activation,
            "run": self.run.to_dict() if hasattr(self.run, "to_dict") else self.run,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }

    @classmethod
    def from_dict(cls, data: dict) -> "RuntimeEventExecutionLogRun":
        activation_data = data.get("runtime_event_execution_log_activation")
        if isinstance(activation_data, dict):
            from plugin_platform.plugin.runtime_event_execution_log_activation.runtime_execution_log_activation import RuntimeEventExecutionLogActivation
            activation_obj = RuntimeEventExecutionLogActivation.from_dict(activation_data)
        else:
            activation_obj = activation_data
            
        return cls(
            run_id=data.get("run_id"),
            runtime_event_execution_log_activation=activation_obj,
            run=RuntimeExecutionLogRun.from_dict(data.get("run", {})) if isinstance(data.get("run"), dict) else data.get("run"),
            metadata=data.get("metadata", {}),
            trace_id=data.get("trace_id")
        )

