from .event_endpoint_descriptor import EventEndpointDescriptor

class EventEndpointRegistry:
    def __init__(self):
        self._endpoint_store = {}

    def register(self, descriptor: EventEndpointDescriptor):
        assert descriptor.endpoint_id is not None, "Descriptor endpoint_id must not be None"
        self._endpoint_store[descriptor.endpoint_id] = descriptor

    def get(self, endpoint_id: str) -> EventEndpointDescriptor:
        return self._endpoint_store.get(endpoint_id)

    def get_all(self) -> list:
        # 決定論的ソート (1. endpoint_id 昇順)
        return sorted(self._endpoint_store.values(), key=lambda x: x.endpoint_id)
