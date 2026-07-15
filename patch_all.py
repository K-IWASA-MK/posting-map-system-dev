import re

FILE_PATH = "sdk/DevelopmentRules.ts"

with open(FILE_PATH, "r") as f:
    content = f.read()

# We need to find all `static getXXX` that don't have an `if (!` check.
# But we need to make a proper chain.
# From the debug output, `getExecutionRuntimeContext` correctly returns false.
# The ones that return `true` unconditionally start with `getExecutionRuntimeSession`.
# Wait, `getExecutionRuntimeManager` also returns true unconditionally.
# Let's see the order in DevelopmentRules.ts.

pattern = re.compile(r"static get([A-Za-z0-9_]+)\(rule: DevelopmentRule\): \1 \| undefined \{\n\s+// [^\n]+\n\s+return [A-Z0-Z_]+BLUEPRINT.get([A-Za-z0-9_]+)\(\);\n\s+\}")
matches = pattern.findall(content)

for name, _ in matches:
    print(name)

