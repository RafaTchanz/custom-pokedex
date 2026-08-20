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
  animated3dUrl?: string;
  shinyAnimated3dUrl?: string;
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
  abilities?: { name: string }[];
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
  private is3DModelActive: boolean = false;
  private isGlobalShinyActive: boolean = false;
  private isGlobal3DActive: boolean = false;
  private isFiltersCollapsed: boolean = false;
  private isTableViewMode: boolean = false;
  private cardShinyState: Map<number, boolean> = new Map();
  private movesMethodFilter: 'level-up' | 'egg' | 'machine' = 'level-up';

  private currentFilteredGroups: PokemonSpeciesGroup[] = [];
  private currentModalIndex: number = -1;

  private searchInput!: HTMLInputElement;
  private genSelect!: HTMLSelectElement;
  private typeSelect!: HTMLSelectElement;
  private sortSelect!: HTMLSelectElement;
  private clearSearchBtn!: HTMLButtonElement;
  private resetAllBtn!: HTMLButtonElement;
  private emptyResetBtn!: HTMLButtonElement;
  private globalShinyBtn!: HTMLButtonElement;
  private global3DBtn!: HTMLButtonElement;
  private toggleFiltersBtn!: HTMLButtonElement;
  private toggleFiltersText!: HTMLSpanElement;
  private viewModeBtn!: HTMLButtonElement;
  private viewModeText!: HTMLSpanElement;
  private filterBar!: HTMLDivElement;
  private backToTopBtn!: HTMLButtonElement;
  private gridContainer!: HTMLDivElement;
  private tableContainer!: HTMLDivElement;
  private tableBody!: HTMLTableSectionElement;
  private emptyState!: HTMLDivElement;
  private totalCountText!: HTMLSpanElement;
  private modalBackdrop!: HTMLDivElement;
  private modalContent!: HTMLDivElement;
  private closeModalBtn!: HTMLButtonElement;
  private modalPrevBtn!: HTMLButtonElement;
  private modalNextBtn!: HTMLButtonElement;

  constructor() {
    this.initDOMReferences();
    this.attachEventListeners();
    this.loadData();
  }

  private initDOMReferences(): void {
    this.searchInput = document.getElementById('search-input') as HTMLInputElement;
    this.genSelect = document.getElementById('gen-select') as HTMLSelectElement;
    this.typeSelect = document.getElementById('type-select') as HTMLSelectElement;
    this.sortSelect = document.getElementById('sort-select') as HTMLSelectElement;
    this.clearSearchBtn = document.getElementById('clear-search-btn') as HTMLButtonElement;
    this.resetAllBtn = document.getElementById('reset-all-btn') as HTMLButtonElement;
    this.emptyResetBtn = document.getElementById('empty-reset-btn') as HTMLButtonElement;
    this.globalShinyBtn = document.getElementById('global-shiny-btn') as HTMLButtonElement;
    this.global3DBtn = document.getElementById('global-3d-btn') as HTMLButtonElement;
    this.toggleFiltersBtn = document.getElementById('toggle-filters-btn') as HTMLButtonElement;
    this.toggleFiltersText = document.getElementById('toggle-filters-text') as HTMLSpanElement;
    this.viewModeBtn = document.getElementById('view-mode-btn') as HTMLButtonElement;
    this.viewModeText = document.getElementById('view-mode-text') as HTMLSpanElement;
    this.filterBar = document.getElementById('filter-bar') as HTMLDivElement;
    this.backToTopBtn = document.getElementById('back-to-top-btn') as HTMLButtonElement;
    this.gridContainer = document.getElementById('pokemon-grid') as HTMLDivElement;
    this.tableContainer = document.getElementById('pokemon-table-container') as HTMLDivElement;
    this.tableBody = document.getElementById('table-body') as HTMLTableSectionElement;
    this.emptyState = document.getElementById('empty-state') as HTMLDivElement;
    this.totalCountText = document.getElementById('total-count-text') as HTMLSpanElement;
    this.modalBackdrop = document.getElementById('pokemon-modal') as HTMLDivElement;
    this.modalContent = document.getElementById('modal-content') as HTMLDivElement;
    this.closeModalBtn = document.getElementById('close-modal-btn') as HTMLButtonElement;
    this.modalPrevBtn = document.getElementById('modal-prev-btn') as HTMLButtonElement;
    this.modalNextBtn = document.getElementById('modal-next-btn') as HTMLButtonElement;
  }

  private attachEventListeners(): void {
    this.searchInput.addEventListener('input', () => {
      this.toggleClearSearchBtn();
      this.render();
    });

    if (this.genSelect) this.genSelect.addEventListener('change', () => this.render());
    if (this.typeSelect) this.typeSelect.addEventListener('change', () => this.render());
    if (this.sortSelect) this.sortSelect.addEventListener('change', () => this.render());

    this.clearSearchBtn.addEventListener('click', () => {
      this.searchInput.value = '';
      this.toggleClearSearchBtn();
      this.render();
    });

    if (this.viewModeBtn) {
      this.viewModeBtn.addEventListener('click', () => {
        this.isTableViewMode = !this.isTableViewMode;
        this.viewModeText.textContent = this.isTableViewMode ? 'Modo Grade' : 'Modo Planilha';
        this.render();
      });
    }

    if (this.toggleFiltersBtn) {
      this.toggleFiltersBtn.addEventListener('click', () => {
        this.isFiltersCollapsed = !this.isFiltersCollapsed;
        this.filterBar.classList.toggle('collapsed', this.isFiltersCollapsed);
        this.toggleFiltersText.textContent = this.isFiltersCollapsed ? 'Mostrar Filtros' : 'Filtros';
      });
    }

    if (this.backToTopBtn) {
      window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
          this.backToTopBtn.classList.remove('hidden');
        } else {
          this.backToTopBtn.classList.add('hidden');
        }
      });

      this.backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    if (this.globalShinyBtn) {
      this.globalShinyBtn.addEventListener('click', () => {
        this.isGlobalShinyActive = !this.isGlobalShinyActive;
        this.globalShinyBtn.textContent = this.isGlobalShinyActive ? '✨ Shiny: ON' : '✨ Shiny: OFF';
        this.globalShinyBtn.classList.toggle('active', this.isGlobalShinyActive);
        this.render();
      });
    }

    if (this.global3DBtn) {
      this.global3DBtn.addEventListener('click', () => {
        this.isGlobal3DActive = !this.isGlobal3DActive;
        this.global3DBtn.textContent = this.isGlobal3DActive ? '👾 3D: ON' : '👾 3D: OFF';
        this.global3DBtn.classList.toggle('active', this.isGlobal3DActive);
        this.render();
      });
    }

    // Sortable Table Headers Click
    const tableHeaders = document.querySelectorAll('.stats-table th.sortable');
    tableHeaders.forEach(th => {
      th.addEventListener('click', () => {
        const sortType = th.getAttribute('data-sort');
        if (!sortType) return;

        const cur = this.sortSelect ? this.sortSelect.value : '';
        if (sortType === 'id') {
          this.sortSelect.value = cur === 'id-asc' ? 'id-desc' : 'id-asc';
        } else if (sortType === 'name') {
          this.sortSelect.value = cur === 'name-asc' ? 'name-desc' : 'name-asc';
        } else if (sortType === 'bst') {
          this.sortSelect.value = cur === 'bst-desc' ? 'bst-asc' : 'bst-desc';
        } else if (['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'].includes(sortType)) {
          const descKey = `${sortType}-desc`;
          const ascKey = `${sortType}-asc`;
          this.sortSelect.value = cur === descKey ? ascKey : descKey;
        }

        this.render();
      });
    });

    this.resetAllBtn.addEventListener('click', () => this.resetFilters());
    this.emptyResetBtn.addEventListener('click', () => this.resetFilters());

    this.closeModalBtn.addEventListener('click', () => this.closeModal());
    this.modalBackdrop.addEventListener('click', (e) => {
      if (e.target === this.modalBackdrop) this.closeModal();
    });

    if (this.modalPrevBtn) {
      this.modalPrevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.navigateModal(-1);
      });
    }

    if (this.modalNextBtn) {
      this.modalNextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.navigateModal(1);
      });
    }

    document.addEventListener('keydown', (e) => {
      if (this.modalBackdrop.classList.contains('hidden')) return;

      if (e.key === 'Escape') this.closeModal();
      if (e.key === 'ArrowLeft') this.navigateModal(-1);
      if (e.key === 'ArrowRight') this.navigateModal(1);
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
    if (this.genSelect) this.genSelect.value = '';
    if (this.typeSelect) this.typeSelect.value = '';
    if (this.sortSelect) this.sortSelect.value = 'id-asc';
    this.isGlobalShinyActive = false;
    this.isGlobal3DActive = false;
    this.cardShinyState.clear();
    if (this.globalShinyBtn) {
      this.globalShinyBtn.textContent = '✨ Shiny: OFF';
      this.globalShinyBtn.classList.remove('active');
    }
    if (this.global3DBtn) {
      this.global3DBtn.textContent = '👾 3D: OFF';
      this.global3DBtn.classList.remove('active');
    }
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
    const genFilter = this.genSelect ? this.genSelect.value : '';
    const typeFilter = this.typeSelect ? this.typeSelect.value.trim().toLowerCase() : '';
    const sortVal = this.sortSelect ? this.sortSelect.value : 'id-asc';

    let filtered = this.speciesGroups.filter(group => {
      // Generation Filter
      if (genFilter) {
        const id = group.speciesId;
        if (genFilter === 'gen1' && (id < 1 || id > 151)) return false;
        if (genFilter === 'gen2' && (id < 152 || id > 251)) return false;
        if (genFilter === 'gen3' && (id < 252 || id > 386)) return false;
        if (genFilter === 'gen4' && (id < 387 || id > 493)) return false;
        if (genFilter === 'gen5' && (id < 494 || id > 649)) return false;
        if (genFilter === 'gen6' && (id < 650 || id > 721)) return false;
        if (genFilter === 'gen7' && (id < 722 || id > 809)) return false;
        if (genFilter === 'gen8' && (id < 810 || id > 905)) return false;
        if (genFilter === 'gen9' && id < 906) return false;
      }

      const matchingVarieties = group.varieties.filter(p => {
        if (typeFilter && !p.types.some(t => t.name.toLowerCase() === typeFilter)) {
          return false;
        }
        if (search) {
          const matchesName = p.name.toLowerCase().includes(search) || group.name.toLowerCase().includes(search);
          const matchesId = p.id.toString() === search || group.speciesId.toString() === search || `#${group.speciesId}` === search;
          const matchesMove = (p.moves || []).some(m => m.name.toLowerCase().includes(search));
          const matchesAbility = (p.abilities || []).some(a => a.name.toLowerCase().includes(search));

          if (!matchesName && !matchesId && !matchesMove && !matchesAbility) {
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

    // Sorting
    filtered.sort((a, b) => {
      const pA = a.selectedPokemon;
      const pB = b.selectedPokemon;

      if (sortVal === 'id-asc') return a.speciesId - b.speciesId;
      if (sortVal === 'id-desc') return b.speciesId - a.speciesId;
      if (sortVal === 'name-asc') return pA.name.localeCompare(pB.name);
      if (sortVal === 'name-desc') return pB.name.localeCompare(pA.name);

      const getStat = (p: PokemonCardData, statName: string): number => {
        const found = (p.stats || []).find(s => s.name === statName);
        return found ? found.baseStat : 0;
      };

      const getBst = (p: PokemonCardData): number => {
        return (p.stats || []).reduce((sum, s) => sum + (s.baseStat || 0), 0);
      };

      if (sortVal === 'bst-desc') return getBst(pB) - getBst(pA);
      if (sortVal === 'bst-asc') return getBst(pA) - getBst(pB);

      const statKeys = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'];
      for (const key of statKeys) {
        if (sortVal === `${key}-desc`) {
          return getStat(pB, key) - getStat(pA, key);
        }
        if (sortVal === `${key}-asc`) {
          return getStat(pA, key) - getStat(pB, key);
        }
      }

      return a.speciesId - b.speciesId;
    });

    return filtered;
  }

  private isCardShinyActive(speciesId: number): boolean {
    if (this.isGlobalShinyActive) return true;
    return !!this.cardShinyState.get(speciesId);
  }

  private getPokemonMediaUrl(p: PokemonCardData, isShiny: boolean, is3D: boolean): string {
    const id = p.id;
    if (is3D) {
      return isShiny
        ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/shiny/${id}.gif`
        : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${id}.gif`;
    }
    return isShiny
      ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${id}.png`
      : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
  }

  private getCardImageUrl(p: PokemonCardData, speciesId: number): string {
    const isShiny = this.isCardShinyActive(speciesId);
    return this.getPokemonMediaUrl(p, isShiny, this.isGlobal3DActive);
  }

  private render(): void {
    const filtered = this.filterGroups();
    this.currentFilteredGroups = filtered;

    const totalVarietiesCount = filtered.reduce((sum, g) => sum + g.varieties.length, 0);
    this.totalCountText.textContent = `${filtered.length} Espécies (${totalVarietiesCount} Formas)`;

    if (filtered.length === 0) {
      this.gridContainer.innerHTML = '';
      this.tableBody.innerHTML = '';
      this.emptyState.classList.remove('hidden');
      this.gridContainer.classList.add('hidden');
      this.tableContainer.classList.add('hidden');
      return;
    }

    this.emptyState.classList.add('hidden');

    if (this.isTableViewMode) {
      this.gridContainer.classList.add('hidden');
      this.tableContainer.classList.remove('hidden');
      this.renderTable(filtered);
    } else {
      this.tableContainer.classList.add('hidden');
      this.gridContainer.classList.remove('hidden');
      this.renderGrid(filtered);
    }
  }

  private renderGrid(filtered: PokemonSpeciesGroup[]): void {
    this.gridContainer.innerHTML = filtered.map(g => this.createCardHTML(g)).join('');

    filtered.forEach(group => {
      const cardEl = document.getElementById(`species-card-${group.speciesId}`);
      if (cardEl) {
        cardEl.addEventListener('click', (e) => {
          const target = e.target as HTMLElement;
          if (target.closest('.cry-btn') || target.closest('.form-pill') || target.closest('.card-shiny-btn')) return;
          this.openModal(group);
        });
      }

      const cardShinyBtn = document.getElementById(`card-shiny-btn-${group.speciesId}`);
      if (cardShinyBtn) {
        cardShinyBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const currentState = this.isCardShinyActive(group.speciesId);
          this.cardShinyState.set(group.speciesId, !currentState);
          this.updateCardUI(group);
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

  private renderTable(filtered: PokemonSpeciesGroup[]): void {
    this.tableBody.innerHTML = filtered.map(g => {
      const p = g.selectedPokemon;
      const formattedId = `#${g.speciesId.toString().padStart(4, '0')}`;
      const imgUrl = this.getCardImageUrl(p, g.speciesId);
      const hdClass = this.isGlobal3DActive ? '' : 'hd-art';

      const typeBadges = p.types
        .map(t => {
          const color = TYPE_COLORS[t.name.toLowerCase()] || '#a8a77a';
          return `<span class="type-badge" style="background-color: ${color}; font-size: 0.65rem; padding: 0.15rem 0.45rem;">${t.name}</span>`;
        })
        .join(' ');

      const getStat = (name: string) => {
        const found = p.stats.find(s => s.name === name);
        return found ? found.baseStat : 0;
      };

      const hp = getStat('hp');
      const atk = getStat('attack');
      const def = getStat('defense');
      const spa = getStat('special-attack');
      const spd = getStat('special-defense');
      const spe = getStat('speed');
      const bst = hp + atk + def + spa + spd + spe;

      return `
        <tr id="table-row-${g.speciesId}">
          <td style="font-weight: 800; color: #94a3b8;">${formattedId}</td>
          <td><img class="table-img ${hdClass}" src="${imgUrl}" alt="${p.name}" loading="lazy"></td>
          <td style="font-weight: 700; color: #ffffff; text-transform: capitalize;">${p.name}</td>
          <td>${typeBadges}</td>
          <td class="stat-cell" style="color: #4ade80;">${hp}</td>
          <td class="stat-cell" style="color: #f87171;">${atk}</td>
          <td class="stat-cell" style="color: #fbbf24;">${def}</td>
          <td class="stat-cell" style="color: #c084fc;">${spa}</td>
          <td class="stat-cell" style="color: #a7f3d0;">${spd}</td>
          <td class="stat-cell" style="color: #f472b6;">${spe}</td>
          <td><span class="bst-cell">${bst}</span></td>
        </tr>
      `;
    }).join('');

    filtered.forEach(group => {
      const rowEl = document.getElementById(`table-row-${group.speciesId}`);
      if (rowEl) {
        rowEl.addEventListener('click', () => this.openModal(group));
      }
    });
  }

  private updateCardUI(group: PokemonSpeciesGroup): void {
    const p = group.selectedPokemon;
    const cardEl = document.getElementById(`species-card-${group.speciesId}`);
    if (!cardEl) return;

    const isShiny = this.isCardShinyActive(group.speciesId);

    const titleEl = cardEl.querySelector('.card-title');
    if (titleEl) titleEl.textContent = p.name;

    const imgEl = cardEl.querySelector('.card-artwork') as HTMLImageElement;
    if (imgEl) {
      imgEl.src = this.getCardImageUrl(p, group.speciesId);
      imgEl.alt = p.name;
      if (this.isGlobal3DActive) {
        imgEl.classList.remove('hd-art');
      } else {
        imgEl.classList.add('hd-art');
      }
    }

    const shinyBtn = document.getElementById(`card-shiny-btn-${group.speciesId}`);
    if (shinyBtn) {
      shinyBtn.classList.toggle('active', isShiny);
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
    const isShiny = this.isCardShinyActive(group.speciesId);

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

    const imgUrl = this.getCardImageUrl(p, group.speciesId);
    const hdClass = this.isGlobal3DActive ? '' : 'hd-art';

    return `
      <div id="species-card-${group.speciesId}" class="pokemon-card">
        <button id="card-shiny-btn-${group.speciesId}" class="card-shiny-btn ${isShiny ? 'active' : ''}" title="Alternar forma Shiny">✨ Shiny</button>
        <span class="card-number">${formattedId}</span>
        <div class="card-img-container">
          <img class="card-artwork ${hdClass}" src="${imgUrl}" alt="${p.name}" loading="lazy" onerror="if(this.src.includes('/showdown/shiny/')){this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${p.id}.png';}else if(this.src.includes('/showdown/')){this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${p.id}.png';}else if(this.src.includes('/official-artwork/shiny/')){this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${p.id}.png';}else{this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png';}">
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
    this.currentModalIndex = this.currentFilteredGroups.findIndex(g => g.speciesId === group.speciesId);
    this.activeModalTab = 'general';
    this.isShinyActive = this.isCardShinyActive(group.speciesId);
    this.is3DModelActive = this.isGlobal3DActive;
    this.movesMethodFilter = 'level-up';
    this.renderModalContent(group);
    this.modalBackdrop.classList.remove('hidden');
  }

  private navigateModal(direction: number): void {
    if (this.currentFilteredGroups.length === 0 || this.currentModalIndex === -1) return;

    let newIndex = this.currentModalIndex + direction;
    if (newIndex < 0) {
      newIndex = this.currentFilteredGroups.length - 1;
    } else if (newIndex >= this.currentFilteredGroups.length) {
      newIndex = 0;
    }

    this.currentModalIndex = newIndex;
    const targetGroup = this.currentFilteredGroups[newIndex];
    if (targetGroup) {
      this.isShinyActive = this.isCardShinyActive(targetGroup.speciesId);
      this.renderModalContent(targetGroup);
    }
  }

  private async renderModalContent(group: PokemonSpeciesGroup): Promise<void> {
    try {
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

      // Natural Proportional Image Display (Preserves character scale proportions!)
      const imgDisplayUrl = this.getPokemonMediaUrl(p, this.isShinyActive, this.is3DModelActive);
      const hdClassModal = this.is3DModelActive ? '' : 'hd-art';

      const mediaHeroHTML = `
        <div class="modal-hero-container">
          <img class="modal-hero-img ${hdClassModal}" src="${imgDisplayUrl}" alt="${p.name}" onerror="if(this.src.includes('/showdown/shiny/')){this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${p.id}.png';}else if(this.src.includes('/showdown/')){this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${p.id}.png';}else if(this.src.includes('/official-artwork/shiny/')){this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${p.id}.png';}else{this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png';}">
        </div>
      `;

      // Shiny & 3D Model Toggles Header
      const togglesHTML = `
        <div style="display: flex; justify-content: center; align-items: center; gap: 0.75rem; margin-bottom: 1.25rem; flex-wrap: wrap;">
          <button id="modal-shiny-toggle" class="form-pill ${this.isShinyActive ? 'active' : ''}" style="background: ${this.isShinyActive ? 'linear-gradient(135deg, #f59e0b, #ef4444)' : 'rgba(255,255,255,0.1)'}; color: #ffffff; padding: 0.4rem 1rem; font-weight: 800; border-radius: 9999px; border: 1px solid rgba(255,255,255,0.2); cursor: pointer; transition: all 0.3s ease;">
            ${this.isShinyActive ? '✨ Forma Shiny Ativa!' : '✨ Alternar para Shiny'}
          </button>
          <button id="modal-3d-toggle" class="form-pill ${this.is3DModelActive ? 'active' : ''}" style="background: ${this.is3DModelActive ? '#38bdf8' : 'rgba(255,255,255,0.1)'}; color: ${this.is3DModelActive ? '#0f172a' : '#ffffff'}; padding: 0.4rem 1rem; font-weight: 800; border-radius: 9999px; border: 1px solid rgba(255,255,255,0.2); cursor: pointer; transition: all 0.3s ease;">
            ${this.is3DModelActive ? '👾 Modelo 3D Animado Ativo' : '👾 Ver Modelo 3D Animado'}
          </button>
        </div>
      `;

      // Tabs Header
      const tabsHTML = `
        <div style="display: flex; gap: 0.4rem; margin-bottom: 1.25rem; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.5rem; overflow-x: auto;">
          <button id="modal-tab-general" class="form-pill ${this.activeModalTab === 'general' ? 'active' : ''}" style="padding: 0.5rem 0.8rem; font-weight: 700; border-radius: 12px; font-size: 0.85rem; white-space: nowrap;">📊 Stats</button>
          <button id="modal-tab-evolution" class="form-pill ${this.activeModalTab === 'evolution' ? 'active' : ''}" style="padding: 0.5rem 0.8rem; font-weight: 700; border-radius: 12px; font-size: 0.85rem; white-space: nowrap;">🧬 Evoluções</button>
          <button id="modal-tab-moves" class="form-pill ${this.activeModalTab === 'moves' ? 'active' : ''}" style="padding: 0.5rem 0.8rem; font-weight: 700; border-radius: 12px; font-size: 0.85rem; white-space: nowrap;">📜 Golpes (${(p.moves || []).length})</button>
          <button id="modal-tab-encounters" class="form-pill ${this.activeModalTab === 'encounters' ? 'active' : ''}" style="padding: 0.5rem 0.8rem; font-weight: 700; border-radius: 12px; font-size: 0.85rem; white-space: nowrap;">🗺️ Locais</button>
          <button id="modal-tab-competitive" class="form-pill ${this.activeModalTab === 'competitive' ? 'active' : ''}" style="padding: 0.5rem 0.8rem; font-weight: 700; border-radius: 12px; font-size: 0.85rem; white-space: nowrap;">⚔️ Competitivo</button>
        </div>
      `;

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
        const compData = await this.smogonService.getCompetitiveData(p.name);
        
        const warningBanner = compData.isOfflineFallback
          ? `<div style="background: rgba(245,158,11,0.15); border: 1px solid rgba(245,158,11,0.4); color: #fbbf24; padding: 0.75rem 1rem; border-radius: 12px; font-size: 0.85rem; margin-bottom: 1.25rem; text-align: center;">
               ⚠️ ${compData.warningMessage}
             </div>`
          : '';

        const movesetsHTML = compData.movesets.map((m: MovesetOption, buildIdx: number) => `
          <div style="background: rgba(15,23,42,0.6); padding: 1.1rem; border-radius: 14px; margin-bottom: 1rem; text-align: left; border: 1px solid ${buildIdx === 0 ? '#38bdf8' : 'rgba(255,255,255,0.08)'}; box-shadow: ${buildIdx === 0 ? '0 0 15px rgba(56,189,248,0.2)' : 'none'};">
            <div style="font-weight: 800; color: #38bdf8; font-size: 1.05rem; margin-bottom: 0.6rem; display: flex; align-items: center; justify-content: space-between;">
              <span>🎯 Build #${buildIdx + 1}: ${m.name} <span style="font-size: 0.7rem; background: ${buildIdx === 0 ? '#38bdf8' : 'rgba(255,255,255,0.15)'}; color: ${buildIdx === 0 ? '#0f172a' : '#f8fafc'}; padding: 0.15rem 0.5rem; border-radius: 6px; font-weight: 800; margin-left: 0.5rem;">${m.format || 'Gen 9 Competitive'}</span></span>
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
          <h2 style="font-size: 2.25rem; font-weight: 800; text-transform: capitalize; margin: 0.2rem 0 0.8rem 0; color: #ffffff;">${p.name}</h2>
          
          <div style="display: flex; justify-content: center; gap: 0.5rem; margin-bottom: 1.25rem;">
            ${typeBadges}
          </div>

          ${mediaHeroHTML}
          ${togglesHTML}
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
      const model3dToggleBtn = document.getElementById('modal-3d-toggle');

      if (tabGenBtn) tabGenBtn.addEventListener('click', () => { this.activeModalTab = 'general'; this.renderModalContent(group); });
      if (tabEvoBtn) tabEvoBtn.addEventListener('click', () => { this.activeModalTab = 'evolution'; this.renderModalContent(group); });
      if (tabMovesBtn) tabMovesBtn.addEventListener('click', () => { this.activeModalTab = 'moves'; this.renderModalContent(group); });
      if (tabEncBtn) tabEncBtn.addEventListener('click', () => { this.activeModalTab = 'encounters'; this.renderModalContent(group); });
      if (tabCompBtn) tabCompBtn.addEventListener('click', () => { this.activeModalTab = 'competitive'; this.renderModalContent(group); });

      if (shinyToggleBtn) {
        shinyToggleBtn.addEventListener('click', () => {
          this.isShinyActive = !this.isShinyActive;
          this.cardShinyState.set(group.speciesId, this.isShinyActive);
          this.updateCardUI(group);
          this.renderModalContent(group);
        });
      }

      if (model3dToggleBtn) {
        model3dToggleBtn.addEventListener('click', () => {
          this.is3DModelActive = !this.is3DModelActive;
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
    } catch (err) {
      console.error('Error rendering modal content:', err);
    }
  }

  private closeModal(): void {
    this.modalBackdrop.classList.add('hidden');
    this.currentModalIndex = -1;
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new PokedexApp();
});
