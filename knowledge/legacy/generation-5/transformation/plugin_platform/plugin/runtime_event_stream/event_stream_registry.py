from .event_stream_descriptor import EventStreamDescriptor

class EventStreamRegistry:
    def __init__(self):
        self._stream_store = {}

    def register(self, descriptor: EventStreamDescriptor):
        assert descriptor.stream_id is not None, "Descriptor stream_id must not be None"
        self._stream_store[descriptor.stream_id] = descriptor

    def get(self, stream_id: str) -> EventStreamDescriptor:
        return self._stream_store.get(stream_id)

    def get_all(self) -> list:
        # 決定論的ソート (1. stream_id 昇順)
        return sorted(self._stream_store.values(), key=lambda x: x.stream_id)
