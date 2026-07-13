from .execution_pipeline import Pipeline

class RuntimeExecutionPipeline:
    """
    RuntimeExecutionPipeline
    
    【設計定義】
    - Immutable Execution Pipeline Blueprint
      (This DTO defines the immutable execution pipeline blueprint only. No runtime execution or side effects are performed.)
    - pipeline_id: runtime_id から決定論的に導出される一意な識別子。
    - runtime_id: 対象とする Execution Runtime ID。
    - pipeline_type: パイプライン種別を示す固定値 "default"。
    - pipeline_state: パイプラインの状態を示す固定値 "pipeline_ready"。
    - pipeline_version: パイプライン設計のバージョン識別子 "v1"。
    - pipeline_map: 実行パイプラインマッピングの Blueprint 固定配列。
    """
    def __init__(self, pipeline_id: str, runtime_id: str, pipeline_type: str, pipeline_state: str, pipeline_version: str, pipeline_map: list, trace_id: str, pipeline_obj: Pipeline, metadata: dict):
        self.pipeline_id = pipeline_id
        self.runtime_id = runtime_id
        self.pipeline_type = pipeline_type
        self.pipeline_state = pipeline_state
        self.pipeline_version = pipeline_version
        self.pipeline_map = pipeline_map
        self.trace_id = trace_id
        self.pipeline = pipeline_obj
        self.metadata = metadata

    def to_dict(self) -> dict:
        return {
            "pipeline_id": self.pipeline_id,
            "runtime_id": self.runtime_id,
            "pipeline_type": self.pipeline_type,
            "pipeline_state": self.pipeline_state,
            "pipeline_version": self.pipeline_version,
            "pipeline_map": self.pipeline_map,
            "trace_id": self.trace_id,
            "pipeline": self.pipeline.to_dict() if hasattr(self.pipeline, "to_dict") else self.pipeline,
            "metadata": self.metadata
        }

    @classmethod
    def from_dict(cls, data: dict) -> "RuntimeExecutionPipeline":
        # Backward Compatibility
        pl_data = data.get("pipeline")
        if isinstance(pl_data, dict):
            pl_obj = Pipeline.from_dict(pl_data)
        else:
            pl_obj = pl_data
            
        return cls(
            pipeline_id=data.get("pipeline_id"),
            runtime_id=data.get("runtime_id"),
            pipeline_type=data.get("pipeline_type", "default"),
            pipeline_state=data.get("pipeline_state", "pipeline_ready"),
            pipeline_version=data.get("pipeline_version", "v1"),
            pipeline_map=data.get("pipeline_map", []),
            trace_id=data.get("trace_id"),
            pipeline_obj=pl_obj,
            metadata=data.get("metadata", {})
        )
