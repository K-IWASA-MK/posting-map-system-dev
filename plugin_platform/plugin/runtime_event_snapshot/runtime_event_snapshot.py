from plugin_platform.plugin.runtime_event_replay import RuntimeEventReplay

class RuntimeEventSnapshot:
    def __init__(self, snapshot_id: str, runtime_event_replay: RuntimeEventReplay, snapshot_type: str, snapshot_data: dict, metadata: dict, trace_id: str):
        self.snapshot_id = snapshot_id
        self.runtime_event_replay = runtime_event_replay
        self.snapshot_type = snapshot_type
        self.snapshot_data = snapshot_data
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "snapshot_id": self.snapshot_id,
            "runtime_event_replay": self.runtime_event_replay.to_dict() if hasattr(self.runtime_event_replay, "to_dict") else self.runtime_event_replay,
            "snapshot_type": self.snapshot_type,
            "snapshot_data": self.snapshot_data,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }
