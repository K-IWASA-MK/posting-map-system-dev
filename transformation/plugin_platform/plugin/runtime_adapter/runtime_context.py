class RuntimeContext:
    def __init__(self, runtime_id: str, configuration: dict, environment: str, variables: dict, metadata: dict):
        self.runtime_id = runtime_id
        self.configuration = configuration
        self.environment = environment
        self.variables = variables
        self.metadata = metadata

    def to_dict(self) -> dict:
        return {
            "runtime_id": self.runtime_id,
            "configuration": self.configuration,
            "environment": self.environment,
            "variables": self.variables,
            "metadata": self.metadata
        }

    @classmethod
    def from_dict(cls, data: dict) -> "RuntimeContext":
        return cls(
            runtime_id=data.get("runtime_id"),
            configuration=data.get("configuration", {}),
            environment=data.get("environment"),
            variables=data.get("variables", {}),
            metadata=data.get("metadata", {})
        )

class RuntimeRuntime:
    """
    RuntimeRuntime
    No Context Leak に準拠した Runtime システムメタモデルの表現。
    """
    def __init__(self, runtime_id: str, configuration: dict, environment: str, variables: dict, metadata: dict):
        self.runtime_id = runtime_id
        self.configuration = configuration
        self.environment = environment
        self.variables = variables
        self.metadata = metadata

    def to_dict(self) -> dict:
        return {
            "runtime_id": self.runtime_id,
            "configuration": self.configuration,
            "environment": self.environment,
            "variables": self.variables,
            "metadata": self.metadata
        }

    @classmethod
    def from_dict(cls, data: dict) -> "RuntimeRuntime":
        return cls(
            runtime_id=data.get("runtime_id"),
            configuration=data.get("configuration", {}),
            environment=data.get("environment"),
            variables=data.get("variables", {}),
            metadata=data.get("metadata", {})
        )


