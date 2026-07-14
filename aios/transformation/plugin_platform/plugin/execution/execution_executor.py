from .execution_plan import ExecutionPlan
from .execution_result import ExecutionResult

class ExecutionExecutor:
    @staticmethod
    def execute(plan: ExecutionPlan, context) -> ExecutionResult:
        plugin_results = []
        
        for step in plan.steps:
            # Traceアサーション
            assert step.trace is not None, "ExecutionStep trace must not be None"
            assert step.trace.get("registry") == step.plugin_id, "Registry ID trace mismatch"
            assert step.trace.get("execution") == step.execution_id, "Execution ID trace mismatch"
            
            if step.enabled:
                status = "success"
            else:
                status = "skipped"
                
            plugin_results.append({
                "plugin_id": step.plugin_id,
                "execution_id": step.execution_id,
                "status": status,
                "duration": 0.0,
                "trace": step.trace
            })
            
        execution_id = f"execution_run:{context.session_id}"
        trace_id = f"trace:{context.session_id}"
        
        started_at = context.timestamp
        finished_at = context.timestamp
        duration = 0.0
        
        metadata = {
            "version": 1,
            "steps_processed": len(plan.steps),
            "steps_succeeded": sum(1 for r in plugin_results if r["status"] == "success"),
            "steps_skipped": sum(1 for r in plugin_results if r["status"] == "skipped"),
            "steps_failed": sum(1 for r in plugin_results if r["status"] == "failed")
        }
        
        return ExecutionResult(
            execution_id=execution_id,
            plan_id=plan.plan_id,
            status="success",
            started_at=started_at,
            finished_at=finished_at,
            duration=duration,
            plugin_results=plugin_results,
            metadata=metadata,
            trace_id=trace_id
        )
