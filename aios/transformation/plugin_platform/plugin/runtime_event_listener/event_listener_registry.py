from .event_listener_descriptor import EventListenerDescriptor

class EventListenerRegistry:
    def __init__(self):
        self._listener_store = {}

    def register(self, descriptor: EventListenerDescriptor):
        assert descriptor.listener_id is not None, "Descriptor listener_id must not be None"
        self._listener_store[descriptor.listener_id] = descriptor

    def get(self, listener_id: str) -> EventListenerDescriptor:
        return self._listener_store.get(listener_id)

    def get_all(self) -> list:
        # 決定論的ソート (1. listener_id 昇順)
        return sorted(self._listener_store.values(), key=lambda x: x.listener_id)
