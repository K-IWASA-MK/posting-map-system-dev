class RuntimeResponse:
    def __init__(self, request_id: str, plugin_id: str, status: str, output: dict, metadata: dict, trace_id: str):
        self.request_id = request_id
        self.plugin_id = plugin_id
        self.status = status
        self.output = output
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "request_id": self.request_id,
            "plugin_id": self.plugin_id,
            "status": self.status,
            "output": self.output,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }
