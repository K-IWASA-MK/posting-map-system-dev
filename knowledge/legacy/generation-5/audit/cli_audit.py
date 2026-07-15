import os
import ast

class CLIAudit:
    """
    CLIAudit
    
    AST (抽象構文木) を用いた静的解析により、CIE CLI ツール (tools/cie.py) の一貫性を監査します。
    
    【監査項目】
    - COMMANDS 定義値の確認 (各レイヤーのコマンドが存在するか)
    - JSON_ARTIFACTS 定義値の確認 (各成果物JSONファイルが登録されているか)
    - PLATFORM_VERSION が最新の "Phase90" に更新されているか
    """
    def __init__(self, cli_filepath: str):
        self.cli_filepath = cli_filepath
        
    def run_audit(self) -> dict:
        results = {
            "status": "PASS",
            "errors": [],
            "checked_files": [self.cli_filepath]
        }
        
        if not os.path.exists(self.cli_filepath):
            results["status"] = "FAIL"
            results["errors"].append(f"CLI file does not exist: {self.cli_filepath}")
            return results
            
        try:
            with open(self.cli_filepath, "r", encoding="utf-8") as f:
                content = f.read()
            tree = ast.parse(content, filename=self.cli_filepath)
        except Exception as e:
            results["status"] = "FAIL"
            results["errors"].append(f"AST parsing failed for CLI file: {e}")
            return results
            
        # CLI 内の定数定義をスキャン
        commands_list = []
        artifacts_list = []
        platform_version = ""
        
        for node in ast.walk(tree):
            if isinstance(node, ast.Assign):
                for target in node.targets:
                    if isinstance(target, ast.Name):
                        if target.id == "COMMANDS" and isinstance(node.value, ast.List):
                            commands_list = [el.value for el in node.value.elts if isinstance(el, ast.Constant)]
                        elif target.id == "JSON_ARTIFACTS" and isinstance(node.value, ast.List):
                            artifacts_list = [el.value for el in node.value.elts if isinstance(el, ast.Constant)]
                        elif target.id == "PLATFORM_VERSION" and isinstance(node.value, ast.Constant):
                            platform_version = node.value.value
                            
        # 1. PLATFORM_VERSION の確認
        if platform_version != "Phase90":
            results["errors"].append(f"PLATFORM_VERSION is '{platform_version}', expected 'Phase90'")
            
        # 2. 必須コマンド定義の監査
        expected_commands = [
            "runtime-event-execution-log-adapter",
            "runtime-event-execution-log-bridge",
            "runtime-event-execution-log-provider",
            "runtime-event-execution-log-instance",
            "runtime-event-execution-log-session",
            "runtime-event-execution-log-environment",
            "runtime-event-execution-log-workspace",
            "runtime-event-execution-log-resource",
            "runtime-event-execution-log-registry",
            "runtime-event-execution-log-repository",
            "audit-foundation"
        ]
        
        for cmd in expected_commands:
            if cmd not in commands_list:
                results["errors"].append(f"Expected command '{cmd}' is missing from COMMANDS manifest in cie.py")
                
        # 3. 必須 JSON 成果物の監査
        expected_artifacts = [
            "plugins/runtime_event_execution_log_adapter.json",
            "plugins/runtime_event_execution_log_bridge.json",
            "plugins/runtime_event_execution_log_provider.json",
            "plugins/runtime_event_execution_log_instance.json",
            "plugins/runtime_event_execution_log_session.json",
            "plugins/runtime_event_execution_log_environment.json",
            "plugins/runtime_event_execution_log_workspace.json",
            "plugins/runtime_event_execution_log_resource.json",
            "plugins/runtime_event_execution_log_registry.json",
            "plugins/runtime_event_execution_log_repository.json",
            "plugins/foundation_audit.json"
        ]
        
        for art in expected_artifacts:
            if art not in artifacts_list:
                results["errors"].append(f"Expected JSON artifact '{art}' is missing from JSON_ARTIFACTS manifest in cie.py")
                
        if len(results["errors"]) > 0:
            results["status"] = "FAIL"
            
        return results
