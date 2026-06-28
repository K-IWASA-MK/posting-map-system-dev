class RuntimeExecutionLogExecutor:
    """
    RuntimeExecutionLogExecutor
    
    実行開始と制御の遷移を統括する「状態遷移マシン (State Transition Engine)」を表す DTO です。
    """
    def __init__(self, executor_id: str, controller_id: str, lifecycle_state: str, execution_cursor: int, lifecycle_map: list, metadata: dict, trace_id: str):
        self.executor_id = executor_id
        self.controller_id = controller_id
        self.lifecycle_state = lifecycle_state
        
        # execution_cursor は lifecycle_map のインデックスに対応します。
        # 0は初期状態 "initialize_execution" を意味的に指す初期カーソル位置です。
        self.execution_cursor = execution_cursor
        
        self.lifecycle_map = lifecycle_map
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "executor_id": self.executor_id,
            "controller_id": self.controller_id,
            "lifecycle_state": self.lifecycle_state,
            "execution_cursor": self.execution_cursor,
            "lifecycle_map": self.lifecycle_map,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }
