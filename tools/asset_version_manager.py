import os
import re
import sys
import json
import subprocess
from datetime import datetime

TARGET_ASSETS = ["style.css", "app.js", "render.js", "config.js", "db.js"]

def run_git(args):
    try:
        return subprocess.check_output(["git"] + args).decode("utf-8").strip()
    except subprocess.CalledProcessError as e:
        print(f"Git command failed: {e}", file=sys.stderr)
        return ""

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

def get_modified_assets():
    # 1. Get staged changes
    staged = run_git(["diff", "--cached", "--name-only"]).split("\n")
    # 2. Get unstaged changes
    unstaged = run_git(["diff", "--name-only"]).split("\n")
    
    # Combine and deduplicate
    all_changes = list(set(staged + unstaged))
    all_changes = [f.strip() for f in all_changes if f.strip()]
    
    modified = []
    for filepath in all_changes:
        basename = os.path.basename(filepath)
        if basename in TARGET_ASSETS:
            modified.append(filepath)
            
    return list(set(modified))

def find_html_files(root_dir, exclude_paths):
    html_files = []
    for root, dirs, files in os.walk(root_dir):
        # Filter out directories if their name or relative path matches an entry in exclude_paths
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
            if any(file_rel_path_normalized == pattern or file_rel_path_normalized.startswith(pattern + "/") for pattern in exclude_paths):
                continue
                
            if f.endswith(".html") and f != "index.html" or (f == "index.html" and root != root_dir):
                html_files.append(file_full_path)
            elif f == "index.html" and root == root_dir:
                html_files.append(file_full_path)
    return html_files

def update_file_versions(filepath, modified_assets, timestamp, dry_run=False):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
        
    original = content
    changes = []
    
    for asset in modified_assets:
        # Match pattern like: asset?v=TIMESTAMP or asset?v=460
        pattern = re.escape(asset) + r'\?v=([a-zA-Z0-9_-]+)'
        matches = re.findall(pattern, content)
        
        if matches:
            for old_ver in set(matches):
                old_str = f"{asset}?v={old_ver}"
                new_str = f"{asset}?v={timestamp}"
                if old_ver != timestamp:
                    changes.append((old_str, new_str))
                    content = content.replace(old_str, new_str)
            
    if changes and not dry_run:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
            
    return changes

def update_service_worker(sw_path, modified_assets, timestamp, dry_run=False):
    if not os.path.exists(sw_path):
        return []
        
    with open(sw_path, "r", encoding="utf-8") as f:
        content = f.read()
        
    original = content
    changes = []
    
    # 1. Update individual asset versions inside SW cache lists
    for asset in modified_assets:
        # Match pattern: 'app.js?v=455' or "app.js?v=455"
        pattern = r'([\'"])(.*?' + re.escape(asset) + r')\?v=([a-zA-Z0-9_-]+)\1'
        matches = re.findall(pattern, content)
        if matches:
            for quote, path_part, old_ver in set(matches):
                old_str = f"{quote}{path_part}?v={old_ver}{quote}"
                new_str = f"{quote}{path_part}?v={timestamp}{quote}"
                if old_ver != timestamp:
                    changes.append((old_str, new_str))
                    content = content.replace(old_str, new_str)
            
    # 2. Update overall CACHE_NAME version (e.g. posting-map-cache-v462 -> posting-map-cache-v20260626190321)
    if changes:
        cache_pattern = r'posting-map-cache-v([a-zA-Z0-9_-]+)'
        cache_match = re.search(cache_pattern, content)
        if cache_match:
            old_ver = cache_match.group(1)
            old_cache = cache_match.group(0)
            new_cache = f"posting-map-cache-v{timestamp}"
            if old_ver != timestamp:
                changes.append((old_cache, new_cache))
                content = content.replace(old_cache, new_cache)
            
    if changes and not dry_run:
        with open(sw_path, "w", encoding="utf-8") as f:
            f.write(content)
            
    return changes

def main():
    dry_run = "--dry-run" in sys.argv
    
    modified_paths = get_modified_assets()
    if not modified_paths:
        print("No CSS/JS asset modifications detected. No version updates required.")
        sys.exit(0)
        
    modified_basenames = list(set(os.path.basename(p) for p in modified_paths))
    
    # Generate timestamp for new versions
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    exclude_paths = load_config()
    html_files = find_html_files(root_dir, exclude_paths)
    
    all_proposed_changes = {}
    
    # Check/update HTML files
    for filepath in html_files:
        rel_path = os.path.relpath(filepath, root_dir)
        file_changes = update_file_versions(filepath, modified_basenames, timestamp, dry_run)
        if file_changes:
            all_proposed_changes[rel_path] = file_changes
            
    # Check/update Service Worker
    sw_path = os.path.join(root_dir, "service-worker.js")
    if os.path.exists(sw_path):
        rel_sw = os.path.relpath(sw_path, root_dir)
        sw_changes = update_service_worker(sw_path, modified_basenames, timestamp, dry_run)
        if sw_changes:
            all_proposed_changes[rel_sw] = sw_changes
            
    # Print output matching the requested style
    if dry_run:
        print("Detected:")
        for path in sorted(modified_paths):
            print(f"- {path}")
        print()
        
        if all_proposed_changes:
            print("Would update:")
            print()
            # Print file names first
            for rel_file in sorted(all_proposed_changes.keys()):
                print(rel_file)
            print()
            
            # Print transitions
            transitions = set()
            for changes_list in all_proposed_changes.values():
                for old_str, new_str in changes_list:
                    clean_old = old_str.strip("'\"")
                    clean_new = new_str.strip("'\"")
                    transitions.add((clean_old, clean_new))
            
            for old, new in sorted(transitions):
                print(old)
                print("↓")
                print(new)
                print()
        else:
            print("No files would be updated.")
            
        print("No files modified.")
    else:
        print("Detected:")
        for path in sorted(modified_paths):
            print(f"- {path}")
        print()
        
        if all_proposed_changes:
            print("Updating:")
            for rel_file, changes_list in sorted(all_proposed_changes.items()):
                print(f"  {rel_file}:")
                for old_str, new_str in changes_list:
                    print(f"    {old_str} -> {new_str}")
            print()
            
            # Git add
            print("Staging updated files to Git...")
            for rel_file in sorted(all_proposed_changes.keys()):
                run_git(["add", rel_file])
            print("Done.")
        else:
            print("No file references needed updating.")

if __name__ == "__main__":
    main()
