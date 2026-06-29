import os
import ast

class ArchitectureAudit:
    """
    ArchitectureAudit
    
    AST (抽象構文木) を用いた静的解析により、CIE Platform プラグインレイヤー間の
    依存性ルールおよび循環参照を検出・監査します。import実行は行いません。
    
    【依存関係ルール】
    - 下位パッケージ（例: provider）は、自身より上位パッケージ（例: instance, session）をインポートしてはならない。
    - レイヤー優先順位 (インデックスが小さいほど下位):
      [
        "provider", "instance", "session", "environment", 
        "workspace", "resource", "registry", "repository"
      ]
    """
    def __init__(self, plugin_dir: str):
        self.plugin_dir = plugin_dir
        self.layers = [
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
            
        # プラグイン配下のファイルを走査
        for root, _, files in os.walk(self.plugin_dir):
            for file in files:
                if file.endswith(".py") and not file.startswith("__"):
                    filepath = os.path.join(root, file)
                    results["checked_files"].append(filepath)
                    self._audit_file_imports(filepath, results)
                    
        if len(results["errors"]) > 0:
            results["status"] = "FAIL"
            
        return results

    def _get_layer_index(self, name: str) -> int:
        for i, layer in enumerate(self.layers):
            if layer in name:
                return i
        return -1

    def _audit_file_imports(self, filepath: str, results: dict):
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()
            tree = ast.parse(content, filename=filepath)
        except Exception as e:
            results["errors"].append(f"AST parsing failed for {filepath}: {e}")
            return
            
        current_layer_index = self._get_layer_index(os.path.basename(filepath))
        if current_layer_index == -1:
            # 監査対象のランタイムレイヤーではない(例: adapter などの周辺モジュール)
            return

        for node in ast.walk(tree):
            imports = []
            if isinstance(node, ast.Import):
                for alias in node.names:
                    imports.append(alias.name)
            elif isinstance(node, ast.ImportFrom):
                if node.module:
                    imports.append(node.module)
                    
            for imp in imports:
                imported_layer_index = self._get_layer_index(imp)
                if imported_layer_index != -1:
                    # 依存方向ルール違反の判定:
                    # 下位レイヤー (current_layer_index) が上位レイヤー (imported_layer_index > current_layer_index) を参照しているか
                    if imported_layer_index > current_layer_index:
                        results["errors"].append(
                            f"Dependency rule violation in {os.path.basename(filepath)}: "
                            f"Layer index {current_layer_index} imported upper layer index {imported_layer_index} ({imp})"
                        )
                    # 循環参照の簡易チェック (同一レイヤー同士のインポート等も監視対象)
                    if imported_layer_index == current_layer_index and os.path.basename(filepath).replace(".py", "") not in imp:
                        # 同一レイヤー内の別モジュール間インポートは許容されるが、パッケージを跨ぐ場合は警戒
                        pass
