from .runtime_definition import RuntimeDefinition

class RuntimeProvider:
    def __init__(self):
        self._definitions = {}

    def register(self, definition: RuntimeDefinition):
        assert definition.runtime_id is not None, "Definition runtime_id must not be None"
        self._definitions[definition.runtime_id] = definition

    def get(self, runtime_id: str) -> RuntimeDefinition:
        return self._definitions.get(runtime_id)

    def get_all(self) -> list:
        # 決定論的ソート (1. version 降順, 2. runtime_id 昇順)
        return sorted(self._definitions.values(), key=lambda x: (-x.version, x.runtime_id))
