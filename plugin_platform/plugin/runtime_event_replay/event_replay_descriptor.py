class EventReplayDescriptor:
    def __init__(self, replay_id: str, analysis_id: str, replay_type: str, metadata: dict, trace_id: str):
        self.replay_id = replay_id
        self.analysis_id = analysis_id
        self.replay_type = replay_type
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "replay_id": self.replay_id,
            "analysis_id": self.analysis_id,
            "replay_type": self.replay_type,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }
