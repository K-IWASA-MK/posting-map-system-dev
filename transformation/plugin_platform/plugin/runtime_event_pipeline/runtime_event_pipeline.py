from plugin_platform.plugin.runtime_event_sync import RuntimeEventSync

class RuntimeEventPipeline:
    def __init__(self, pipeline_id: str, runtime_event_sync: RuntimeEventSync, pipeline_type: str, pipeline_steps: list, metadata: dict, trace_id: str):
        self.pipeline_id = pipeline_id
        self.runtime_event_sync = runtime_event_sync
        self.pipeline_type = pipeline_type
        self.pipeline_steps = pipeline_steps
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "pipeline_id": self.pipeline_id,
            "runtime_event_sync": self.runtime_event_sync.to_dict() if hasattr(self.runtime_event_sync, "to_dict") else self.runtime_event_sync,
            "pipeline_type": self.pipeline_type,
            "pipeline_steps": self.pipeline_steps,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }

    @classmethod
    def from_dict(cls, data: dict) -> "RuntimeEventPipeline":
        sync_data = data.get("runtime_event_sync")
        if isinstance(sync_data, dict):
            from plugin_platform.plugin.runtime_event_sync.runtime_event_sync import RuntimeEventSync
            sync_obj = RuntimeEventSync.from_dict(sync_data)
        else:
            sync_obj = sync_data
            
        return cls(
            pipeline_id=data.get("pipeline_id"),
            runtime_event_sync=sync_obj,
            pipeline_type=data.get("pipeline_type"),
            pipeline_steps=data.get("pipeline_steps", []),
            metadata=data.get("metadata", {}),
            trace_id=data.get("trace_id")
        )

