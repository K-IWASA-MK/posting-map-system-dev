from .event_persistence_descriptor import EventPersistenceDescriptor

class EventPersistenceRegistry:
    def __init__(self):
        self._persistence_store = {}

    def register(self, descriptor: EventPersistenceDescriptor):
        assert descriptor.persistence_id is not None, "Descriptor persistence_id must not be None"
        self._persistence_store[descriptor.persistence_id] = descriptor

    def get(self, persistence_id: str) -> EventPersistenceDescriptor:
        return self._persistence_store.get(persistence_id)

    def get_all(self) -> list:
        # 決定論的ソート (1. persistence_id 昇順)
        return sorted(self._persistence_store.values(), key=lambda x: x.persistence_id)
