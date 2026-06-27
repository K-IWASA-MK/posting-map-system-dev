from plugin_platform.plugin.runtime_factory import RuntimeInstance

class RuntimeSession:
    def __init__(self, session_id: str, runtime_instance: RuntimeInstance, state: str, configuration: dict, metadata: dict, trace_id: str):
        self.session_id = session_id
        self.runtime_instance = runtime_instance
        self.state = state
        self.configuration = configuration
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "session_id": self.session_id,
            "runtime_instance": self.runtime_instance.to_dict() if hasattr(self.runtime_instance, "to_dict") else self.runtime_instance,
            "state": self.state,
            "configuration": self.configuration,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }
