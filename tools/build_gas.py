import os
import re

def strip_imports_exports(content):
    # Remove import statements spanning multiple lines or single line
    content = re.sub(r"^import\s+[\s\S]*?from\s+['\"].*?['\"];?\n", "", content, flags=re.MULTILINE)
    # Also handle 'import ...' without from (if any)
    
    # Remove 'export default '
    content = re.sub(r"^export\s+default\s+", "", content, flags=re.MULTILINE)
    # Remove 'export '
    content = re.sub(r"^export\s+", "", content, flags=re.MULTILINE)
    content = re.sub(r"^\s+export\s+", " ", content, flags=re.MULTILINE)
    
    return content

def build_bundle(source_dirs, output_file):
    bundle_content = f"// =========================================\n"
    bundle_content += f"// Generated: {output_file}\n"
    bundle_content += f"// =========================================\n\n"
    
    for d in source_dirs:
        for root, _, files in os.walk(d):
            # Sort to ensure deterministic output
            for file in sorted(files):
                if file.endswith(".ts") and not file.endswith(".d.ts"):
                    filepath = os.path.join(root, file)
                    with open(filepath, "r") as f:
                        file_content = f.read()
                    bundle_content += f"// --- Source: {filepath} ---\n"
                    bundle_content += strip_imports_exports(file_content)
                    bundle_content += "\n\n"
                    
    with open(output_file, "w") as f:
        f.write(bundle_content)
    print(f"Built {output_file}")

os.makedirs("active/gas", exist_ok=True)

build_bundle(["src/plugins/posting-map/core"], "active/gas/00_core.gs")
build_bundle(["src/plugins/posting-map/foundation/features", "src/plugins/posting-map/foundation/licensing", "src/plugins/posting-map/foundation/validation", "src/plugins/posting-map/foundation/monitoring", "src/plugins/posting-map/foundation/bridge"], "active/gas/01_foundation.gs")
build_bundle(["src/plugins/posting-map/foundation/authentication", "src/plugins/posting-map/foundation/authorization", "src/plugins/posting-map/foundation/hardening"], "active/gas/02_security.gs")
build_bundle(["src/platform"], "active/gas/03_platform.gs")
build_bundle(["src/plugins/posting-map/infrastructure/gas"], "active/gas/04_api.gs")
build_bundle([
    "src/plugins/posting-map/domain/common",
    "src/plugins/posting-map/domain/workspace",
    "src/plugins/posting-map/domain/field",
    "src/plugins/posting-map/application/events",
    "src/plugins/posting-map/application/field",
    "src/plugins/posting-map/application/subscription",
    "src/plugins/posting-map/application/operations",
    "src/plugins/posting-map/application/onboarding",
    "src/plugins/posting-map/infrastructure/spreadsheet",
    "src/plugins/posting-map/infrastructure/repository/workspace",
    "src/plugins/posting-map/infrastructure/repository/field",
    "src/plugins/posting-map/api/field",
    "src/plugins/posting-map/api/subscription",
    "src/plugins/posting-map/api/operations",
    "src/plugins/posting-map/api/registry",
    "src/plugins/posting-map/infrastructure/bootstrap"
], "active/gas/05_field.gs")

build_bundle([
    "src/plugins/posting-map/application/dashboard",
    "src/plugins/posting-map/api/dashboard"
], "active/gas/06_dashboard.gs")

entry_content = """// =========================================
// Generated: active/gas/99_entry.gs
// =========================================

function doGet(e) {
  return PlatformIntegrationPipeline.execute(e);
}

function doPost(e) {
  return PlatformIntegrationPipeline.execute(e);
}
"""
with open("active/gas/99_entry.gs", "w") as f:
    f.write(entry_content)
print("Built active/gas/99_entry.gs")
