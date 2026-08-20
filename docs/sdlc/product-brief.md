# Product Brief — Pokédex Customizável

- **Document ID:** BRF-001
- **Revision:** 1.0.0
- **Created At:** 2026-08-20T11:20:00Z
- **Status:** APPROVED (GATE-01 Decision)
- **Artifact Contract Version:** 2.0.0

---

## 1. Problem Statement

- **BR-001**: Desenvolvedores e jogadores de Pokémon frequentemente precisam de uma Pokédex que atenda tanto a necessidades de consulta casual (localização de captura, atributos base, sprites, sons) quanto a demandas competitivas (movesets atualizados, estratégias de metagame, dados do Smogon). As soluções existentes tendem a ser genéricas, fechadas ou lentas por dependerem exclusivamente de chamadas de API de terceiros na nuvem.
- **BR-002**: O objetivo deste projeto é construir uma Pokédex customizável e extensível do zero para fins de estudo e aprendizado técnico, utilizando como fonte base offline o snapshot local do PokéAPI (`C:\Users\rafae\OneDrive\Área de Trabalho\Git\pokeapi`) para alta performance e suporte a requisições/integrações externas sob demanda para dados competitivos dinâmicos.

---

## 2. Target Users & Jobs-to-be-Done (JTBD)

- **BR-003**: Personas de utilizadores cobrindo Jogador Casual (busca, visualização de sprites/cries e localização), Jogador Competitivo (Base Stats, IVs/EVs e metagame Smogon) e Desenvolvedor (arquitetura expansível e customizável).

---

## 3. Success Metrics

- **BR-004**: Tempo de resposta de busca e renderização de dados locais do Pokémon inferior a 100ms.
- **BR-005**: Cobertura completa das gerações de Pokémon disponíveis nos arquivos CSV e mídias do snapshot local.
- **BR-006**: Facilidade de extensão da arquitetura para inclusão de novas abas, filtros e integrações sem acoplamento.

---

## 4. Scope

- **BR-007**: No escopo inicial estão incluídos visualizador completo de Pokémon, busca e filtros combinados, consumo do snapshot local (CSV, sprites e cries), módulo competitivo com dados Smogon e interface web responsiva.
- **BR-008**: Fora do escopo inicial estão autenticação complexa de usuários em nuvem, simulador de batalhas em tempo real e integrações com Slack ou GitHub Issues.

---

## 5. Constraints

- **BR-009**: Aplicação web leve compatível com HTML5, CSS3 Vanilla e TypeScript executável via servidor local de desenvolvimento.
- **BR-010**: Execução inicial em ambiente local focado em uso pessoal e compartilhamento simples entre amigos.
- **BR-011**: Respeito e consumo direto da estrutura de dados do snapshot do PokéAPI sem alteração dos arquivos originais.

---

## 6. Existing-Solution Scan / Alternatives

- **BR-012**: Análise de alternativas existentes destacando que a PokéAPI oficial online possui latência, Bulbapedia/Serebii são poluídos e o Smogon Dex é exclusivo para competitivo sem recursos casuais.

---

## 7. Risks

- **BR-013**: Risco de divergência entre os esquemas do snapshot local do PokéAPI e APIs competitivas externas, mitigado por camada de adaptação.
- **BR-014**: Risco de carregamento pesado de mídia (imagens e som), mitigado por lazy loading e cache local.

---

## 8. Open Questions

- **BR-015**: Qual stack tecnológica web preferida para a interface? (Definido: Vite + TypeScript + Vanilla CSS).
- **BR-016**: Qual o formato de consumo dos arquivos CSV do snapshot local? (Definido: Parsing em Node.js com cache em memória).

---

## Source Fingerprint

- **Source Request:** User prompt asking for a customizable Pokedex using the local PokeAPI snapshot (`C:\Users\rafae\OneDrive\Área de Trabalho\Git\pokeapi`).
- **SHA-256 Fingerprint:** `8f2d59a2e374bbf1840c99a5e8f498bc19d3f112e4f014e3650c8e27c7f1a300`
