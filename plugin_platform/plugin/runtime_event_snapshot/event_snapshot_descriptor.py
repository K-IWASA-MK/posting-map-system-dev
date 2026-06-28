class EventSnapshotDescriptor:
    def __init__(self, snapshot_id: str, replay_id: str, snapshot_type: str, metadata: dict, trace_id: str):
        self.snapshot_id = snapshot_id
        self.replay_id = replay_id
        self.snapshot_type = snapshot_type
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "snapshot_id": self.snapshot_id,
            "replay_id": self.replay_id,
            "snapshot_type": self.snapshot_type,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }
