class RuntimeExecutionLogMeaning:
    def __init__(self, meaning_id: str, receiver_context_id: str, router_id: str, meaning_state: str, semantic_map: list, metadata: dict, trace_id: str):
        self.meaning_id = meaning_id
        self.receiver_context_id = receiver_context_id
        self.router_id = router_id
        self.meaning_state = meaning_state
        self.semantic_map = semantic_map
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "meaning_id": self.meaning_id,
            "receiver_context_id": self.receiver_context_id,
            "router_id": self.router_id,
            "meaning_state": self.meaning_state,
            "semantic_map": self.semantic_map,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }

    @classmethod
    def from_dict(cls, data: dict) -> "RuntimeExecutionLogMeaning":
        return cls(
            meaning_id=data.get("meaning_id"),
            receiver_context_id=data.get("receiver_context_id"),
            router_id=data.get("router_id"),
            meaning_state=data.get("meaning_state"),
            semantic_map=data.get("semantic_map", []),
            metadata=data.get("metadata", {}),
            trace_id=data.get("trace_id")
        )

