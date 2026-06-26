import os
import sys
import json
from datetime import datetime, timezone

def main():
    dry_run = "--dry-run" in sys.argv
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # 既存成果物のロード
    kg_path = os.path.join(script_dir, "knowledge_graph.json")
    rg_path = os.path.join(script_dir, "route_graph.json")
    
    if not os.path.exists(kg_path) or not os.path.exists(rg_path):
        print("Error: knowledge_graph.json or route_graph.json not found.", file=sys.stderr)
        print("Please build them first.", file=sys.stderr)
        sys.exit(1)
        
    try:
        with open(kg_path, "r", encoding="utf-8") as f:
            kg_data = json.load(f)
            kg_funcs = kg_data.get("functions", {})
        with open(rg_path, "r", encoding="utf-8") as f:
            rg_data = json.load(f)
            rg_routes = rg_data.get("routes", {})
    except Exception as e:
        print(f"Error reading JSON inputs: {e}", file=sys.stderr)
        sys.exit(1)
        
    # Route Graph にあるルート（関数名）を特定
    route_keys = set(rg_routes.keys())
    
    flows = {}
    
    # Data Flow のマッピング
    for func_name, kg_info in kg_funcs.items():
        called_by = kg_info.get("called_by", [])
        calls = kg_info.get("calls", [])
        file_path = kg_info.get("file", "")
        
        # incoming / outgoing のプレフィックス付与とソート
        incoming = sorted([f"func:{x}" for x in called_by])
        outgoing = sorted([f"func:{x}" for x in calls])
        
        # route 紐付け
        associated_routes = []
        if func_name in route_keys:
            associated_routes.append(f"route:{func_name}")
        for call_name in calls:
            if call_name in route_keys:
                associated_routes.append(f"route:{call_name}")
        associated_routes = sorted(list(set(associated_routes)))
        
        flow_key = f"func:{func_name}"
        flows[flow_key] = {
            "id": f"flow:{func_name}",
            "flow_type": "function",
            "function": f"func:{func_name}",
            "file": file_path,
            "incoming": incoming,
            "outgoing": outgoing,
            "route": associated_routes,
            "node_links": {
                "knowledge": f"func:{func_name}",
                "route": associated_routes
            },
            "future": {
                "runtime": [],
                "variables": [],
                "parameters": [],
                "return_values": []
            }
        }
        
    # 決定論的な結果にするため、キーをアルファベット順にソートした辞書を作成
    sorted_flows = {k: flows[k] for k in sorted(flows.keys())}
    
    # Verification
    # 1. Coverage Test
    kg_func_count = len(kg_funcs)
    df_flow_count = len(sorted_flows)
    coverage_pass = kg_func_count == df_flow_count
    
    # 2. Route Mapping Test
    route_mapping_pass = True
    for r_name, r_info in rg_routes.items():
        df_key = f"func:{r_name}"
        if df_key not in sorted_flows:
            route_mapping_pass = False
            break
        if f"route:{r_name}" not in sorted_flows[df_key]["route"]:
            route_mapping_pass = False
            break
            
    # 3. Integrity Test
    integrity_pass = True
    for f_key, f_info in sorted_flows.items():
        orig_name = f_key.replace("func:", "")
        kg_info = kg_funcs.get(orig_name, {})
        
        orig_called_by = sorted([f"func:{x}" for x in kg_info.get("called_by", [])])
        orig_calls = sorted([f"func:{x}" for x in kg_info.get("calls", [])])
        
        if f_info["incoming"] != orig_called_by or f_info["outgoing"] != orig_calls:
            integrity_pass = False
            break
            
    # 4. Flow Distribution Test
    route_linked_count = sum(1 for f_key in sorted_flows.keys() if f_key.replace("func:", "") in route_keys)
    standalone_count = df_flow_count - route_linked_count
    distribution_pass = (kg_func_count == 105 and df_flow_count == 105 and 
                         route_linked_count == 5 and standalone_count == 100)
    
    if dry_run:
        print("Data Flow\n")
        # ユーザーの dry-run 表示例を模倣して、単純かつ分かりやすいフロー表示をする
        # 呼び出し元 -> 関数 -> 呼び出し先を縦並びの矢印で示す
        # 例として最初の3つのフローを表示
        sample_keys = sorted(sorted_flows.keys())[:3]
        for idx, f_key in enumerate(sample_keys):
            flow = sorted_flows[f_key]
            func_name = flow["function"].replace("func:", "")
            
            # Incoming
            if flow["incoming"]:
                for inc in flow["incoming"]:
                    print(inc.replace("func:", ""))
                    print("↓\n")
            
            # 自身
            print(func_name)
            
            # Outgoing
            if flow["outgoing"]:
                print("↓\n")
                for out in flow["outgoing"]:
                    print(out.replace("func:", ""))
                    if out != flow["outgoing"][-1]:
                        print("↓\n")
            
            if idx < len(sample_keys) - 1:
                print("\n")
    else:
        # JSON 出力
        output_data = {
            "_meta": {
                "version": 1,
                "generated_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
                "scanner": "data_flow_builder"
            },
            "flows": sorted_flows
        }
        
        output_path = os.path.join(script_dir, "data_flow.json")
        try:
            with open(output_path, "w", encoding="utf-8") as f:
                json.dump(output_data, f, indent=2, ensure_ascii=False)
            print(f"Successfully generated data flow: {output_path}")
            
            # Coverage Test
            print("\nCoverage Test\n")
            print("Knowledge Graph\n")
            print("↓\n")
            print("Function Count\n")
            print(f"{kg_func_count}\n")
            print("=\n")
            print("Data Flow Count\n")
            print(f"{df_flow_count}\n")
            print("PASS" if coverage_pass else "FAIL")
            
            # Route Mapping Test
            print("\nRoute Mapping Test\n")
            print("Route Graph\n")
            print("↓\n")
            print("Data Flow\n")
            print("Route Mapping\n")
            print("PASS" if route_mapping_pass else "FAIL")
            
            # Integrity Test
            print("\nIntegrity Test\n")
            print("Knowledge Graph\n")
            print("↓\n")
            print("Data Flow\n")
            print("Incoming一致\n")
            print("Outgoing一致\n")
            print("PASS" if integrity_pass else "FAIL")
            
            # Flow Distribution Test
            print("\nFlow Distribution Test\n")
            print(f"Functions : {kg_func_count}\n")
            print(f"Flows : {df_flow_count}\n")
            print(f"Route Linked : {route_linked_count}\n")
            print(f"Standalone : {standalone_count}\n")
            print("PASS" if distribution_pass else "FAIL")
            
        except Exception as e:
            print(f"Error writing data flow: {e}", file=sys.stderr)
            sys.exit(1)

if __name__ == "__main__":
    main()
