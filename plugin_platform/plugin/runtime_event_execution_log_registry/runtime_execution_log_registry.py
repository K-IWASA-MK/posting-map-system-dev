from plugin_platform.plugin.runtime_event_execution_log_resource import RuntimeEventExecutionLogResource

class RuntimeExecutionLogRegistry:
    """
    RuntimeExecutionLogRegistry
    
    【設計定義】
    - Registry: Runtime Resource を決定論的に管理・参照するための Runtime Registry の抽象構造を定義。
      ※本クラスは Registry 実体そのものではなく、Registry Blueprint を表現するメタモデルです。(No actual registry operations occur here.)
    - runtime_type: 利用するランタイムタイプを示す "plugin_runtime" を保持します。
    - registry_type: レジストリの種類を示します (将来の拡張: plugin_registry, resource_registry, cache_registry, memory_registry などに拡張可能)。
    - registry_state: レジストリ定義の状態を示します。
      ※"registry_ready" は、実際の登録処理やインデックス生成が実行中であることを表すのではなく、「Registry定義が構築済み」であることを明記するステータスです。
    - registry_version: 設計拡張性のためのバージョン識別子 (例: "v1")。
    - registry_map: レジストリ管理フローを示す配列。
      # Registry Blueprint
      # registry_map represents a static registry blueprint and does not allocate or resolve actual runtime registers.
    """
    def __init__(self, registry_id: str, resource_id: str, runtime_type: str, registry_type: str, registry_state: str, registry_version: str, registry_map: list, metadata: dict, trace_id: str):
        self.registry_id = registry_id
        self.resource_id = resource_id
        self.runtime_type = runtime_type
        self.registry_type = registry_type  # 固定値 "runtime_registry" (拡張可能)
        self.registry_state = registry_state  # "registry_ready" 固定値
        self.registry_version = registry_version
        self.registry_map = registry_map  # 固定 Blueprint 配列
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "registry_id": self.registry_id,
            "resource_id": self.resource_id,
            "runtime_type": self.runtime_type,
            "registry_type": self.registry_type,
            "registry_state": self.registry_state,
            "registry_version": self.registry_version,
            "registry_map": self.registry_map,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }

class RuntimeEventExecutionLogRegistry:
    def __init__(self, registry_id: str, runtime_event_execution_log_resource: RuntimeEventExecutionLogResource, registry: RuntimeExecutionLogRegistry, metadata: dict, trace_id: str):
        self.registry_id = registry_id
        self.runtime_event_execution_log_resource = runtime_event_execution_log_resource
        self.registry = registry
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "registry_id": self.registry_id,
            "runtime_event_execution_log_resource": self.runtime_event_execution_log_resource.to_dict() if hasattr(self.runtime_event_execution_log_resource, "to_dict") else self.runtime_event_execution_log_resource,
            "registry": self.registry.to_dict() if hasattr(self.registry, "to_dict") else self.registry,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }
