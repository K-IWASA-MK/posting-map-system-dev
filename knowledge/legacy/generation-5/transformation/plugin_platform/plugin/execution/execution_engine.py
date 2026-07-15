from .execution_plan import ExecutionPlan
from .execution_context import ExecutionContext
from .execution_result import ExecutionResult
from .execution_executor import ExecutionExecutor

class ExecutionEngine:
    @staticmethod
    def execute(plan: ExecutionPlan, context: ExecutionContext) -> ExecutionResult:
        return ExecutionExecutor.execute(plan, context)
