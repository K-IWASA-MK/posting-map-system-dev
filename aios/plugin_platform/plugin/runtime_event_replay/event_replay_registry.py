from .event_replay_descriptor import EventReplayDescriptor

class EventReplayRegistry:
    def __init__(self):
        self._replay_store = {}

    def register(self, descriptor: EventReplayDescriptor):
        assert descriptor.replay_id is not None, "Descriptor replay_id must not be None"
        self._replay_store[descriptor.replay_id] = descriptor

    def get(self, replay_id: str) -> EventReplayDescriptor:
        return self._replay_store.get(replay_id)

    def get_all(self) -> list:
        # 決定論的ソート (1. replay_id 昇順)
        return sorted(self._replay_store.values(), key=lambda x: x.replay_id)
