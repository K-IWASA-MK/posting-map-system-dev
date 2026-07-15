from .lifecycle_descriptor import LifecycleDescriptor

class LifecycleRegistry:
    def __init__(self):
        self._lifecycles = {}

    def register(self, descriptor: LifecycleDescriptor):
        assert descriptor.lifecycle_id is not None, "Descriptor lifecycle_id must not be None"
        self._lifecycles[descriptor.lifecycle_id] = descriptor

    def get(self, lifecycle_id: str) -> LifecycleDescriptor:
        return self._lifecycles.get(lifecycle_id)

    def get_all(self) -> list:
        # 決定論的ソート (1. lifecycle_id 昇順)
        return sorted(self._lifecycles.values(), key=lambda x: x.lifecycle_id)
