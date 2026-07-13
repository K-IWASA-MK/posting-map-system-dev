from .event_receiver_descriptor import EventReceiverDescriptor

class EventReceiverRegistry:
    def __init__(self):
        self._receiver_store = {}

    def register(self, descriptor: EventReceiverDescriptor):
        assert descriptor.receiver_id is not None, "Descriptor receiver_id must not be None"
        self._receiver_store[descriptor.receiver_id] = descriptor

    def get(self, receiver_id: str) -> EventReceiverDescriptor:
        return self._receiver_store.get(receiver_id)

    def get_all(self) -> list:
        # 決定論的ソート (1. receiver_id 昇順)
        return sorted(self._receiver_store.values(), key=lambda x: x.receiver_id)
