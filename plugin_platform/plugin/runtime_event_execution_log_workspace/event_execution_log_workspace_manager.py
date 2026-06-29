from .runtime_execution_log_workspace import RuntimeExecutionLogWorkspace, RuntimeEventExecutionLogWorkspace
from plugin_platform.plugin.runtime_event_execution_log_environment import RuntimeEventExecutionLogEnvironment
from plugin_platform.plugin.runtime_adapter.runtime_context import RuntimeRuntime

class EventExecutionLogWorkspaceManager:
    """
    EventExecutionLogWorkspaceManager
    
    【設計原則】
    - Stateless: マネージャ内部で状態を持たず、入力された Environment から決定論的な Workspace 定義を生成するのみです。
    - Deterministic: workspace_id, workspace_type, workspace_state, workspace_version, workspace_map を決定論的に導出します。
    - Side Effect Free: 本フェーズでは実際のディレクトリ作成、File I/O、メモリ確保、環境生成などの副作用は一切行いません。
    - No Context Leak: 境界モデル、DTO、メッセージにおいて `Context` という名称は使用しません。(引数および型にも Context という名前を含めず、RuntimeRuntime 型を使用します)
    - 暫定入力の明記: CLI で runtime_event_execution_log_environment.json から復元してテストするデータフローは、将来的な Runtime Environment Layer との完全統合を見据えた「暫定・テスト用入力」としての実装です。
    """
    
    @staticmethod
    def create_execution_workspace(environment_execution: RuntimeEventExecutionLogEnvironment, runtime: RuntimeRuntime) -> RuntimeEventExecutionLogWorkspace:
        # Trace ID および Environment ID のアサーション検証
        assert environment_execution.trace_id is not None, "environment_execution trace_id must not be None"
        assert environment_execution.environment_id is not None, "environment_execution environment_id must not be None"
        
        # 決定論的な ID の導出
        workspace_id = f"workspace:{environment_execution.environment_id}"
        
        # 前段から runtime_type を安全に抽出
        if hasattr(environment_execution, "environment") and hasattr(environment_execution.environment, "runtime_type"):
            runtime_type = environment_execution.environment.runtime_type
        elif isinstance(environment_execution, dict):
            runtime_type = environment_execution.get("environment", {}).get("runtime_type", "plugin_runtime")
        else:
            runtime_type = "plugin_runtime"
            
        # 固定値
        workspace_type = "runtime_workspace"  # isolated_workspace, shared_workspace などに拡張可能
        workspace_state = "workspace_ready"  # ワークスペース定義が構築されたことを示す
        workspace_version = "v1"
        workspace_map = [
            "resolve_workspace",
            "prepare_workspace",
            "validate_workspace",
            "workspace_ready"
        ]
        
        metadata = {
            "version": 1,
            "manager": "event_execution_log_workspace_manager_stub",
            "environment": runtime.environment,
            "note": "Temporary test data flow structure for Phase 86 execution workspace validation"
        }
        
        # 1. Workspace DTO の構築
        workspace_dto = RuntimeExecutionLogWorkspace(
            workspace_id=workspace_id,
            environment_id=environment_execution.environment_id,
            runtime_type=runtime_type,
            workspace_type=workspace_type,
            workspace_state=workspace_state,
            workspace_version=workspace_version,
            workspace_map=workspace_map,
            metadata=metadata.copy(),
            trace_id=environment_execution.trace_id
        )
        
        # 2. Event Workspace DTO の構築
        return RuntimeEventExecutionLogWorkspace(
            workspace_id=workspace_id,
            runtime_event_execution_log_environment=environment_execution,
            workspace=workspace_dto,
            metadata=metadata.copy(),
            trace_id=environment_execution.trace_id
        )
