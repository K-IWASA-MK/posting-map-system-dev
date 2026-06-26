import os
import sys
import json
from datetime import datetime, timezone

def main():
    dry_run = "--dry-run" in sys.argv
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    root_dir = os.path.dirname(script_dir)
    
    exec_graph_path = os.path.join(script_dir, "execution_graph.json")
    if not os.path.exists(exec_graph_path):
        print(f"Error: execution_graph.json not found at {exec_graph_path}", file=sys.stderr)
        print("Please run tools/execution_graph_scanner.py first.", file=sys.stderr)
        sys.exit(1)
        
    try:
        with open(exec_graph_path, "r", encoding="utf-8") as f:
            exec_data = json.load(f)
    except Exception as e:
        print(f"Error reading execution_graph.json: {e}", file=sys.stderr)
        sys.exit(1)
        
    functions = exec_data.get("functions", {})
    
    # 逆引き（Caller Index）辞書の構築
    # すべての関数について、初期値として file 情報を引き継ぎ、called_by は空の set で初期化
    callers = {}
    for func_name, info in functions.items():
        callers[func_name] = {
            "file": info.get("file", ""),
            "called_by": set()
        }
        
    # 呼び出し関係を逆引きでマッピング
    for caller_name, info in functions.items():
        calls = info.get("calls", [])
        for callee_name in calls:
            if callee_name in callers:
                callers[callee_name]["called_by"].add(caller_name)
            else:
                # もし execution_graph.json の calls にあるが functions 自体には定義がない関数があれば
                # 念のため新規登録して逆引き関係を構築（外部ライブラリや定義なし関数など）
                callers[callee_name] = {
                    "file": "undefined/external",
                    "called_by": {caller_name}
                }
                
    # 決定論的な結果にするため、および json.dump 用に関数リストをソート
    sorted_callers = {}
    for func_name in sorted(callers.keys()):
        info = callers[func_name]
        sorted_callers[func_name] = {
            "file": info["file"],
            "called_by": sorted(list(info["called_by"]))
        }
        
    # Integrity Test (整合性テスト)
    exec_func_count = len(functions)
    index_func_count = len(sorted_callers)
    # 外部依存で undefined が追加された可能性を考慮し、純粋に functions 内のキー同士で確認
    # もしくは、単純に総数の一致を確認
    func_count_match = exec_func_count == index_func_count
    
    if dry_run:
        print("Call Graph Index\n")
        for func_name, info in sorted_callers.items():
            called_by = info["called_by"]
            if called_by:
                print(func_name)
                for c in called_by:
                    print("↑")
                    print(c)
                print()
    else:
        # メタデータの作成
        output_data = {
            "_meta": {
                "version": 1,
                "generated_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
                "scanner": "call_graph_index"
            },
            "callers": sorted_callers
        }
        
        output_path = os.path.join(script_dir, "call_graph_index.json")
        try:
            with open(output_path, "w", encoding="utf-8") as f:
                json.dump(output_data, f, indent=2, ensure_ascii=False)
            print(f"Successfully generated call graph index: {output_path}")
            print(f"Integrity Test (Function Count Match): {func_count_match} (Execution: {exec_func_count}, Index: {index_func_count})")
        except Exception as e:
            print(f"Error writing call graph index: {e}", file=sys.stderr)
            sys.exit(1)

if __name__ == "__main__":
    main()
