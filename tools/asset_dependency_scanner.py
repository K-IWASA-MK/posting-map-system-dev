import os
import re
import sys
import json

TARGET_ASSETS = ["style.css", "app.js", "render.js", "config.js", "db.js"]

def load_config():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    config_path = os.path.join(script_dir, "config.json")
    if os.path.exists(config_path):
        try:
            with open(config_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                return data.get("exclude_paths", [".git", ".github", "node_modules", "__pycache__"])
        except Exception as e:
            print(f"Warning: Failed to load config from {config_path}: {e}. Using defaults.", file=sys.stderr)
    return [".git", ".github", "node_modules", "__pycache__"]

def scan_files(root_dir, exclude_paths):
    scanned_files = []
    
    # Scan for HTML files and service-worker.js
    for root, dirs, files in os.walk(root_dir):
        # Filter out directories based on exclude_paths
        filtered_dirs = []
        for d in dirs:
            dir_full_path = os.path.join(root, d)
            dir_rel_path = os.path.relpath(dir_full_path, root_dir)
            dir_rel_path_normalized = dir_rel_path.replace(os.path.sep, "/")
            
            exclude = False
            for pattern in exclude_paths:
                if d == pattern:
                    exclude = True
                    break
                if dir_rel_path_normalized == pattern or dir_rel_path_normalized.startswith(pattern + "/"):
                    exclude = True
                    break
            if not exclude:
                filtered_dirs.append(d)
        dirs[:] = filtered_dirs
        
        for f in files:
            file_full_path = os.path.join(root, f)
            file_rel_path = os.path.relpath(file_full_path, root_dir)
            file_rel_path_normalized = file_rel_path.replace(os.path.sep, "/")
            
            # Check file level exclusion
            if any(file_rel_path_normalized == pattern or file_rel_path_normalized.startswith(pattern + "/") for pattern in exclude_paths):
                continue
                
            # We target *.html files and service-worker.js
            if f.endswith(".html") or f == "service-worker.js":
                scanned_files.append(file_full_path)
                
    return scanned_files

def analyze_dependencies(files, root_dir):
    graph = {asset: [] for asset in TARGET_ASSETS}
    
    for filepath in files:
        rel_path = os.path.relpath(filepath, root_dir).replace(os.path.sep, "/")
        
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()
        except Exception as e:
            print(f"Warning: Could not read {filepath}: {e}", file=sys.stderr)
            continue
            
        for asset in TARGET_ASSETS:
            # Match quotes, slashes, or word boundary followed by the asset name, and optionally ?v=...
            pattern = r'(?:[\'\"/]|href=|src=|\b)' + re.escape(asset) + r'(?:\?v=[a-zA-Z0-9_-]*)?'
            if re.search(pattern, content):
                graph[asset].append(rel_path)
                
    # Sort referencing files alphabetically
    for asset in graph:
        graph[asset].sort()
        
    return graph

def main():
    dry_run = "--dry-run" in sys.argv
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    root_dir = os.path.dirname(script_dir)
    
    exclude_paths = load_config()
    files_to_scan = scan_files(root_dir, exclude_paths)
    
    graph = analyze_dependencies(files_to_scan, root_dir)
    
    if dry_run:
        print("Detected Assets")
        print()
        for asset in TARGET_ASSETS:
            print(asset)
            print()
            print("↓")
            print()
            referencing_files = graph.get(asset, [])
            if referencing_files:
                for ref in referencing_files:
                    print(ref)
            else:
                print("(none)")
            print()
    else:
        output_path = os.path.join(script_dir, "asset_graph.json")
        try:
            with open(output_path, "w", encoding="utf-8") as f:
                json.dump(graph, f, indent=2, ensure_ascii=False)
            print(f"Successfully generated dependency graph: {output_path}")
        except Exception as e:
            print(f"Error writing dependency graph: {e}", file=sys.stderr)
            sys.exit(1)

if __name__ == "__main__":
    main()
