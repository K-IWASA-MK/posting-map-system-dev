from .event_metadata_descriptor import EventMetadataDescriptor

class EventMetadataRegistry:
    def __init__(self):
        self._metadata_store = {}

    def register(self, descriptor: EventMetadataDescriptor):
        assert descriptor.metadata_id is not None, "Descriptor metadata_id must not be None"
        self._metadata_store[descriptor.metadata_id] = descriptor

    def get(self, metadata_id: str) -> EventMetadataDescriptor:
        return self._metadata_store.get(metadata_id)

    def get_all(self) -> list:
        # 決定論的ソート (1. metadata_id 昇順)
        return sorted(self._metadata_store.values(), key=lambda x: x.metadata_id)
