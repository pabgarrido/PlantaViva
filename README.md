# PlantaViva

> Plataforma de renderização com IA para arquitetos portugueses.  
> AI rendering platform for Portuguese architects.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, TypeScript, Tailwind CSS, Three.js / R3F |
| APIs | NestJS (Node 20) |
| Workers | Python 3.12, FastAPI |
| Auth | Azure Entra ID B2C |
| Data | Azure SQL · Cosmos DB · Blob Storage · Redis |
| Queue | Azure Service Bus |
| Realtime | Azure SignalR |
| AI | Azure OpenAI GPT-4o · SDXL + ControlNet · Blender Cycles |
| IaC | Bicep |
| CI/CD | GitHub Actions |
| Hosting | Azure (West Europe) |

---

## Monorepo Structure

```
plantaviva/
├── apps/
│   ├── web/              # Next.js 15 App Router
│   ├── core-api/         # NestJS — projects, renders, materials, assistant
│   └── delivery-api/     # NestJS — share links, comments, PDF export
├── python/
│   ├── parser-worker/    # FastAPI — IFC/PDF/CAD parsing
│   └── render-worker/    # FastAPI — SDXL/Blender rendering
├── packages/
│   ├── types/            # Shared TypeScript types
│   └── tsconfig/         # Shared TypeScript configs
├── infra/                # Bicep IaC
└── .github/workflows/    # CI/CD pipelines
```

## Quick Start

### Prerequisites
- Node.js ≥ 20, pnpm ≥ 9
- Python 3.12
- Azure CLI (for infra)

### Install
```bash
pnpm install
```

### Develop
```bash
pnpm dev
```

### Build
```bash
pnpm build
```

### Test
```bash
pnpm test
```

---

## Environment Variables

Copy `.env.example` → `.env` in each app directory. Never commit secrets.

---

## Feature Flags

| Flag | Default | Purpose |
|------|---------|---------|
| `FEATURE_PDF_PARSER` | `false` | Enable PDF/image plan parsing (beta) |
| `FEATURE_VIDEO` | `false` | Enable video generation |
| `FEATURE_PREMIUM_RENDER` | `false` | Enable Blender Cycles premium renders |

---

## Infrastructure

Bicep IaC in `infra/`. Deploy:

```bash
# Dev
az deployment sub create \
  --location westeurope \
  --template-file infra/main.bicep \
  --parameters infra/parameters/dev.bicepparam

# Prod
az deployment sub create \
  --location westeurope \
  --template-file infra/main.bicep \
  --parameters infra/parameters/prod.bicepparam
```

---

## Delivery Plan

| Phase | Weeks | Scope |
|-------|-------|-------|
| **0 — Foundation** | 1–2 | Azure setup, CI/CD, hello-world deploys ← *current* |
| 1 — Auth & uploads | 3–4 | B2C login, projects CRUD, SAS upload |
| 2 — BIM path | 5–6 | IFC parser, Cosmos scene, Three.js viewer |
| 3 — Materials & assistant | 7–9 | Catalog, GPT-4o assistant, lighting |
| 4 — Render pipeline | 10–12 | SDXL workers, 3 tiers, SignalR |
| 5 — Walkthrough & video | 13–15 | glTF viewer, video, PDF parser |
| 6 — Delivery & polish | 16–18 | Shares, comments, billing, prod hardening |

---

## Contributing

Conventional commits required. One branch per feature, PR to merge to `main`.