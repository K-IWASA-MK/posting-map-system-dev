from plugin_platform.plugin.runtime_event_execution_log_meaning import RuntimeEventExecutionLogMeaning

class RuntimeExecutionLogIntentGraph:
    def __init__(self, graph_id: str, meaning_id: str, graph_state: str, nodes: list, edges: list, metadata: dict, trace_id: str):
        self.graph_id = graph_id
        self.meaning_id = meaning_id
        self.graph_state = graph_state
        self.nodes = nodes
        self.edges = edges
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "graph_id": self.graph_id,
            "meaning_id": self.meaning_id,
            "graph_state": self.graph_state,
            "nodes": [n.to_dict() if hasattr(n, "to_dict") else n for n in self.nodes],
            "edges": [e.to_dict() if hasattr(e, "to_dict") else e for e in self.edges],
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }

    @classmethod
    def from_dict(cls, data: dict) -> "RuntimeExecutionLogIntentGraph":
        from .runtime_execution_log_intent_node import RuntimeExecutionLogIntentNode
        from .runtime_execution_log_intent_edge import RuntimeExecutionLogIntentEdge
        
        nodes_data = data.get("nodes", [])
        nodes_list = [RuntimeExecutionLogIntentNode.from_dict(n) if isinstance(n, dict) else n for n in nodes_data]
        
        edges_data = data.get("edges", [])
        edges_list = [RuntimeExecutionLogIntentEdge.from_dict(e) if isinstance(e, dict) else e for e in edges_data]
        
        return cls(
            graph_id=data.get("graph_id"),
            meaning_id=data.get("meaning_id"),
            graph_state=data.get("graph_state"),
            nodes=nodes_list,
            edges=edges_list,
            metadata=data.get("metadata", {}),
            trace_id=data.get("trace_id")
        )

class RuntimeEventExecutionLogIntentGraph:
    def __init__(self, graph_id: str, runtime_event_execution_log_meaning: RuntimeEventExecutionLogMeaning, intent_graph: RuntimeExecutionLogIntentGraph, metadata: dict, trace_id: str):
        self.graph_id = graph_id
        self.runtime_event_execution_log_meaning = runtime_event_execution_log_meaning
        self.intent_graph = intent_graph
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "graph_id": self.graph_id,
            "runtime_event_execution_log_meaning": self.runtime_event_execution_log_meaning.to_dict() if hasattr(self.runtime_event_execution_log_meaning, "to_dict") else self.runtime_event_execution_log_meaning,
            "intent_graph": self.intent_graph.to_dict() if hasattr(self.intent_graph, "to_dict") else self.intent_graph,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }

    @classmethod
    def from_dict(cls, data: dict) -> "RuntimeEventExecutionLogIntentGraph":
        meaning_data = data.get("runtime_event_execution_log_meaning")
        if isinstance(meaning_data, dict):
            from plugin_platform.plugin.runtime_event_execution_log_meaning.runtime_event_execution_log_meaning import RuntimeEventExecutionLogMeaning
            meaning_obj = RuntimeEventExecutionLogMeaning.from_dict(meaning_data)
        else:
            meaning_obj = meaning_data
            
        return cls(
            graph_id=data.get("graph_id"),
            runtime_event_execution_log_meaning=meaning_obj,
            intent_graph=RuntimeExecutionLogIntentGraph.from_dict(data.get("intent_graph", {})) if isinstance(data.get("intent_graph"), dict) else data.get("intent_graph"),
            metadata=data.get("metadata", {}),
            trace_id=data.get("trace_id")
        )

