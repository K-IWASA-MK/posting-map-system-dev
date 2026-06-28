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
