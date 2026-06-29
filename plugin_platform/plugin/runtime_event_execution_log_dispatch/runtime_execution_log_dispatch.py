from plugin_platform.plugin.runtime_event_execution_log_run import RuntimeEventExecutionLogRun

class RuntimeExecutionLogDispatch:
    """
    RuntimeExecutionLogDispatch
    
    【設計定義】
    - Dispatch: 実行開始状態(Run)となった処理を、実際のRuntimeへと受け渡すための構造を表現します。
    - dispatch_version: 設計拡張性のために導入されたバージョン識別子 (例: "v1")。
    - dispatch_state: 送信準備状態を示す "dispatch_ready" を決定論的に保持します。
    - dispatch_target: 送信先を示す "runtime" を保持します。
    """
    def __init__(self, dispatch_id: str, run_id: str, actuator_id: str, dispatch_version: str, dispatch_state: str, dispatch_target: str, dispatch_map: list, metadata: dict, trace_id: str):
        self.dispatch_id = dispatch_id
        self.run_id = run_id
        self.actuator_id = actuator_id
        self.dispatch_version = dispatch_version
        self.dispatch_state = dispatch_state
        self.dispatch_target = dispatch_target
        self.dispatch_map = dispatch_map
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "dispatch_id": self.dispatch_id,
            "run_id": self.run_id,
            "actuator_id": self.actuator_id,
            "dispatch_version": self.dispatch_version,
            "dispatch_state": self.dispatch_state,
            "dispatch_target": self.dispatch_target,
            "dispatch_map": self.dispatch_map,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }

class RuntimeEventExecutionLogDispatch:
    def __init__(self, dispatch_id: str, runtime_event_execution_log_run: RuntimeEventExecutionLogRun, dispatch: RuntimeExecutionLogDispatch, metadata: dict, trace_id: str):
        self.dispatch_id = dispatch_id
        self.runtime_event_execution_log_run = runtime_event_execution_log_run
        self.dispatch = dispatch
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "dispatch_id": self.dispatch_id,
            "runtime_event_execution_log_run": self.runtime_event_execution_log_run.to_dict() if hasattr(self.runtime_event_execution_log_run, "to_dict") else self.runtime_event_execution_log_run,
            "dispatch": self.dispatch.to_dict() if hasattr(self.dispatch, "to_dict") else self.dispatch,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }
