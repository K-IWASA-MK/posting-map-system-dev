from plugin_platform.plugin.runtime_event_execution_log_intent import RuntimeEventExecutionLogIntentGraph

class RuntimeEventExecutionLogExecutionPlan:
    def __init__(self, execution_plan_id: str, intent_graph_id: str, plan_id: str, optimizer_id: str, optimized_nodes: list, optimized_edges: list, plan_state: str, metadata: dict, trace_id: str, runtime_event_execution_log_intent_graph: RuntimeEventExecutionLogIntentGraph = None):
        self.execution_plan_id = execution_plan_id
        self.intent_graph_id = intent_graph_id
        self.plan_id = plan_id
        self.optimizer_id = optimizer_id
        self.optimized_nodes = optimized_nodes
        self.optimized_edges = optimized_edges
        self.plan_state = plan_state
        self.metadata = metadata
        self.trace_id = trace_id
        self.runtime_event_execution_log_intent_graph = runtime_event_execution_log_intent_graph

    def to_dict(self) -> dict:
        return {
            "execution_plan_id": self.execution_plan_id,
            "intent_graph_id": self.intent_graph_id,
            "plan_id": self.plan_id,
            "optimizer_id": self.optimizer_id,
            "optimized_nodes": self.optimized_nodes,
            "optimized_edges": self.optimized_edges,
            "plan_state": self.plan_state,
            "metadata": self.metadata,
            "trace_id": self.trace_id,
            "runtime_event_execution_log_intent_graph": self.runtime_event_execution_log_intent_graph.to_dict() if hasattr(self.runtime_event_execution_log_intent_graph, "to_dict") else self.runtime_event_execution_log_intent_graph
        }

    @classmethod
    def from_dict(cls, data: dict) -> "RuntimeEventExecutionLogExecutionPlan":
        intent_data = data.get("runtime_event_execution_log_intent_graph")
        if isinstance(intent_data, dict):
            from plugin_platform.plugin.runtime_event_execution_log_intent.runtime_execution_log_intent_graph import RuntimeEventExecutionLogIntentGraph
            intent_obj = RuntimeEventExecutionLogIntentGraph.from_dict(intent_data)
        else:
            intent_obj = intent_data
            
        return cls(
            execution_plan_id=data.get("execution_plan_id"),
            intent_graph_id=data.get("intent_graph_id"),
            plan_id=data.get("plan_id"),
            optimizer_id=data.get("optimizer_id"),
            optimized_nodes=data.get("optimized_nodes", []),
            optimized_edges=data.get("optimized_edges", []),
            plan_state=data.get("plan_state"),
            metadata=data.get("metadata", {}),
            trace_id=data.get("trace_id"),
            runtime_event_execution_log_intent_graph=intent_obj
        )

