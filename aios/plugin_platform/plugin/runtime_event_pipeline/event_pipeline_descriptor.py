class EventPipelineDescriptor:
    def __init__(self, pipeline_id: str, sync_id: str, pipeline_type: str, metadata: dict, trace_id: str):
        self.pipeline_id = pipeline_id
        self.sync_id = sync_id
        self.pipeline_type = pipeline_type
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "pipeline_id": self.pipeline_id,
            "sync_id": self.sync_id,
            "pipeline_type": self.pipeline_type,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }

    @classmethod
    def from_dict(cls, data: dict) -> "EventPipelineDescriptor":
        return cls(
            pipeline_id=data.get("pipeline_id"),
            sync_id=data.get("sync_id"),
            pipeline_type=data.get("pipeline_type"),
            metadata=data.get("metadata", {}),
            trace_id=data.get("trace_id")
        )

