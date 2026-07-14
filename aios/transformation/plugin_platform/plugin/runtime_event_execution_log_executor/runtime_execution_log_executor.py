class RuntimeExecutionLogExecutor:
    """
    RuntimeExecutionLogExecutor
    
    実行開始と制御の遷移を統括する「状態遷移マシン (State Transition Engine)」を表す DTO です。
    """
    def __init__(self, executor_id: str, controller_id: str, lifecycle_state: str, execution_cursor: str, lifecycle_map: list, state_transition_map: list, metadata: dict, trace_id: str):
        self.executor_id = executor_id
        self.controller_id = controller_id
        self.lifecycle_state = lifecycle_state
        
        # execution_cursor は有向グラフ化や拡張性を考慮し、数値ではなく意味ベースの文字列状態を設定します。
        self.execution_cursor = execution_cursor
        
        self.lifecycle_map = lifecycle_map
        self.state_transition_map = state_transition_map
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "executor_id": self.executor_id,
            "controller_id": self.controller_id,
            "lifecycle_state": self.lifecycle_state,
            "execution_cursor": self.execution_cursor,
            "lifecycle_map": self.lifecycle_map,
            "state_transition_map": self.state_transition_map,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }

    @classmethod
    def from_dict(cls, data: dict) -> "RuntimeExecutionLogExecutor":
        return cls(
            executor_id=data.get("executor_id"),
            controller_id=data.get("controller_id"),
            lifecycle_state=data.get("lifecycle_state"),
            execution_cursor=data.get("execution_cursor"),
            lifecycle_map=data.get("lifecycle_map", []),
            state_transition_map=data.get("state_transition_map", []),
            metadata=data.get("metadata", {}),
            trace_id=data.get("trace_id")
        )

