class RuntimeDefinition:
    def __init__(self, runtime_id: str, runtime_type: str, version: int, implementation: str, capabilities: list, metadata: dict, trace_id: str):
        self.runtime_id = runtime_id
        self.runtime_type = runtime_type
        self.version = version
        self.implementation = implementation
        self.capabilities = capabilities
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "runtime_id": self.runtime_id,
            "runtime_type": self.runtime_type,
            "version": self.version,
            "implementation": self.implementation,
            "capabilities": self.capabilities,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }
