import os
import sys
import json
from datetime import datetime, timezone

def main():
    dry_run = "--dry-run" in sys.argv
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # 既存成果物のロード
    kg_path = os.path.join(script_dir, "knowledge_graph.json")
    semantic_path = os.path.join(script_dir, "semantic_layer.json")
    
    if not os.path.exists(kg_path) or not os.path.exists(semantic_path):
        print("Error: knowledge_graph.json or semantic_layer.json not found.", file=sys.stderr)
        print("Please build them first.", file=sys.stderr)
        sys.exit(1)
        
    try:
        with open(kg_path, "r", encoding="utf-8") as f:
            kg_data = json.load(f)
            kg_funcs = kg_data.get("functions", {})
        with open(semantic_path, "r", encoding="utf-8") as f:
            semantic_data = json.load(f)
            semantic_funcs = semantic_data.get("functions", {})
    except Exception as e:
        print(f"Error reading JSON inputs: {e}", file=sys.stderr)
        sys.exit(1)
        
    routes = {}
    
    # Navigation 関数の抽出とマッピング
    for func_name, sem_info in semantic_funcs.items():
        if sem_info.get("category") == "Navigation":
            # knowledge_graph.json から該当する関数の詳細関係を取得
            kg_info = kg_funcs.get(func_name, {})
            called_by = kg_info.get("called_by", [])
            calls = kg_info.get("calls", [])
            file_path = kg_info.get("file", "")
            html = kg_info.get("html", [])
            
            entry_point = len(called_by) == 0
            
            routes[func_name] = {
                "id": f"route:{func_name}",
                "function": f"func:{func_name}",
                "file": file_path,
                "category": "Navigation",
                "route_type": "screen_transition",
                "entry_point": entry_point,
                "calls": sorted(list(calls)),
                "called_by": sorted(list(called_by)),
                "html": sorted(list(html)),
                "future": {
                    "runtime": [],
                    "events": [],
                    "user_flow": [],
                    "state": []
                }
            }
            
    # 決定論的な結果にするため、キーをアルファベット順にソートした辞書を作成
    sorted_routes = {k: routes[k] for k in sorted(routes.keys())}
    
    # Verification (Coverage & Integrity Test)
    # 1. Route Coverage Test (画面遷移網羅性テスト)
    nav_functions_in_semantic = [f for f, info in semantic_funcs.items() if info.get("category") == "Navigation"]
    nav_count = len(nav_functions_in_semantic)
    route_count = len(sorted_routes)
    coverage_pass = nav_count == route_count
    
    # 2. Route Distribution Test (分布検証テスト)
    entry_points_count = len([f for f, info in sorted_routes.items() if info["entry_point"]])
    
    # 3. Integrity Test (整合性テスト)
    integrity_pass = True
    for r_name, r_info in sorted_routes.items():
        kg_info = kg_funcs.get(r_name, {})
        if (sorted(kg_info.get("calls", [])) != r_info["calls"] or
            sorted(kg_info.get("called_by", [])) != r_info["called_by"] or
            sorted(kg_info.get("html", [])) != r_info["html"] or
            kg_info.get("file", "") != r_info["file"]):
            integrity_pass = False
            break

    if dry_run:
        print("Route Graph\n")
        for route_name, info in sorted_routes.items():
            print(f"Route\n{route_name}\n")
            print("↓\nFile")
            print(info["file"])
            print()
            
            if info["called_by"]:
                print("↓\nCalled By")
                for c in info["called_by"]:
                    print(c)
                print()
                
            if info["calls"]:
                print("↓\nCalls")
                for c in info["calls"]:
                    print(c)
                print()
                
            if info["html"]:
                print("↓\nHTML")
                for h in info["html"]:
                    print(h)
                print()
            print("---")
    else:
        # JSON 出力
        output_data = {
            "_meta": {
                "version": 1,
                "generated_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
                "scanner": "route_graph_builder"
            },
            "routes": sorted_routes
        }
        
        output_path = os.path.join(script_dir, "route_graph.json")
        try:
            with open(output_path, "w", encoding="utf-8") as f:
                json.dump(output_data, f, indent=2, ensure_ascii=False)
            print(f"Successfully generated route graph: {output_path}")
            
            # Route Distribution Test
            print("Route Distribution Test\n")
            print(f"Navigation Functions : {nav_count}\n")
            print(f"Route Nodes : {route_count}\n")
            print(f"Entry Points : {entry_points_count}\n")
            print("PASS" if coverage_pass else "FAIL")
            
            # Route Coverage Test
            print("Route Coverage Test\n")
            print("Semantic Layer\n")
            print("↓\n")
            print("Navigation\n")
            print(f"{nav_count}\n")
            print("↓\n")
            print("Route Graph\n")
            print(f"{route_count}\n")
            print("PASS" if coverage_pass else "FAIL")
            
            # Integrity Test
            print(f"\nIntegrity Check: {'PASS' if integrity_pass else 'FAIL'}")
        except Exception as e:
            print(f"Error writing route graph: {e}", file=sys.stderr)
            sys.exit(1)

if __name__ == "__main__":
    main()
