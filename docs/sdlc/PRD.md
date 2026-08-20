# Product Requirements Document (PRD) — Pokédex Customizável

- **Document ID:** PRD-001
- **Revision:** 1.0.0
- **Created At:** 2026-08-20T11:20:30Z
- **Status:** APPROVED (GATE-02 Decision)
- **Derived From Brief:** BRF-001 (rev 1.0.0, hash `0c79b69561b174038cdbe14cbafe28a7a1092b9bab15283443609d21ca9b6e2d`)
- **Artifact Contract Version:** 2.0.0

---

## 1. Overview & Goals

- **GOAL-001**: Prover uma experiência de Pokédex rápida, offline-first e customizável para gameplay casual e estudo. (Derived from: BR-001, BR-002, BR-004)
- **GOAL-002**: Oferecer um módulo estendido de informações competitivas de Pokémon (Smogon / metagame) via integração dinâmica. (Derived from: BR-003, BR-007)
- **GOAL-003**: Manter uma arquitetura de código limpa, testável e extensível para inclusão de novos recursos de aprendizado. (Derived from: BR-003, BR-006, BR-009)

---

## 2. Epics & Functional Requirements (FR)

### EPIC-001: Data Ingestion & Core Processing (Snapshot PokéAPI)
- **FR-001**: O sistema deve ler, parsear e estruturar os dados de Pokémon contidos nos arquivos CSV e diretórios de mídias do snapshot local do PokéAPI. (Derived from: BR-002, BR-007)

### EPIC-002: Graphical User Interface & Casual Gameplay Experience
- **FR-002**: O sistema deve disponibilizar uma interface web moderna, responsiva e interativa com busca, filtros por tipo/geração, detalhes de atributos e reprodução de som. (Derived from: BR-003, BR-007, BR-009)

### EPIC-003: Competitive Gameplay & Dynamic Data Extension
- **FR-003**: O sistema deve disponibilizar uma visão competitiva dedicada com integração a serviços/APIs externas para exibição de Tiers e movesets. (Derived from: BR-003, BR-007, BR-013)

---

## 3. Stories & Acceptance Criteria (ST & AC)

### ST-001: Parser e Serviço de Dados Local (CSV Snapshot)
- **Epic:** EPIC-001
- **FR Reference:** FR-001
- **Brief Source:** BR-002, BR-007
**Description:** Serviço em Node.js para ler e indexar dados dos arquivos CSV do PokéAPI em memória.
**Priority:** High

- **AC-ST-001-01**: Given o snapshot local do PokéAPI disponível no caminho configurado, When o serviço de dados carrega os arquivos CSV (pokemon.csv, pokemon_stats.csv, pokemon_types.csv), Then os dados de todos os Pokémon são indexados corretamente em memória com ID, nome, tipos e atributos base.
- **AC-ST-001-02**: Given o serviço de dados inicializado, When é solicitado um Pokémon com ID inválido ou inexistente (ex: -1 ou 99999), Then o serviço retorna um erro padronizado POKEMON_NOT_FOUND sem interromper a execução.

---

### ST-002: Provedor de Mídias (Sprites e Cries)
- **Epic:** EPIC-001
- **FR Reference:** FR-001
- **Brief Source:** BR-007
**Description:** Serviço de resolução e entrega de mídias estáticas de imagens PNG/SVG e sons OGG do snapshot.
**Priority:** Medium

- **AC-ST-002-01**: Given o ID de um Pokémon válido (ex: ID 25 - Pikachu), When o componente visual solicita o sprite e o arquivo de som (cry), Then o sistema retorna os caminhos locais dos arquivos de imagem (PNG/SVG) e áudio (OGG/MP3).
- **AC-ST-002-02**: Given um Pokémon sem arquivo de cry no snapshot local, When a reprodução do som é acionada, Then o sistema trata o evento silenciosamente usando áudio de fallback ou desabilitando o botão sem exceções.

---

### ST-003: Interface da Pokédex (Grid, Busca e Filtros)
- **Epic:** EPIC-002
- **FR Reference:** FR-002
- **Brief Source:** BR-003, BR-007
**Description:** Componentes visuais web para exibição da grade de Pokémon com busca por texto e filtro de tipos.
**Priority:** High

