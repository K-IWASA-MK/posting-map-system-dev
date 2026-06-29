from plugin_platform.plugin.runtime_event_execution_log_environment import RuntimeEventExecutionLogEnvironment

class RuntimeExecutionLogWorkspace:
    """
    RuntimeExecutionLogWorkspace
    
    【設計定義】
    - Workspace: Runtime Environment 上で実行コンテキストを保持する Runtime Workspace の抽象構造を定義。
      ※本クラスは Workspace 実体そのものではなく、Workspace Blueprint を表現するメタモデルです。(No actual workspace creation or File I/O occurs here.)
    - runtime_type: 利用するランタイムタイプを示す "plugin_runtime" を保持します。
    - workspace_type: ワークスペースの種類を示します (将来の拡張: isolated_workspace, shared_workspace, ephemeral_workspace, persistent_workspace などに拡張可能)。
    - workspace_state: ワークスペース定義の状態を示します。
      ※"workspace_ready" は、実際のディレクトリ作成やファイル書き込みが実行中であることを表すのではなく、「Workspace定義が構築済み」であることを明記するステータスです。
    - workspace_version: 設計拡張性のためのバージョン識別子 (例: "v1")。
    - workspace_map: ワークスペース管理フローを示す配列。
      ※この配列は動的に状態遷移を実行するものではなく、Workspaceライフサイクルの「抽象仕様（Blueprint）」であることを明記します。
    """
    def __init__(self, workspace_id: str, environment_id: str, runtime_type: str, workspace_type: str, workspace_state: str, workspace_version: str, workspace_map: list, metadata: dict, trace_id: str):
        self.workspace_id = workspace_id
        self.environment_id = environment_id
        self.runtime_type = runtime_type
        self.workspace_type = workspace_type  # 固定値 "runtime_workspace" (拡張可能)
        self.workspace_state = workspace_state  # "workspace_ready" 固定値
        self.workspace_version = workspace_version
        self.workspace_map = workspace_map  # 固定 Blueprint 配列
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "workspace_id": self.workspace_id,
            "environment_id": self.environment_id,
            "runtime_type": self.runtime_type,
            "workspace_type": self.workspace_type,
            "workspace_state": self.workspace_state,
            "workspace_version": self.workspace_version,
            "workspace_map": self.workspace_map,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }

class RuntimeEventExecutionLogWorkspace:
    def __init__(self, workspace_id: str, runtime_event_execution_log_environment: RuntimeEventExecutionLogEnvironment, workspace: RuntimeExecutionLogWorkspace, metadata: dict, trace_id: str):
        self.workspace_id = workspace_id
        self.runtime_event_execution_log_environment = runtime_event_execution_log_environment
        self.workspace = workspace
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "workspace_id": self.workspace_id,
            "runtime_event_execution_log_environment": self.runtime_event_execution_log_environment.to_dict() if hasattr(self.runtime_event_execution_log_environment, "to_dict") else self.runtime_event_execution_log_environment,
            "workspace": self.workspace.to_dict() if hasattr(self.workspace, "to_dict") else self.workspace,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }
