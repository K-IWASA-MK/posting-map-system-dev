from .event_store_descriptor import EventStoreDescriptor

class EventStoreRegistry:
    def __init__(self):
        self._stores = {}

    def register(self, descriptor: EventStoreDescriptor):
        assert descriptor.store_id is not None, "Descriptor store_id must not be None"
        self._stores[descriptor.store_id] = descriptor

    def get(self, store_id: str) -> EventStoreDescriptor:
        return self._stores.get(store_id)

    def get_all(self) -> list:
        # 決定論的ソート (1. store_id 昇順)
        return sorted(self._stores.values(), key=lambda x: x.store_id)
