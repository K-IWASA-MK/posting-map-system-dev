from .event_audit_descriptor import EventAuditDescriptor

class EventAuditRegistry:
    def __init__(self):
        self._audit_store = {}

    def register(self, descriptor: EventAuditDescriptor):
        assert descriptor.audit_id is not None, "Descriptor audit_id must not be None"
        self._audit_store[descriptor.audit_id] = descriptor

    def get(self, audit_id: str) -> EventAuditDescriptor:
        return self._audit_store.get(audit_id)

    def get_all(self) -> list:
        # 決定論的ソート (1. audit_id 昇順)
        return sorted(self._audit_store.values(), key=lambda x: x.audit_id)
