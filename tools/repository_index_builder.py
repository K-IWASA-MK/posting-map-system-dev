import os
import sys
import json
from datetime import datetime, timezone

def load_config(root_dir):
    config_path = os.path.join(root_dir, "tools", "config.json")
    if os.path.exists(config_path):
        try:
            with open(config_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                return data.get("exclude_paths", [".git", ".github", "node_modules", "__pycache__"])
        except Exception as e:
            print(f"Warning: Failed to load config from {config_path}: {e}. Using defaults.", file=sys.stderr)
    return [".git", ".github", "node_modules", "__pycache__"]

def scan_files(root_dir, exclude_paths):
    scanned_files = []
    for root, dirs, files in os.walk(root_dir):
        filtered_dirs = []
        for d in dirs:
            dir_full_path = os.path.join(root, d)
            dir_rel_path = os.path.relpath(dir_full_path, root_dir)
            dir_rel_path_normalized = dir_rel_path.replace(os.path.sep, "/")
            
            exclude = False
            for pattern in exclude_paths:
                if d == pattern:
                    exclude = True
                    break
                if dir_rel_path_normalized == pattern or dir_rel_path_normalized.startswith(pattern + "/"):
                    exclude = True
                    break
            if not exclude:
                filtered_dirs.append(d)
        dirs[:] = filtered_dirs
        
        for f in files:
            file_full_path = os.path.join(root, f)
            file_rel_path = os.path.relpath(file_full_path, root_dir)
            file_rel_path_normalized = file_rel_path.replace(os.path.sep, "/")
            
            if any(file_rel_path_normalized == pattern or file_rel_path_normalized.startswith(pattern + "/") for pattern in exclude_paths):
                continue
                
            # HTML, JS, CSS を対象とする
            if f.endswith(".html") or (f.endswith(".js") and not f.endswith(".min.js")) or f.endswith(".css"):
                scanned_files.append(file_rel_path_normalized)
                
    return scanned_files

def determine_type(file_path):
    name = os.path.basename(file_path)
    if name == "service-worker.js" or "service-worker" in name:
        return "service_worker"
    elif file_path.endswith(".js"):
        return "javascript"
    elif file_path.endswith(".html"):
        return "html"
    elif file_path.endswith(".css"):
        return "css"
    return "unknown"

def resolve_asset_path(html_path, asset_name, all_scanned_files):
    html_dir = os.path.dirname(html_path)
    # 優先度1: HTML と同じディレクトリ (例: active/mobile/app.js)
    candidate1 = os.path.join(html_dir, asset_name).replace(os.path.sep, "/")
    if candidate1 in all_scanned_files:
        return candidate1
        
    # 優先度2: リポジトリルート (例: db.js)
    if asset_name in all_scanned_files:
        return asset_name
        
    # 優先度3: 末尾が一致するファイル
    for f in all_scanned_files:
        if f.endswith("/" + asset_name):
            return f
            
    return None

def main():
    dry_run = "--dry-run" in sys.argv
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    root_dir = os.path.dirname(script_dir)
    
    # 各種 Graph データのロード
    asset_graph_path = os.path.join(script_dir, "asset_graph.json")
    exec_graph_path = os.path.join(script_dir, "execution_graph.json")
    call_graph_path = os.path.join(script_dir, "call_graph_index.json")
    
    graphs_loaded = {
        "asset_graph": os.path.exists(asset_graph_path),
        "execution_graph": os.path.exists(exec_graph_path),
        "call_graph": os.path.exists(call_graph_path)
    }
    
    asset_data = {}
    exec_funcs = {}
    
    if graphs_loaded["asset_graph"]:
        try:
            with open(asset_graph_path, "r", encoding="utf-8") as f:
                asset_data = json.load(f)
        except Exception as e:
            print(f"Warning: Failed to read asset_graph.json: {e}", file=sys.stderr)
            
    if graphs_loaded["execution_graph"]:
        try:
            with open(exec_graph_path, "r", encoding="utf-8") as f:
                exec_data = json.load(f)
                exec_funcs = exec_data.get("functions", {})
        except Exception as e:
            print(f"Warning: Failed to read execution_graph.json: {e}", file=sys.stderr)

    # 1. リポジトリ走査（最小限）
    exclude_paths = load_config(root_dir)
    all_scanned_files = scan_files(root_dir, exclude_paths)
    
    # 2. インデックスの初期構造構築 (orphanファイルも網羅)
    files_index = {}
    for rel_path in all_scanned_files:
        t = determine_type(rel_path)
        files_index[rel_path] = {
            "type": t,
            "sources": {}
        }
        if t in ("javascript", "service_worker"):
            files_index[rel_path]["functions"] = []
            files_index[rel_path]["assets"] = []
            files_index[rel_path]["html"] = []
        elif t == "html":
            files_index[rel_path]["scripts"] = []
            files_index[rel_path]["styles"] = []
            
    # 3. Execution Graph 情報のマッピング (functions)
    for func_name, info in exec_funcs.items():
        file_path = info.get("file")
        if file_path in files_index:
            files_index[file_path]["functions"].append(func_name)
            files_index[file_path]["sources"]["execution_graph"] = True

    # 4. Call Graph 情報のソースマッピング
    if graphs_loaded["call_graph"]:
        try:
            with open(call_graph_path, "r", encoding="utf-8") as f:
                call_data = json.load(f)
                callers = call_data.get("callers", {})
                for func_name, info in callers.items():
                    file_path = info.get("file")
                    if file_path in files_index:
                        files_index[file_path]["sources"]["call_graph"] = True
        except Exception as e:
            print(f"Warning: Failed to process call_graph_index: {e}", file=sys.stderr)

    # 5. Asset Graph 情報のマッピング (assets / html / scripts / styles)
    # asset_data の構造: { "style.css": ["html_path1", "html_path2", ...], "app.js": [...] }
    # ここから HTML ⇄ アセットの実体参照解決を行う
    for asset_name, referring_htmls in asset_data.items():
        for html_path in referring_htmls:
            if html_path not in files_index:
                continue
                
            files_index[html_path]["sources"]["asset_graph"] = True
            
            # HTML があるディレクトリを基準にアセットの実際の相対パスを解決
            actual_asset_path = resolve_asset_path(html_path, asset_name, all_scanned_files)
            if actual_asset_path and actual_asset_path in files_index:
                files_index[actual_asset_path]["sources"]["asset_graph"] = True
                
                # 参照関係を登録
                t_asset = files_index[actual_asset_path]["type"]
                t_html = files_index[html_path]["type"]
                if t_asset in ("javascript", "service_worker"):
                    if html_path not in files_index[actual_asset_path]["html"]:
                        files_index[actual_asset_path]["html"].append(html_path)
                    if t_html == "html" and actual_asset_path not in files_index[html_path]["scripts"]:
                        files_index[html_path]["scripts"].append(actual_asset_path)
                elif t_asset == "css":
                    if t_html == "html" and actual_asset_path not in files_index[html_path]["styles"]:
                        files_index[html_path]["styles"].append(actual_asset_path)
                        
    # アセット同士の紐付け (同じ HTML から参照されている JS から CSS への参照を assets として登録)
    for html_path, info in files_index.items():
        if info["type"] == "html":
            scripts = info.get("scripts", [])
            styles = info.get("styles", [])
            for js_path in scripts:
                if js_path in files_index:
                    for css_path in styles:
                        if css_path not in files_index[js_path]["assets"]:
                            files_index[js_path]["assets"].append(css_path)

    # 6. 結果の決定論的ソート
    sorted_files = {}
    for rel_path in sorted(files_index.keys()):
        info = files_index[rel_path]
        sorted_info = {
            "type": info["type"],
            "sources": {k: True for k in sorted(info["sources"].keys())}
        }
        
        # JS / Service Worker
        if info["type"] in ("javascript", "service_worker"):
            sorted_info["functions"] = sorted(info.get("functions", []))
            sorted_info["assets"] = sorted(info.get("assets", []))
            sorted_info["html"] = sorted(info.get("html", []))
            
        # HTML
        elif info["type"] == "html":
            sorted_info["scripts"] = sorted(info.get("scripts", []))
            sorted_info["styles"] = sorted(info.get("styles", []))
            
        sorted_files[rel_path] = sorted_info

    # 7. Verification Tests
    # A. Coverage Test (網羅性テスト)
    actual_js_files = [f for f in all_scanned_files if f.endswith(".js")]
    actual_html_files = [f for f in all_scanned_files if f.endswith(".html")]
    
    indexed_js_files = [f for f, info in sorted_files.items() if info["type"] in ("javascript", "service_worker")]
    indexed_html_files = [f for f, info in sorted_files.items() if info["type"] == "html"]
    
    coverage_js = len(indexed_js_files) == len(actual_js_files)
    coverage_html = len(indexed_html_files) == len(actual_html_files)
    coverage_pass = coverage_js and coverage_html
    
    # B. Integrity Test (整合性テスト)
    # Execution Graph に登録されている関数の総数と、Index内の関数の総数が一致するか確認
    exec_func_names = set(exec_funcs.keys())
    indexed_func_names = set()
    for f, info in sorted_files.items():
        if "functions" in info:
            indexed_func_names.update(info["functions"])
            
    integrity_check = exec_func_names == indexed_func_names

    if dry_run:
        print("Repository Index\n")
        for file_path, info in sorted_files.items():
            print(file_path)
            print(f"Type: {info['type']}")
            sources_str = ", ".join(info["sources"].keys()) if info["sources"] else "none"
            print(f"Sources: {sources_str}")
            
            if "functions" in info and info["functions"]:
                print("Functions")
                for func in info["functions"]:
                    print(f"- {func}")
                    
            if "html" in info and info["html"]:
                print("Referenced by")
                for html in info["html"]:
                    print(f"- {html}")
                    
            if "scripts" in info and info["scripts"]:
                print("Scripts")
                for script in info["scripts"]:
                    print(f"- {script}")
                    
            if "styles" in info and info["styles"]:
                print("Styles")
                for style in info["styles"]:
                    print(f"- {style}")
            print()
    else:
        # 出力
        output_data = {
            "_meta": {
                "version": 1,
                "generated_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
                "scanner": "repository_index_builder"
            },
            "files": sorted_files
        }
        
        output_path = os.path.join(script_dir, "repository_index.json")
        try:
            with open(output_path, "w", encoding="utf-8") as f:
                json.dump(output_data, f, indent=2, ensure_ascii=False)
            print(f"Successfully generated repository index: {output_path}")
            
            # Coverage Test Output
            print("\nCoverage Test")
            print(f"JS: {len(indexed_js_files)}/{len(actual_js_files)}")
            print(f"HTML: {len(indexed_html_files)}/{len(actual_html_files)}")
            print("PASS" if coverage_pass else "FAIL")
            
            # Integrity Test Output
            print(f"\nIntegrity Check (Function Total Match): {integrity_check} (Exec: {len(exec_func_names)}, Index: {len(indexed_func_names)})")
        except Exception as e:
            print(f"Error writing repository index: {e}", file=sys.stderr)
            sys.exit(1)

if __name__ == "__main__":
    main()
