from .event_sync_descriptor import EventSyncDescriptor

class EventSyncRegistry:
    def __init__(self):
        self._sync_store = {}

    def register(self, descriptor: EventSyncDescriptor):
        assert descriptor.sync_id is not None, "Descriptor sync_id must not be None"
        self._sync_store[descriptor.sync_id] = descriptor

    def get(self, sync_id: str) -> EventSyncDescriptor:
        return self._sync_store.get(sync_id)

    def get_all(self) -> list:
        # 決定論的ソート (1. sync_id 昇順)
        return sorted(self._sync_store.values(), key=lambda x: x.sync_id)
