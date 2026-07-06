#!/usr/bin/env python3
import os
import sys
import json
import re
import fnmatch
from datetime import datetime, timezone

RULES_FILE = os.path.join(os.path.dirname(__file__), "architecture_rules.json")
RESULT_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "AUDIT_REVIEW_RESULT.json")

def load_rules():
    with open(RULES_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def match_glob_patterns(filepath, patterns):
    for p in patterns:
        p_norm = p.replace("\\", "/")
        file_norm = filepath.replace("\\", "/")
        
        reg = p_norm.replace("**/", "__DIR_STAR__")
        reg = reg.replace("**", "__DBL_STAR__")
        reg = reg.replace("*", "__SGL_STAR__")
        reg = reg.replace("?", "__ANY_CHAR__")
        
        reg = re.escape(reg)
        
        reg = reg.replace("__DIR_STAR__", "(?:.*/)?")
        reg = reg.replace("__DBL_STAR__", ".*")
        reg = reg.replace("__SGL_STAR__", "[^/]*")
        reg = reg.replace("__ANY_CHAR__", ".")
        reg = reg.replace("\\/", "/")
        
        reg_compiled = re.compile("^" + reg + "$")
        if reg_compiled.match(file_norm):
            return True
    return False

def check_file(filepath, content, rules):
    violations = []
    lines = content.splitlines()

    for rule in rules:
        target_files = rule.get("target_files", [])
        if not match_glob_patterns(filepath, target_files):
            continue
            
        rule_id = rule["id"]
        rule_name = rule["name"]
        severity = rule["severity"]

        # 1. Forbidden Patterns Check (Blacklist)
        for forbidden in rule.get("forbidden_patterns", []):
            pat = forbidden["pattern"]
            msg = forbidden["message"]
            compiled_pat = re.compile(pat)
            
            if "[\\s\\S]" in pat or "\\n" in pat:
                match = compiled_pat.search(content)
                if match:
                    start_char = match.start()
                    line_num = content[:start_char].count("\n") + 1
                    violations.append({
                        "id": rule_id,
                        "name": rule_name,
                        "severity": severity,
                        "message": msg,
                        "file": filepath,
                        "line": line_num,
                        "match": match.group(0)[:100]
                    })
            else:
                for line_idx, line in enumerate(lines):
                    # Ignore comments when checking server side scripts for window/document
                    trimmed_line = line.strip()
                    if trimmed_line.startswith("//") or trimmed_line.startswith("/*") or trimmed_line.startswith("*"):
                        continue
                    match = compiled_pat.search(line)
                    if match:
                        violations.append({
                            "id": rule_id,
                            "name": rule_name,
                            "severity": severity,
                            "message": f"{msg} (Line: '{trimmed_line}')",
                            "file": filepath,
                            "line": line_idx + 1,
                            "match": match.group(0)
                        })

        # 2. Required Patterns Check (Whitelist)
        for req in rule.get("required_patterns", []):
            pat = req["pattern"]
            msg = req["message"]
            compiled_pat = re.compile(pat)
            if not compiled_pat.search(content):
                violations.append({
                    "id": rule_id,
                    "name": rule_name,
                    "severity": severity,
                    "message": msg,
                    "file": filepath,
                    "line": 1,
                    "match": "MISSING_REQUIRED_PATTERN"
                })

    return violations

def get_target_files_in_project(rules):
    project_root = os.path.dirname(os.path.dirname(__file__))
    target_files = []
    
    patterns = set()
    for rule in rules:
        patterns.update(rule.get("target_files", []))
        
    for root, dirs, files in os.walk(project_root):
        if ".git" in root or "node_modules" in root or ".venv" in root:
            continue
        for file in files:
            full_path = os.path.join(root, file)
            rel_path = os.path.relpath(full_path, project_root)
            rel_path = rel_path.replace(os.sep, "/")
            if match_glob_patterns(rel_path, patterns):
                target_files.append(rel_path)
                
    return target_files

def main():
    try:
        rules_data = load_rules()
        rules = rules_data.get("rules", [])
        rule_version = rules_data.get("ruleVersion", "0.0.0")
    except Exception as e:
        print(f"Error loading rules: {e}", file=sys.stderr)
        sys.exit(1)

    args = sys.argv[1:]
    project_root = os.path.dirname(os.path.dirname(__file__))
    
    if args:
        target_files = []
        for path in args:
            rel = os.path.relpath(os.path.abspath(path), project_root).replace(os.sep, "/")
            target_files.append(rel)
    else:
        target_files = get_target_files_in_project(rules)

    all_violations = []
    for rel_path in target_files:
        full_path = os.path.join(project_root, rel_path)
        if not os.path.exists(full_path):
            continue
        try:
            with open(full_path, "r", encoding="utf-8") as f:
                content = f.read()
            violations = check_file(rel_path, content, rules)
            all_violations.extend(violations)
        except Exception as e:
            print(f"Error reading file {rel_path}: {e}", file=sys.stderr)

    error_count = sum(1 for v in all_violations if v["severity"] == "ERROR")
    status = "FAILED" if error_count > 0 else "PASS"

    result = {
        "reviewEngineVersion": "1.0.0",
        "ruleVersion": rule_version,
        "status": status,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "violations": all_violations
    }

    try:
        with open(RESULT_FILE, "w", encoding="utf-8") as f:
            json.dump(result, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print(f"Error writing result file: {e}", file=sys.stderr)

    if all_violations:
        print(f"--- Architecture Review Results: {status} ---")
        for v in all_violations:
            badge = f"[{v['severity']}]"
            print(f"{badge} Rule {v['id']} ({v['name']}): {v['message']} in {v['file']}:{v['line']}")
    else:
        print(f"--- Architecture Review: PASS (No violations found) ---")

    if status == "FAILED":
        sys.exit(1)
    else:
        sys.exit(0)

if __name__ == "__main__":
    main()
