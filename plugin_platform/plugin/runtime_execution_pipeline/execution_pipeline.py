class Pipeline:
    """
    Pipeline
    
    【設計定義】
    - Pipeline DTO: 将来的な Execution Flow を構成する Pipeline Definition。
    - This DTO defines the immutable execution pipeline blueprint only. No runtime execution or side effects are performed.
    """
    def __init__(self, runtime_id: str, pipeline_type: str, trace_id: str, metadata: dict):
        self.runtime_id = runtime_id
        self.pipeline_type = pipeline_type
        self.trace_id = trace_id
        self.metadata = metadata

    def to_dict(self) -> dict:
        return {
            "runtime_id": self.runtime_id,
            "pipeline_type": self.pipeline_type,
            "trace_id": self.trace_id,
            "metadata": self.metadata
        }

    @classmethod
    def from_dict(cls, data: dict) -> "Pipeline":
        # Backward Compatibility: data.get(...) を使用し、キーが不足している場合はデフォルト値を設定。
        return cls(
            runtime_id=data.get("runtime_id"),
            pipeline_type=data.get("pipeline_type", "default"),
            trace_id=data.get("trace_id"),
            metadata=data.get("metadata", {})
        )
