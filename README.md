# POSTING MAP - Self-Correcting Strategic OS

POSTING MAP is a full-stack, real-time autonomous operating system for election strategy and field operations.

## 🏗️ 3-Layer Architecture (SaaS Standard OS Structure)

The repository strictly follows a 3-layer architecture to ensure scalability, stability, and clarity:

### 1. `/active` (Execution OS)
The actively running system components.
- `/dashboard` : Command Center OS (The single source of truth for management UI)
- `/mobile`    : Field Agent App (Mobile OS)
- `/gas`       : AI OS Core (Backend logic, Decision Engine, Prediction Engine)
- `/api`       : API & Communication Layer

### 2. `/reference` (Data Dictionary / External Memory)
Static or semi-static data files serving as the external memory for the OS.
- `geo_map.csv`, `turnout.csv`, `district.csv`, etc.
- **Rule:** This layer is for REFERENCE ONLY. It provides the base realities (districts, historical turnout) to the OS.

### 3. `/legacy` (Frozen Archive)
Deprecated applications, old dashboards, and experimental features.
- **LEGACY is frozen.**
- **No API integration allowed.**
- **Reference only.**

---
*Note: This architecture was established in Phase 17 to stabilize the development environment into a production-ready SaaS infrastructure.*

---
*Note: Version management system integrated on 2026-06-26.*
