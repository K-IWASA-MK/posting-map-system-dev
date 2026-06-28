class RuntimeExecutionLogIntentNode:
    def __init__(self, node_id: str, node_type: str, action_name: str, node_state: str, metadata: dict, trace_id: str):
        self.node_id = node_id
        self.node_type = node_type
        self.action_name = action_name
        self.node_state = node_state
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "node_id": self.node_id,
            "node_type": self.node_type,
            "action_name": self.action_name,
            "node_state": self.node_state,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }
