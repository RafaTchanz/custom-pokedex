# Architecture Document — TchanzDex

- **Document ID:** ARC-001
- **Revision:** 2.0.0
- **Updated At:** 2026-08-21T09:00:00Z
- **Status:** APPROVED & UP-TO-DATE
- **Derived From PRD:** PRD-001 (rev 2.0.0)
- **Artifact Contract Version:** 2.0.0

---

## 1. Context & Constraints

- **Arquitetura:** Aplicação Web SPA (Single Page Application) modular e ultra-rápida, alimentada por um dataset pré-indexado offline em JSON (`public/data/pokemon.json`).
- **Data Exporter Engine:** Script Node.js (`src/scripts/exportDataEnriched.js`) que processa o snapshot CSV do PokéAPI e injeta localizações modernas para jogos das Gerações 7, 8, 9 e *Pokémon Legends: Z-A*.
- **Deploy:** Vercel Static Web Hosting ([https://custom-pokedex-flame.vercel.app](https://custom-pokedex-flame.vercel.app)).

---

## 2. Tech Stack & Rationale

- **Frontend Core:** Vite + TypeScript + Vanilla CSS + Glassmorphism UX.
  - *Justificativa:* Zero overhead de frameworks pesados, bundling instantâneo, renderização nativa rápida no DOM (< 50ms) e estilos customizados sob medida.
- **Data Engine:** Script de exportação customizado (`exportDataEnriched.js`) e dataset local estático minificado (9.8 MB) que elimina chamadas de rede lentas durante navegação na Pokédex.
- **Mídias & Assets:**
  - Imagens Oficiais HD: PokeAPI GitHub Repository Raw.
  - Formas Shiny: PokeAPI GitHub Official Artwork Shiny Raw.
  - Modelos 3D Animados: Showdown GIF Repository Raw com fallback inteligente via `onerror`.
  - Cries: PokeAPI Audio Cries Repository Raw.
- **Serviço Competitivo (`SmogonService`):**
  - Integração Híbrida com `smogon_builds.json` local e fallback dinâmico para Pokémons sem metagame oficial registrado.

---

## 3. Component Architecture & Modules

```
 ┌────────────────────────────────────────────────────────────────────────┐
 │                              TchanzDex UI                              │
 ├─────────────────────────┬──────────────────────┬───────────────────────┤
 │     Mode Switcher       │    Filter Controls   │    Modal Presenter    │
 │ (Card Grid vs Table)    │ (Search, Type, Gen)  │ (Tabs, Nav Arrows)    │
 └───────────┬─────────────┴──────────┬───────────┴───────────┬───────────┘
             │                        │                       │
             ▼                        ▼                       ▼
 ┌────────────────────────────────────────────────────────────────────────┐
 │                           Application Core                             │
 │                    (app.ts - PokedexApp State Engine)                  │
 └───────────┬────────────────────────────────────────────────┬───────────┘
             │                                                │
             ▼                                                ▼
 ┌────────────────────────┐                      ┌────────────────────────┐
 │   Local JSON Engine    │                      │     SmogonService      │
 │ (data/pokemon.json)    │                      │(Competitive Builds API)│
 └────────────────────────┘                      └────────────────────────┘
```

---

## 4. Key Workflows & Features

1. **Modo Planilha (📊 Table View)**:
   - Alternância de visualização para tabela com colunas de estatísticas base.
   - Ordenação dinâmica no cliente por HP, Atk, Def, SpA, SpD, Spe e BST Total.
2. **Sistema de Mídias & Fallback Resiliente**:
   - `getPokemonMediaUrl(p, isShiny, is3D)` constrói URLs dinâmicas para Shiny e 3D.
   - O elemento `<img>` escuta falhas (`onerror`) para retroceder graciosamente de GIF 3D ➔ Arte HD Shiny ➔ Arte HD Normal ➔ 2D Sprite.
3. **Engine de Localizações Recentes**:
   - Mapeia jogos recentes para todos os 1025 Pokémons (Legends: Z-A, Legends: Arceus, Scarlet & Violet, The Indigo Disk, The Teal Mask, BDSP, Let's Go).
4. **Modal com Navegação por Setas**:
   - Atualiza o conteúdo do modal mantendo o estado ativo da aba (Visão Geral, Evolução, Golpes, Locais, Competitivo).

---

## Source Fingerprint

- **Derived From PRD Hash:** `b149d8c728e19b52a819b6e5684cd2901a91e52f78b88d447a195b0021c`
- **Architecture Revision 2.0.0 Hash:** `e7392a816c27104b2c15982847a6d8174519920194bc02e4828114`
