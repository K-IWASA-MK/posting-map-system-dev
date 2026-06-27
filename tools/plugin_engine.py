import os
import sys
import json
import argparse
from datetime import datetime, timezone

# Allowed Plugin Types
ALLOWED_TYPES = {"utility", "analysis", "report", "export", "integration", "experimental"}
REQUIRED_KEYS = {"id", "name", "version", "type", "entry", "enabled", "description"}

def scan_plugins(plugins_dir):
    plugins = []
    
    if not os.path.exists(plugins_dir):
        return plugins

    for item in os.listdir(plugins_dir):
        item_path = os.path.join(plugins_dir, item)
        if os.path.isdir(item_path):
            manifest_path = os.path.join(item_path, "plugin.json")
            if os.path.exists(manifest_path):
                try:
                    with open(manifest_path, "r", encoding="utf-8") as f:
                        manifest = json.load(f)
                except (json.JSONDecodeError, IOError) as e:
                    # JSON破損時は invalid 扱いとしてリストへ追加
                    plugins.append({
                        "id": f"invalid:{item}",
                        "name": item,
                        "version": 0,
                        "type": "unknown",
                        "enabled": False,
                        "status": "invalid"
                    })
                    continue
                
                # キーのバリデーション
                is_valid = REQUIRED_KEYS.issubset(manifest.keys())
                if is_valid:
                    if manifest["type"] not in ALLOWED_TYPES:
                        is_valid = False
                        
                if not is_valid:
                    status = "invalid"
                elif not manifest.get("enabled", True):
                    status = "disabled"
                else:
                    status = "loaded"
                    
                plugins.append({
                    "id": manifest.get("id", f"invalid:{item}"),
                    "name": manifest.get("name", item),
                    "version": manifest.get("version", 1),
                    "type": manifest.get("type", "unknown"),
                    "enabled": manifest.get("enabled", False),
                    "status": status
                })
                
    # 決定論的ソート (1. status, 2. name, 3. id)
    plugins.sort(key=lambda x: (x.get("status", ""), x.get("name", ""), x.get("id", "")))
    return plugins

def main():
    parser = argparse.ArgumentParser(description="CIE Plugin Engine Scanner")
    parser.add_argument("--dry-run", action="store_true", help="Perform scanning dry-run without writing registry")
    args = parser.parse_args()
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    plugins_dir = os.path.join(script_dir, "plugins")
    os.makedirs(plugins_dir, exist_ok=True)
    
    # スキャン実行
    plugins = scan_plugins(plugins_dir)
    
    if args.dry_run:
        print("Plugin Engine")
        for p in plugins:
            print("Loaded      :", p["name"])
            print("Type        :", p["type"])
            print("Status      :", p["status"])
            print("-" * 10)
        sys.exit(0)
        
    # registry.json 生成
    registry_path = os.path.join(plugins_dir, "registry.json")
    now_utc = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
    
    registry = {
        "_meta": {
            "version": 1,
            "generated_at": now_utc,
            "scanner": "plugin_engine",
            "plugin_count": len(plugins)
        },
        "plugins": plugins
    }
    
    try:
        with open(registry_path, "w", encoding="utf-8") as f:
            json.dump(registry, f, indent=2, ensure_ascii=False)
        print("Plugin scans successfully written to registry.json")
        sys.exit(0)
    except IOError as e:
        print(f"Error writing plugin registry: {e}", file=sys.stderr)
        sys.exit(3)

if __name__ == "__main__":
    main()
