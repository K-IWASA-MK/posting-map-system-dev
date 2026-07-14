from .event_snapshot_descriptor import EventSnapshotDescriptor

class EventSnapshotRegistry:
    def __init__(self):
        self._snapshot_store = {}

    def register(self, descriptor: EventSnapshotDescriptor):
        assert descriptor.snapshot_id is not None, "Descriptor snapshot_id must not be None"
        self._snapshot_store[descriptor.snapshot_id] = descriptor

    def get(self, snapshot_id: str) -> EventSnapshotDescriptor:
        return self._snapshot_store.get(snapshot_id)

    def get_all(self) -> list:
        # 決定論的ソート (1. snapshot_id 昇順)
        return sorted(self._snapshot_store.values(), key=lambda x: x.snapshot_id)
