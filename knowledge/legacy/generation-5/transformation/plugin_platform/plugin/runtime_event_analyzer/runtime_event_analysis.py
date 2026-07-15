from plugin_platform.plugin.runtime_event_metadata import RuntimeEventMetadata

class RuntimeEventAnalysis:
    def __init__(self, analysis_id: str, runtime_event_metadata: RuntimeEventMetadata, analysis_type: str, result: dict, metadata: dict, trace_id: str):
        self.analysis_id = analysis_id
        self.runtime_event_metadata = runtime_event_metadata
        self.analysis_type = analysis_type
        self.result = result
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "analysis_id": self.analysis_id,
            "runtime_event_metadata": self.runtime_event_metadata.to_dict() if hasattr(self.runtime_event_metadata, "to_dict") else self.runtime_event_metadata,
            "analysis_type": self.analysis_type,
            "result": self.result,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }

    @classmethod
    def from_dict(cls, data: dict) -> "RuntimeEventAnalysis":
        meta_data = data.get("runtime_event_metadata")
        if isinstance(meta_data, dict):
            from plugin_platform.plugin.runtime_event_metadata.runtime_event_metadata import RuntimeEventMetadata
            meta_obj = RuntimeEventMetadata.from_dict(meta_data)
        else:
            meta_obj = meta_data
            
        return cls(
            analysis_id=data.get("analysis_id"),
            runtime_event_metadata=meta_obj,
            analysis_type=data.get("analysis_type"),
            result=data.get("result", {}),
            metadata=data.get("metadata", {}),
            trace_id=data.get("trace_id")
        )

