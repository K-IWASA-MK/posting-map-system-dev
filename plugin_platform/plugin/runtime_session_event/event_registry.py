from .event_descriptor import EventDescriptor

class EventRegistry:
    def __init__(self):
        self._events = {}

    def register(self, descriptor: EventDescriptor):
        assert descriptor.event_id is not None, "Descriptor event_id must not be None"
        self._events[descriptor.event_id] = descriptor

    def get(self, event_id: str) -> EventDescriptor:
        return self._events.get(event_id)

    def get_all(self) -> list:
        # 決定論的ソート (1. event_id 昇順)
        return sorted(self._events.values(), key=lambda x: x.event_id)
