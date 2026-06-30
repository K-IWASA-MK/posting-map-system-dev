from .execution_flow import Flow

class RuntimeExecutionFlow:
    """
    RuntimeExecutionFlow
    
    【設計定義】
    - Immutable Execution Flow Blueprint
      (This DTO defines the immutable execution flow blueprint only. No runtime execution or side effects are performed.)
    - flow_id: pipeline_id から決定論的に導出される一意な識別子。
    - pipeline_id: 対象とする Execution Pipeline ID。
    - flow_type: フロー種別を示す固定値 "default"。
    - flow_state: フローの状態を示す固定値 "flow_ready"。
    - flow_version: フロー設計のバージョン識別子 "v1"。
    - flow_map: 実行フロー階層の Blueprint 固定配列。
    """
    def __init__(self, flow_id: str, pipeline_id: str, flow_type: str, flow_state: str, flow_version: str, flow_map: list, trace_id: str, flow_obj: Flow, metadata: dict):
        self.flow_id = flow_id
        self.pipeline_id = pipeline_id
        self.flow_type = flow_type
        self.flow_state = flow_state
        self.flow_version = flow_version
        self.flow_map = flow_map
        self.trace_id = trace_id
        self.flow = flow_obj
        self.metadata = metadata

    def to_dict(self) -> dict:
        return {
            "flow_id": self.flow_id,
            "pipeline_id": self.pipeline_id,
            "flow_type": self.flow_type,
            "flow_state": self.flow_state,
            "flow_version": self.flow_version,
            "flow_map": self.flow_map,
            "trace_id": self.trace_id,
            "flow": self.flow.to_dict() if hasattr(self.flow, "to_dict") else self.flow,
            "metadata": self.metadata
        }

    @classmethod
    def from_dict(cls, data: dict) -> "RuntimeExecutionFlow":
        # Backward Compatibility
        fl_data = data.get("flow")
        if isinstance(fl_data, dict):
            fl_obj = Flow.from_dict(fl_data)
        else:
            fl_obj = fl_data

        return cls(
            flow_id=data.get("flow_id"),
            pipeline_id=data.get("pipeline_id"),
            flow_type=data.get("flow_type", "default"),
            flow_state=data.get("flow_state", "flow_ready"),
            flow_version=data.get("flow_version", "v1"),
            flow_map=data.get("flow_map", []),
            trace_id=data.get("trace_id"),
            flow_obj=fl_obj,
            metadata=data.get("metadata", {})
        )
