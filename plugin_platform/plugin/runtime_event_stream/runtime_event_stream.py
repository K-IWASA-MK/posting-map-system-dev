from plugin_platform.plugin.runtime_event_pipeline import RuntimeEventPipeline

class RuntimeEventStream:
    def __init__(self, stream_id: str, runtime_event_pipeline: RuntimeEventPipeline, stream_type: str, stream_entries: list, metadata: dict, trace_id: str):
        self.stream_id = stream_id
        self.runtime_event_pipeline = runtime_event_pipeline
        self.stream_type = stream_type
        self.stream_entries = stream_entries
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "stream_id": self.stream_id,
            "runtime_event_pipeline": self.runtime_event_pipeline.to_dict() if hasattr(self.runtime_event_pipeline, "to_dict") else self.runtime_event_pipeline,
            "stream_type": self.stream_type,
            "stream_entries": self.stream_entries,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }

    @classmethod
    def from_dict(cls, data: dict) -> "RuntimeEventStream":
        pipe_data = data.get("runtime_event_pipeline")
        if isinstance(pipe_data, dict):
            from plugin_platform.plugin.runtime_event_pipeline.runtime_event_pipeline import RuntimeEventPipeline
            pipe_obj = RuntimeEventPipeline.from_dict(pipe_data)
        else:
            pipe_obj = pipe_data
            
        return cls(
            stream_id=data.get("stream_id"),
            runtime_event_pipeline=pipe_obj,
            stream_type=data.get("stream_type"),
            stream_entries=data.get("stream_entries", []),
            metadata=data.get("metadata", {}),
            trace_id=data.get("trace_id")
        )

