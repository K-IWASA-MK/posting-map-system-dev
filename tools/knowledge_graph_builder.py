import os
import sys
import json
from datetime import datetime, timezone

def main():
    dry_run = "--dry-run" in sys.argv
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # 既存の静的解析成果物のパス
    asset_graph_path = os.path.join(script_dir, "asset_graph.json")
    exec_graph_path = os.path.join(script_dir, "execution_graph.json")
    call_graph_path = os.path.join(script_dir, "call_graph_index.json")
    repo_index_path = os.path.join(script_dir, "repository_index.json")
    
    # 存在確認と読み込み
    required_paths = {
        "asset_graph": asset_graph_path,
        "execution_graph": exec_graph_path,
        "call_graph": call_graph_path,
        "repository_index": repo_index_path
    }
    
    loaded_data = {}
    for key, path in required_paths.items():
        if not os.path.exists(path):
            print(f"Error: {key}.json not found at {path}", file=sys.stderr)
            print(f"Please run the corresponding builder first.", file=sys.stderr)
            sys.exit(1)
        try:
            with open(path, "r", encoding="utf-8") as f:
                loaded_data[key] = json.load(f)
        except Exception as e:
            print(f"Error reading {key}.json: {e}", file=sys.stderr)
            sys.exit(1)
            
    # データ参照のショートカット
    asset_graph = loaded_data["asset_graph"]
    exec_funcs = loaded_data["execution_graph"].get("functions", {})
    callers = loaded_data["call_graph"].get("callers", {})
    repo_files = loaded_data["repository_index"].get("files", {})
    
    knowledge_funcs = {}
    
    # Execution Graph の全関数をベースとして Knowledge Graph を構築
    for func_name, info in exec_funcs.items():
        file_path = info.get("file", "")
        calls = info.get("calls", [])
        
        # Call Graph から called_by を取得
        called_by = callers.get(func_name, {}).get("called_by", [])
        
        # Repository Index から html / assets 情報の取得
        html = repo_files.get(file_path, {}).get("html", [])
        assets = repo_files.get(file_path, {}).get("assets", [])
        
        knowledge_funcs[func_name] = {
            "id": f"func:{func_name}",
            "file": file_path,
            "calls": sorted(list(calls)),
            "called_by": sorted(list(called_by)),
            "html": sorted(list(html)),
            "assets": sorted(list(assets)),
            "relations": {
                "calls": True,
                "called_by": True,
                "repository": True,
                "asset": True
            },
            "future": {
                "route": [],
                "data_flow": [],
                "state": [],
                "analysis": {}
            }
        }
        
    # 結果の決定論的ソート（キーをアルファベット順にソート）
    sorted_functions = {k: knowledge_funcs[k] for k in sorted(knowledge_funcs.keys())}
    
    # Verification (Knowledge Coverage Test)
    # 1. Execution Graph ➔ Knowledge Graph
    exec_count = len(exec_funcs)
    kg_exec_count = len(sorted_functions)
    exec_match = exec_count == kg_exec_count
    
    # 2. Call Graph ➔ Knowledge Graph
    call_count = len(callers)
    # callersの中には外部ライブラリなどの未定義関数が含まれている可能性があるため、KGのキーに含まれているものと比較
    kg_call_count = len([f for f in callers if f in sorted_functions])
    # 整合チェック: callersでfileが登録されている関数はすべてKGに含まれているべき
    call_match = True
    for c_name, c_info in callers.items():
        if "file" in c_info and c_info["file"] != "undefined/external":
            if c_name not in sorted_functions:
                call_match = False
                break
                
    # 3. Repository Index ➔ Knowledge Graph
    # 各関数の file パスが repository_index 内の functions と一致しているかをチェック
    repo_match = True
    for func_name, info in sorted_functions.items():
        file_path = info["file"]
        if file_path in repo_files:
            if func_name not in repo_files[file_path].get("functions", []):
                repo_match = False
                break
        else:
            repo_match = False
            break
            
    # 4. Asset Graph ➔ Knowledge Graph
    # 関数の HTML 参照関係が asset_graph の JS ⇄ HTML 参照関係と論理的に整合しているか確認
    asset_match = True
    for func_name, info in sorted_functions.items():
        file_path = info["file"]
        html_list = info["html"]
        # HTML 参照リスト内の各 HTML が、asset_graph にて file_path（の末尾）を参照しているか
        file_name = os.path.basename(file_path)
        if file_name in asset_graph:
            referred_htmls = asset_graph[file_name]
            for h in html_list:
                if h not in referred_htmls:
                    asset_match = False
                    break
        if not asset_match:
            break
            
    coverage_pass = exec_match and call_match and repo_match and asset_match
    
    if dry_run:
        print("Knowledge Graph\n")
        for func_name, info in sorted_functions.items():
            print(f"Function\n{func_name}\n")
            print("File\n↓")
            print(info["file"])
            print()
            
            if info["called_by"]:
                print("Called By\n↓")
                for c in info["called_by"]:
                    print(c)
                print()
                
            if info["calls"]:
                print("Calls\n↓")
                for c in info["calls"]:
                    print(c)
                print()
                
            if info["html"]:
                print("Referenced HTML\n↓")
                for h in info["html"]:
                    print(h)
                print()
                
            if info["assets"]:
                print("Assets\n↓")
                for a in info["assets"]:
                    print(a)
                print()
            print("---")
    else:
        # 出力データの構築
        output_data = {
            "_meta": {
                "version": 1,
                "generated_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
                "scanner": "knowledge_graph_builder"
            },
            "functions": sorted_functions
        }
        
        output_path = os.path.join(script_dir, "knowledge_graph.json")
        try:
            with open(output_path, "w", encoding="utf-8") as f:
                json.dump(output_data, f, indent=2, ensure_ascii=False)
            print(f"Successfully generated knowledge graph: {output_path}")
            
            # Coverage Test の結果表示
            print("\nKnowledge Coverage Test")
            print(f"Execution Graph   ➔  Knowledge Graph: {kg_exec_count} / {exec_count} ({'PASS' if exec_match else 'FAIL'})")
            print(f"Call Graph        ➔  Knowledge Graph: {kg_call_count} / {call_count} ({'PASS' if call_match else 'FAIL'})")
            print(f"Repository Index  ➔  Knowledge Graph: {'PASS' if repo_match else 'FAIL'}")
            print(f"Asset Graph       ➔  Knowledge Graph: {'PASS' if asset_match else 'FAIL'}")
            print(f"\nKnowledge Coverage: {'PASS' if coverage_pass else 'FAIL'}")
        except Exception as e:
            print(f"Error writing knowledge graph: {e}", file=sys.stderr)
            sys.exit(1)

if __name__ == "__main__":
    main()
