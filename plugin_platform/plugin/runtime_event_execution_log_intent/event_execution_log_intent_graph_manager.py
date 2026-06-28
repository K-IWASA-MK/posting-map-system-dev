from .runtime_execution_log_intent_node import RuntimeExecutionLogIntentNode
from .runtime_execution_log_intent_edge import RuntimeExecutionLogIntentEdge
from .runtime_execution_log_intent_graph import RuntimeExecutionLogIntentGraph, RuntimeEventExecutionLogIntentGraph
from plugin_platform.plugin.runtime_event_execution_log_meaning import RuntimeEventExecutionLogMeaning
from plugin_platform.plugin.runtime_adapter import RuntimeContext

class EventExecutionLogIntentGraphManager:
    """
    EventExecutionLogIntentGraphManager
    
    【設計原則】
    - Stateless: マネージャ内部で状態を持たず、入力された Meaning 情報から決定論的な Intent Graph を生成するのみです。
    - Deterministic: graph_id, node_id, edge_id を決定論的に導出します。
    - Graph Structure Fixation: nodes / edges は動的に生成・評価せず、CIE Foundation 向けの固定された DAG 配列を使用します。
    
    【暫定入力に関する注意】
    - CLI で runtime_event_execution_log_meaning.json から RuntimeEventExecutionLogMeaning を復元して
      テストするデータフローは、将来的な Meaning / Receiver / Router の完全結合を見据えた「暫定・テスト用入力」としての実装です。
    """
    
    @staticmethod
    def create_intent_graph(meaning: RuntimeEventExecutionLogMeaning, context: RuntimeContext) -> RuntimeEventExecutionLogIntentGraph:
        # Trace ID および Meaning ID のアサーション検証
        assert meaning.trace_id is not None, "meaning trace_id must not be None"
        assert meaning.meaning_id is not None, "meaning meaning_id must not be None"
        
        # 決定論的な ID の導出
        graph_id = f"graph:{meaning.meaning_id}"
        
        # 固定状態
        graph_state = "compiled"
        node_state = "defined"
        dependency_type = "sequential"
        node_type = "meaning_intent_node_v1"
        
        metadata = {
            "version": 1,
            "manager": "event_execution_log_intent_graph_manager_stub",
            "environment": context.environment,
            "note": "Temporary test data flow structure for Phase 71 intent graph validation"
        }
        
        # 固定テンプレートのノード生成
        node_actions = [
            "interpret_meaning",
            "resolve_intent",
            "build_execution_graph",
            "finalize_graph"
        ]
        
        nodes = []
        for i, action in enumerate(node_actions):
            node_id = f"node:{graph_id}:{i}"
            node = RuntimeExecutionLogIntentNode(
                node_id=node_id,
                node_type=node_type,
                action_name=action,
                node_state=node_state,
                metadata=metadata,
                trace_id=meaning.trace_id
            )
            nodes.append(node)
            
        # 固定テンプレートのエッジ生成 (0 -> 1 -> 2 -> 3)
        edges = []
        for i in range(len(nodes) - 1):
            source = nodes[i].node_id
            target = nodes[i + 1].node_id
            edge_id = f"edge:{source}->{target}"
            edge = RuntimeExecutionLogIntentEdge(
                edge_id=edge_id,
                source_node_id=source,
                target_node_id=target,
                dependency_type=dependency_type,
                metadata=metadata,
                trace_id=meaning.trace_id
            )
            edges.append(edge)
            
        # 1. Intent Graph DTO の構築
        graph_dto = RuntimeExecutionLogIntentGraph(
            graph_id=graph_id,
            meaning_id=meaning.meaning_id,
            graph_state=graph_state,
            nodes=nodes,
            edges=edges,
            metadata=metadata,
            trace_id=meaning.trace_id
        )
        
        # 2. Event Intent Graph DTO の構築
        return RuntimeEventExecutionLogIntentGraph(
            graph_id=graph_id,
            runtime_event_execution_log_meaning=meaning,
            intent_graph=graph_dto,
            metadata=metadata,
            trace_id=meaning.trace_id
        )
