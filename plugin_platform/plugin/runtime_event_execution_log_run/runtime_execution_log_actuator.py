class RuntimeExecutionLogActuator:
    """
    RuntimeExecutionLogActuator
    
    【設計定義】
    - Actuator: 実際の実行開始構造を表現し、ランタイムの実行ゲートを起動するための制御構造です。
    - actuator_state: ロード・待機状態を示す "armed" を保持します。
    """
    def __init__(self, actuator_id: str, run_id: str, actuator_state: str, actuator_map: list, metadata: dict, trace_id: str):
        self.actuator_id = actuator_id
        self.run_id = run_id
        self.actuator_state = actuator_state
        self.actuator_map = actuator_map
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "actuator_id": self.actuator_id,
            "run_id": self.run_id,
            "actuator_state": self.actuator_state,
            "actuator_map": self.actuator_map,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }

    @classmethod
    def from_dict(cls, data: dict) -> "RuntimeExecutionLogActuator":
        return cls(
            actuator_id=data.get("actuator_id"),
            run_id=data.get("run_id"),
            actuator_state=data.get("actuator_state"),
            actuator_map=data.get("actuator_map", []),
            metadata=data.get("metadata", {}),
            trace_id=data.get("trace_id")
        )

