from plugin_platform.plugin.runtime_event_execution_log_registry import RuntimeEventExecutionLogRegistry

class RuntimeExecutionLogRepository:
    """
    RuntimeExecutionLogRepository
    
    【設計定義】
    - Repository: Runtime Registry が管理する定義群を保持・提供する Runtime Repository の抽象構造を定義。
      ※本クラスは Repository 実体そのものではなく、Repository Blueprint を表現するメタモデルです。(No actual persistence occurs here.)
    - runtime_type: 利用するランタイムタイプを示す "plugin_runtime" を保持します。
    - repository_type: レポジトリの種類を示します (将来の拡張: plugin_repository, resource_repository, artifact_repository, metadata_repository などに拡張可能)。
    - repository_state: レポジトリ定義の状態を示します。
      ※"repository_ready" は、実際の永続化処理やデータベース書き込みが実行中であることを表すのではなく、「Repository定義が構築済み」であることを明記するステータスです。
    - repository_version: 設計拡張性のためのバージョン識別子 (例: "v1")。
    - repository_map: レポジトリ管理フローを示す配列。
      # Repository Blueprint
      # repository_map represents a static repository blueprint and does not allocate or resolve actual runtime repositories.
    """
    def __init__(self, repository_id: str, registry_id: str, runtime_type: str, repository_type: str, repository_state: str, repository_version: str, repository_map: list, metadata: dict, trace_id: str):
        self.repository_id = repository_id
        self.registry_id = registry_id
        self.runtime_type = runtime_type
        self.repository_type = repository_type  # 固定値 "runtime_repository" (拡張可能)
        self.repository_state = repository_state  # "repository_ready" 固定値
        self.repository_version = repository_version
        self.repository_map = repository_map  # 固定 Blueprint 配列
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "repository_id": self.repository_id,
            "registry_id": self.registry_id,
            "runtime_type": self.runtime_type,
            "repository_type": self.repository_type,
            "repository_state": self.repository_state,
            "repository_version": self.repository_version,
            "repository_map": self.repository_map,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }

    @classmethod
    def from_dict(cls, data: dict) -> "RuntimeExecutionLogRepository":
        return cls(
            repository_id=data.get("repository_id"),
            registry_id=data.get("registry_id"),
            runtime_type=data.get("runtime_type"),
            repository_type=data.get("repository_type"),
            repository_state=data.get("repository_state"),
            repository_version=data.get("repository_version"),
            repository_map=data.get("repository_map", []),
            metadata=data.get("metadata", {}),
            trace_id=data.get("trace_id")
        )

class RuntimeEventExecutionLogRepository:
    def __init__(self, repository_id: str, runtime_event_execution_log_registry: RuntimeEventExecutionLogRegistry, repository: RuntimeExecutionLogRepository, metadata: dict, trace_id: str):
        self.repository_id = repository_id
        self.runtime_event_execution_log_registry = runtime_event_execution_log_registry
        self.repository = repository
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "repository_id": self.repository_id,
            "runtime_event_execution_log_registry": self.runtime_event_execution_log_registry.to_dict() if hasattr(self.runtime_event_execution_log_registry, "to_dict") else self.runtime_event_execution_log_registry,
            "repository": self.repository.to_dict() if hasattr(self.repository, "to_dict") else self.repository,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }

    @classmethod
    def from_dict(cls, data: dict) -> "RuntimeEventExecutionLogRepository":
        return cls(
            repository_id=data.get("repository_id"),
            runtime_event_execution_log_registry=data.get("runtime_event_execution_log_registry", {}),
            repository=RuntimeExecutionLogRepository.from_dict(data.get("repository", {})) if isinstance(data.get("repository"), dict) else data.get("repository"),
            metadata=data.get("metadata", {}),
            trace_id=data.get("trace_id")
        )

