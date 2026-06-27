import os
import sys
import json
import argparse
from datetime import datetime, timezone

def load_lifecycle(lifecycle_path):
    if not os.path.exists(lifecycle_path):
        return []
    try:
        with open(lifecycle_path, "r", encoding="utf-8") as f:
            lifecycle_data = json.load(f)
        return lifecycle_data.get("lifecycle", [])
    except (json.JSONDecodeError, IOError):
        return []

def map_to_dependency(lifecycle_list):
    dependency_list = []
    
    # 決定論的ソートのために名前をIDから成形
    # 例: "plugin:example" -> "Example Plugin"
    def format_plugin_name(plugin_id):
        name_part = plugin_id.split(":")[-1]
        return name_part.replace("_", " ").title() + " Plugin"
        
    resolved_idx = 1
    
    for idx, l in enumerate(lifecycle_list, 1):
        life_state = l.get("state", "invalid")
        plugin_id = l.get("plugin", f"plugin:unknown_{idx}")
        runtime_id = l.get("runtime", f"runtime:unknown_{idx}")
        lifecycle_id = l.get("id", f"lifecycle:unknown_{idx}")
        
        # 1. status and health mapping
        if life_state == "ready":
            status = "resolved"
            health = "good"
            load_order = resolved_idx
            resolved_idx += 1
        elif life_state == "disabled":
            status = "disabled"
            health = "warning"
            load_order = 0
        else:
            status = "invalid"
            health = "bad"
            load_order = 0
            
        dependency_id = f"dependency:{idx:04d}"
        
        # 2. trace mapping
        trace = {
            "registry": plugin_id,
            "runtime": runtime_id,
            "lifecycle": lifecycle_id,
            "dependency": dependency_id
        }
        
        # Trace 一致検証
        # registry, runtime, lifecycle の各IDが上位レイヤーと完全一致・追従していることを確認
        assert l.get("trace", {}).get("registry") == plugin_id, "Registry ID trace mismatch"
        assert l.get("trace", {}).get("runtime") == runtime_id, "Runtime ID trace mismatch"
        assert l.get("trace", {}).get("lifecycle") == lifecycle_id, "Lifecycle ID trace mismatch"
        
        plugin_name = format_plugin_name(plugin_id)
        
        dependency_list.append({
            "id": dependency_id,
            "plugin": plugin_id,
            "runtime": runtime_id,
            "lifecycle": lifecycle_id,
            "requires": [],
            "optional": [],
            "status": status,
            "load_order": load_order,
            "circular": False,
            "simulation_only": True,
            "dependency_version": 1,
            "health": health,
            "trace": trace,
            "_temp_name": plugin_name  # ソート用
        })
        
    # 決定論的ソート (1. status, 2. plugin name, 3. id)
    dependency_list.sort(key=lambda x: (x.get("status", ""), x.get("_temp_name", ""), x.get("id", "")))
    
    # 一時的なソート用キーを削除
    for item in dependency_list:
        item.pop("_temp_name", None)
        
    return dependency_list

def main():
    parser = argparse.ArgumentParser(description="CIE Plugin Dependency Engine")
    parser.add_argument("--dry-run", action="store_true", help="Perform scanning dry-run without writing dependency registry")
    args = parser.parse_args()
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    lifecycle_path = os.path.join(script_dir, "plugins", "lifecycle.json")
    
    # lifecycle.json をロード
    lifecycle = load_lifecycle(lifecycle_path)
    
    # Dependency Object に変換 (Trace Test も内包)
    try:
        dependency = map_to_dependency(lifecycle)
    except AssertionError as e:
        print(f"Trace Verification Failed: {e}", file=sys.stderr)
        sys.exit(3)
    
    # カウント集計
    dependency_count = len(dependency)
    resolved_count = sum(1 for d in dependency if d["status"] == "resolved")
    disabled_count = sum(1 for d in dependency if d["status"] == "disabled")
    invalid_count = sum(1 for d in dependency if d["status"] == "invalid")
    circular_count = sum(1 for d in dependency if d["circular"])
    
    if args.dry_run:
        print("Plugin Dependency")
        for d in dependency:
            name_part = d["plugin"].split(":")[-1]
            p_name = name_part.replace("_", " ").title() + " Plugin"
            print(p_name)
            print("Status")
            print(d["status"].upper())
            print("Load Order")
            print(d["load_order"])
            print("Circular")
            print("YES" if d["circular"] else "NO")
            print("-" * 10)
        sys.exit(0)
        
    # dependency.json 生成
    dependency_path = os.path.join(script_dir, "plugins", "dependency.json")
    now_utc = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
    
    dependency_registry = {
        "_meta": {
            "version": 1,
            "generated_at": now_utc,
            "scanner": "plugin_dependency",
            "dependency_count": dependency_count,
            "resolved_count": resolved_count,
            "disabled_count": disabled_count,
            "invalid_count": invalid_count,
            "circular_count": circular_count
        },
        "dependencies": dependency
    }
    
    try:
        with open(dependency_path, "w", encoding="utf-8") as f:
            json.dump(dependency_registry, f, indent=2, ensure_ascii=False)
        print("Plugin Dependency Registry successfully written to dependency.json")
        sys.exit(0)
    except IOError as e:
        print(f"Error writing dependency registry: {e}", file=sys.stderr)
        sys.exit(3)

if __name__ == "__main__":
    main()
