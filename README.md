# AIOS - AI-Native Development Platform

AIOS is an AI-Native Development Platform.

Projects are applications built on AIOS.

```
Project
    ↓
AIOS Platform
```

## Platform Architecture

AIOS is a standalone Platform product. It does not contain project-specific code. All projects must depend on AIOS, and AIOS must never depend on any project.

- `kernel/` : Core Engine
- `runtime/` : Execution Runtime
- `sdk/` : Integration SDK
- `plugins/` : Reusable AI Plugins
- `skills/` : AI Skills
- `templates/` : UI and Logic Templates
- `workflows/` : Process Workflows
- `knowledge/` : Elevated Knowledge Base
- `marketplace/` : Ecosystem Assets
- `projects/` : Hosted Applications (e.g., POSTING MAP)

---

## POSTING MAP Project (Hosted Application)

POSTING MAP is the first project operating on the AIOS platform.
(Legacy architecture details for POSTING MAP have been migrated to the `projects/posting-map` context).
