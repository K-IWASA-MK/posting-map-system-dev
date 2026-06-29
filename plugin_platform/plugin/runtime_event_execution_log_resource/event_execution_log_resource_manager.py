from .runtime_execution_log_resource import RuntimeExecutionLogResource, RuntimeEventExecutionLogResource
from plugin_platform.plugin.runtime_event_execution_log_workspace import RuntimeEventExecutionLogWorkspace
from plugin_platform.plugin.runtime_adapter.runtime_context import RuntimeRuntime

class EventExecutionLogResourceManager:
    """
    EventExecutionLogResourceManager
    
    【設計原則】
    - Stateless: マネージャ内部で状態を持たず、入力された Workspace から決定論的な Resource 定義を生成するのみです。
    - Deterministic: resource_id, resource_type, resource_state, resource_version, resource_map を決定論的に導出します。
    - Side Effect Free: 本フェーズでは実際のファイルアクセス、メモリ確保、リソース構築などの副作用は一切行いません。
    - No Context Leak: 境界モデル、DTO、メッセージ、マネージャにおいて `Context` という名称は使用しません。
    - 暫定入力の明記: CLI で runtime_event_execution_log_workspace.json から復元してテストするデータフローは、将来的な Runtime Workspace Layer との完全統合を見据えた「暫定・テスト用入力」としての実装です。
    """
    
    @staticmethod
    def create_execution_resource(workspace_execution: RuntimeEventExecutionLogWorkspace, runtime: RuntimeRuntime) -> RuntimeEventExecutionLogResource:
        # Trace ID および Workspace ID のアサーション検証
        assert workspace_execution.trace_id is not None, "workspace_execution trace_id must not be None"
        assert workspace_execution.workspace_id is not None, "workspace_execution workspace_id must not be None"
        
        # 決定論的な ID の導出
        resource_id = f"resource:{workspace_execution.workspace_id}"
        
        # 前段から runtime_type を安全に抽出
        if hasattr(workspace_execution, "workspace") and hasattr(workspace_execution.workspace, "runtime_type"):
            runtime_type = workspace_execution.workspace.runtime_type
        elif isinstance(workspace_execution, dict):
            runtime_type = workspace_execution.get("workspace", {}).get("runtime_type", "plugin_runtime")
        else:
            runtime_type = "plugin_runtime"
            
        # 固定値
        resource_type = "runtime_resource"  # file_resource, memory_resource などに拡張可能
        resource_state = "resource_ready"  # リソース定義が構築されたことを示す
        resource_version = "v1"
        resource_map = [
            "resolve_resource",
            "prepare_resource",
            "validate_resource",
            "resource_ready"
        ]
        
        metadata = {
            "version": 1,
            "manager": "event_execution_log_resource_manager_stub",
            "environment": runtime.environment,
            "note": "Temporary test data flow structure for Phase 87 execution resource validation"
        }
        
        # 1. Resource DTO の構築
        resource_dto = RuntimeExecutionLogResource(
            resource_id=resource_id,
            workspace_id=workspace_execution.workspace_id,
            runtime_type=runtime_type,
            resource_type=resource_type,
            resource_state=resource_state,
            resource_version=resource_version,
            resource_map=resource_map,
            metadata=metadata.copy(),
            trace_id=workspace_execution.trace_id
        )
        
        # 2. Event Resource DTO の構築
        return RuntimeEventExecutionLogResource(
            resource_id=resource_id,
            runtime_event_execution_log_workspace=workspace_execution,
            resource=resource_dto,
            metadata=metadata.copy(),
            trace_id=workspace_execution.trace_id
        )