- **AC-ST-003-01**: Given a tela principal da Pokédex exibindo os cards, When o usuário digita um nome (ex: "Charizard") e/ou seleciona o filtro por Tipo "Fogo", Then a grade de Pokémon é atualizada instantaneamente (< 100ms) com os resultados filtrados.
- **AC-ST-003-02**: Given o campo de busca da Pokédex, When o usuário digita uma busca sem correspondência (ex: "XYZ123"), Then a interface exibe a mensagem "Nenhum Pokémon encontrado" com opção de limpar os filtros.

---

### ST-004: Modal de Detalhes do Pokémon e Player de Cry
- **Epic:** EPIC-002
- **FR Reference:** FR-002
- **Brief Source:** BR-003, BR-007
**Description:** Modal detalhado com visualização de Base Stats, características, habilidades e player de som do cry.
**Priority:** High

- **AC-ST-004-01**: Given a lista de Pokémon carregada, When o usuário clica sobre um Pokémon específico, Then um modal interativo exibe a imagem em alta resolução, gráficos de Base Stats, tipos, habilidades, altura, peso e controle de áudio do cry.

---

### ST-005: Módulo Competitivo (Metagame & Smogon Integration)
- **Epic:** EPIC-003
- **FR Reference:** FR-003
- **Brief Source:** BR-003, BR-007, BR-013
**Description:** Módulo de integração assíncrona com API externa Smogon para exibição de Tiers e recomendações de EVs/IVs.
**Priority:** Medium

- **AC-ST-005-01**: Given a aba Competitivo selecionada no modal de um Pokémon, When o sistema consulta a integração de dados de metagame, Then a interface exibe a Tier atual do Pokémon (ex: OU, UU), movesets populares e recomendações de EVs/IVs.
- **AC-ST-005-02**: Given a ausência de conexão externa ou falha na requisição, When o usuário acessa a aba competitiva, Then o sistema apresenta os dados base locais com o aviso "Dados de metagame em tempo real indisponíveis offline".

---

## 4. Non-Functional Requirements (NFR)

- **NFR-001 (Performance):** A resposta da busca e filtragem local de Pokémon deve ser inferior a 100ms. (Derived from: BR-004)
- **NFR-002 (Usabilidade):** Interface responsiva acessível em desktop e telas mobile, com paleta de cores temática acessível. (Derived from: BR-009)
- **NFR-003 (Extensibilidade):** Módulos de dados desacoplados (separação clara entre serviço de dados, cliente de API e camada visual). (Derived from: BR-006)

---

## 5. Interface Contracts & User Journeys

- **CTR-001**: Interface de Consulta Local do PokéAPI para listagem, busca e detalhes de Pokémon. (Derived from: FR-001)
- **CTR-002**: Interface de Integração com API/Dataset Competitivo do Smogon. (Derived from: FR-003)
- **JNY-001**: Jornada Casual de Busca, Filtros, Visualização de Detalhes e Som do Cry. (Derived from: FR-002)
- **JNY-002**: Jornada Competitiva de Análise de Metagame, EVs/IVs e Movesets. (Derived from: FR-003)

---

## 6. Release Criteria (RC)

- **RC-001**: 100% dos testes unitários e de integração de todas as histórias de usuário executados com sucesso (GREEN). (Derived from: BR-004)
- **RC-002**: Validação de acessibilidade e renderização sem erros no console dos navegadores modernos. (Derived from: BR-009)
- **RC-003**: Todas as histórias de usuário testadas com evidências RED/GREEN e verificações de rastreabilidade aprovadas. (Derived from: BR-006)

---

## Source Fingerprint

- **Derived From Brief Hash:** `0c79b69561b174038cdbe14cbafe28a7a1092b9bab15283443609d21ca9b6e2d`
- **PRD SHA-256 Fingerprint:** `efda8ba31a29a943941f4a568aa345093ac48a7979bc9c6b30ad1318b6ee6222`
