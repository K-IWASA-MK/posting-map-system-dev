#!/usr/bin/env python3
import os
import sys
import json
import argparse

sys.path.append(os.path.dirname(__file__))
from ai_team_orchestrator import load_json, save_json

HISTORY_FILE = os.path.join(os.path.dirname(__file__), "review_history_db.json")
RULES_FILE = os.path.join(os.path.dirname(__file__), "architecture_rules.json")
KNOWLEDGE_FILE = os.path.join(os.path.dirname(__file__), "knowledge_base.json")

def compile_knowledge():
    print("--- Running Knowledge Compiler (Auto-Learning Mode) ---")
    history = load_json(HISTORY_FILE)
    rules_data = load_json(RULES_FILE)
    knowledge_data = load_json(KNOWLEDGE_FILE)
    
    if not isinstance(history, list):
        history = []
        
    rules_list = rules_data.get("rules", [])
    rules_map = {r["id"]: r for r in rules_list}

    if not knowledge_data or "patterns" not in knowledge_data:
        knowledge_data = {
            "knowledgeSchemaVersion": "1.0.0",
            "patterns": []
        }

    existing_patterns = knowledge_data.get("patterns", [])
    existing_keys = {p["triggerKey"] for p in existing_patterns}

    compiled_count = 0
    violations_summary = {}

    for run in history:
        for v in run.get("violations", []):
            r_id = v.get("id")
            if not r_id:
                continue
            if r_id not in violations_summary:
                violations_summary[r_id] = {
                    "count": 0,
                    "sample_messages": [],
                    "name": v.get("name", "Unknown Rule")
                }
            
            violations_summary[r_id]["count"] += 1
            msg = v.get("message", "")
            if msg and msg not in violations_summary[r_id]["sample_messages"]:
                violations_summary[r_id]["sample_messages"].append(msg)

    # Compile rules that have occurred at least once into BUG_PATTERN entries
    for r_id, stats in violations_summary.items():
        rule = rules_map.get(r_id)
        if not rule:
            continue
            
        trigger_key = rule.get("forbidden_patterns", [{}])[0].get("pattern", f"Rule_{r_id}_Violation")
        if trigger_key in existing_keys:
            continue

        remediation = rule.get("remediation", "Check and comply with target design system rules.")
        solution_suggestion = f"Remediation template: {remediation}"
        if rule.get("nextAction"):
            solution_suggestion += f" | Action steps: {', '.join(rule['nextAction'])}"

        knw_id = f"KNW-{len(existing_patterns) + 1:04d}"
        pattern = {
            "knowledgeId": knw_id,
            "patternType": "BUG_PATTERN",
            "targetRuleId": r_id,
            "triggerKey": trigger_key,
            "description": f"Rule {r_id} ({stats['name']}) direct violations. Details: {stats['sample_messages'][0] if stats['sample_messages'] else ''}",
            "solution": solution_suggestion,
            "reliabilityScore": 0.9
        }
        
        existing_patterns.append(pattern)
        existing_keys.add(trigger_key)
        compiled_count += 1
        print(f"Learned new knowledge pattern: [{knw_id}] Rule {r_id} -> Trigger Key: {trigger_key}")

    knowledge_data["patterns"] = existing_patterns
    save_json(KNOWLEDGE_FILE, knowledge_data)
    print(f"Successfully compiled {compiled_count} knowledge patterns into knowledge_base.json.")

def main():
    parser = argparse.ArgumentParser(description="AIOS Knowledge Compiler")
    parser.add_argument("--compile", action="store_true", help="Compile and extract knowledge from review histories")
    args = parser.parse_args()
    
    if args.compile:
        compile_knowledge()
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
