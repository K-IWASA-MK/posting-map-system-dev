from .event_pipeline_descriptor import EventPipelineDescriptor

class EventPipelineRegistry:
    def __init__(self):
        self._pipeline_store = {}

    def register(self, descriptor: EventPipelineDescriptor):
        assert descriptor.pipeline_id is not None, "Descriptor pipeline_id must not be None"
        self._pipeline_store[descriptor.pipeline_id] = descriptor

    def get(self, pipeline_id: str) -> EventPipelineDescriptor:
        return self._pipeline_store.get(pipeline_id)

    def get_all(self) -> list:
        # 決定論的ソート (1. pipeline_id 昇順)
        return sorted(self._pipeline_store.values(), key=lambda x: x.pipeline_id)
