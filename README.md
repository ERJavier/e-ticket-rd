# Dominican Republic E-Ticket System Modernization

## 🇩🇴 Modernizing the Dominican Republic’s E-Ticket system for migration control

[![Code Quality](https://github.com/ERJavier/e-ticket-rd/actions/workflows/code-quality.yml/badge.svg?branch=main)](https://github.com/ERJavier/e-ticket-rd/actions/workflows/code-quality.yml)
[![Security Analysis](https://github.com/ERJavier/e-ticket-rd/actions/workflows/security-analysis.yml/badge.svg?branch=main)](https://github.com/ERJavier/e-ticket-rd/actions/workflows/security-analysis.yml)

> A modern, secure, and user-friendly **reference implementation** for the Dominican Republic’s migration e-ticket system.

---

## 🧭 Fork Status & Current State

This repository is a **maintained fork** of the original `e-ticket-rd` project initiated by **@gustavovalverde**.

### What changed in this fork

- ✅ All upstream issues completed and addressed
- ✅ Security, quality, and accessibility checks implemented
- ✅ Documentation expanded and structured for institutional review
- ✅ Project consolidated into a **handoff / evaluation-ready state**

### Why this fork exists

The original project was created as an exploratory architectural effort.  
This fork represents the **completion and consolidation** of that work into a coherent, reviewable implementation suitable for evaluation, pilot discussion, or further official development.

### Known limitation

- 🔐 **Cuenta Única integration**
  - The system architecture supports it
  - Official API access is required to implement it
  - This dependency is not publicly accessible and cannot be completed in open source

This repository is intended as a **technical and product reference implementation**, not a production deployment.

---

## 🎯 What This Project Is

This project explores a modernization of the Dominican Republic’s current migration e-ticket system at <https://eticket.migracion.gob.do>.

It focuses on **usability, reliability, accessibility, and security**, while remaining compatible with government-grade requirements.

**Mission**: demonstrate how a system used by **millions of travelers every year** can be simpler, safer, and more resilient.

---

## 📊 Problems Addressed & Improvements

| Current Challenges             | Proposed Improvements                    |
| ------------------------------ | ---------------------------------------- |
| Browser crashes, lost progress | Autosave, draft recovery                 |
| Long repetitive forms          | Smart forms & data reuse                 |
| Poor mobile experience         | Mobile-first, responsive UI              |
| Inconsistent QR validation     | Deterministic QR generation & validation |
| Accessibility gaps             | WCAG 2.1 / 2.2 AA compliance             |
| Limited error handling         | Clear feedback & recovery paths          |

---

## 🌍 International Benchmarks

This project draws inspiration from proven international systems:

- 🇳🇿 **New Zealand Traveller Declaration (NZTD)**
- 🇸🇬 **Singapore Arrival Card (SGAC)**
- 🇪🇺 **EU Once-Only Technical System UX guidelines**

The goal is **adaptation**, not imitation.

---

## 🛠 Technology Stack

### Frontend

- Next.js 15 (App Router)
- React
- Tailwind CSS
- shadcn/ui
- TanStack Form
- Zod (validation)
- next-intl (internationalization)

### Quality & Security

- TypeScript
- ESLint + Prettier
- Automated security analysis
- Dependency auditing
- Accessibility testing (WCAG AA)

---

## 🚀 Local Development

### Prerequisites

- Node.js **24+**
- pnpm **10+**
- Git

### Setup

```bash
git clone https://github.com/ERJavier/e-ticket-rd.git
cd e-ticket-rd
pnpm install
pnpm dev
```

Open <http://localhost:3000>

### Scripts

```bash
pnpm dev
pnpm build
pnpm start
pnpm lint
pnpm lint:strict
pnpm type-check
pnpm format
pnpm check-all
```
