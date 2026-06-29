import os
import ast

class RuntimeFoundationAudit:
    """
    RuntimeFoundationAudit
    
    CIE Platform プラグイン層の Blueprint 整合性および No Context Leak 方針を検証・監査します。
    ※Phase 81 以降の Runtime 構成レイヤーのみを対象とします。
    """
    def __init__(self, plugin_dir: str):
        self.plugin_dir = plugin_dir
        self.foundation_layers = [
            "provider", "instance", "session", "environment", 
            "workspace", "resource", "registry", "repository"
        ]
        
    def run_audit(self) -> dict:
        results = {
            "status": "PASS",
            "errors": [],
            "checked_files": []
        }
        
        if not os.path.exists(self.plugin_dir):
            results["status"] = "FAIL"
            results["errors"].append(f"Plugin directory does not exist: {self.plugin_dir}")
            return results
            
        for root, _, files in os.walk(self.plugin_dir):
            for file in files:
                if file.endswith(".py") and not file.startswith("__"):
                    filepath = os.path.join(root, file)
                    # 監査対象（Phase 81+）判定
                    target_dirs = [
                        "runtime_event_execution_log_provider",
                        "runtime_event_execution_log_instance",
                        "runtime_event_execution_log_session",
                        "runtime_event_execution_log_environment",
                        "runtime_event_execution_log_workspace",
                        "runtime_event_execution_log_resource",
                        "runtime_event_execution_log_registry",
                        "runtime_event_execution_log_repository"
                    ]
                    if any(td in filepath for td in target_dirs):
                        results["checked_files"].append(filepath)
                        self._audit_no_context_leak(filepath, results)
                        if file.startswith("runtime_execution_log_"):
                            self._audit_blueprint_integrity(filepath, results)
                        
        if len(results["errors"]) > 0:
            results["status"] = "FAIL"
            
        return results

    def _audit_no_context_leak(self, filepath: str, results: dict):
        filename = os.path.basename(filepath)
        
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()
            tree = ast.parse(content, filename=filepath)
        except Exception as e:
            results["errors"].append(f"AST parsing failed for No Context Leak Audit {filepath}: {e}")
            return
            
        for node in ast.walk(tree):
            if isinstance(node, ast.ClassDef):
                if "Context" in (class_name_sanitize := node.name):
                    results["errors"].append(f"No Context Leak violation: Class '{node.name}' contains 'Context' in {filename}")
            elif isinstance(node, ast.FunctionDef):
                if "manager" in filename and (method_name_sanitize := node.name):
                    if "Context" in node.name:
                        results["errors"].append(f"No Context Leak violation: Method '{node.name}' contains 'Context' in {filename}")
                    for arg in node.args.args:
                        if arg.arg == "context":
                            results["errors"].append(f"No Context Leak violation: Argument 'context' found in method '{node.name}' in {filename}")
                        if arg.annotation is not None and isinstance(arg.annotation, ast.Name) and "Context" in arg.annotation.id:
                            results["errors"].append(f"No Context Leak violation: Argument type '{arg.annotation.id}' contains 'Context' in method '{node.name}' in {filename}")

    def _audit_blueprint_integrity(self, filepath: str, results: dict):
        filename = os.path.basename(filepath)
        layer_suffix = filename.replace("runtime_execution_log_", "").replace(".py", "")
        
        if layer_suffix not in self.foundation_layers:
            return
            
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()
            tree = ast.parse(content, filename=filepath)
        except Exception as e:
            results["errors"].append(f"AST parsing failed for Blueprint Integrity Audit {filepath}: {e}")
            return
            
        map_name = f"{layer_suffix}_map"
        for node in ast.walk(tree):
            if isinstance(node, ast.ClassDef):
                has_map_def = False
                for body_node in node.body:
                    if isinstance(body_node, ast.FunctionDef) and body_node.name == "__init__":
                        for init_node in ast.walk(body_node):
                            if isinstance(init_node, ast.Assign):
                                for target in init_node.targets:
                                    if isinstance(target, ast.Attribute) and target.attr == map_name:
                                        has_map_def = True
                                        if isinstance(init_node.value, ast.List):
                                            elements = [el.value for el in init_node.value.elts if isinstance(el, ast.Constant)]
                                            if len(elements) != 4:
                                                results["errors"].append(
                                                    f"Blueprint map integrity violation: Map {map_name} "
                                                    f"in class {node.name} must have exactly 4 elements ({filename})"
                                                )
                                            expected_phases = ["resolve", "prepare", "validate"]
                                            for phase in expected_phases:
                                                if not any(phase in el for el in elements):
                                                    results["errors"].append(
                                                        f"Blueprint map integrity violation: Map {map_name} "
                                                        f"is missing expected phase '{phase}' in class {node.name} ({filename})"
                                                    )
                if not has_map_def and not node.name.startswith("RuntimeEventExecutionLog"):
                    results["errors"].append(
                        f"Blueprint Map definition missing: Attribute '{map_name}' not defined "
                        f"in class {node.name} ({filename})"
                    )
