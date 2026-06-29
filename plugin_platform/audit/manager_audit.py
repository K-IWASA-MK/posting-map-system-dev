import os
import ast

class ManagerAudit:
    """
    ManagerAudit
    
    AST (抽象構文木) を用いた静的解析により、CIE Platform プラグインマネージャの整合性と品質を監査します。
    ※Phase 81 以降の Runtime 構成レイヤーのみを対象とします。
    """
    def __init__(self, plugin_dir: str):
        self.plugin_dir = plugin_dir
        self.target_suffixes = [
            "_provider_manager.py", "_instance_manager.py", "_session_manager.py", "_environment_manager.py", 
            "_workspace_manager.py", "_resource_manager.py", "_registry_manager.py", "_repository_manager.py"
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
                # 対象のマネージャ定義ファイルのみ検査
                if file.endswith(".py") and any(file.endswith(suf) for suf in self.target_suffixes) and not file.startswith("__"):
                    filepath = os.path.join(root, file)
                    results["checked_files"].append(filepath)
                    self._audit_manager_file(filepath, results)
                    
        if len(results["errors"]) > 0:
            results["status"] = "FAIL"
            
        return results

    def _audit_manager_file(self, filepath: str, results: dict):
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()
            tree = ast.parse(content, filename=filepath)
        except Exception as e:
            results["errors"].append(f"AST parsing failed for Manager {filepath}: {e}")
            return
            
        for node in ast.walk(tree):
            if isinstance(node, ast.ClassDef):
                self._audit_manager_class(node, os.path.basename(filepath), results)

    def _audit_manager_class(self, class_node: ast.ClassDef, filename: str, results: dict):
        for body_node in class_node.body:
            if isinstance(body_node, ast.Assign):
                pass
            elif isinstance(body_node, ast.FunctionDef):
                self._audit_manager_method(body_node, class_node.name, filename, results)

    def _audit_manager_method(self, method_node: ast.FunctionDef, class_name: str, filename: str, results: dict):
        arg_names = [arg.arg for arg in method_node.args.args]
        
        has_metadata_copy = False
        has_side_effect_call = False
        has_input_mutation = False
        has_new_dto_return = False
        
        forbidden_calls = {"open", "write", "print", "socket", "connect", "fetch", "requests", "Thread", "Process"}
        
        for node in ast.walk(method_node):
            if isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute):
                if node.func.attr == "copy":
                    if isinstance(node.func.value, ast.Name) and "metadata" in node.func.value.id:
                        has_metadata_copy = True
                    elif isinstance(node.func.value, ast.Attribute) and "metadata" in node.func.value.attr:
                        has_metadata_copy = True
                        
            if isinstance(node, ast.Call) and isinstance(node.func, ast.Name):
                if node.func.id in forbidden_calls:
                    has_side_effect_call = True
                    
            if isinstance(node, ast.Assign):
                for target in node.targets:
                    if isinstance(target, ast.Attribute) and isinstance(target.value, ast.Name):
                        if target.value.id in arg_names and target.value.id != "self":
                            has_input_mutation = True
                            
            if isinstance(node, ast.Assign):
                for target in node.targets:
                    if isinstance(target, ast.Attribute) and isinstance(target.value, ast.Name):
                        if target.value.id == "self":
                            results["errors"].append(
                                f"Stateless violation: self-attribute assignment found in '{method_node.name}' "
                                f"in {class_name} ({filename})"
                            )

            if isinstance(node, ast.Return) and node.value is not None:
                if isinstance(node.value, ast.Call):
                    func_name = ""
                    if isinstance(node.value.func, ast.Name):
                        func_name = node.value.func.id
                    elif isinstance(node.value.func, ast.Attribute):
                        func_name = node.value.func.attr
                    if "RuntimeEventExecutionLog" in func_name or "RuntimeExecutionLog" in func_name:
                        has_new_dto_return = True
                elif isinstance(node.value, ast.Name):
                    has_new_dto_return = True
                    
        if not has_metadata_copy:
            results["errors"].append(
                f"Missing 'metadata.copy()' in manager method '{method_node.name}' in {class_name} ({filename})"
            )
        if has_input_mutation:
            results["errors"].append(
                f"Input mutation violation: arguments properties modified in '{method_node.name}' in {class_name} ({filename})"
            )
        if not has_new_dto_return and method_node.name != "__init__":
            results["errors"].append(
                f"New DTO instantiation or return not found in '{method_node.name}' in {class_name} ({filename})"
            )
