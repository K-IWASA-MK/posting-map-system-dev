from .event_query_descriptor import EventQueryDescriptor

class EventQueryRegistry:
    def __init__(self):
        self._queries = {}

    def register(self, descriptor: EventQueryDescriptor):
        assert descriptor.query_id is not None, "Descriptor query_id must not be None"
        self._queries[descriptor.query_id] = descriptor

    def get(self, query_id: str) -> EventQueryDescriptor:
        return self._queries.get(query_id)

    def get_all(self) -> list:
        # 決定論的ソート (1. query_id 昇順)
        return sorted(self._queries.values(), key=lambda x: x.query_id)
