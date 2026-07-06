#!/usr/bin/env python3
import os
import sys
import json
import argparse
from datetime import datetime, timezone

sys.path.append(os.path.dirname(__file__))
from ai_team_orchestrator import load_json, save_json

KNOWLEDGE_FILE = os.path.join(os.path.dirname(__file__), "knowledge_base.json")
REPORT_FILE = os.path.join(os.path.dirname(__file__), "ai_quality_report.json")
ADVICE_FILE = os.path.join(os.path.dirname(__file__), "ai_pre_implementation_advice.json")

def consult_advisor(agent_id, category):
    report = load_json(REPORT_FILE)
    knowledge = load_json(KNOWLEDGE_FILE)
    
    agent_data = report.get("agents", {}).get(agent_id, {})
    if not agent_data:
        print(f"No quality history profile found for agent ID '{agent_id}'. Proceeding with standard rules.")
        return

    violated_rule_ids = []
    for v in agent_data.get("topViolations", []):
        r_id = v.get("ruleId")
        if r_id:
            violated_rule_ids.append(r_id)

    patterns = knowledge.get("patterns", [])
    matching_advices = []

    for pat in patterns:
        r_id = pat.get("targetRuleId")
        if r_id in violated_rule_ids or not violated_rule_ids:
            matching_advices.append({
                "knowledgeId": pat.get("knowledgeId"),
                "ruleId": r_id,
                "triggerKey": pat.get("triggerKey"),
                "description": pat.get("description"),
                "solution": pat.get("solution"),
                "priority": "HIGH" if r_id in violated_rule_ids else "LOW"
            })

    advice_report = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "targetAgent": {
            "agentId": agent_id,
            "agentName": agent_data.get("agentName", "Unknown"),
            "role": agent_data.get("agentRole", "Developer")
        },
        "targetCategory": category,
        "advices": matching_advices
    }
    
    save_json(ADVICE_FILE, advice_report)

    print("=====================================================================")
    print("                 AIOS PRE-IMPLEMENTATION CONSULTANT")
    print(f"      Target AI: {advice_report['targetAgent']['agentName']} ({agent_id})")
    print(f"      Category : {category} | Timestamp: {advice_report['timestamp']}")
    print("=====================================================================")
    
    if matching_advices:
        print(f"\n⚠️ WARNING: This Agent has a history of violations in category '{category}'!")
        print("Please review and follow the historical fix templates below:\n")
        
        for idx, adv in enumerate(matching_advices):
            prio = f"[{adv['priority']}]"
            print(f"    {idx+1}. {prio} Pattern ID: {adv['knowledgeId']} (Rule {adv['ruleId']})")
            print(f"       Trigger Symbol: {adv['triggerKey']}")
            print(f"       Violation Case: {adv['description']}")
            print(f"       Recommended Fix: {adv['solution']}")
            print("       -------------------------------------------------------------")
    else:
        print("\n✅ Verification OK: No matching historical violation patterns found for this Agent in this category.")
        print("Standard architecture rules apply.")
        
    print("\n=====================================================================")

def main():
    parser = argparse.ArgumentParser(description="AIOS Pre-Implementation Consultant")
    parser.add_argument("--consult", action="store_true", help="Generate pre-implementation advisory warnings for agent")
    parser.add_argument("--agentId", required=True, help="Target Agent ID")
    parser.add_argument("--category", required=True, help="Target task category")
    
    args = parser.parse_args()
    
    if args.consult:
        consult_advisor(args.agentId, args.category)
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
