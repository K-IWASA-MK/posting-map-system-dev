from .milestone_audit import MilestoneAudit

class RuntimeExecutionMilestoneAudit:
    """
    RuntimeExecutionMilestoneAudit

    【設計定義】
    - Immutable Execution Milestone Audit Blueprint.
    - audit_id: controller_id から決定論的に導出される一意な識別子。
    - controller_id: 対象とする Execution Controller ID。
    - audit_type: 種別を示す固定値 "default"。
    - audit_state: 状態を示す固定値 "audit_ready"。
    - audit_version: 設計のバージョン識別子 "v1"。
    - audit_map: 監査ライフサイクル固定配列。
    """
    def __init__(self, audit_id: str, controller_id: str, audit_type: str, audit_state: str, audit_version: str, audit_map: list, trace_id: str, audit_obj: MilestoneAudit, metadata: dict):
        self.audit_id = audit_id
        self.controller_id = controller_id
        self.audit_type = audit_type
        self.audit_state = audit_state
        self.audit_version = audit_version
        self.audit_map = audit_map
        self.trace_id = trace_id
        self.audit = audit_obj
        self.metadata = metadata

    def to_dict(self) -> dict:
        return {
            "audit_id": self.audit_id,
            "controller_id": self.controller_id,
            "audit_type": self.audit_type,
            "audit_state": self.audit_state,
            "audit_version": self.audit_version,
            "audit_map": self.audit_map,
            "trace_id": self.trace_id,
            "audit": self.audit.to_dict() if hasattr(self.audit, "to_dict") else self.audit,
            "metadata": self.metadata
        }

    @classmethod
    def from_dict(cls, data: dict) -> "RuntimeExecutionMilestoneAudit":
        # Backward Compatibility
        audit_data = data.get("audit")
        if isinstance(audit_data, dict):
            audit_obj = MilestoneAudit.from_dict(audit_data)
        else:
            audit_obj = audit_data

        return cls(
            audit_id=data.get("audit_id"),
            controller_id=data.get("controller_id"),
            audit_type=data.get("audit_type", "default"),
            audit_state=data.get("audit_state", "audit_ready"),
            audit_version=data.get("audit_version", "v1"),
            audit_map=data.get("audit_map", []),
            trace_id=data.get("trace_id"),
            audit_obj=audit_obj,
            metadata=data.get("metadata", {})
        )
