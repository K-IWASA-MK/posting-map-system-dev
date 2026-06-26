import os
import sys
import json
from datetime import datetime, timezone

# 意味分類のキーワードルール定義 (優先順位順)
RULES = [
    ("Initialization", ["init", "start", "boot", "setup"]),
    ("Navigation", ["switch", "navigate", "page", "screen"]),
    ("Rendering", ["render", "draw", "updateview", "refresh", "view"]),
    ("Storage", ["save", "load", "storage", "cache", "db"]),
    ("Authentication", ["login", "logout", "auth", "token", "session"]),
    ("Synchronization", ["sync", "queue", "offline", "online"]),
    ("Configuration", ["config", "setting", "option"]),
    ("Utility", ["util", "format", "helper", "log"])
]

def classify_function(func_name):
    name_lower = func_name.lower()
    for category, keywords in RULES:
        for kw in keywords:
            if kw in name_lower:
                return category, kw
    return "Unknown", None

def main():
    dry_run = "--dry-run" in sys.argv
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    kg_path = os.path.join(script_dir, "knowledge_graph.json")
    
    if not os.path.exists(kg_path):
        print(f"Error: knowledge_graph.json not found at {kg_path}", file=sys.stderr)
        print("Please run tools/knowledge_graph_builder.py first.", file=sys.stderr)
        sys.exit(1)
        
    try:
        with open(kg_path, "r", encoding="utf-8") as f:
            kg_data = json.load(f)
    except Exception as e:
        print(f"Error reading knowledge_graph.json: {e}", file=sys.stderr)
        sys.exit(1)
        
    functions = kg_data.get("functions", {})
    semantic_funcs = {}
    
    # カテゴリの集計用辞書
    distribution = {cat: 0 for cat, _ in RULES}
    distribution["Unknown"] = 0
    
    for func_name in sorted(functions.keys()):
        category, matched_rule = classify_function(func_name)
        semantic_funcs[func_name] = {
            "id": f"func:{func_name}",
            "category": category,
            "confidence": 1.0,
            "matched_rule": matched_rule
        }
        # 集計
        distribution[category] += 1
        
    # Verification (Coverage Test)
    kg_func_count = len(functions)
    semantic_func_count = len(semantic_funcs)
    coverage_pass = kg_func_count == semantic_func_count
    
    if dry_run:
        print("Semantic Layer\n")
        for func_name in sorted(semantic_funcs.keys()):
            info = semantic_funcs[func_name]
            rule_str = f"Rule: {info['matched_rule']}" if info['matched_rule'] else "Rule: none"
            print(func_name)
            print("↓")
            print(f"{info['category']} ({rule_str}, Confidence: {info['confidence']})")
            print()
    else:
        # JSON 出力
        output_data = {
            "_meta": {
                "version": 1,
                "generated_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
                "scanner": "semantic_layer_builder"
            },
            "functions": semantic_funcs
        }
        
        output_path = os.path.join(script_dir, "semantic_layer.json")
        try:
            with open(output_path, "w", encoding="utf-8") as f:
                json.dump(output_data, f, indent=2, ensure_ascii=False)
            print(f"Successfully generated semantic layer: {output_path}")
            
            # Coverage Test Output
            print("\nCoverage Test")
            print(f"Function Count Match: {'PASS' if coverage_pass else 'FAIL'} (Knowledge: {kg_func_count}, Semantic: {semantic_func_count})")
            
            # Category Distribution Test Output
            print("\nCategory Distribution\n")
            for cat, count in distribution.items():
                print(f"{cat} : {count}")
            print(f"\nFunction Total : {semantic_func_count}")
            print("PASS" if coverage_pass else "FAIL")
        except Exception as e:
            print(f"Error writing semantic layer: {e}", file=sys.stderr)
            sys.exit(1)

if __name__ == "__main__":
    main()
