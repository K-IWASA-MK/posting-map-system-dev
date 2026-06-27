import os
import sys
import json
import argparse
from datetime import datetime, timezone

def load_runtime(runtime_path):
    if not os.path.exists(runtime_path):
        return []
    try:
        with open(runtime_path, "r", encoding="utf-8") as f:
            runtime_data = json.load(f)
        return runtime_data.get("runtime", [])
    except (json.JSONDecodeError, IOError):
        return []

def map_to_lifecycle(runtime_list):
    lifecycle_list = []
    
    for idx, r in enumerate(runtime_list, 1):
        run_status = r.get("status", "invalid")
        plugin_id = r.get("plugin", f"plugin:unknown_{idx}")
        runtime_id = r.get("id", f"runtime:unknown_{idx}")
        name = r.get("name", f"Unknown Plugin {idx}")
        
        # 1. state mapping
        if run_status == "ready":
            state = "ready"
            next_state = "idle"
            transition_allowed = True
        elif run_status == "disabled":
            state = "disabled"
            next_state = "disabled"
            transition_allowed = False
        else:
            state = "invalid"
            next_state = "invalid"
            transition_allowed = False
            
        lifecycle_id = f"lifecycle:{idx:04d}"
        
        # 2. trace mapping
        trace = {
            "registry": plugin_id,
            "runtime": runtime_id,
            "lifecycle": lifecycle_id
        }
        
        lifecycle_list.append({
            "id": lifecycle_id,
            "runtime": runtime_id,
            "plugin": plugin_id,
            "state": state,
            "previous_state": "loaded",
            "next_state": next_state,
            "transition_allowed": transition_allowed,
            "execution_allowed": False,
            "simulation_only": True,
            "health": "bad" if state == "invalid" else "good",
            "lifecycle_version": 1,
            "trace": trace,
            "_temp_name": name  # ソート用の一時的な名前保持
        })
        
    # 決定論的ソート (1. state, 2. plugin name, 3. id)
    lifecycle_list.sort(key=lambda x: (x.get("state", ""), x.get("_temp_name", ""), x.get("id", "")))
    
    # 一時的なソート用キーを削除
    for item in lifecycle_list:
        item.pop("_temp_name", None)
        
    return lifecycle_list

def main():
    parser = argparse.ArgumentParser(description="CIE Plugin Lifecycle Engine")
    parser.add_argument("--dry-run", action="store_true", help="Perform scanning dry-run without writing lifecycle registry")
    args = parser.parse_args()
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    runtime_path = os.path.join(script_dir, "plugins", "runtime.json")
    
    # runtime.json をロード
    runtime = load_runtime(runtime_path)
    
    # Lifecycle Object に変換
    lifecycle = map_to_lifecycle(runtime)
    
    # カウント集計
    lifecycle_count = len(lifecycle)
    ready_count = sum(1 for l in lifecycle if l["state"] == "ready")
    idle_count = sum(1 for l in lifecycle if l["state"] == "idle")
    disabled_count = sum(1 for l in lifecycle if l["state"] == "disabled")
    invalid_count = sum(1 for l in lifecycle if l["state"] == "invalid")
    
    if args.dry_run:
        print("Plugin Lifecycle")
        # 元の plugin name を見つけるため、runtime 情報からマップを作成
        runtime_name_map = {r.get("id", ""): r.get("name", "") for r in runtime}
        for l in lifecycle:
            p_name = runtime_name_map.get(l["runtime"], l["plugin"])
            print(p_name)
            print(l["state"].upper())
            print("↓")
            print(l["next_state"].upper())
            print("Execution")
            print("DISABLED")
            print("-" * 10)
        sys.exit(0)
        
    # lifecycle.json 生成
    lifecycle_path = os.path.join(script_dir, "plugins", "lifecycle.json")
    now_utc = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
    
    lifecycle_registry = {
        "_meta": {
            "version": 1,
            "generated_at": now_utc,
            "scanner": "plugin_lifecycle",
            "lifecycle_count": lifecycle_count,
            "ready_count": ready_count,
            "idle_count": idle_count,
            "disabled_count": disabled_count,
            "invalid_count": invalid_count
        },
        "lifecycle": lifecycle
    }
    
    try:
        with open(lifecycle_path, "w", encoding="utf-8") as f:
            json.dump(lifecycle_registry, f, indent=2, ensure_ascii=False)
        print("Plugin Lifecycle Registry successfully written to lifecycle.json")
        sys.exit(0)
    except IOError as e:
        print(f"Error writing lifecycle registry: {e}", file=sys.stderr)
        sys.exit(3)

if __name__ == "__main__":
    main()
