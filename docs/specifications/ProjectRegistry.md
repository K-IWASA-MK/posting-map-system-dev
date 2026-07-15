# Project Registry Specification

## Purpose

Project Registry is the official project ledger of the AIOS Platform.

AIOS recognizes, validates, and manages every official project exclusively through `projects/registry.json`.

Every project under AIOS must be registered in this registry before it can participate in future platform services.

This registry is the Single Source of Truth for project discovery.

---

## Schema Reference

The registry is defined as a JSON document located at `projects/registry.json`.

### Structure

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "ProjectRegistry",
  "type": "object",
  "properties": {
    "version": {
      "type": "string",
      "description": "The specification version of the registry schema."
    },
    "projects": {
      "type": "array",
      "items": {
        "$ref": "#/definitions/Project"
      }
    }
  },
  "required": ["version", "projects"],
  "definitions": {
    "Project": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "description": "Unique, kebab-case identifier matching the project directory name."
        },
        "name": {
          "type": "string",
          "description": "Human-readable name of the project."
        },
        "status": {
          "type": "string",
          "enum": ["development", "production", "archived"],
          "description": "Lifecycle status of the project."
        },
        "description": {
          "type": "string",
          "description": "A brief summary explaining the project's scope and purpose."
        }
      },
      "required": ["id", "name", "status", "description"]
    }
  }
}
```

### Property Details

| Property | Type | Constraints / Allowed Values | Description |
|---|---|---|---|
| `version` | `string` | Must be `"1.0"` | Registry format version |
| `projects[].id` | `string` | Unique, kebab-case, matching directory name under `projects/` | Project ID |
| `projects[].name` | `string` | Max 100 characters | Display Name |
| `projects[].status` | `string` | `"development"`, `"production"`, `"archived"` | Project lifecycle status |
| `projects[].description` | `string` | Max 500 characters | Summary of the project |

---

## Validation Rules

To maintain the integrity of the AIOS Platform, the project registry must satisfy the following validation rules:

1. **Existence**: `projects/registry.json` must exist.
2. **Directory Integrity**: Every project directory listed in the registry must actually exist as a subdirectory under the `projects/` folder.
3. **ID Uniqueness**: Each project `id` defined in `projects/registry.json` must be unique.
4. **Kebab-Case Format**: Each project `id` must be formatted strictly in `kebab-case` (e.g., lower-case alphanumeric characters and hyphens, no underscores or spaces).
5. **Bijective Mapping (No Orphans)**:
   - **No Orphan Projects**: Every subdirectory under the `projects/` folder (excluding metadata/registry files like `registry.json` and hidden files/directories like `.DS_Store`) must be registered in `projects/registry.json`.
   - **No Missing References**: Every entry inside `projects/registry.json` must correspond to a valid physical directory under `projects/`.
   - Result: Registry entries and project folders have a strict 1-to-1 bijective mapping.

---

## Future Expansion

The Project Registry serves as the foundational database for the AIOS Platform. The following capabilities are explicitly deferred to future sprints:

### 1. Launcher Integration
Future execution managers (Launchers) will consult the Project Registry as the single source of truth to:
- Enumerate available boot targets.
- Retrieve project execution metadata.
- Launch runtimes under targeted directories.

### 2. Marketplace Integration
The upcoming Marketplace service will publish and verify third-party extensions, themes, or templates. The registry will:
- Differentiate between official core systems and third-party modules.
- Ensure that only authenticated and registered projects are displayed or installable.

### 3. Knowledge Engine Integration
Knowledge Elevation layers will crawl project workspaces based on registry listings. By referencing the registry, the Knowledge Engine will:
- Discover domain-specific contexts within official projects.
- Selectively prioritize, elevate, or index documentation and logic maps per project.

### 4. Plugin & Skill Discovery
Runtimes will scan registered projects to dynamically discover, validate, and load locally declared plugins and skills.

### 5. Runtime & Kernel Adapters
Adapters will dynamically configure project environments using context parsed from the registry, enabling multi-tenant sandbox execution without hardcoded configurations.
