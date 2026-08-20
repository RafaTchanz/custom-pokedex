# Architecture Document — Pokédex Customizável

- **Document ID:** ARC-001
- **Revision:** 1.0.0
- **Created At:** 2026-08-20T11:21:15Z
- **Status:** DRAFT (Awaiting GATE-03 Decision)
- **Derived From PRD:** PRD-001 (rev 1.0.0, hash `bdf52e03fd64964e311b989b24cc0c5154116ddea38c2473efa610598a96a30e`)
- **Artifact Contract Version:** 2.0.0

---

## 1. Context & Constraints

- **Arquitetura:** Aplicação Web SPA (Single Page Application) modular e leve, acoplada a serviços de dados locais para indexação offline do snapshot PokéAPI.
- **Snapshot Local:** Fonte primária de mídias e metadados contida em `C:\Users\rafae\OneDrive\Área de Trabalho\Git\pokeapi`.
- **Serviços Externos:** Integração sob demanda com endpoints públicos de dados competitivos (ex: Smogon API).

---

## 2. Tech Stack Decision & Rationale

- **Frontend:** Vite + TypeScript + Vanilla CSS (Design Responsivo e Temático por Tipo).
  - *Justificativa:* Alta performance de bundling, HMR instantâneo, tipagem estática rigorosa para estruturas de dados de Pokémon e total controle estético sem dependências pesadas.
  - *Alternativa Rejeitada:* React/Next.js complexo SSR (desnecessário para execução local rápida e offline-first).
- **Backend / Data Ingestion:** Node.js (ES Modules) Data Engine local / Parser de CSVs e Servidor de Assets Estáticos.
  - *Justificativa:* Leitura rápida de arquivos CSV e facilidade de servir sprites/cries via HTTP local.

---

## 3. Component Boundaries

1. **Local Data Ingestion Engine (`LocalDataEngine`):**
   - Responsável por ler `data/v2/csv/*.csv` do snapshot local e fornecer dados normalizados em memória (Pokémon, Stats, Types, Abilities, Species).
2. **Media Asset Server (`MediaServer`):**
   - Mapeia e serve imagens (`data/v2/sprites/pokemon`) e áudios de som (`data/v2/cries/pokemon`).
3. **Competitive Integration Client (`SmogonClient`):**
   - Cliente assíncrono para requisitar estatísticas e movesets competitivos atualizados com tratamento de falhas e fallback offline.
4. **UI Presentation Layer (`PokedexUI`):**
   - Componentes visuais: Pokédex Grid, Filtros & Busca, Modal de Detalhes, Chart de Base Stats, Audio Player e Aba Competitiva.

---

## 4. Contracts (CTR) & Journeys (JNY)

### 4.1 Interface Contracts
- **CTR-001 (Local PokéAPI Query Interface):**
  - **Provider:** `LocalDataEngine`
  - **Consumer:** `PokedexUI`
  - **Linked ACs:** `AC-ST-001-01`, `AC-ST-001-02`, `AC-ST-002-01`, `AC-ST-002-02`
  - **Description:** Retorna lista filtrada de Pokémon ou detalhes por ID/Nome com tratamento de erros.

- **CTR-002 (Competitive Meta API Interface):**
  - **Provider:** `SmogonClient`
  - **Consumer:** `PokedexUI`
  - **Linked ACs:** `AC-ST-005-01`, `AC-ST-005-02`
  - **Description:** Retorna dados de Tier, Movesets recomendados e EVs/IVs do Smogon com fallback gracioso quando offline.

### 4.2 User Journeys
- **JNY-001 (Jornada Casual: Busca e Detalhes com Som):**
  - **Linked ACs:** `AC-ST-003-01`, `AC-ST-003-02`, `AC-ST-004-01`
  - **Flow:** Usuário entra na Pokédex -> Filtra por Tipo Fogo -> Clica no Charizard -> Visualiza Base Stats -> Toca o Cry.

- **JNY-002 (Jornada Competitiva: Análise de Metagame):**
  - **Linked ACs:** `AC-ST-004-01`, `AC-ST-005-01`, `AC-ST-005-02`
  - **Flow:** Usuário seleciona o Pokémon -> Alterna para a aba Competitivo -> Visualiza Tiers do Smogon e Movesets -> Caso offline, recebe alerta com dados base.

---

## 5. Delivery Plan (Epic Manifest Source)

| Story ID | Title | Tier | Repo | Dependencies | AC References |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **ST-001** | Parser e Serviço de Dados Local (CSV Snapshot) | backend | local | None | `AC-ST-001-01`, `AC-ST-001-02` |
| **ST-002** | Provedor de Mídias (Sprites e Cries) | backend | local | `ST-001` | `AC-ST-002-01`, `AC-ST-002-02` |
| **ST-003** | Interface da Pokédex (Grid, Busca e Filtros) | frontend | local | `ST-001` | `AC-ST-003-01`, `AC-ST-003-02` |
| **ST-004** | Modal de Detalhes do Pokémon e Player de Cry | frontend | local | `ST-002`, `ST-003` | `AC-ST-004-01` |
| **ST-005** | Módulo Competitivo (Metagame & Smogon Integration) | fullstack | local | `ST-004` | `AC-ST-005-01`, `AC-ST-005-02` |

---

## 6. Security & Deployment

- **Segurança:** Sanitização de entradas na busca para evitar injeção XSS; validação de parâmetros de requisição.
- **Imantação/Deployment:** Execução local via Node.js dev-server (`npm run dev`) e empacotamento estático otimizado (`npm run build`).

---

## Source Fingerprint

- **Derived From PRD Hash:** `efda8ba31a29a943941f4a568aa345093ac48a7979bc9c6b30ad1318b6ee6222`
- **Architecture SHA-256 Fingerprint:** `72686d68940604ad77dd8b4e610bc7192ad09a95712bce8bd231ecd3566b7510`
