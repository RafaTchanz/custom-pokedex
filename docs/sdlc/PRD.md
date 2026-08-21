# Product Requirements Document (PRD) — TchanzDex

- **Document ID:** PRD-001
- **Revision:** 2.0.0
- **Updated At:** 2026-08-21T09:00:00Z
- **Status:** APPROVED & UP-TO-DATE
- **Derived From Brief:** BRF-001 (rev 2.0.0)
- **Artifact Contract Version:** 2.0.0

---

## 1. Overview & Goals

- **GOAL-001**: Prover uma experiência de Pokédex rápida, offline-first e customizável para gameplay casual e estudo (**TchanzDex — Gameplay - Casual & Competitiva**).
- **GOAL-002**: Oferecer um módulo estendido de informações competitivas de Pokémon (Smogon / metagame) via integração dinâmica e datasets pré-indexados.
- **GOAL-003**: Garantir navegabilidade e ergonômia de qualidade de vida (modo planilha com ordenação por stats, filtro de gerações, menu expansível mobile, navegação interna por modal e botão voltar ao topo).
- **GOAL-004**: Mapear localizações de captura dos jogos mais recentes para toda a Pokédex (Scarlet & Violet, Indigo Disk, Teal Mask, Legends: Arceus, Legends: Z-A, BDSP e Let's Go).

---

## 2. Epics & Functional Requirements (FR)

### EPIC-001: Data Ingestion & Enriched Dataset Exporter
- **FR-001**: O sistema deve ler e estruturar os dados de Pokémon contidos nos arquivos CSV do snapshot local do PokéAPI e exportar um dataset enriquecido e minificado (`public/data/pokemon.json`).
- **FR-002**: O sistema deve mapear localizações de captura modernas para todos os Pokémons (Gen 1 ao Gen 9) cobrindo *Scarlet & Violet*, *The Indigo Disk*, *The Teal Mask*, *Legends: Arceus*, *Pokémon Legends: Z-A*, *BDSP* e *Let's Go*.

### EPIC-002: Graphical User Interface & Casual Gameplay Experience
- **FR-003**: O sistema deve disponibilizar busca textual, filtro por Tipo, filtro por Geração/Região (Gen 1 a 9) e menu de filtros colapsável para telas móveis.
- **FR-004**: O sistema deve suportar visualização em **Modo Cards** e **Modo Planilha (📊 Table View)** com ordenação interativa por qualquer stat base (HP, Atk, Def, SpA, SpD, Spe, BST).
- **FR-005**: O sistema deve permitir alternância para formas **✨ Shiny** e **Modelos 3D Animados (GIF Showdown)** com sistema de fallback gracioso para arte HD oficial.
- **FR-006**: O modal de detalhes deve permitir navegação contínua entre Pokémons via setas ⬅️ Anterior e Próximo ➡️ sem precisar fechar a janela.
- **FR-007**: A página deve disponibilizar um botão flutuante de seta para voltar ao topo de forma suave.

### EPIC-003: Competitive Gameplay & Smogon Metagame Integration
- **FR-008**: O sistema deve consultar dados do Smogon (Tiers, Movesets, EVs/IVs, Natures, Tera Types) com suporte a cache local e offline.
- **FR-009**: Para Pokémons sem builds competitivas registradas no Smogon, o sistema deve apresentar uma mensagem amigável *"Não há dados competitivos relevantes no Smogon para este Pokémon"* junto com a Tier estimada.

---

## 3. Stories & Acceptance Criteria (ST & AC)

### ST-001: Parser e Serviço de Dados Local (CSV Snapshot & Exporter)
- **AC-ST-001-01**: Given o script de exportação `exportDataEnriched.js`, When executado via Node.js, Then gera `public/data/pokemon.json` (< 10 MB) contendo 1351 formas de Pokémons com stats, habilidades, movimentos e localizações recentes.

### ST-002: Provedor de Mídias (Artwork, Shiny & 3D Fallback)
- **AC-ST-002-01**: Given o botão Shiny ativado, When renderizado o card ou modal, Then busca a arte oficial Shiny (`official-artwork/shiny/${id}.png`) e GIF 3D Shiny.
- **AC-ST-002-02**: Given um Pokémon sem modelo 3D no Showdown (ex: Miraidon/Paradox), When o GIF falha no carregamento, Then o evento `onerror` transiciona automaticamente para a Arte HD Oficial sem quebrar o layout.

### ST-003: Interface da Pokédex (Grid, Busca, Filtros de Geração e Menu Mobile)
- **AC-ST-003-01**: Given a barra de filtros, When o usuário clica em "Esconder Filtros", Then a barra encolhe suavemente melhorando a visualização no celular.
- **AC-ST-003-02**: Given o seletor de Geração, When o usuário escolhe "Geração 9 (Paldea)", Then exibe apenas Pokémons da IX Geração.

### ST-004: Modo Planilha (📊 Stats Table & Ordenação)
- **AC-ST-004-01**: Given a Pokédex no Modo Planilha, When o usuário clica no cabeçalho de uma coluna (ex: BST ou Sp. Atk), Then a tabela é reordenada em ordem decrescente pelo stat selecionado.

### ST-005: Modal com Navegação por Setas e Player de Cry
- **AC-ST-005-01**: Given o modal de um Pokémon aberto (ex: Charmander #0004), When o usuário clica na seta ➡️ Próximo, Then o modal atualiza instantaneamente para o Charmeleon (#0005).

### ST-006: Módulo Competitivo (Smogon & Empty State)
- **AC-ST-006-01**: Given a aba Competitivo de um Pokémon sem builds no Smogon (ex: Metapod), Then exibe o card *"Não há dados competitivos relevantes no Smogon para este Pokémon"* com a Tier estimada.

---

## 4. Non-Functional Requirements (NFR)

- **NFR-001 (Performance):** Resposta da busca, filtros e ordenação por stats inferior a 50ms.
- **NFR-002 (Responsividade Mobile):** Layout responsivo ajustado para dispositivos móveis (<640px) com grid de 2 colunas e rolagem horizontal na tabela.
- **NFR-003 (Deploy & Payload Limit):** Dataset enriquecido otimizado mantido abaixo dos limites de upload e memória da Vercel (< 10 MB).

---

## Source Fingerprint

- **Derived From Brief Hash:** `0c79b69561b174038cdbe14cbafe28a7a1092b9bab15283443609d21ca9b6e2d`
- **PRD Revision 2.0.0 Hash:** `b149d8c728e19b52a819b6e5684cd2901a91e52f78b88d447a195b0021c`
