import sys
from typing import List, Dict, Any
from .execution_context import ExecutionContext
from .execution_step import ExecutionStep
from .execution_plan import ExecutionPlan

class ExecutionPlanBuilder:
    @staticmethod
    def build_plan(
        context: ExecutionContext,
        registry_data: Dict[str, Any],
        dependency_data: Dict[str, Any],
        scheduler_data: Dict[str, Any],
        configuration: Dict[str, Any]
    ) -> ExecutionPlan:
        # ロードされたデータからリストを取得
        plugins = registry_data.get("plugins", [])
        dependencies = dependency_data.get("dependencies", [])
        schedulers = scheduler_data.get("scheduler", [])
        
        # 参照用マップの構築
        plugin_map = {p["id"]: p for p in plugins}
        dependency_map = {d["plugin"]: d for d in dependencies}
        
        # scheduler上の順序に基づいてソート。
        # 決定論的ソートのためのソートキー:
        # (status == 'ready' (逆順: readyが先), queue_order, plugin_name, id)
        def sort_key(s):
            is_ready = 0 if s.get("status") == "ready" else 1
            queue_order = s.get("queue_order", 9999)
            if queue_order == 0:
                queue_order = 9999
            name_part = s["plugin"].split(":")[-1]
            plugin_name = name_part.replace("_", " ").title() + " Plugin"
            return (is_ready, queue_order, plugin_name, s.get("id", ""))
        
        sorted_schedulers = sorted(schedulers, key=sort_key)
        
        steps = []
        for idx, s in enumerate(sorted_schedulers, 1):
            plugin_id = s.get("plugin")
            runtime_id = s.get("runtime")
            lifecycle_id = s.get("lifecycle")
            dependency_id = s.get("dependency")
            scheduler_id = s.get("id")
            execution_id = f"execution:{idx:04d}"
            
            # 各マップからの情報取得
            p_info = plugin_map.get(plugin_id, {})
            d_info = dependency_map.get(plugin_id, {})
            
            # 1. Trace ID アサーション検証
            if p_info:
                assert p_info.get("id") == plugin_id, f"Registry ID mismatch: {p_info.get('id')} != {plugin_id}"
            if d_info:
                assert d_info.get("trace", {}).get("registry") == plugin_id, "Registry ID trace mismatch in dependency"
                assert d_info.get("trace", {}).get("runtime") == runtime_id, "Runtime ID trace mismatch in dependency"
                assert d_info.get("trace", {}).get("lifecycle") == lifecycle_id, "Lifecycle ID trace mismatch in dependency"
                assert d_info.get("id") == dependency_id, f"Dependency ID mismatch: {d_info.get('id')} != {dependency_id}"
            
            assert s.get("trace", {}).get("registry") == plugin_id, "Registry ID trace mismatch in scheduler"
            assert s.get("trace", {}).get("runtime") == runtime_id, "Runtime ID trace mismatch in scheduler"
            assert s.get("trace", {}).get("lifecycle") == lifecycle_id, "Lifecycle ID trace mismatch in scheduler"
            assert s.get("trace", {}).get("dependency") == dependency_id, "Dependency ID trace mismatch in scheduler"
            
            # Traceマッピングの構築
            trace = {
                "registry": plugin_id,
                "runtime": runtime_id,
                "lifecycle": lifecycle_id,
                "dependency": dependency_id,
                "scheduler": scheduler_id,
                "execution": execution_id
            }
            
            # 2. Enabled判定・Config反映
            config_plugins = configuration.get("plugins", {})
            plugin_config = config_plugins.get(plugin_id, {})
            
            enabled = plugin_config.get("enabled", p_info.get("enabled", False))
            
            if s.get("blocked", True) or s.get("status") != "ready":
                step_enabled = False
            else:
                step_enabled = enabled
                
            timeout = plugin_config.get("timeout", configuration.get("default_timeout", 30))
            retry = plugin_config.get("retry", configuration.get("default_retry", 3))
            parameters = plugin_config.get("parameters", {})
            
            dependencies_list = d_info.get("requires", [])
            
            step = ExecutionStep(
                plugin_id=plugin_id,
                version=p_info.get("version", 1),
                parameters=parameters,
                dependencies=dependencies_list,
                timeout=timeout,
                retry=retry,
                enabled=step_enabled,
                execution_id=execution_id,
                trace=trace
            )
            
            steps.append(step)
            
        plan_id = f"plan:{context.session_id}"
        created_at = context.timestamp
        trigger = configuration.get("trigger", "manual")
        
        metadata = {
            "version": 1,
            "session_id": context.session_id,
            "workspace": context.workspace,
            "environment": context.environment,
            "plugin_count": len(steps),
            "enabled_count": sum(1 for step in steps if step.enabled),
            "disabled_count": sum(1 for step in steps if not step.enabled)
        }
        
        return ExecutionPlan(
            plan_id=plan_id,
            steps=steps,
            created_at=created_at,
            trigger=trigger,
            metadata=metadata
        )
