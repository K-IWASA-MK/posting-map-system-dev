class Runtime:
    """
    Runtime
    
    【設計定義】
    - Runtime DTO: 将来的な Runtime Pipeline が利用する Runtime Definition。
    - This DTO defines the immutable execution runtime blueprint only. No runtime execution or side effects are performed.
    """
    def __init__(self, engine_id: str, runtime_type: str, trace_id: str, metadata: dict):
        self.engine_id = engine_id
        self.runtime_type = runtime_type
        self.trace_id = trace_id
        self.metadata = metadata

    def to_dict(self) -> dict:
        return {
            "engine_id": self.engine_id,
            "runtime_type": self.runtime_type,
            "trace_id": self.trace_id,
            "metadata": self.metadata
        }

    @classmethod
    def from_dict(cls, data: dict) -> "Runtime":
        # Backward Compatibility: data.get(...) を使用し、キーが不足している場合はデフォルト値を設定。
        return cls(
            engine_id=data.get("engine_id"),
            runtime_type=data.get("runtime_type", "default"),
            trace_id=data.get("trace_id"),
            metadata=data.get("metadata", {})
        )
