class ExecutionStep:
    def __init__(self, plugin_id: str, version: int, parameters: dict, dependencies: list, timeout: int, retry: int, enabled: bool, execution_id: str = None, trace: dict = None):
        self.plugin_id = plugin_id
        self.version = version
        self.parameters = parameters
        self.dependencies = dependencies
        self.timeout = timeout
        self.retry = retry
        self.enabled = enabled
        self.execution_id = execution_id
        self.trace = trace

    def to_dict(self) -> dict:
        data = {
            "plugin_id": self.plugin_id,
            "version": self.version,
            "parameters": self.parameters,
            "dependencies": self.dependencies,
            "timeout": self.timeout,
            "retry": self.retry,
            "enabled": self.enabled
        }
        if self.execution_id:
            data["id"] = self.execution_id
        if self.trace:
            data["trace"] = self.trace
        return data
