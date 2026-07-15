from .event_analysis_descriptor import EventAnalysisDescriptor

class EventAnalysisRegistry:
    def __init__(self):
        self._analysis_store = {}

    def register(self, descriptor: EventAnalysisDescriptor):
        assert descriptor.analysis_id is not None, "Descriptor analysis_id must not be None"
        self._analysis_store[descriptor.analysis_id] = descriptor

    def get(self, analysis_id: str) -> EventAnalysisDescriptor:
        return self._analysis_store.get(analysis_id)

    def get_all(self) -> list:
        # 決定論的ソート (1. analysis_id 昇順)
        return sorted(self._analysis_store.values(), key=lambda x: x.analysis_id)
