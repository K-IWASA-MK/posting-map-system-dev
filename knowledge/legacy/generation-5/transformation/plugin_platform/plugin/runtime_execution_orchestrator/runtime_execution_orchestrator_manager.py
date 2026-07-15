from .execution_orchestrator import Orchestrator as OrchestratorDTO
from .runtime_execution_orchestrator import RuntimeExecutionOrchestrator
from plugin_platform.plugin.runtime_execution_flow import RuntimeExecutionFlow
from plugin_platform.plugin.runtime_adapter.runtime_context import RuntimeRuntime

class RuntimeExecutionOrchestratorManager:
    """
    RuntimeExecutionOrchestratorManager
    
    【設計原則】
    - Stateless: マネージャ内部で状態を持たず、入力された定義から決定論的な Execution Orchestrator 定義を生成するのみです。
    - Deterministic: orchestrator_id, orchestrator_type, orchestrator_state, orchestrator_version, orchestrator_map を決定論的に導出します。
    - Side Effect Free: 本フェーズでは実際の実行、スレッド処理、外部呼び出し、キュー投入などの副作用は一切行いません。
    - No Context Leak: 境界モデル、DTO、メッセージ、マネージャ、CLI、コメントにおいて `Context` という名称は使用しません。
    - No Mutation: RuntimeExecutionOrchestratorManager never mutates input DTOs and always returns newly constructed DTO instances.
    """
    
    @staticmethod
    def create_execution_orchestrator(flow: RuntimeExecutionFlow, runtime_definition: RuntimeRuntime) -> RuntimeExecutionOrchestrator:
        assert flow.flow_id is not None, "flow_id must not be None"
        assert flow.trace_id is not None, "trace_id must not be None"
        
        # 決定論的な ID およびプロパティの導出
        orchestrator_id = f"orchestrator:{flow.flow_id}"
        orchestrator_type = "default"
        orchestrator_state = "orchestrator_ready"
        orchestrator_version = "v1"
        orchestrator_map = [
            "resolve_orchestrator",
            "prepare_orchestrator",
            "validate_orchestrator",
            "orchestrator_ready",
        ]
        
        orchestrator_metadata = {
            "version": 1,
            "manager": "runtime_execution_orchestrator_manager_stub",
            "environment": runtime_definition.environment,
            "note": "Phase 98 execution orchestrator validation metadata blueprint"
        }
        
        # Orchestrator DTO 構築
        orchestrator_dto = OrchestratorDTO(
            flow_id=flow.flow_id,
            orchestrator_type=orchestrator_type,
            trace_id=flow.trace_id,
            metadata=orchestrator_metadata.copy()
        )
        
        # Runtime Execution Orchestrator DTO 構築 (No Mutation rule: returns a brand new instance)
        return RuntimeExecutionOrchestrator(
            orchestrator_id=orchestrator_id,
            flow_id=flow.flow_id,
            orchestrator_type=orchestrator_type,
            orchestrator_state=orchestrator_state,
            orchestrator_version=orchestrator_version,
            orchestrator_map=orchestrator_map,
            trace_id=flow.trace_id,
            orchestrator_obj=orchestrator_dto,
            metadata=orchestrator_metadata.copy()
        )
