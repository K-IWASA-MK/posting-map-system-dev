class Engine:
    """
    Engine
    
    【設計定義】
    - Engine DTO: Blueprint を保持する実行エンジンの定義モデル。
    - This DTO defines the immutable execution engine blueprint only. No runtime execution or side effects are performed.
    """
    def __init__(self, blueprint_id: str, engine_type: str, trace_id: str, metadata: dict):
        self.blueprint_id = blueprint_id
        self.engine_type = engine_type
        self.trace_id = trace_id
        self.metadata = metadata

    def to_dict(self) -> dict:
        return {
            "blueprint_id": self.blueprint_id,
            "engine_type": self.engine_type,
            "trace_id": self.trace_id,
            "metadata": self.metadata
        }

    @classmethod
    def from_dict(cls, data: dict) -> "Engine":
        # Backward Compatibility: data.get(...) を使用し、キーが不足している場合はデフォルト値を設定。
        return cls(
            blueprint_id=data.get("blueprint_id"),
            engine_type=data.get("engine_type", "default"),
            trace_id=data.get("trace_id"),
            metadata=data.get("metadata", {})
        )
