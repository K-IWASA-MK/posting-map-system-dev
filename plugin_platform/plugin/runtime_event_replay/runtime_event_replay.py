from plugin_platform.plugin.runtime_event_analyzer import RuntimeEventAnalysis

class RuntimeEventReplay:
    def __init__(self, replay_id: str, runtime_event_analysis: RuntimeEventAnalysis, replay_type: str, replay_data: dict, metadata: dict, trace_id: str):
        self.replay_id = replay_id
        self.runtime_event_analysis = runtime_event_analysis
        self.replay_type = replay_type
        self.replay_data = replay_data
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "replay_id": self.replay_id,
            "runtime_event_analysis": self.runtime_event_analysis.to_dict() if hasattr(self.runtime_event_analysis, "to_dict") else self.runtime_event_analysis,
            "replay_type": self.replay_type,
            "replay_data": self.replay_data,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }

    @classmethod
    def from_dict(cls, data: dict) -> "RuntimeEventReplay":
        analysis_data = data.get("runtime_event_analysis")
        if isinstance(analysis_data, dict):
            from plugin_platform.plugin.runtime_event_analyzer.runtime_event_analysis import RuntimeEventAnalysis
            analysis_obj = RuntimeEventAnalysis.from_dict(analysis_data)
        else:
            analysis_obj = analysis_data
            
        return cls(
            replay_id=data.get("replay_id"),
            runtime_event_analysis=analysis_obj,
            replay_type=data.get("replay_type"),
            replay_data=data.get("replay_data", {}),
            metadata=data.get("metadata", {}),
            trace_id=data.get("trace_id")
        )

