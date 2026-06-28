from .event_gateway_descriptor import EventGatewayDescriptor

class EventGatewayRegistry:
    def __init__(self):
        self._gateway_store = {}

    def register(self, descriptor: EventGatewayDescriptor):
        assert descriptor.gateway_id is not None, "Descriptor gateway_id must not be None"
        self._gateway_store[descriptor.gateway_id] = descriptor

    def get(self, gateway_id: str) -> EventGatewayDescriptor:
        return self._gateway_store.get(gateway_id)

    def get_all(self) -> list:
        # 決定論的ソート (1. gateway_id 昇順)
        return sorted(self._gateway_store.values(), key=lambda x: x.gateway_id)
