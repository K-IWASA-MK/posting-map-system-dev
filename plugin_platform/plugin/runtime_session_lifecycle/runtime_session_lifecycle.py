from plugin_platform.plugin.runtime_session import RuntimeSession

class RuntimeSessionLifecycle:
    def __init__(self, lifecycle_id: str, runtime_session: RuntimeSession, state: str, metadata: dict, trace_id: str):
        self.lifecycle_id = lifecycle_id
        self.runtime_session = runtime_session
        self.state = state
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "lifecycle_id": self.lifecycle_id,
            "runtime_session": self.runtime_session.to_dict() if hasattr(self.runtime_session, "to_dict") else self.runtime_session,
            "state": self.state,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }
