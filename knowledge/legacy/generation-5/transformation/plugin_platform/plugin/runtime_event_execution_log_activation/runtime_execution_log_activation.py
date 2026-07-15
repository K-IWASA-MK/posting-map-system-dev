from plugin_platform.plugin.runtime_event_execution_log_executor import RuntimeEventExecutionLogExecutor

class RuntimeExecutionLogActivation:
    """
    RuntimeExecutionLogActivation
    
    【設計定義】
    - Activation: Executorを実行可能状態（解釈可能状態）にするゲートであり、実際の状態遷移実行は行いません。
    - trigger: 起動理由のラベル（"controller_pass", "manual", "auto" 等）を意味的に保持します。
    """
    def __init__(self, activation_id: str, executor_id: str, activation_state: str, activation_trigger: str, activation_map: list, metadata: dict, trace_id: str):
        self.activation_id = activation_id
        self.executor_id = executor_id
        self.activation_state = activation_state
        self.activation_trigger = activation_trigger
        self.activation_map = activation_map
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "activation_id": self.activation_id,
            "executor_id": self.executor_id,
            "activation_state": self.activation_state,
            "activation_trigger": self.activation_trigger,
            "activation_map": self.activation_map,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }

    @classmethod
    def from_dict(cls, data: dict) -> "RuntimeExecutionLogActivation":
        return cls(
            activation_id=data.get("activation_id"),
            executor_id=data.get("executor_id"),
            activation_state=data.get("activation_state"),
            activation_trigger=data.get("activation_trigger"),
            activation_map=data.get("activation_map", []),
            metadata=data.get("metadata", {}),
            trace_id=data.get("trace_id")
        )

class RuntimeEventExecutionLogActivation:
    def __init__(self, activation_id: str, runtime_event_execution_log_executor: RuntimeEventExecutionLogExecutor, activation: RuntimeExecutionLogActivation, metadata: dict, trace_id: str):
        self.activation_id = activation_id
        self.runtime_event_execution_log_executor = runtime_event_execution_log_executor
        self.activation = activation
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "activation_id": self.activation_id,
            "runtime_event_execution_log_executor": self.runtime_event_execution_log_executor.to_dict() if hasattr(self.runtime_event_execution_log_executor, "to_dict") else self.runtime_event_execution_log_executor,
            "activation": self.activation.to_dict() if hasattr(self.activation, "to_dict") else self.activation,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }

    @classmethod
    def from_dict(cls, data: dict) -> "RuntimeEventExecutionLogActivation":
        exec_data = data.get("runtime_event_execution_log_executor")
        if isinstance(exec_data, dict):
            from plugin_platform.plugin.runtime_event_execution_log_executor.runtime_event_execution_log_executor import RuntimeEventExecutionLogExecutor
            exec_obj = RuntimeEventExecutionLogExecutor.from_dict(exec_data)
        else:
            exec_obj = exec_data
            
        return cls(
            activation_id=data.get("activation_id"),
            runtime_event_execution_log_executor=exec_obj,
            activation=RuntimeExecutionLogActivation.from_dict(data.get("activation", {})) if isinstance(data.get("activation"), dict) else data.get("activation"),
            metadata=data.get("metadata", {}),
            trace_id=data.get("trace_id")
        )

