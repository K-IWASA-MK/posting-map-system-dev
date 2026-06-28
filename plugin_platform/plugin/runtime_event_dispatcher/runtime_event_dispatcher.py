from plugin_platform.plugin.runtime_event_stream import RuntimeEventStream

class RuntimeEventDispatcher:
    def __init__(self, dispatcher_id: str, runtime_event_stream: RuntimeEventStream, dispatcher_type: str, dispatch_targets: list, metadata: dict, trace_id: str):
        self.dispatcher_id = dispatcher_id
        self.runtime_event_stream = runtime_event_stream
        self.dispatcher_type = dispatcher_type
        self.dispatch_targets = dispatch_targets
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "dispatcher_id": self.dispatcher_id,
            "runtime_event_stream": self.runtime_event_stream.to_dict() if hasattr(self.runtime_event_stream, "to_dict") else self.runtime_event_stream,
            "dispatcher_type": self.dispatcher_type,
            "dispatch_targets": self.dispatch_targets,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }
