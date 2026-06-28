from .event_dispatcher_descriptor import EventDispatcherDescriptor

class EventDispatcherRegistry:
    def __init__(self):
        self._dispatcher_store = {}

    def register(self, descriptor: EventDispatcherDescriptor):
        assert descriptor.dispatcher_id is not None, "Descriptor dispatcher_id must not be None"
        self._dispatcher_store[descriptor.dispatcher_id] = descriptor

    def get(self, dispatcher_id: str) -> EventDispatcherDescriptor:
        return self._dispatcher_store.get(dispatcher_id)

    def get_all(self) -> list:
        # 決定論的ソート (1. dispatcher_id 昇順)
        return sorted(self._dispatcher_store.values(), key=lambda x: x.dispatcher_id)
