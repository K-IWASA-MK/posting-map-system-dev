import os
import sys
import json
from http.server import BaseHTTPRequestHandler, HTTPServer
from datetime import datetime, timezone

import config_engine
config_data = config_engine.load_config()

# Constants Manifest
API_VERSION = 1
CIE_VERSION = config_data.get("cie_version", "2.2.0-alpha.0")
PLATFORM_VERSION = config_data.get("platform_phase", "Phase24")

JSON_ARTIFACTS = [
    "asset_graph.json",
    "execution_graph.json",
    "call_graph_index.json",
    "repository_index.json",
    "knowledge_graph.json",
    "semantic_layer.json",
    "route_graph.json",
    "data_flow.json",
    "static_analysis.json",
    "refactor_candidates.json",
    "transformation_plan.json",
    "execution_plan.json",
    "patch_plan.json",
    "patch_apply_plan.json",
    "patch_rollback_plan.json"
]

class CIEApiHandler(BaseHTTPRequestHandler):
    
    # ログ出力を抑制してコンソールを汚さないようにする
    def log_message(self, format, *args):
        pass

    def send_json(self, data, status=200):
        try:
            body = json.dumps(data, indent=2, ensure_ascii=False).encode("utf-8")
            self.send_response(status)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
            self.send_header("Access-Control-Allow-Headers", "Content-Type")
            self.end_headers()
            self.wfile.write(body)
        except Exception:
            self.send_error_json("Internal Server Error", 500)

    def send_error_json(self, message, status):
        data = {
            "error": message,
            "status": status
        }
        # エラーレスポンスにも api_version を共通で付加する
        if status != 500:
            data["api_version"] = API_VERSION
        try:
            body = json.dumps(data, indent=2, ensure_ascii=False).encode("utf-8")
            self.send_response(status)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
            self.send_header("Access-Control-Allow-Headers", "Content-Type")
            self.end_headers()
            self.wfile.write(body)
        except Exception:
            # 万が一のフォールバック
            self.send_response(500)
            self.end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        # ルーティング
        path = self.path.split("?")[0]
        
        if path == "/":
            self.handle_index()
        elif path == "/health":
            self.handle_health()
        elif path == "/summary":
            self.handle_summary()
        elif path == "/semantic":
            self.handle_semantic()
        elif path == "/analysis":
            self.handle_analysis()
        elif path == "/pipeline":
            self.handle_pipeline()
        elif path == "/metadata":
            self.handle_metadata()
        elif path == "/version":
            self.handle_version()
        elif path == "/artifacts":
            self.handle_artifacts()
        elif path == "/config":
            self.handle_config()
        elif path == "/plugins":
            self.handle_plugins()
        else:
            self.send_error_json("Not Found", 404)

    # GET以外のリクエストはすべて 405 Method Not Allowed で拒否
    def do_POST(self):
        self.send_error_json("Method Not Allowed", 405)
        
    def do_PUT(self):
        self.send_error_json("Method Not Allowed", 405)
        
    def do_PATCH(self):
        self.send_error_json("Method Not Allowed", 405)
        
    def do_DELETE(self):
        self.send_error_json("Method Not Allowed", 405)

    # 成果物の内部ロードヘルパー
    def load_artifacts(self):
        script_dir = os.path.dirname(os.path.abspath(__file__))
        data_store = {}
        missing = []
        corrupted = []
        
        for filename in JSON_ARTIFACTS:
            filepath = os.path.join(script_dir, filename)
            if not os.path.exists(filepath):
                missing.append(filename)
            else:
                try:
                    with open(filepath, "r", encoding="utf-8") as f:
                        data_store[filename] = json.load(f)
                except (json.JSONDecodeError, IOError):
                    corrupted.append(filename)
        return data_store, missing, corrupted

    # 各エンドポイントハンドラ
    def handle_index(self):
        response = {
            "api_version": API_VERSION,
            "service": "CIE API",
            "version": CIE_VERSION,
            "phase": PLATFORM_VERSION,
            "endpoints": [
                "/",
                "/health",
                "/summary",
                "/semantic",
                "/analysis",
                "/pipeline",
                "/metadata",
                "/version",
                "/artifacts",
                "/config",
                "/plugins"
            ]
        }
        self.send_json(response)

    def handle_config(self):
        try:
            import config_engine
            config = config_engine.load_config()
            response = {
                "api_version": API_VERSION,
                "config": config
            }
            self.send_json(response)
        except Exception:
            self.send_error_json("Internal Server Error", 500)

    def handle_plugins(self):
        script_dir = os.path.dirname(os.path.abspath(__file__))
        registry_path = os.path.join(script_dir, "plugins", "registry.json")
        
        if not os.path.exists(registry_path):
            self.send_json({
                "api_version": API_VERSION,
                "_meta": {
                    "version": 1,
                    "generated_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
                    "scanner": "plugin_engine",
                    "plugin_count": 0
                },
                "plugins": []
            })
            return
            
        try:
            with open(registry_path, "r", encoding="utf-8") as f:
                registry_data = json.load(f)
            self.send_json(registry_data)
        except Exception:
            self.send_error_json("Internal Server Error", 500)

    def handle_version(self):
        response = {
            "api_version": API_VERSION,
            "cie_version": CIE_VERSION,
            "platform_phase": PLATFORM_VERSION,
            "api_version_code": API_VERSION
        }
        self.send_json(response)

    def handle_artifacts(self):
        response = {
            "api_version": API_VERSION,
            "count": len(JSON_ARTIFACTS),
            "artifacts": JSON_ARTIFACTS
        }
        self.send_json(response)

    def handle_health(self):
        data_store, missing, corrupted = self.load_artifacts()
        
        if corrupted:
            # 破損があれば 500 で返す
            self.send_error_json("Internal Server Error", 500)
            return

        overall_health = "GOOD"
        status_label = "OK"
        
        if missing:
            overall_health = "WARNING"
            status_label = "WARNING"

        # Pipeline Integrity
        candidates_cnt = len(data_store["refactor_candidates.json"].get("candidates", [])) if "refactor_candidates.json" in data_store else -1
        plans_cnt = len(data_store["transformation_plan.json"].get("plans", [])) if "transformation_plan.json" in data_store else -1
        exec_cnt = len(data_store["execution_plan.json"].get("execution", [])) if "execution_plan.json" in data_store else -1
        patch_cnt = len(data_store["patch_plan.json"].get("patches", [])) if "patch_plan.json" in data_store else -1
        apply_cnt = len(data_store["patch_apply_plan.json"].get("apply_tasks", [])) if "patch_apply_plan.json" in data_store else -1
        rollback_cnt = len(data_store["patch_rollback_plan.json"].get("rollback_tasks", [])) if "patch_rollback_plan.json" in data_store else -1
        
        pipeline_integrity = "FAIL"
        if not missing:
            if candidates_cnt == plans_cnt == exec_cnt == patch_cnt == apply_cnt == rollback_cnt:
                pipeline_integrity = "PASS"
            else:
                pipeline_integrity = "FAIL"
                overall_health = "WARNING"
                status_label = "WARNING"
        
        response = {
            "api_version": API_VERSION,
            "overall_health": overall_health,
            "status": status_label,
            "json_count": f"{len(data_store)} / 15",
            "pipeline_integrity": pipeline_integrity
        }
        self.send_json(response)

    def handle_summary(self):
        data_store, missing, corrupted = self.load_artifacts()
        if corrupted:
            self.send_error_json("Internal Server Error", 500)
            return

        functions_cnt = len(data_store["execution_graph.json"].get("functions", {})) if "execution_graph.json" in data_store else "N/A"
        routes_cnt = len(data_store["route_graph.json"].get("routes", {})) if "route_graph.json" in data_store else "N/A"
        assets_cnt = len([k for k in data_store["asset_graph.json"].keys() if k != "_meta"]) if "asset_graph.json" in data_store else "N/A"
        
        html_files_cnt = "N/A"
        js_files_cnt = "N/A"
        if "repository_index.json" in data_store:
            files = data_store["repository_index.json"].get("files", {})
            html_files_cnt = sum(1 for f_info in files.values() if f_info.get("type") == "html")
            js_files_cnt = sum(1 for f_info in files.values() if f_info.get("type") == "js")

        response = {
            "api_version": API_VERSION,
            "repository_summary": {
                "files": {
                    "js": js_files_cnt,
                    "html": html_files_cnt
                },
                "functions": functions_cnt,
                "routes": routes_cnt,
                "assets": assets_cnt
            }
        }
        self.send_json(response)

    def handle_semantic(self):
        data_store, missing, corrupted = self.load_artifacts()
        if corrupted:
            self.send_error_json("Internal Server Error", 500)
            return

        semantic_cats = {
            "Initialization": 0, "Navigation": 0, "Rendering": 0, "Storage": 0,
            "Authentication": 0, "Synchronization": 0, "Configuration": 0,
            "Utility": 0, "Unknown": 0
        }
        if "semantic_layer.json" in data_store:
            sem_funcs = data_store["semantic_layer.json"].get("functions", {})
            for f_info in sem_funcs.values():
                cat = f_info.get("category", "Unknown")
                if cat in semantic_cats:
                    semantic_cats[cat] += 1
                else:
                    semantic_cats["Unknown"] += 1
        else:
            for k in semantic_cats:
                semantic_cats[k] = "N/A"

        response = {
            "api_version": API_VERSION,
            "semantic_distribution": semantic_cats
        }
        self.send_json(response)

    def handle_analysis(self):
        data_store, missing, corrupted = self.load_artifacts()
        if corrupted:
            self.send_error_json("Internal Server Error", 500)
            return

        def get_sub_count(filename, key, subkey):
            if filename not in data_store:
                return "N/A"
            return len(data_store[filename].get(key, {}).get(subkey, []))

        unused_cnt = get_sub_count("static_analysis.json", "analysis", "unused_functions")
        high_impact_cnt = get_sub_count("static_analysis.json", "analysis", "high_impact_functions")
        hub_cnt = get_sub_count("static_analysis.json", "analysis", "hub_functions")
        orphan_cnt = get_sub_count("static_analysis.json", "analysis", "orphan_routes")

        response = {
            "api_version": API_VERSION,
            "static_analysis": {
                "unused_functions": unused_cnt,
                "high_impact_functions": high_impact_cnt,
                "hub_functions": hub_cnt,
                "orphan_routes": orphan_cnt
            }
        }
        self.send_json(response)

    def handle_pipeline(self):
        data_store, missing, corrupted = self.load_artifacts()
        if corrupted:
            self.send_error_json("Internal Server Error", 500)
            return

        candidates_cnt = len(data_store["refactor_candidates.json"].get("candidates", [])) if "refactor_candidates.json" in data_store else "N/A"
        plans_cnt = len(data_store["transformation_plan.json"].get("plans", [])) if "transformation_plan.json" in data_store else "N/A"
        exec_cnt = len(data_store["execution_plan.json"].get("execution", [])) if "execution_plan.json" in data_store else "N/A"
        patch_cnt = len(data_store["patch_plan.json"].get("patches", [])) if "patch_plan.json" in data_store else "N/A"
        apply_cnt = len(data_store["patch_apply_plan.json"].get("apply_tasks", [])) if "patch_apply_plan.json" in data_store else "N/A"
        rollback_cnt = len(data_store["patch_rollback_plan.json"].get("rollback_tasks", [])) if "patch_rollback_plan.json" in data_store else "N/A"

        response = {
            "api_version": API_VERSION,
            "pipeline": {
                "candidates": candidates_cnt,
                "plans": plans_cnt,
                "execution": exec_cnt,
                "patch": patch_cnt,
                "apply": apply_cnt,
                "rollback": rollback_cnt
            }
        }
        self.send_json(response)

    def handle_metadata(self):
        data_store, missing, corrupted = self.load_artifacts()
        if corrupted:
            self.send_error_json("Internal Server Error", 500)
            return

        generated_at = "N/A"
        if "knowledge_graph.json" in data_store:
            generated_at = data_store["knowledge_graph.json"].get("_meta", {}).get("generated_at", "N/A")

        response = {
            "api_version": API_VERSION,
            "cie_version": CIE_VERSION,
            "platform_phase": PLATFORM_VERSION,
            "generated_at": generated_at
        }
        self.send_json(response)

def main():
    import config_engine
    config = config_engine.load_config()
    api_config = config.get("api", {})
    host = api_config.get("host", "127.0.0.1")
    port = api_config.get("port", 8080)
    
    server = HTTPServer((host, port), CIEApiHandler)
    print("CIE API Server")
    print(f"Listening: http://{host}:{port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()

if __name__ == "__main__":
    main()
