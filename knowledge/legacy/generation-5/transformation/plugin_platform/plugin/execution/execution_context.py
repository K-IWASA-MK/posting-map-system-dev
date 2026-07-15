class ExecutionContext:
    def __init__(self, session_id: str, workspace: str, configuration: dict, variables: dict, environment: str, timestamp: str):
        self.session_id = session_id
        self.workspace = workspace
        self.configuration = configuration
        self.variables = variables
        self.environment = environment
        self.timestamp = timestamp

    def to_dict(self) -> dict:
        return {
            "session_id": self.session_id,
            "workspace": self.workspace,
            "configuration": self.configuration,
            "variables": self.variables,
            "environment": self.environment,
            "timestamp": self.timestamp
        }
