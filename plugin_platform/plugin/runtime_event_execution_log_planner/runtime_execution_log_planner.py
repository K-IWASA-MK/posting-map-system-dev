class RuntimeExecutionLogPlanner:
    def __init__(self, plan_id: str, intent_graph_id: str, planner_state: str, optimization_rules: list, metadata: dict, trace_id: str):
        self.plan_id = plan_id
        self.intent_graph_id = intent_graph_id
        self.planner_state = planner_state
        self.optimization_rules = optimization_rules
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "plan_id": self.plan_id,
            "intent_graph_id": self.intent_graph_id,
            "planner_state": self.planner_state,
            "optimization_rules": self.optimization_rules,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }
