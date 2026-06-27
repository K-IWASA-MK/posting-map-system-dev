class RuntimeRequest:
    def __init__(self, request_id: str, plugin_id: str, version: int, parameters: dict, execution_id: str, metadata: dict, trace_id: str):
        self.request_id = request_id
        self.plugin_id = plugin_id
        self.version = version
        self.parameters = parameters
        self.execution_id = execution_id
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "request_id": self.request_id,
            "plugin_id": self.plugin_id,
            "version": self.version,
            "parameters": self.parameters,
            "execution_id": self.execution_id,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }
