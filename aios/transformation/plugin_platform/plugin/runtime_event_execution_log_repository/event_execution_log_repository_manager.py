from .runtime_execution_log_repository import RuntimeExecutionLogRepository, RuntimeEventExecutionLogRepository
from plugin_platform.plugin.runtime_event_execution_log_registry import RuntimeEventExecutionLogRegistry
from plugin_platform.plugin.runtime_adapter.runtime_context import RuntimeRuntime

class EventExecutionLogRepositoryManager:
    """
    EventExecutionLogRepositoryManager
    
    【設計原則】
    - Stateless: マネージャ内部で状態を持たず、入力された Registry から決定論的な Repository 定義を生成するのみです。
    - Deterministic: repository_id, repository_type, repository_state, repository_version, repository_map を決定論的に導出します。
    - Side Effect Free: 本フェーズでは実際の永続化、DBアクセス、キャッシュ、保存などの副作用は一切行いません。
    - No Context Leak: 境界モデル、DTO、メッセージ、マネージャ、CLI、コメントにおいて `Context` という名称は使用しません。
    - 暫定入力の明記: CLI で runtime_event_execution_log_registry.json から復元してテストするデータフローは、将来的な Runtime Registry Layer との完全統合を見据えた「暫定・テスト用入力」としての実装です。
    """
    
    @staticmethod
    def create_execution_repository(registry_execution: RuntimeEventExecutionLogRegistry, runtime: RuntimeRuntime) -> RuntimeEventExecutionLogRepository:
        # Trace ID および Registry ID のアサーション検証
        assert registry_execution.trace_id is not None, "registry_execution trace_id must not be None"
        assert registry_execution.registry_id is not None, "registry_execution registry_id must not be None"
        
        # 決定論的な ID の導出
        repository_id = f"repository:{registry_execution.registry_id}"
        
        # 前段から runtime_type を安全に抽出
        if hasattr(registry_execution, "registry") and hasattr(registry_execution.registry, "runtime_type"):
            runtime_type = registry_execution.registry.runtime_type
        elif isinstance(registry_execution, dict):
            runtime_type = registry_execution.get("registry", {}).get("runtime_type", "plugin_runtime")
        else:
            runtime_type = "plugin_runtime"
            
        # 固定値
        repository_type = "runtime_repository"  # plugin_repository, artifact_repository などに拡張可能
        repository_state = "repository_ready"  # レポジトリ定義が構築されたことを示す
        repository_version = "v1"
        repository_map = [
            "resolve_repository",
            "prepare_repository",
            "validate_repository",
            "repository_ready"
        ]
        
        metadata = {
            "version": 1,
            "manager": "event_execution_log_repository_manager_stub",
            "environment": runtime.environment,
            "note": "Temporary test data flow structure for Phase 89 execution repository validation"
        }
        
        # 1. Repository DTO の構築
        repository_dto = RuntimeExecutionLogRepository(
            repository_id=repository_id,
            registry_id=registry_execution.registry_id,
            runtime_type=runtime_type,
            repository_type=repository_type,
            repository_state=repository_state,
            repository_version=repository_version,
            repository_map=repository_map,
            metadata=metadata.copy(),
            trace_id=registry_execution.trace_id
        )
        
        # 2. Event Repository DTO の構築
        return RuntimeEventExecutionLogRepository(
            repository_id=repository_id,
            runtime_event_execution_log_registry=registry_execution,
            repository=repository_dto,
            metadata=metadata.copy(),
            trace_id=registry_execution.trace_id
        )
