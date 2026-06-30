class MilestoneAudit:
    """
    MilestoneAudit DTO

    【設計定義】
    - MilestoneAudit DTO: 将来的な Execution Runtime の監査対象および監査ルールを定義する Blueprint。
    - This DTO defines the immutable audit rules only. No runtime execution or side effects are performed.
    """
    def __init__(self, controller_id: str, audit_type: str, audit_rules: list, trace_id: str, metadata: dict):
        self.controller_id = controller_id
        self.audit_type = audit_type
        self.audit_rules = audit_rules
        self.trace_id = trace_id
        self.metadata = metadata

    def to_dict(self) -> dict:
        return {
            "controller_id": self.controller_id,
            "audit_type": self.audit_type,
            "audit_rules": self.audit_rules,
            "trace_id": self.trace_id,
            "metadata": self.metadata
        }

    @classmethod
    def from_dict(cls, data: dict) -> "MilestoneAudit":
        # Backward Compatibility
        return cls(
            controller_id=data.get("controller_id"),
            audit_type=data.get("audit_type", "default"),
            audit_rules=data.get("audit_rules", []),
            trace_id=data.get("trace_id"),
            metadata=data.get("metadata", {})
        )
