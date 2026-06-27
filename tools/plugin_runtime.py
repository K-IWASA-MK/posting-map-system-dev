import os
import sys
import json
import argparse
from datetime import datetime, timezone

def load_registry(registry_path):
    if not os.path.exists(registry_path):
        return []
    try:
        with open(registry_path, "r", encoding="utf-8") as f:
            registry_data = json.load(f)
        return registry_data.get("plugins", [])
    except (json.JSONDecodeError, IOError):
        return []

def map_to_runtime(plugins):
    runtime_list = []
    
    for idx, p in enumerate(plugins, 1):
        orig_status = p.get("status", "invalid")
        
        # 1. status mapping
        if orig_status == "loaded":
            status = "ready"
        elif orig_status == "disabled":
            status = "disabled"
        else:
            status = "invalid"
            
        # 2. lifecycle mapping (always loaded in Phase 26)
        lifecycle = "loaded"
        
        # 3. health mapping
        health = "bad" if status == "invalid" else "good"
        
        # 4. enabled mapping
        enabled = p.get("enabled", False)
        
        runtime_list.append({
            "id": f"runtime:{idx:04d}",
            "plugin": p.get("id", f"plugin:unknown_{idx}"),
            "name": p.get("name", f"Unknown Plugin {idx}"),
            "type": p.get("type", "unknown"),
            "runtime_version": 1,
            "status": status,
            "loaded": True,
            "enabled": enabled,
            "execution_allowed": False,
            "runtime_only": True,
            "lifecycle": lifecycle,
            "health": health
        })
        
    # 決定論的ソート (1. status, 2. name, 3. id)
    runtime_list.sort(key=lambda x: (x.get("status", ""), x.get("name", ""), x.get("id", "")))
    return runtime_list

def main():
    parser = argparse.ArgumentParser(description="CIE Plugin Runtime Engine")
    parser.add_argument("--dry-run", action="store_true", help="Perform scanning dry-run without writing runtime registry")
    args = parser.parse_args()
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    registry_path = os.path.join(script_dir, "plugins", "registry.json")
    
    # 唯一のインプットとして registry.json をロード
    plugins = load_registry(registry_path)
    
    # Runtime Object に変換
    runtime = map_to_runtime(plugins)
    
    # カウント集計
    runtime_count = len(runtime)
    ready_count = sum(1 for r in runtime if r["status"] == "ready")
    disabled_count = sum(1 for r in runtime if r["status"] == "disabled")
    invalid_count = sum(1 for r in runtime if r["status"] == "invalid")
    
    if args.dry_run:
        print("Plugin Runtime")
        for r in runtime:
            print(r["name"])
            print(r["status"].upper())
            print(r["type"].capitalize())
            print("Execution")
            print("DISABLED")
            print("-" * 10)
        sys.exit(0)
        
    # runtime.json 生成
    runtime_path = os.path.join(script_dir, "plugins", "runtime.json")
    now_utc = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
    
    runtime_registry = {
        "_meta": {
            "version": 1,
            "generated_at": now_utc,
            "scanner": "plugin_runtime",
            "runtime_count": runtime_count,
            "ready_count": ready_count,
            "disabled_count": disabled_count,
            "invalid_count": invalid_count
        },
        "runtime": runtime
    }
    
    try:
        with open(runtime_path, "w", encoding="utf-8") as f:
            json.dump(runtime_registry, f, indent=2, ensure_ascii=False)
        print("Plugin Runtime Registry successfully written to runtime.json")
        sys.exit(0)
    except IOError as e:
        print(f"Error writing runtime registry: {e}", file=sys.stderr)
        sys.exit(3)

if __name__ == "__main__":
    main()
