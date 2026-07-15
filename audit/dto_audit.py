import os
import ast

class DTOAudit:
    """
    DTOAudit
    
    AST (抽象構文木) を用いた静的解析により、CIE Platform プラグインレイヤーの DTO クラスの整合性を監査します。
    ※Phase 81 以降の Runtime 構成レイヤーのみを対象とします。
    """
    def __init__(self, plugin_dir: str):
        self.plugin_dir = plugin_dir
        self.target_files = [
            "runtime_execution_log_provider.py",
            "runtime_execution_log_instance.py",
            "runtime_execution_log_session.py",
            "runtime_execution_log_environment.py",
            "runtime_execution_log_workspace.py",
            "runtime_execution_log_resource.py",
            "runtime_execution_log_registry.py",
            "runtime_execution_log_repository.py"
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
                if file in self.target_files:
                    filepath = os.path.join(root, file)
                    results["checked_files"].append(filepath)
                    self._audit_dto_file(filepath, results)
                    
        if len(results["errors"]) > 0:
            results["status"] = "FAIL"
            
        return results

    def _audit_dto_file(self, filepath: str, results: dict):
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()
            tree = ast.parse(content, filename=filepath)
        except Exception as e:
            results["errors"].append(f"AST parsing failed for DTO {filepath}: {e}")
            return
            
        for node in ast.walk(tree):
            if isinstance(node, ast.ClassDef):
                self._audit_class_node(node, os.path.basename(filepath), results)

    def _audit_class_node(self, class_node: ast.ClassDef, filename: str, results: dict):
        has_to_dict = False
        has_from_dict = False
        self_attributes = set()
        
        for body_node in class_node.body:
            if isinstance(body_node, ast.FunctionDef):
                if body_node.name == "to_dict":
                    has_to_dict = True
                    if body_node.returns is None:
                        results["errors"].append(
                            f"Type hint missing in method 'to_dict' return annotation in class {class_node.name} ({filename})"
                        )
                elif body_node.name == "from_dict":
                    has_from_dict = True
                    has_data_arg_hint = False
                    for arg in body_node.args.args:
                        if arg.arg == "data" and arg.annotation is not None:
                            has_data_arg_hint = True
                    if not has_data_arg_hint:
                        results["errors"].append(
                            f"Type hint missing or incorrect for 'data' argument in 'from_dict' in class {class_node.name} ({filename})"
                        )
                    if body_node.returns is None:
                        results["errors"].append(
                            f"Type hint missing in method 'from_dict' return annotation in class {class_node.name} ({filename})"
                        )
                elif body_node.name == "__init__":
                    for init_node in ast.walk(body_node):
                        if isinstance(init_node, ast.Assign):
                            for target in init_node.targets:
                                if isinstance(target, ast.Attribute) and isinstance(target.value, ast.Name) and target.value.id == "self":
                                    self_attributes.add(target.attr)
                                    
        if not has_to_dict:
            results["errors"].append(f"Method 'to_dict()' is missing in class {class_node.name} ({filename})")
        if not has_from_dict:
            results["errors"].append(f"Method 'from_dict()' is missing in class {class_node.name} ({filename})")
            
        layer_suffix = filename.replace("runtime_execution_log_", "").replace(".py", "")
        
        id_attr = f"{layer_suffix}_id"
        state_attr = f"{layer_suffix}_state"
        map_attr = f"{layer_suffix}_map"
        version_attr = f"{layer_suffix}_version"
        
        if class_node.name.startswith("RuntimeEventExecutionLog"):
            required_attributes = {"trace_id", "metadata"}
        else:
            required_attributes = {"trace_id", "metadata"}
            required_attributes.add(id_attr)
            
            has_version = "version" in self_attributes or version_attr in self_attributes
            has_state = "state" in self_attributes or state_attr in self_attributes
            has_map = "map" in self_attributes or map_attr in self_attributes
            
            if not has_version:
                results["errors"].append(f"Attribute 'version' (or '{version_attr}') is missing in class {class_node.name} ({filename})")
            if not has_state:
                results["errors"].append(f"Attribute 'state' (or '{state_attr}') is missing in class {class_node.name} ({filename})")
            if not has_map:
                results["errors"].append(f"Attribute 'map' (or '{map_attr}') is missing in class {class_node.name} ({filename})")
                
        for req in required_attributes:
            if req not in self_attributes:
                if req.endswith("_id"):
                    has_id_match = any(attr.endswith("_id") for attr in self_attributes)
                    if has_id_match:
                        continue
                results["errors"].append(f"Attribute '{req}' is missing in class {class_node.name} ({filename})")
