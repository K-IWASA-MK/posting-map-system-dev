from .execution_engine import Engine
from .runtime_event_execution_engine import RuntimeEventExecutionEngine
from plugin_platform.plugin.runtime_event_execution_blueprint import RuntimeEventExecutionBlueprint
from plugin_platform.plugin.runtime_adapter.runtime_context import RuntimeRuntime

class EngineManager:
    """
    EngineManager
    
    【設計原則】
    - Stateless: マネージャ内部で状態を持たず、入力された定義から決定論的な Execution Engine 定義を生成するのみです。
    - Deterministic: engine_id, engine_type, engine_state, engine_version, engine_map を決定論的に導出します。
    - Side Effect Free: 本フェーズでは実際の実行、スレッド処理、外部呼び出し、キュー投入などの副作用は一切行いません。
    - No Context Leak: 境界モデル、DTO、メッセージ、マネージャ、CLI、コメントにおいて `Context` という名称は使用しません。
    - No Mutation: EngineManager never mutates input DTOs and always returns newly constructed DTO instances.
    """
    
    @staticmethod
    def create_execution_engine(blueprint: RuntimeEventExecutionBlueprint, runtime: RuntimeRuntime) -> RuntimeEventExecutionEngine:
        assert blueprint.blueprint_id is not None, "blueprint_id must not be None"
        assert blueprint.trace_id is not None, "trace_id must not be None"
        
        # 決定論的な ID およびプロパティの導出
        engine_id = f"engine:{blueprint.blueprint_id}"
        engine_type = "default"
        engine_state = "engine_ready"
        engine_version = "v1"
        engine_map = [
            "resolve_engine",
            "prepare_engine",
            "validate_engine",
            "engine_ready"
        ]
        
        engine_metadata = {
            "version": 1,
            "manager": "engine_manager_stub",
            "environment": runtime.environment,
            "note": "Phase 94 execution engine validation metadata blueprint"
        }
        
        # Engine DTO 構築
        engine = Engine(
            blueprint_id=blueprint.blueprint_id,
            engine_type=engine_type,
            trace_id=blueprint.trace_id,
            metadata=engine_metadata.copy()
        )
        
        # Runtime Event Execution Engine DTO 構築 (No Mutation rule: returns a brand new instance)
        return RuntimeEventExecutionEngine(
            engine_id=engine_id,
            blueprint_id=blueprint.blueprint_id,
            engine_type=engine_type,
            engine_state=engine_state,
            engine_version=engine_version,
            engine_map=engine_map,
            trace_id=blueprint.trace_id,
            engine=engine,
            metadata=engine_metadata.copy()
        )
