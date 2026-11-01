# NoSleep — Ambient Digital Space

> **"A calm digital space to keep your screen awake, find your focus and explore ambient experiences."**

[![Domain](https://img.shields.io/badge/Domain-nosleeppage.com-f54e00?style=flat-square)](https://nosleeppage.com)
[![Framework](https://img.shields.io/badge/Framework-Astro_Static-f54e00?style=flat-square)](https://astro.build)
[![Language](https://img.shields.io/badge/Language-TypeScript_Strict-26251e?style=flat-square)](https://www.typescriptlang.org)
[![Hosting](https://img.shields.io/badge/Hosting-GitHub_Pages-26251e?style=flat-square)](https://pages.github.com)
[![Privacy](https://img.shields.io/badge/Privacy-100%25_Client--Side-1f8a65?style=flat-square)](https://nosleeppage.com/privacy)

---

## 🌟 Executive Overview

**NoSleep** is a calm, high-performance web application that prevents display timeout while providing soothing ambient soundscapes, focus timers, and generative visual atmospheres.

Unlike barren single-button wake tools or ad-cluttered noise generators, NoSleep combines:
1. **Standards-Compliant Screen Wake Lock:** Zero-permission, one-tap screen wake activation with automated tab visibility re-acquisition.
2. **Atmospheric Soundscapes:** High-fidelity, client-side audio mixing (gentle rain, ocean waves, morning forest, warm brown noise, and lo-fi Rhodes chords) powered by the Web Audio API.
3. **Interactive Generative Visuals:** GPU-accelerated Canvas 2D and WebGL visuals (breathing orb, cosmic dust particles, orbital atoms) that turn idle displays into serene desktop art.
4. **Zero-Friction Privacy & Static Independence:** No accounts, no cookies, no server-side tracking, and 100% static hosting on GitHub Pages.

---

## 🏛️ Architecture & Fixed Constraints

| Layer | Selected Technology | Architectural Rationale |
|---|---|---|
| **Framework** | **Astro (Static Output)** | Zero client-side framework overhead; ultra-fast static HTML/CSS delivery. |
| **Language** | **TypeScript (Strict Mode)** | Full end-to-end type safety and deterministic state machines. |
| **Styling & Design** | **HTML5 + Vanilla CSS** | Follows workspace `DESIGN.md`: Cursor Orange (`#f54e00`), warm cream canvas (`#f7f7f4`), near-black ink (`#26251e`). |
| **Display Wake** | **Screen Wake Lock API** | Native W3C standard with automatic `visibilitychange` reacquisition. |
| **Audio Processing** | **Web Audio API** | Decoded audio buffer mixing, clickless zero-crossing loops, and exponential cross-fades. |
| **Visual Rendering** | **Canvas 2D + Raw WebGL** | Sub-millisecond rendering loops with battery-aware adaptive frame throttling. |
| **Persistence** | **LocalStorage (Versioned)** | Completely private, client-side storage for custom presets and preferences. |
| **Hosting & CI/CD** | **GitHub Pages + Actions** | Fully automated zero-cost deployment from `main` branch to `nosleeppage.com`. |

---

## 🌍 Multi-Language Strategy (i18n)

Modeled directly on the proven static i18n architecture of `@online-slug-generator`, NoSleep provides full zero-runtime static localized versions for 7 global languages:

- 🇺🇸 **English** (`en`) — Root default (`/`)
- 🇪🇸 **Español** (`es`) — `/es/`
- 🇩🇪 **Deutsch** (`de`) — `/de/`
- 🇫🇷 **Français** (`fr`) — `/fr/`
- 🇵🇹 **Português** (`pt`) — `/pt/`
- 🇯🇵 **日本語** (`ja`) — `/ja/`
- 🇨🇳 **简体中文** (`zh`) — `/zh/`

Each localized route includes automated `<link rel="alternate" hreflang="...">` tags, structured JSON-LD schemas, and tailored typography adjustments.

---

## 📖 Master Product Blueprint

For the exhaustive 30-section architectural blueprint, competitor intelligence report, Reddit intent findings, SEO/GEO strategies, and data models, review the master document:

👉 **[Master Product Blueprint & Research Plan](docs/NOSLEEP_MASTER_BLUEPRINT.md)**

### Key Blueprint Highlights:
* **Competitor Benchmark:** Detailed breakdown of direct rivals (`nosleep.page`, `keep-screen-on.com`) and indirect competitors (`noisli.com`, `asoftmurmur.com`).
* **Reddit Intent Model:** Real-world analysis of 140+ user discussions across `r/productivity`, `r/webdev`, and `r/mac`.
* **Technical Engines:** Exhaustive specifications for the **Visual Engine**, **Audio Engine**, **Session Engine**, and **Preferences Engine**.
* **GEO Strategy:** Full `llms.txt`, `llms-full.txt`, and AI crawler policies for Perplexity, ChatGPT Search, and Google AI Overviews.
* **Licensing Registry:** Verified CC0 and CC BY 4.0 stems with public attribution register.

---

## 🚀 Implementation Roadmap

```text
Milestone 0: Research, Competitor Analysis & Master Blueprint Approval [COMPLETED]
Milestone 1: Project Setup, Design Tokens, i18n Architecture & Base Layout
Milestone 2: Application Shell, WakeLockManager & Drift-Free Session Timer
Milestone 3: Visual Engine, Canvas 2D Scheduler & Generative Scenes
Milestone 4: Web Audio Engine, Sound Mixer & Initial Audio Stems
Milestone 5: Ambient Modes (Focus/Unwind/Explore), Presets & Base64 URL Sharing
Milestone 6: Advanced Capabilities: PWA Offline Shell & Document Picture-in-Picture
Milestone 7: SEO Landing Pages (/sounds/*, /focus/*), JSON-LD & Content Architecture
Milestone 8: Quality Guardian CI Automation, Performance Audit & Production Launch
```

---

## 📜 Quality & Performance Budgets

* **Initial JS Bundle:** < 35 KB gzipped (Enforced via CI)
* **Initial CSS Bundle:** < 20 KB gzipped
* **Largest Contentful Paint (LCP):** < 1.2 seconds
* **Interaction to Next Paint (INP):** < 50 milliseconds
* **Cumulative Layout Shift (CLS):** 0.000
* **Accessibility:** 100% WCAG 2.2 AA Compliance (Axe-Core validated)

---

## 👤 Author & Licensing

* **Author:** Atharva Mahamuni ([@athmatwt](https://twitter.com/athmatwt))
* **License:** MIT License (Application Code). Audio assets licensed under CC0 / CC BY 4.0.
