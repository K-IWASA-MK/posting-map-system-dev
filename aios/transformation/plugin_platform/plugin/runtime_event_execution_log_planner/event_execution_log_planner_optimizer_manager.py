from .runtime_execution_log_planner import RuntimeExecutionLogPlanner
from .runtime_execution_log_optimizer import RuntimeExecutionLogOptimizer
from .runtime_execution_log_execution_plan import RuntimeEventExecutionLogExecutionPlan
from plugin_platform.plugin.runtime_event_execution_log_intent import RuntimeEventExecutionLogIntentGraph
from plugin_platform.plugin.runtime_adapter import RuntimeContext

class EventExecutionLogPlannerOptimizerManager:
    """
    EventExecutionLogPlannerOptimizerManager
    
    【設計原則】
    - Stateless: マネージャ内部で状態を持たず、入力された Intent Graph から決定論的な Plan を生成するのみです。
    - Deterministic: plan_id, optimizer_id, execution_plan_id を決定論的に導出します。
    - Optimization Rules Fixation: optimization_rules, cost_model, priority_score などのルール・モデル表現は動的評価を行わず、CIE Foundation 向けの固定された構造を使用します。
    
    【暫定入力に関する注意】
    - CLI で runtime_event_execution_log_intent_graph.json から RuntimeEventExecutionLogIntentGraph を復元して
      テストするデータフローは、将来的な Intent Graph Layer との完全な結合を見据えた「暫定・テスト用入力」としての実装です。
    """
    
    @staticmethod
    def create_execution_plan(intent_graph: RuntimeEventExecutionLogIntentGraph, context: RuntimeContext) -> RuntimeEventExecutionLogExecutionPlan:
        # Trace ID および Intent Graph ID のアサーション検証
        assert intent_graph.trace_id is not None, "intent_graph trace_id must not be None"
        assert intent_graph.graph_id is not None, "intent_graph graph_id must not be None"
        
        # 決定論的な ID の導出
        plan_id = f"plan:{intent_graph.graph_id}"
        optimizer_id = f"optimizer:{plan_id}"
        execution_plan_id = f"execution_plan:{plan_id}"
        
        # 各種固定状態
        planner_state = "compiled"
        optimization_state = "optimized"
        plan_state = "optimized"
        
        # 固定配列
        optimization_rules = [
            "reduce_depth",
            "merge_nodes",
            "parallelize_independent_nodes",
            "remove_redundant_edges"
        ]
        
        cost_model = {
            "interpret_meaning": 1.0,
            "resolve_intent": 2.0,
            "build_execution_graph": 1.5,
            "finalize_graph": 0.5
        }
        
        priority_score = {
            "interpret_meaning": 100,
            "resolve_intent": 80,
            "build_execution_graph": 60,
            "finalize_graph": 40
        }
        
        metadata = {
            "version": 1,
            "manager": "event_execution_log_planner_optimizer_manager_stub",
            "environment": context.environment,
            "note": "Temporary test data flow structure for Phase 72 execution plan compilation validation"
        }
        
        # 1. Planner DTO の構築
        planner_dto = RuntimeExecutionLogPlanner(
            plan_id=plan_id,
            intent_graph_id=intent_graph.graph_id,
            planner_state=planner_state,
            optimization_rules=optimization_rules,
            metadata=metadata,
            trace_id=intent_graph.trace_id
        )
        
        # 2. Optimizer DTO の構築
        optimizer_dto = RuntimeExecutionLogOptimizer(
            optimizer_id=optimizer_id,
            plan_id=plan_id,
            cost_model=cost_model,
            priority_score=priority_score,
            optimization_state=optimization_state,
            metadata=metadata,
            trace_id=intent_graph.trace_id
        )
        
        # 3. グラフ構造のコピーベース生成 (実計算禁止、構造変換スタブのみ)
        # 前段の nodes, edges を DTO 辞書リストとして複製
        optimized_nodes = []
        optimized_edges = []
        
        # 前段の意図グラフの情報を復元参照
        source_graph = intent_graph.intent_graph
        if source_graph:
            if hasattr(source_graph, "nodes") and source_graph.nodes:
                optimized_nodes = [n.to_dict() if hasattr(n, "to_dict") else n for n in source_graph.nodes]
            elif isinstance(source_graph, dict):
                optimized_nodes = source_graph.get("nodes", [])
                
            if hasattr(source_graph, "edges") and source_graph.edges:
                optimized_edges = [e.to_dict() if hasattr(e, "to_dict") else e for e in source_graph.edges]
            elif isinstance(source_graph, dict):
                optimized_edges = source_graph.get("edges", [])
        
        # 4. Event Execution Plan DTO の構築
        # 注意: 内部に planner_dto および optimizer_dto も保持・マッピングし、最終的な出力構造にバインドします。
        return RuntimeEventExecutionLogExecutionPlan(
            execution_plan_id=execution_plan_id,
            intent_graph_id=intent_graph.graph_id,
            plan_id=plan_id,
            optimizer_id=optimizer_id,
            optimized_nodes=optimized_nodes,
            optimized_edges=optimized_edges,
            plan_state=plan_state,
            metadata=metadata,
            trace_id=intent_graph.trace_id,
            runtime_event_execution_log_intent_graph=intent_graph
        )
