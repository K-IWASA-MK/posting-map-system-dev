from .event_router_descriptor import EventRouterDescriptor

class EventRouterRegistry:
    def __init__(self):
        self._router_store = {}

    def register(self, descriptor: EventRouterDescriptor):
        assert descriptor.router_id is not None, "Descriptor router_id must not be None"
        self._router_store[descriptor.router_id] = descriptor

    def get(self, router_id: str) -> EventRouterDescriptor:
        return self._router_store.get(router_id)

    def get_all(self) -> list:
        # 決定論的ソート (1. router_id 昇順)
        return sorted(self._router_store.values(), key=lambda x: x.router_id)
