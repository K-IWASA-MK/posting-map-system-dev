import os
import sys
import json
import argparse
from datetime import datetime, timezone

def load_dependency(dependency_path):
    if not os.path.exists(dependency_path):
        return []
    try:
        with open(dependency_path, "r", encoding="utf-8") as f:
            dep_data = json.load(f)
        return dep_data.get("dependencies", [])
    except (json.JSONDecodeError, IOError):
        return []

def map_to_scheduler(dependency_list):
    scheduler_list = []
    
    # 決定論的ソート用の名前成形関数
    def format_plugin_name(plugin_id):
        name_part = plugin_id.split(":")[-1]
        return name_part.replace("_", " ").title() + " Plugin"
        
    ready_idx = 1
    
    for idx, d in enumerate(dependency_list, 1):
        dep_status = d.get("status", "invalid")
        plugin_id = d.get("plugin", f"plugin:unknown_{idx}")
        runtime_id = d.get("runtime", f"runtime:unknown_{idx}")
        lifecycle_id = d.get("lifecycle", f"lifecycle:unknown_{idx}")
        dependency_id = d.get("id", f"dependency:unknown_{idx}")
        
        # 1. 状態変換ルール
        if dep_status == "resolved":
            status = "ready"
            blocked = False
            queue_order = ready_idx
            ready_idx += 1
            health = "good"
        elif dep_status == "disabled":
            status = "disabled"
            blocked = True
            queue_order = 0
            health = "warning"
        else:
            status = "invalid"
            blocked = True
            queue_order = 0
            health = "bad"
            
        scheduler_id = f"scheduler:{idx:04d}"
        
        # 2. trace mapping & validation
        trace = {
            "registry": plugin_id,
            "runtime": runtime_id,
            "lifecycle": lifecycle_id,
            "dependency": dependency_id,
            "scheduler": scheduler_id
        }
        
        # Trace 一致検証 (アサーション)
        # registry, runtime, lifecycle, dependency の各IDが上位レイヤーと完全一致していることを確認
        assert d.get("trace", {}).get("registry") == plugin_id, "Registry ID trace mismatch"
        assert d.get("trace", {}).get("runtime") == runtime_id, "Runtime ID trace mismatch"
        assert d.get("trace", {}).get("lifecycle") == lifecycle_id, "Lifecycle ID trace mismatch"
        assert d.get("trace", {}).get("dependency") == dependency_id, "Dependency ID trace mismatch"
        
        plugin_name = format_plugin_name(plugin_id)
        
        scheduler_list.append({
            "id": scheduler_id,
            "plugin": plugin_id,
            "runtime": runtime_id,
            "lifecycle": lifecycle_id,
            "dependency": dependency_id,
            "queue_order": queue_order,
            "priority": "normal",
            "execution_group": 1,
            "status": status,
            "blocked": blocked,
            "execution_allowed": False,
            "simulation_only": True,
            "scheduler_version": 1,
            "health": health,
            "trace": trace,
            "_temp_load_order": d.get("load_order", 0),  # ソート用
            "_temp_name": plugin_name                    # ソート用
        })
        
    # 決定論的ソート (1. status, 2. load_order, 3. plugin name, 4. id)
    scheduler_list.sort(key=lambda x: (x.get("status", ""), x.get("_temp_load_order", 0), x.get("_temp_name", ""), x.get("id", "")))
    
    # 一時的なソート用キーを削除
    for item in scheduler_list:
        item.pop("_temp_load_order", None)
        item.pop("_temp_name", None)
        
    return scheduler_list

def main():
    parser = argparse.ArgumentParser(description="CIE Plugin Scheduler Engine")
    parser.add_argument("--dry-run", action="store_true", help="Perform scheduling dry-run without writing registry")
    args = parser.parse_args()
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    dependency_path = os.path.join(script_dir, "plugins", "dependency.json")
    
    # dependency.json をロード
    dependencies = load_dependency(dependency_path)
    
    # Scheduler Object に変換 (Trace Test も内包)
    try:
        scheduler = map_to_scheduler(dependencies)
    except AssertionError as e:
        print(f"Trace Verification Failed: {e}", file=sys.stderr)
        sys.exit(3)
        
    # カウント集計
    scheduler_count = len(scheduler)
    ready_count = sum(1 for s in scheduler if s["status"] == "ready")
    blocked_count = sum(1 for s in scheduler if s["blocked"])
    invalid_count = sum(1 for s in scheduler if s["status"] == "invalid")
    
    if args.dry_run:
        print("Plugin Scheduler")
        for s in scheduler:
            name_part = s["plugin"].split(":")[-1]
            p_name = name_part.replace("_", " ").title() + " Plugin"
            print(p_name)
            print(s["status"].upper())
            print("Queue")
            print(s["queue_order"])
            print("Priority")
            print(s["priority"].upper())
            print("Execution")
            print("ALLOWED" if s["execution_allowed"] else "DISABLED")
            print("-" * 10)
        sys.exit(0)
        
    # scheduler.json 生成
    scheduler_path = os.path.join(script_dir, "plugins", "scheduler.json")
    now_utc = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
    
    scheduler_registry = {
        "_meta": {
            "version": 1,
            "generated_at": now_utc,
            "scanner": "plugin_scheduler",
            "scheduler_count": scheduler_count,
            "ready_count": ready_count,
            "blocked_count": blocked_count,
            "invalid_count": invalid_count
        },
        "scheduler": scheduler
    }
    
    try:
        with open(scheduler_path, "w", encoding="utf-8") as f:
            json.dump(scheduler_registry, f, indent=2, ensure_ascii=False)
        print("Plugin Scheduler Registry successfully written to scheduler.json")
        sys.exit(0)
    except IOError as e:
        print(f"Error writing scheduler registry: {e}", file=sys.stderr)
        sys.exit(3)

if __name__ == "__main__":
    main()
