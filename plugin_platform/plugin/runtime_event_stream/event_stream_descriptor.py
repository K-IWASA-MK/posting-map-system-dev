class EventStreamDescriptor:
    def __init__(self, stream_id: str, pipeline_id: str, stream_type: str, metadata: dict, trace_id: str):
        self.stream_id = stream_id
        self.pipeline_id = pipeline_id
        self.stream_type = stream_type
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "stream_id": self.stream_id,
            "pipeline_id": self.pipeline_id,
            "stream_type": self.stream_type,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }

    @classmethod
    def from_dict(cls, data: dict) -> "EventStreamDescriptor":
        return cls(
            stream_id=data.get("stream_id"),
            pipeline_id=data.get("pipeline_id"),
            stream_type=data.get("stream_type"),
            metadata=data.get("metadata", {}),
            trace_id=data.get("trace_id")
        )

