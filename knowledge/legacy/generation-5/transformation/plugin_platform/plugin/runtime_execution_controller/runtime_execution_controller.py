from .execution_controller import Controller

class RuntimeExecutionController:
    """
    RuntimeExecutionController
    
    【設計定義】
    - Immutable Execution Controller Blueprint
      (This DTO defines the immutable execution controller blueprint only. No runtime execution or side effects are performed.)
    - controller_id: orchestrator_id から決定論的に導出される一意な識別子。
    - orchestrator_id: 対象とする Execution Orchestrator ID。
    - controller_type: 種別を示す固定値 "default"。
    - controller_state: 状態を示す固定値 "controller_ready"。
    - controller_version: 設計のバージョン識別子 "v1"。
    - controller_map: 実行コントローラ階層の Blueprint 固定配列。
    """
    def __init__(self, controller_id: str, orchestrator_id: str, controller_type: str, controller_state: str, controller_version: str, controller_map: list, trace_id: str, controller_obj: Controller, metadata: dict):
        self.controller_id = controller_id
        self.orchestrator_id = orchestrator_id
        self.controller_type = controller_type
        self.controller_state = controller_state
        self.controller_version = controller_version
        self.controller_map = controller_map
        self.trace_id = trace_id
        self.controller = controller_obj
        self.metadata = metadata

    def to_dict(self) -> dict:
        return {
            "controller_id": self.controller_id,
            "orchestrator_id": self.orchestrator_id,
            "controller_type": self.controller_type,
            "controller_state": self.controller_state,
            "controller_version": self.controller_version,
            "controller_map": self.controller_map,
            "trace_id": self.trace_id,
            "controller": self.controller.to_dict() if hasattr(self.controller, "to_dict") else self.controller,
            "metadata": self.metadata
        }

    @classmethod
    def from_dict(cls, data: dict) -> "RuntimeExecutionController":
        # Backward Compatibility
        ctrl_data = data.get("controller")
        if isinstance(ctrl_data, dict):
            ctrl_obj = Controller.from_dict(ctrl_data)
        else:
            ctrl_obj = ctrl_data

        return cls(
            controller_id=data.get("controller_id"),
            orchestrator_id=data.get("orchestrator_id"),
            controller_type=data.get("controller_type", "default"),
            controller_state=data.get("controller_state", "controller_ready"),
            controller_version=data.get("controller_version", "v1"),
            controller_map=data.get("controller_map", []),
            trace_id=data.get("trace_id"),
            controller_obj=ctrl_obj,
            metadata=data.get("metadata", {})
        )
