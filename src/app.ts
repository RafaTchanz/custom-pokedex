interface PokemonStat {
  name: string;
  baseStat: number;
}

interface PokemonType {
  slot: number;
  name: string;
}

interface PokemonMove {
  name: string;
  type: string;
  method: 'level-up' | 'egg' | 'machine' | 'tutor';
  level?: number;
  power?: number;
  damageClass?: string;
}

interface PokemonEvolutionStep {
  speciesId: number;
  name: string;
  triggerDetails?: string;
  isCurrent?: boolean;
}

interface PokemonEncounter {
  game: string;
  location: string;
  minLevel: number;
  maxLevel: number;
}

interface PokemonMedia {
  officialArtworkUrl: string;
  spriteUrl: string;
  shinyArtwork?: string;
  shinySpriteFront?: string;
  shinyOfficialArtworkUrl?: string;
  shinySpriteUrl?: string;
  cryUrl: string;
  hasCry: boolean;
}

interface PokemonCardData {
  id: number;
  speciesId: number;
  name: string;
  height: number;
  weight: number;
  stats: PokemonStat[];
  types: PokemonType[];
  media: PokemonMedia;
  isDefault: boolean;
  moves?: PokemonMove[];
  evolutionChain?: PokemonEvolutionStep[];
  obtainMethod?: string;
  encounters?: PokemonEncounter[];
}

interface PokemonSpeciesGroup {
  speciesId: number;
  name: string;
  defaultPokemon: PokemonCardData;
  varieties: PokemonCardData[];
  selectedPokemon: PokemonCardData;
}

const TYPE_COLORS: Record<string, string> = {
  normal: '#a8a77a',
  fire: '#ff4422',
  water: '#3399ff',
  grass: '#77cc55',
  electric: '#ffcc33',
  ice: '#66ccff',
  fighting: '#bb5544',
  poison: '#aa5599',
  ground: '#ddbb55',
  flying: '#8899ff',
  psychic: '#ff5599',
  bug: '#aabb22',
  rock: '#bbaa66',
  ghost: '#6666bb',
  dragon: '#7766ee',
  dark: '#775544',
  steel: '#aaaabb',
  fairy: '#ee99ee',
};

import { SmogonService, CompetitiveData, MovesetOption } from './services/smogonService';

class PokedexApp {
  private allPokemon: PokemonCardData[] = [];
  private speciesGroups: PokemonSpeciesGroup[] = [];
  private currentAudio: HTMLAudioElement | null = null;
  private currentPlayingBtn: HTMLButtonElement | null = null;
  private smogonService: SmogonService = new SmogonService();
  private activeModalTab: 'general' | 'moves' | 'evolution' | 'encounters' | 'competitive' = 'general';
  private isShinyActive: boolean = false;
  private movesMethodFilter: 'level-up' | 'egg' | 'machine' = 'level-up';

  private searchInput!: HTMLInputElement;
  private typeSelect!: HTMLSelectElement;
  private clearSearchBtn!: HTMLButtonElement;
  private resetAllBtn!: HTMLButtonElement;
  private emptyResetBtn!: HTMLButtonElement;
  private gridContainer!: HTMLDivElement;
  private emptyState!: HTMLDivElement;
  private totalCountText!: HTMLSpanElement;
  private modalBackdrop!: HTMLDivElement;
  private modalContent!: HTMLDivElement;
  private closeModalBtn!: HTMLButtonElement;

  constructor() {
    this.initDOMReferences();
    this.attachEventListeners();
    this.loadData();
  }

  private initDOMReferences(): void {
    this.searchInput = document.getElementById('search-input') as HTMLInputElement;
    this.typeSelect = document.getElementById('type-select') as HTMLSelectElement;
    this.clearSearchBtn = document.getElementById('clear-search-btn') as HTMLButtonElement;
    this.resetAllBtn = document.getElementById('reset-all-btn') as HTMLButtonElement;
    this.emptyResetBtn = document.getElementById('empty-reset-btn') as HTMLButtonElement;
    this.gridContainer = document.getElementById('pokemon-grid') as HTMLDivElement;
    this.emptyState = document.getElementById('empty-state') as HTMLDivElement;
    this.totalCountText = document.getElementById('total-count-text') as HTMLSpanElement;
    this.modalBackdrop = document.getElementById('pokemon-modal') as HTMLDivElement;
    this.modalContent = document.getElementById('modal-content') as HTMLDivElement;
    this.closeModalBtn = document.getElementById('close-modal-btn') as HTMLButtonElement;
  }

