from plugin_platform.plugin.runtime_event_execution_log_workspace import RuntimeEventExecutionLogWorkspace

class RuntimeExecutionLogResource:
    """
    RuntimeExecutionLogResource
    
    【設計定義】
    - Resource: Runtime Workspace が保持・参照する Runtime Resource の抽象構造を定義。
      ※本クラスは Resource 実体そのものではなく、Resource Blueprint を表現するメタモデルです。(No actual resource allocation occurs here.)
    - runtime_type: 利用するランタイムタイプを示す "plugin_runtime" を保持します。
    - resource_type: リソースの種類を示します (将来の拡張: file_resource, memory_resource, network_resource, cache_resource などに拡張可能)。
    - resource_state: リソース定義の状態を示します。
      ※"resource_ready" は、実際のメモリ確保やリソース割り当てが実行中であることを表すのではなく、「Resource定義が構築済み」であることを明記するステータスです。
    - resource_version: 設計拡張性のためのバージョン識別子 (例: "v1")。
    - resource_map: リソース管理フローを示す配列。
      # Resource Blueprint
      # resource_map represents a static resource blueprint and does not allocate or resolve actual runtime resources.
    """
    def __init__(self, resource_id: str, workspace_id: str, runtime_type: str, resource_type: str, resource_state: str, resource_version: str, resource_map: list, metadata: dict, trace_id: str):
        self.resource_id = resource_id
        self.workspace_id = workspace_id
        self.runtime_type = runtime_type
        self.resource_type = resource_type  # 固定値 "runtime_resource" (拡張可能)
        self.resource_state = resource_state  # "resource_ready" 固定値
        self.resource_version = resource_version
        self.resource_map = resource_map  # 固定 Blueprint 配列
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "resource_id": self.resource_id,
            "workspace_id": self.workspace_id,
            "runtime_type": self.runtime_type,
            "resource_type": self.resource_type,
            "resource_state": self.resource_state,
            "resource_version": self.resource_version,
            "resource_map": self.resource_map,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }

class RuntimeEventExecutionLogResource:
    def __init__(self, resource_id: str, runtime_event_execution_log_workspace: RuntimeEventExecutionLogWorkspace, resource: RuntimeExecutionLogResource, metadata: dict, trace_id: str):
        self.resource_id = resource_id
        self.runtime_event_execution_log_workspace = runtime_event_execution_log_workspace
        self.resource = resource
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "resource_id": self.resource_id,
            "runtime_event_execution_log_workspace": self.runtime_event_execution_log_workspace.to_dict() if hasattr(self.runtime_event_execution_log_workspace, "to_dict") else self.runtime_event_execution_log_workspace,
            "resource": self.resource.to_dict() if hasattr(self.resource, "to_dict") else self.resource,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }
