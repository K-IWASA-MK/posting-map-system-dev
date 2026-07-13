class RuntimeExecutionLogIntentEdge:
    def __init__(self, edge_id: str, source_node_id: str, target_node_id: str, dependency_type: str, metadata: dict, trace_id: str):
        self.edge_id = edge_id
        self.source_node_id = source_node_id
        self.target_node_id = target_node_id
        self.dependency_type = dependency_type
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "edge_id": self.edge_id,
            "source_node_id": self.source_node_id,
            "target_node_id": self.target_node_id,
            "dependency_type": self.dependency_type,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }

    @classmethod
    def from_dict(cls, data: dict) -> "RuntimeExecutionLogIntentEdge":
        return cls(
            edge_id=data.get("edge_id"),
            source_node_id=data.get("source_node_id"),
            target_node_id=data.get("target_node_id"),
            dependency_type=data.get("dependency_type"),
            metadata=data.get("metadata", {}),
            trace_id=data.get("trace_id")
        )

