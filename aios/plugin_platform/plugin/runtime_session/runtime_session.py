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

    @classmethod
    def from_dict(cls, data: dict) -> "RuntimeSession":
        instance_data = data.get("runtime_instance")
        if isinstance(instance_data, dict):
            from plugin_platform.plugin.runtime_factory.runtime_instance import RuntimeInstance
            instance_obj = RuntimeInstance.from_dict(instance_data)
        else:
            instance_obj = instance_data
            
        return cls(
            session_id=data.get("session_id"),
            runtime_instance=instance_obj,
            state=data.get("state"),
            configuration=data.get("configuration", {}),
            metadata=data.get("metadata", {}),
            trace_id=data.get("trace_id")
        )

