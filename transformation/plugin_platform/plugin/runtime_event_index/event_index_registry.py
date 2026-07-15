from .event_index_descriptor import EventIndexDescriptor

class EventIndexRegistry:
    def __init__(self):
        self._indexes = {}

    def register(self, descriptor: EventIndexDescriptor):
        assert descriptor.index_id is not None, "Descriptor index_id must not be None"
        self._indexes[descriptor.index_id] = descriptor

    def get(self, index_id: str) -> EventIndexDescriptor:
        return self._indexes.get(index_id)

    def get_all(self) -> list:
        # 決定論的ソート (1. index_id 昇順)
        return sorted(self._indexes.values(), key=lambda x: x.index_id)
