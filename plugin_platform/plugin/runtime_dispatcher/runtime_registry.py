from .runtime_descriptor import RuntimeDescriptor

class RuntimeRegistry:
    def __init__(self):
        self._descriptors = {}

    def register(self, descriptor: RuntimeDescriptor):
        assert descriptor.runtime_id is not None, "Descriptor runtime_id must not be None"
        self._descriptors[descriptor.runtime_id] = descriptor

    def get(self, runtime_id: str) -> RuntimeDescriptor:
        return self._descriptors.get(runtime_id)

    def get_all(self) -> list:
        # 決定論的ソート (1. priority 降順, 2. runtime_id 昇順)
        return sorted(self._descriptors.values(), key=lambda x: (-x.priority, x.runtime_id))
