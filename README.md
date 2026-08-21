# ⚡ TchanzDex — Pokédex Customizável (Gameplay Casual & Competitiva)

[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Deploy Status](https://img.shields.io/badge/Vercel-Deployed-000000?logo=vercel&logoColor=white)](https://custom-pokedex-flame.vercel.app)
[![Tests](https://img.shields.io/badge/Vitest-13%20Passed-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev/)

Uma Pokédex web moderna, ultra-rápida e offline-first desenvolvida com **TypeScript**, **Vite** e **Vanilla CSS**, combinando a melhor experiência visual para **jogadores casuais** e **jogadores competitivos**.

👉 **Acesse a versão ao vivo na Vercel:** [https://custom-pokedex-flame.vercel.app](https://custom-pokedex-flame.vercel.app)

---

## 🌟 Principais Recursos & Funcionalidades

### 🎴 1. Visualização Dual (Modo Cards & Modo Planilha)
- **Modo Cards (Grid)**: Cards temáticos com bordas coloridas pelo tipo primário, artes oficiais em alta resolução, badges de tipo, botão de cry de áudio e formas de espécies.
- **📊 Modo Planilha (Table View)**: Tabela interativa com colunas de estatísticas base (HP, Ataque, Defesa, Sp. Atk, Sp. Def, Velocidade e Total de Stats - BST).
- **Ordenação por Atributos**: Ordene a Pokédex por qualquer atributo base em ordem crescente ou decrescente diretamente nos cabeçalhos da tabela ou pelo menu suspenso.

### ✨ 2. Formas Shiny & Modelos 3D Animados com Fallback Resiliente
- **✨ Botão Shiny**: Alternância para formas Shiny em tempo real, exibindo as artes oficiais HD Shiny e GIFs 3D Shiny.
- **Modelos 3D Animados (Showdown)**: Suporte a GIFs animados 3D para Pokémons.
- **Fallback Inteligente (Multi-Level `onerror`)**: Se um modelo 3D não existir no repositório (ex: Miraidon, Koraidon ou Pokémons Paradox de Gen 9), o app transiciona automaticamente e sem falhas para a Arte HD Oficial sem quebrar o layout.

### 🗺️ 3. Motor de Localizações de Captura Recentes (Gerações 1 a 9)
Mapeamento de localizações nos jogos mais recentes para toda a Pokédex (1025 Pokémons):
- **`Pokémon Legends: Z-A`**: Cidade de Lumiose (Áreas Urbanas, Parques, Arenas de Mega Evolução & Escolha de Parceiro).
- **`Legends: Arceus`**: Todas as 242 espécies da Pokédex de Hisui.
- **`Pokémon Scarlet & Violet` / `The Teal Mask` / `The Indigo Disk`**: Paldea, Kitakami e Terarium da Academia Blueberry.
- **`Brilliant Diamond & Shining Pearl`**: Sinnoh e Grand Underground.
- **`Let's Go, Pikachu! & Let's Go, Eevee!`**: Região de Kanto.

### ⚔️ 4. Módulo Competitivo (Integração Smogon Metagame)
- Exibição da **Tier Smogon** (OU, VGC, Ubers, UU, RU, NU, LC, etc.), **EV Spreads Recomendados**, **Natures**, **Itens**, **Tera Types** e **Movesets Sugeridos**.
- **Mensagem Amigável para Pokémons sem Metagame**: Pokémons sem builds registradas no Smogon (ex: pré-evoluções NFE) exibem o card *"Não há dados competitivos relevantes no Smogon para este Pokémon"* com a Tier estimada.

### 📱 5. Ergonomia & Qualidade de Vida Mobile
- **Menu de Filtros Colapsável**: Botão "Esconder/Mostrar Filtros" para otimizar o espaço em telas móveis (<640px).
- **Filtro de Gerações**: Filtre Pokémons por região/geração (Gen 1 Kanto a Gen 9 Paldea).
- **Navegação por Setas no Modal (⬅️ Anterior / Próximo ➡️)**: Alterne entre Pokémons sem precisar fechar e abrir o modal.
- **Voltar ao Topo**: Botão flutuante para rolagem suave instantânea.

---

## 🛠️ Arquitetura & Tecnologias

- **Frontend:** Vite, TypeScript, Vanilla CSS, HTML5 Semantic Elements.
- **Backend / Datasets:** Node.js script de exportação (`src/scripts/exportDataEnriched.js`) que processa CSVs do PokéAPI snapshot e gera `public/data/pokemon.json` (9.8 MB minificado).
- **Testes:** Vitest (13 testes unitários e de integração cobrindo data engine, mídias, UI e serviço competitivo).
- **Hospedagem:** Vercel (Configuração estática em `vercel.json`).

---

## 💻 Como Rodar Localmente

### Pré-requisitos
- Node.js 18+ instalado.

### 1. Clonar o Repositório
```bash
git clone https://github.com/RafaTchanz/custom-pokedex.git
cd custom-pokedex
```

### 2. Instalar Dependências
```bash
npm install
```

### 3. Iniciar o Servidor de Desenvolvimento
```bash
npm run dev
```
Acesse `http://localhost:5173` no navegador.

### 4. Executar os Testes Unitários
```bash
npm test
```

### 5. Compilar o Projeto para Produção
```bash
npm run build
```

---

## 📁 Estrutura de Diretórios

```
custom-pokedex/
├── docs/
│   └── sdlc/
│       ├── product-brief.md       # Visão Geral do Produto
│       ├── PRD.md                 # Product Requirements Document
│       └── architecture.md        # Arquitetura do Sistema
├── public/
│   └── data/
│       └── pokemon.json           # Dataset Enriquecido Pré-Processado (9.8 MB)
├── src/
│   ├── scripts/
│   │   └── exportDataEnriched.js  # Generator do Dataset JSON
│   ├── services/
│   │   └── smogonService.ts       # Módulo Competitivo Smogon
│   ├── app.ts                     # Motor Principal da Pokédex (SPA)
│   └── style.css                  # Estilos CSS Customizados & Temas
├── tests/                         # Suíte de Testes Vitest
├── index.html                     # Estrutura HTML Principal
├── package.json                   # Dependências e Scripts
└── vercel.json                    # Configuração de Deploy Vercel
```

---

## 📄 Licença

Desenvolvido para fins de estudo, aprendizado e diversão casual/competitiva. Dados e mídias fornecidos por [PokéAPI](https://pokeapi.co/) e [Smogon University](https://www.smogon.com/).