  private attachEventListeners(): void {
    this.searchInput.addEventListener('input', () => {
      this.toggleClearSearchBtn();
      this.render();
    });

    this.typeSelect.addEventListener('change', () => this.render());

    this.clearSearchBtn.addEventListener('click', () => {
      this.searchInput.value = '';
      this.toggleClearSearchBtn();
      this.render();
    });

    this.resetAllBtn.addEventListener('click', () => this.resetFilters());
    this.emptyResetBtn.addEventListener('click', () => this.resetFilters());

    this.closeModalBtn.addEventListener('click', () => this.closeModal());
    this.modalBackdrop.addEventListener('click', (e) => {
      if (e.target === this.modalBackdrop) this.closeModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeModal();
    });
  }

  private toggleClearSearchBtn(): void {
    if (this.searchInput.value.trim().length > 0) {
      this.clearSearchBtn.classList.remove('hidden');
    } else {
      this.clearSearchBtn.classList.add('hidden');
    }
  }

  private resetFilters(): void {
    this.searchInput.value = '';
    this.typeSelect.value = '';
    this.toggleClearSearchBtn();
    this.render();
  }

  private async loadData(): Promise<void> {
    try {
      const response = await fetch('/data/pokemon.json');
      if (!response.ok) {
        throw new Error(`Failed to load dataset: ${response.statusText}`);
      }
      this.allPokemon = await response.json();
      this.buildSpeciesGroups();
      this.render();
    } catch (err) {
      console.error('Error loading Pokédex dataset:', err);
      this.totalCountText.textContent = 'Erro ao carregar dados locais';
    }
  }

  private buildSpeciesGroups(): void {
    const groupsMap = new Map<number, PokemonCardData[]>();

    for (const p of this.allPokemon) {
      const specId = p.speciesId || p.id;
      if (!groupsMap.has(specId)) {
        groupsMap.set(specId, []);
      }
      groupsMap.get(specId)!.push(p);
    }

    this.speciesGroups = Array.from(groupsMap.entries()).map(([speciesId, list]) => {
      const defaultPokemon = list.find(x => x.isDefault || x.id === speciesId) || list[0];
      return {
        speciesId,
        name: defaultPokemon.name,
        defaultPokemon,
        varieties: list,
        selectedPokemon: defaultPokemon,
      };
    });
  }

  private getFormDisplayName(p: PokemonCardData, group: PokemonSpeciesGroup): string {
    if (p.isDefault || p.id === group.speciesId) {
      return 'Normal';
    }
    const baseName = group.defaultPokemon.name.toLowerCase();
    const currentName = p.name.toLowerCase();
    if (currentName.startsWith(baseName + '-')) {
      return p.name.slice(group.defaultPokemon.name.length + 1);
    }
    return p.name;
  }

  private filterGroups(): PokemonSpeciesGroup[] {
    const search = this.searchInput.value.trim().toLowerCase();
    const typeFilter = this.typeSelect.value.trim().toLowerCase();

    return this.speciesGroups.filter(group => {
      const matchingVarieties = group.varieties.filter(p => {
        if (typeFilter && !p.types.some(t => t.name.toLowerCase() === typeFilter)) {
          return false;
        }
        if (search) {
          const matchesName = p.name.toLowerCase().includes(search) || group.name.toLowerCase().includes(search);
          const matchesId = p.id.toString() === search || group.speciesId.toString() === search || `#${group.speciesId}` === search;
          if (!matchesName && !matchesId) {
            return false;
          }
        }
        return true;
      });

      if (matchingVarieties.length === 0) {
        return false;
      }

      if (matchingVarieties.length > 0 && !matchingVarieties.includes(group.selectedPokemon)) {
        group.selectedPokemon = matchingVarieties[0];
      }

      return true;
    });
  }

  private render(): void {
    const filtered = this.filterGroups();

    const totalVarietiesCount = filtered.reduce((sum, g) => sum + g.varieties.length, 0);
    this.totalCountText.textContent = `${filtered.length} Espécies (${totalVarietiesCount} Formas/Variantes)`;

    if (filtered.length === 0) {
      this.gridContainer.innerHTML = '';
      this.emptyState.classList.remove('hidden');
      return;
    }

    this.emptyState.classList.add('hidden');
    this.gridContainer.innerHTML = filtered.map(g => this.createCardHTML(g)).join('');

    filtered.forEach(group => {
      const cardEl = document.getElementById(`species-card-${group.speciesId}`);
      if (cardEl) {
        cardEl.addEventListener('click', (e) => {
          const target = e.target as HTMLElement;
          if (target.closest('.cry-btn') || target.closest('.form-pill')) return;
          this.openModal(group);
        });
      }

      group.varieties.forEach(p => {
        const pillBtn = document.getElementById(`pill-${group.speciesId}-${p.id}`);
        if (pillBtn) {
          pillBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            group.selectedPokemon = p;
            this.updateCardUI(group);
          });
        }
      });

      const cryBtn = document.getElementById(`cry-btn-species-${group.speciesId}`) as HTMLButtonElement;
      if (cryBtn) {
        cryBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.playCry(group.selectedPokemon.media.cryUrl, cryBtn);
        });
      }
    });
  }

  private updateCardUI(group: PokemonSpeciesGroup): void {
    const p = group.selectedPokemon;
    const cardEl = document.getElementById(`species-card-${group.speciesId}`);
    if (!cardEl) return;

    const titleEl = cardEl.querySelector('.card-title');
    if (titleEl) titleEl.textContent = p.name;

    const imgEl = cardEl.querySelector('.card-artwork') as HTMLImageElement;
    if (imgEl) {
      imgEl.src = p.media.officialArtworkUrl || p.media.spriteUrl;
      imgEl.alt = p.name;
    }

    const badgesContainer = cardEl.querySelector('.type-badges');
    if (badgesContainer) {
      badgesContainer.innerHTML = p.types
        .map(t => {
          const color = TYPE_COLORS[t.name.toLowerCase()] || '#a8a77a';
          return `<span class="type-badge" style="background-color: ${color};">${t.name}</span>`;
        })
        .join('');
    }

    group.varieties.forEach(v => {
      const pill = document.getElementById(`pill-${group.speciesId}-${v.id}`);
      if (pill) {
        if (v.id === p.id) {
          pill.classList.add('active');
        } else {
          pill.classList.remove('active');
        }
      }
    });
  }

  private createCardHTML(group: PokemonSpeciesGroup): string {
    const p = group.selectedPokemon;
    const formattedId = `#${group.speciesId.toString().padStart(4, '0')}`;
    
    const typeBadges = p.types
      .map(t => {
        const color = TYPE_COLORS[t.name.toLowerCase()] || '#a8a77a';
        return `<span class="type-badge" style="background-color: ${color};">${t.name}</span>`;
      })
      .join('');

    const formPills = group.varieties.length > 1
      ? `<div class="form-selector">` +
        group.varieties
          .map(v => {
            const formLabel = this.getFormDisplayName(v, group);
            const isActive = v.id === p.id ? 'active' : '';
            return `<button id="pill-${group.speciesId}-${v.id}" class="form-pill ${isActive}">${formLabel}</button>`;
          })
          .join('') +
        `</div>`
      : '';

    const imgUrl = p.media.officialArtworkUrl || p.media.spriteUrl;

    return `
      <div id="species-card-${group.speciesId}" class="pokemon-card">
        <span class="card-number">${formattedId}</span>
        <div class="card-img-container">
          <img class="card-artwork" src="${imgUrl}" alt="${p.name}" loading="lazy" onerror="this.src='${p.media.spriteUrl}'">
        </div>
        <h3 class="card-title">${p.name}</h3>
        <div class="type-badges">
          ${typeBadges}
        </div>
        ${formPills}
        <button id="cry-btn-species-${group.speciesId}" class="cry-btn" title="Ouvir som do cry">
          🔊 Play Cry
        </button>
      </div>
    `;
  }

  private playCry(cryUrl: string, buttonEl: HTMLButtonElement): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
    if (this.currentPlayingBtn) {
      this.currentPlayingBtn.classList.remove('playing');
      this.currentPlayingBtn.innerHTML = '🔊 Play Cry';
    }

    if (!cryUrl) return;

    const audio = new Audio(cryUrl);
    this.currentAudio = audio;
    this.currentPlayingBtn = buttonEl;

    buttonEl.classList.add('playing');
    buttonEl.innerHTML = '🎵 Tocando...';

    audio.play().catch(err => {
      console.warn('Audio playback failed:', err);
      buttonEl.classList.remove('playing');
      buttonEl.innerHTML = '🔊 Play Cry';
    });

    audio.onended = () => {
      buttonEl.classList.remove('playing');
      buttonEl.innerHTML = '🔊 Play Cry';
      this.currentAudio = null;
      this.currentPlayingBtn = null;
    };
  }

  private openModal(group: PokemonSpeciesGroup): void {
    this.activeModalTab = 'general';
    this.isShinyActive = false;
    this.movesMethodFilter = 'level-up';
    this.renderModalContent(group);
    this.modalBackdrop.classList.remove('hidden');
  }

  private async renderModalContent(group: PokemonSpeciesGroup): Promise<void> {
    const p = group.selectedPokemon;
    const formattedId = `#${group.speciesId.toString().padStart(4, '0')}`;
    const typeBadges = p.types
      .map(t => {
        const color = TYPE_COLORS[t.name.toLowerCase()] || '#a8a77a';
        return `<span class="type-badge" style="background-color: ${color}; padding: 0.35rem 1rem; font-size: 0.85rem;">${t.name}</span>`;
      })
      .join('');

    const formPillsModal = group.varieties.length > 1
      ? `<div style="margin-bottom: 1.25rem;">
           <div style="font-size: 0.8rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; margin-bottom: 0.5rem; text-align: center;">Formas / Variantes Disponíveis</div>
           <div class="form-selector">` +
          group.varieties
            .map(v => {
              const formLabel = this.getFormDisplayName(v, group);
              const isActive = v.id === p.id ? 'active' : '';
              return `<button id="modal-pill-${group.speciesId}-${v.id}" class="form-pill ${isActive}">${formLabel}</button>`;
            })
            .join('') +
          `</div></div>`
      : '';

    // Tabs Header
    const tabsHTML = `
      <div style="display: flex; gap: 0.4rem; margin-bottom: 1.25rem; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.5rem; overflow-x: auto;">
        <button id="modal-tab-general" class="form-pill ${this.activeModalTab === 'general' ? 'active' : ''}" style="padding: 0.5rem 0.8rem; font-weight: 700; border-radius: 12px; font-size: 0.85rem; white-space: nowrap;">📊 Stats</button>
        <button id="modal-tab-evolution" class="form-pill ${this.activeModalTab === 'evolution' ? 'active' : ''}" style="padding: 0.5rem 0.8rem; font-weight: 700; border-radius: 12px; font-size: 0.85rem; white-space: nowrap;">🧬 Evoluções</button>
        <button id="modal-tab-moves" class="form-pill ${this.activeModalTab === 'moves' ? 'active' : ''}" style="padding: 0.5rem 0.8rem; font-weight: 700; border-radius: 12px; font-size: 0.85rem; white-space: nowrap;">📜 Golpes</button>
        <button id="modal-tab-encounters" class="form-pill ${this.activeModalTab === 'encounters' ? 'active' : ''}" style="padding: 0.5rem 0.8rem; font-weight: 700; border-radius: 12px; font-size: 0.85rem; white-space: nowrap;">🗺️ Locais</button>
        <button id="modal-tab-competitive" class="form-pill ${this.activeModalTab === 'competitive' ? 'active' : ''}" style="padding: 0.5rem 0.8rem; font-weight: 700; border-radius: 12px; font-size: 0.85rem; white-space: nowrap;">⚔️ Competitivo</button>
      </div>
    `;

    // Shiny Toggle Header
    const shinyToggleHTML = `
      <div style="display: flex; justify-content: center; align-items: center; gap: 0.75rem; margin-bottom: 1rem;">
        <button id="modal-shiny-toggle" class="form-pill ${this.isShinyActive ? 'active' : ''}" style="background: ${this.isShinyActive ? 'linear-gradient(135deg, #f59e0b, #ef4444)' : 'rgba(255,255,255,0.1)'}; color: #ffffff; padding: 0.4rem 1rem; font-weight: 800; border-radius: 9999px; border: 1px solid rgba(255,255,255,0.2); cursor: pointer; transition: all 0.3s ease;">
          ${this.isShinyActive ? '✨ Forma Shiny Ativa!' : '✨ Alternar para Shiny'}
        </button>
      </div>
    `;

    const imgDisplayUrl = this.isShinyActive
      ? (p.media.shinyArtwork || p.media.shinySpriteFront || p.media.officialArtworkUrl)
      : (p.media.officialArtworkUrl || p.media.spriteUrl);

    // Render TAB Content
    let tabBodyHTML = '';

    if (this.activeModalTab === 'general') {
      const statsHTML = p.stats
        .map(s => {
          const percentage = Math.min(100, Math.round((s.baseStat / 180) * 100));
          let barColor = '#38bdf8';
          if (s.name === 'hp') barColor = '#4ade80';
          if (s.name === 'attack') barColor = '#f87171';
          if (s.name === 'defense') barColor = '#fbbf24';
          if (s.name === 'special-attack') barColor = '#c084fc';
          if (s.name === 'special-defense') barColor = '#a7f3d0';
          if (s.name === 'speed') barColor = '#f472b6';

          return `
            <div style="margin-bottom: 0.6rem;">
              <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.2rem;">
                <span style="text-transform: uppercase;">${s.name}</span>
                <span>${s.baseStat}</span>
              </div>
              <div style="background: rgba(255,255,255,0.1); height: 8px; border-radius: 9999px; overflow: hidden;">
                <div style="background: ${barColor}; width: ${percentage}%; height: 100%; border-radius: 9999px; transition: width 0.5s ease;"></div>
              </div>
            </div>
          `;
        })
        .join('');

      tabBodyHTML = `
        <div style="width: 180px; height: 180px; margin: 0 auto 1.25rem auto;">
          <img src="${imgDisplayUrl}" alt="${p.name}" style="width: 100%; height: 100%; object-fit: contain; filter: drop-shadow(0 12px 20px rgba(0,0,0,0.5)); transition: transform 0.3s ease;">
        </div>

        <div style="display: flex; justify-content: center; gap: 2rem; background: rgba(15,23,42,0.6); padding: 0.75rem 1.5rem; border-radius: 16px; margin-bottom: 1.25rem; font-size: 0.9rem;">
          <div><strong>Altura:</strong> ${(p.height / 10).toFixed(1)} m</div>
          <div><strong>Peso:</strong> ${(p.weight / 10).toFixed(1)} kg</div>
        </div>

        <div style="text-align: left; background: rgba(15,23,42,0.4); padding: 1.25rem; border-radius: 16px; margin-bottom: 1.25rem;">
          <h4 style="font-size: 0.95rem; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8; margin-bottom: 0.75rem;">Estatísticas Base (Base Stats)</h4>
          ${statsHTML}
        </div>

        <button id="modal-cry-btn" class="cry-btn" style="width: 100%; justify-content: center; padding: 0.75rem; font-size: 1rem;">
          🔊 Play Cry Audio
        </button>
      `;
    } else if (this.activeModalTab === 'evolution') {
      const chain = p.evolutionChain || [];
      if (chain.length === 0) {
        tabBodyHTML = `<div style="padding: 2rem; color: #94a3b8; font-size: 0.9rem;">Nenhuma cadeia evolutiva registrada para este Pokémon.</div>`;
      } else {
        const evoCardsHTML = chain.map((step, idx) => {
          const isCurrent = step.speciesId === group.speciesId || step.speciesId === p.speciesId;
          const imgUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${step.speciesId}.png`;
          const arrowHTML = idx < chain.length - 1
            ? `<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; color: #38bdf8; font-weight: 800; font-size: 1.25rem; margin: 0 0.5rem;">
                 <span>➔</span>
                 <span style="font-size: 0.7rem; color: #94a3b8; background: rgba(255,255,255,0.08); padding: 0.2rem 0.5rem; border-radius: 8px; margin-top: 0.25rem; white-space: nowrap;">${chain[idx + 1].triggerDetails || 'Evolui'}</span>
               </div>`
            : '';

          return `
            <div style="display: flex; align-items: center;">
              <div id="evo-step-${step.speciesId}" class="evo-step-card" style="background: ${isCurrent ? 'rgba(56,189,248,0.2)' : 'rgba(15,23,42,0.6)'}; border: 1px solid ${isCurrent ? '#38bdf8' : 'rgba(255,255,255,0.1)'}; padding: 0.75rem; border-radius: 16px; text-align: center; cursor: pointer; transition: transform 0.2s ease;">
                <img src="${imgUrl}" alt="${step.name}" style="width: 75px; height: 75px; object-fit: contain; margin-bottom: 0.35rem;">
                <div style="font-size: 0.85rem; font-weight: 800; text-transform: capitalize; color: ${isCurrent ? '#38bdf8' : '#f8fafc'};">${step.name}</div>
                <div style="font-size: 0.7rem; color: #94a3b8;">#${step.speciesId.toString().padStart(4, '0')}</div>
              </div>
              ${arrowHTML}
            </div>
          `;
        }).join('');

        tabBodyHTML = `
          <div style="text-align: left; background: rgba(15,23,42,0.4); padding: 1.25rem; border-radius: 16px; margin-bottom: 1.25rem;">
            <h4 style="font-size: 0.95rem; text-transform: uppercase; letter-spacing: 0.05em; color: #38bdf8; margin-bottom: 1rem; text-align: center;">🧬 Linha Evolutiva & Métodos de Evolução</h4>
            <div style="display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: 0.5rem;">
              ${evoCardsHTML}
            </div>
          </div>
        `;
      }
    } else if (this.activeModalTab === 'moves') {
      const moves = p.moves || [];
      const filteredMoves = moves.filter(m => m.method === this.movesMethodFilter);

      const movesSubTabsHTML = `
        <div style="display: flex; gap: 0.5rem; justify-content: center; margin-bottom: 1rem;">
          <button id="moves-subtab-level" class="form-pill ${this.movesMethodFilter === 'level-up' ? 'active' : ''}" style="font-size: 0.8rem; padding: 0.35rem 0.75rem;">⬆️ Nível (${moves.filter(m => m.method === 'level-up').length})</button>
          <button id="moves-subtab-egg" class="form-pill ${this.movesMethodFilter === 'egg' ? 'active' : ''}" style="font-size: 0.8rem; padding: 0.35rem 0.75rem;">🥚 Cruzamento (${moves.filter(m => m.method === 'egg').length})</button>
          <button id="moves-subtab-machine" class="form-pill ${this.movesMethodFilter === 'machine' ? 'active' : ''}" style="font-size: 0.8rem; padding: 0.35rem 0.75rem;">💿 TMs/HMs (${moves.filter(m => m.method === 'machine').length})</button>
        </div>
      `;

      const movesGridHTML = filteredMoves.length === 0
        ? `<div style="padding: 1.5rem; color: #94a3b8; font-size: 0.85rem; text-align: center;">Nenhum golpe registrado nesta categoria.</div>`
        : filteredMoves.map(m => {
            const typeColor = TYPE_COLORS[m.type.toLowerCase()] || '#a8a77a';
            return `
              <div style="background: rgba(15,23,42,0.6); padding: 0.6rem 0.85rem; border-radius: 10px; display: flex; align-items: center; justify-content: space-between; border: 1px solid rgba(255,255,255,0.08);">
                <div style="display: flex; align-items: center; gap: 0.6rem;">
                  <span class="type-badge" style="background: ${typeColor}; padding: 0.2rem 0.5rem; font-size: 0.7rem;">${m.type}</span>
                  <div>
                    <div style="font-weight: 700; font-size: 0.85rem; color: #f8fafc;">${m.name}</div>
                    <div style="font-size: 0.7rem; color: #94a3b8;">${m.damageClass || 'Status'} ${m.power ? `• Power ${m.power}` : ''}</div>
                  </div>
                </div>
                ${m.level ? `<span style="font-size: 0.75rem; font-weight: 800; color: #38bdf8; background: rgba(56,189,248,0.1); padding: 0.2rem 0.5rem; border-radius: 6px;">Nv. ${m.level}</span>` : ''}
              </div>
            `;
          }).join('');

      tabBodyHTML = `
        <div style="text-align: left; background: rgba(15,23,42,0.4); padding: 1.25rem; border-radius: 16px; margin-bottom: 1.25rem;">
          <h4 style="font-size: 0.95rem; text-transform: uppercase; letter-spacing: 0.05em; color: #38bdf8; margin-bottom: 0.75rem; text-align: center;">📜 Golpes Aprendidos</h4>
          ${movesSubTabsHTML}
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 0.5rem; max-height: 320px; overflow-y: auto; padding-right: 0.25rem;">
            ${movesGridHTML}
          </div>
        </div>
      `;
    } else if (this.activeModalTab === 'encounters') {
      const encounters = p.encounters || [];
      const mainMethodHTML = p.obtainMethod
        ? `<div style="background: rgba(56,189,248,0.15); border: 1px solid rgba(56,189,248,0.4); padding: 0.85rem 1rem; border-radius: 14px; margin-bottom: 1rem; text-align: center;">
             <div style="font-size: 0.75rem; color: #94a3b8; font-weight: 700; text-transform: uppercase; margin-bottom: 0.2rem;">📌 Método Principal de Obtenção</div>
             <div style="font-size: 0.95rem; font-weight: 800; color: #38bdf8;">${p.obtainMethod}</div>
           </div>`
        : '';

      const encountersListHTML = encounters.length === 0
        ? `<div style="padding: 1.5rem; color: #94a3b8; font-size: 0.85rem; text-align: center;">
             Este Pokémon não possui encontros selvagens diretos mapeados em rotas comuns (Obtenção via Evolução, Escolha de Inicial ou Eventos/Raids).
           </div>`
        : encounters.map(e => `
          <div style="background: rgba(15,23,42,0.6); padding: 0.75rem 1rem; border-radius: 12px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem; border: 1px solid rgba(255,255,255,0.08);">
            <div>
              <div style="font-weight: 800; font-size: 0.85rem; color: #38bdf8;">🎮 Jogo: ${e.game}</div>
              <div style="font-size: 0.8rem; color: #cbd5e1;">📍 Local: ${e.location}</div>
            </div>
            <span style="font-size: 0.75rem; font-weight: 800; color: #4ade80; background: rgba(74,222,128,0.1); padding: 0.25rem 0.6rem; border-radius: 8px;">Níveis ${e.minLevel} - ${e.maxLevel}</span>
          </div>
        `).join('');

      tabBodyHTML = `
        <div style="text-align: left; background: rgba(15,23,42,0.4); padding: 1.25rem; border-radius: 16px; margin-bottom: 1.25rem;">
          <h4 style="font-size: 0.95rem; text-transform: uppercase; letter-spacing: 0.05em; color: #38bdf8; margin-bottom: 0.75rem; text-align: center;">🗺️ Onde Encontrar / Como Obter no Jogo</h4>
          ${mainMethodHTML}
          <div style="max-height: 320px; overflow-y: auto; padding-right: 0.25rem;">
            ${encountersListHTML}
          </div>
        </div>
      `;
    } else {
      // Competitive tab with multi-builds prioritizing Champions / Gen 9
      const compData = await this.smogonService.getCompetitiveData(p.name);
      
      const warningBanner = compData.isOfflineFallback
        ? `<div style="background: rgba(245,158,11,0.15); border: 1px solid rgba(245,158,11,0.4); color: #fbbf24; padding: 0.75rem 1rem; border-radius: 12px; font-size: 0.85rem; margin-bottom: 1.25rem; text-align: center;">
             ⚠️ ${compData.warningMessage}
           </div>`
        : '';

      const movesetsHTML = compData.movesets.map((m: MovesetOption, buildIdx: number) => `
        <div style="background: rgba(15,23,42,0.6); padding: 1.1rem; border-radius: 14px; margin-bottom: 1rem; text-align: left; border: 1px solid ${buildIdx === 0 ? '#38bdf8' : 'rgba(255,255,255,0.08)'}; box-shadow: ${buildIdx === 0 ? '0 0 15px rgba(56,189,248,0.2)' : 'none'};">
          <div style="font-weight: 800; color: #38bdf8; font-size: 1.05rem; margin-bottom: 0.6rem; display: flex; align-items: center; justify-content: space-between;">
            <span>🎯 Build #${buildIdx + 1}: ${m.name} ${buildIdx === 0 ? '<span style="font-size: 0.7rem; background: #38bdf8; color: #0f172a; padding: 0.15rem 0.5rem; border-radius: 6px; font-weight: 800; margin-left: 0.5rem;">META PRINCIPAL / CHAMPIONS</span>' : ''}</span>
          </div>
          <div style="font-size: 0.85rem; color: #cbd5e1; margin-bottom: 0.75rem; display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; background: rgba(0,0,0,0.2); padding: 0.75rem; border-radius: 10px;">
            <div><strong style="color: #94a3b8;">Habilidade:</strong> <span style="color: #f1f5f9;">${m.abilities.join(' / ')}</span></div>
            <div><strong style="color: #94a3b8;">Item:</strong> <span style="color: #f1f5f9;">${m.items.join(' / ')}</span></div>
            <div><strong style="color: #94a3b8;">Nature:</strong> <span style="color: #f1f5f9;">${m.natures.join(' / ')}</span></div>
            ${m.teraTypes && m.teraTypes.length > 0 ? `<div><strong style="color: #94a3b8;">Tera Type:</strong> <span style="color: #a7f3d0;">${m.teraTypes.join(' / ')}</span></div>` : ''}
          </div>
          <div style="font-size: 0.85rem; font-weight: 700; color: #94a3b8; margin-top: 0.5rem; margin-bottom: 0.4rem;">Golpes Recomendados (Moveset):</div>
          <div style="display: flex; flex-direction: column; gap: 0.35rem;">
            ${m.moves.map((slot: string[], idx: number) => `
              <div style="background: rgba(30,41,59,0.7); padding: 0.4rem 0.75rem; border-radius: 8px; font-size: 0.85rem; color: #f8fafc; display: flex; align-items: center; gap: 0.5rem;">
                <span style="font-size: 0.75rem; font-weight: 800; color: #64748b; min-width: 50px;">SLOT ${idx + 1}:</span>
                <span style="font-weight: 600; color: #38bdf8;">${slot.join(' <span style="color: #64748b;">/</span> ')}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `).join('');

      tabBodyHTML = `
        ${warningBanner}
        <div style="display: flex; justify-content: space-around; background: rgba(30,41,59,0.7); padding: 1rem; border-radius: 16px; margin-bottom: 1.25rem; font-size: 0.9rem;">
          <div><div style="font-size: 0.75rem; color: #94a3b8; font-weight: 700; text-transform: uppercase;">Tier Smogon</div><div style="font-size: 1.25rem; font-weight: 800; color: #38bdf8;">${compData.tier}</div></div>
          <div><div style="font-size: 0.75rem; color: #94a3b8; font-weight: 700; text-transform: uppercase;">EV Spread Recomendado</div><div style="font-size: 0.85rem; font-weight: 600; color: #e2e8f0;">${compData.recommendedEvs}</div></div>
        </div>
        ${movesetsHTML}
      `;
    }

    // Combine Full Modal HTML
    this.modalContent.innerHTML = `
      <div style="text-align: center;">
        <span style="font-size: 0.9rem; font-weight: 800; color: #94a3b8;">${formattedId}</span>
        <h2 style="font-size: 2rem; font-weight: 800; text-transform: capitalize; margin: 0.2rem 0 0.8rem 0;">${p.name}</h2>
        
        <div style="display: flex; justify-content: center; gap: 0.5rem; margin-bottom: 1.25rem;">
          ${typeBadges}
        </div>

        ${shinyToggleHTML}
        ${tabsHTML}
        ${formPillsModal}

        ${tabBodyHTML}
      </div>
    `;

    // Attach Tab Event Listeners
    const tabGenBtn = document.getElementById('modal-tab-general');
    const tabEvoBtn = document.getElementById('modal-tab-evolution');
    const tabMovesBtn = document.getElementById('modal-tab-moves');
    const tabEncBtn = document.getElementById('modal-tab-encounters');
    const tabCompBtn = document.getElementById('modal-tab-competitive');
    const shinyToggleBtn = document.getElementById('modal-shiny-toggle');

    if (tabGenBtn) tabGenBtn.addEventListener('click', () => { this.activeModalTab = 'general'; this.renderModalContent(group); });
    if (tabEvoBtn) tabEvoBtn.addEventListener('click', () => { this.activeModalTab = 'evolution'; this.renderModalContent(group); });
    if (tabMovesBtn) tabMovesBtn.addEventListener('click', () => { this.activeModalTab = 'moves'; this.renderModalContent(group); });
    if (tabEncBtn) tabEncBtn.addEventListener('click', () => { this.activeModalTab = 'encounters'; this.renderModalContent(group); });
    if (tabCompBtn) tabCompBtn.addEventListener('click', () => { this.activeModalTab = 'competitive'; this.renderModalContent(group); });

    if (shinyToggleBtn) {
      shinyToggleBtn.addEventListener('click', () => {
        this.isShinyActive = !this.isShinyActive;
        this.renderModalContent(group);
      });
    }

    // Attach Sub-tabs Event Listeners for Moves
    const mLevelBtn = document.getElementById('moves-subtab-level');
    const mEggBtn = document.getElementById('moves-subtab-egg');
    const mMachBtn = document.getElementById('moves-subtab-machine');

    if (mLevelBtn) mLevelBtn.addEventListener('click', () => { this.movesMethodFilter = 'level-up'; this.renderModalContent(group); });
    if (mEggBtn) mEggBtn.addEventListener('click', () => { this.movesMethodFilter = 'egg'; this.renderModalContent(group); });
    if (mMachBtn) mMachBtn.addEventListener('click', () => { this.movesMethodFilter = 'machine'; this.renderModalContent(group); });

    // Evolution Cards Click Navigation
    (p.evolutionChain || []).forEach(step => {
      const evoCard = document.getElementById(`evo-step-${step.speciesId}`);
      if (evoCard) {
        evoCard.addEventListener('click', () => {
          const matchedGroup = this.speciesGroups.find(g => g.speciesId === step.speciesId);
          if (matchedGroup) {
            this.openModal(matchedGroup);
          }
        });
      }
    });

    group.varieties.forEach(v => {
      const modalPill = document.getElementById(`modal-pill-${group.speciesId}-${v.id}`);
      if (modalPill) {
        modalPill.addEventListener('click', () => {
          group.selectedPokemon = v;
          this.updateCardUI(group);
          this.renderModalContent(group);
        });
      }
    });

    const modalCryBtn = document.getElementById('modal-cry-btn') as HTMLButtonElement;
    if (modalCryBtn) {
      modalCryBtn.addEventListener('click', () => {
        this.playCry(p.media.cryUrl, modalCryBtn);
      });
    }
  }

  private closeModal(): void {
    this.modalBackdrop.classList.add('hidden');
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new PokedexApp();
});
