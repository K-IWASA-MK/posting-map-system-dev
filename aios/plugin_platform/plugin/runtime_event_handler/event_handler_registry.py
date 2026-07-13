from .event_handler_descriptor import EventHandlerDescriptor

class EventHandlerRegistry:
    def __init__(self):
        self._handler_store = {}

    def register(self, descriptor: EventHandlerDescriptor):
        assert descriptor.handler_id is not None, "Descriptor handler_id must not be None"
        self._handler_store[descriptor.handler_id] = descriptor

    def get(self, handler_id: str) -> EventHandlerDescriptor:
        return self._handler_store.get(handler_id)

    def get_all(self) -> list:
        # 決定論的ソート (1. handler_id 昇順)
        return sorted(self._handler_store.values(), key=lambda x: x.handler_id)
