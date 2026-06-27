class SessionDescriptor:
    def __init__(self, session_id: str, instance_id: str, runtime_id: str, status: str, metadata: dict, trace_id: str):
        self.session_id = session_id
        self.instance_id = instance_id
        self.runtime_id = runtime_id
        self.status = status
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "session_id": self.session_id,
            "instance_id": self.instance_id,
            "runtime_id": self.runtime_id,
            "status": self.status,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }
