#!/usr/bin/env python3
import os
import sys
import json
import re
import argparse
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
        category = rule.get("category", "Architecture")
        severity = rule["severity"]

        # 1. Forbidden Patterns Check (Blacklist)
        for forbidden in rule.get("forbidden_patterns", []):
            pat = forbidden["pattern"]
            msg = forbidden["message"]
            remediation = forbidden.get("remediation", "")
            next_action = forbidden.get("nextAction", [])
            compiled_pat = re.compile(pat)
            
            if "[\\s\\S]" in pat or "\\n" in pat:
                match = compiled_pat.search(content)
                if match:
                    start_char = match.start()
                    line_num = content[:start_char].count("\n") + 1
                    violations.append({
                        "id": rule_id,
                        "name": rule_name,
                        "category": category,
                        "severity": severity,
                        "message": msg,
                        "file": filepath,
                        "line": line_num,
                        "match": match.group(0)[:100],
                        "remediation": remediation,
                        "nextAction": next_action
                    })
            else:
                for line_idx, line in enumerate(lines):
                    trimmed_line = line.strip()
                    if trimmed_line.startswith("//") or trimmed_line.startswith("/*") or trimmed_line.startswith("*"):
                        continue
                    match = compiled_pat.search(line)
                    if match:
                        violations.append({
                            "id": rule_id,
                            "name": rule_name,
                            "category": category,
                            "severity": severity,
                            "message": f"{msg} (Line: '{trimmed_line}')",
                            "file": filepath,
                            "line": line_idx + 1,
                            "match": match.group(0),
                            "remediation": remediation,
                            "nextAction": next_action
                        })

        # 2. Required Patterns Check (Whitelist)
        for req in rule.get("required_patterns", []):
            pat = req["pattern"]
            msg = req["message"]
            remediation = req.get("remediation", "")
            next_action = req.get("nextAction", [])
            compiled_pat = re.compile(pat)
            if not compiled_pat.search(content):
                violations.append({
                    "id": rule_id,
                    "name": rule_name,
                    "category": category,
                    "severity": severity,
                    "message": msg,
                    "file": filepath,
                    "line": 1,
                    "match": "MISSING_REQUIRED_PATTERN",
                    "remediation": remediation,
                    "nextAction": next_action
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
    # Arg Parser for Multi-Agent Tracking
    parser = argparse.ArgumentParser(description="AIOS Architecture Reviewer")
    parser.add_argument("files", nargs="*", help="Files to review (default: scan all)")
    parser.add_argument("--agentId", default="antigravity-ide-v1", help="Agent Unique ID")
    parser.add_argument("--agentName", default="Antigravity", help="Agent Human Name")
    parser.add_argument("--agentRole", default="Developer", help="Agent Role in System")
    
    parsed_args, unknown_files = parser.parse_known_args()
    input_files = parsed_args.files + unknown_files

    try:
        rules_data = load_rules()
        rules = rules_data.get("rules", [])
        rule_version = rules_data.get("ruleVersion", "0.0.0")
    except Exception as e:
        print(f"Error loading rules: {e}", file=sys.stderr)
        sys.exit(1)

    project_root = os.path.dirname(os.path.dirname(__file__))
    
    if input_files:
        target_files = []
        for path in input_files:
            # Ignore flags passed mistakenly as files
            if path.startswith("-"):
                continue
            abs_path = os.path.abspath(path)
            if os.path.exists(abs_path):
                rel = os.path.relpath(abs_path, project_root).replace(os.sep, "/")
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

    # 1. Initialize Category-specific Summary
    categories = set(rule.get("category", "Architecture") for rule in rules)
    summary = {}
    for cat in categories:
        summary[cat] = {
            "status": "PASS",
            "errors": 0,
            "warnings": 0
        }

    # 2. Populate Category Counts and Violations
    for v in all_violations:
        cat = v["category"]
        if v["severity"] == "ERROR":
            summary[cat]["errors"] += 1
            summary[cat]["status"] = "FAILED"
        elif v["severity"] == "WARNING":
            summary[cat]["warnings"] += 1

    # 3. Determine Overall Status (PASS / PASS_WITH_WARNING / FAILED)
    total_errors = sum(cat_info["errors"] for cat_info in summary.values())
    total_warnings = sum(cat_info["warnings"] for cat_info in summary.values())
    
    if total_errors > 0:
        status = "FAILED"
    elif total_warnings > 0:
        status = "PASS_WITH_WARNING"
    else:
        status = "PASS"

    review_id = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S")

    result = {
        "reviewId": review_id,
        "reviewEngineVersion": "1.1.0",
        "ruleVersion": rule_version,
        "agent": {
            "agentId": parsed_args.agentId,
            "agentName": parsed_args.agentName,
            "agentRole": parsed_args.agentRole
        },
        "status": status,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "summary": summary,
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
            print(f"{badge} Rule {v['id']} ({v['name']}) [{v['category']}]: {v['message']} in {v['file']}:{v['line']}")
    else:
        print(f"--- Architecture Review: PASS (No violations found) ---")

    if status == "FAILED":
        sys.exit(1)
    else:
        sys.exit(0)

if __name__ == "__main__":
    main()
