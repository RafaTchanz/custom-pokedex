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
  varieties: PokemonCardData[];
  selectedPokemon: PokemonCardData;
}

const TYPE_COLORS: Record<string, string> = {
  normal: '#A8A77A',
  fire: '#EE8130',
  water: '#6390F0',
  grass: '#7AC74C',
  electric: '#F7D02C',
  ice: '#96D9D6',
  fighting: '#C22E28',
  poison: '#A33EA1',
  ground: '#E2BF65',
  flying: '#A98FF3',
  psychic: '#F95587',
  bug: '#A6B91A',
  rock: '#B6A136',
  ghost: '#735797',
  dragon: '#6F35FC',
  dark: '#705746',
  steel: '#B7B7CE',
  fairy: '#D685AD'
};

import { SmogonService, CompetitiveData, MovesetOption } from './services/smogonService';
import { TeamBuilderService, TeamMember, StatBlock, FormatMode, ALL_TYPES, TYPE_CHART, POPULAR_ITEMS, NATURES } from './services/teamBuilderService';

class PokedexApp {
  private pokemonData: PokemonCardData[] = [];
  private speciesGroups: PokemonSpeciesGroup[] = [];
  private currentAudio: HTMLAudioElement | null = null;
  private currentPlayingBtn: HTMLButtonElement | null = null;
  private smogonService: SmogonService = new SmogonService();
  private teamBuilderService: TeamBuilderService = new TeamBuilderService();
  private currentViewMode: 'cards' | 'table' | 'builder' = 'cards';
  private activeSlotIndexToPick: number | null = null;
  private activeModalTab: 'general' | 'moves' | 'evolution' | 'encounters' | 'competitive' = 'general';
  private isShinyActive: boolean = false;
  private is3DModelActive: boolean = false;
  private isGlobalShinyActive: boolean = false;
  private isGlobal3DActive: boolean = false;
  private isFiltersCollapsed: boolean = false;
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
  private viewModeCards!: HTMLButtonElement;
  private viewModeTable!: HTMLButtonElement;
  private viewModeBuilder!: HTMLButtonElement;
  private teamBuilderContainer!: HTMLDivElement;
  private pickerModal!: HTMLDivElement;
  private pickerGrid!: HTMLDivElement;
  private pickerSearchInput!: HTMLInputElement;
  private closePickerBtn!: HTMLButtonElement;
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
    this.viewModeCards = document.getElementById('view-mode-cards') as HTMLButtonElement;
    this.viewModeTable = document.getElementById('view-mode-table') as HTMLButtonElement;
    this.viewModeBuilder = document.getElementById('view-mode-builder') as HTMLButtonElement;
    this.teamBuilderContainer = document.getElementById('team-builder-container') as HTMLDivElement;
    this.pickerModal = document.getElementById('pokemon-picker-modal') as HTMLDivElement;
    this.pickerGrid = document.getElementById('picker-grid') as HTMLDivElement;
    this.pickerSearchInput = document.getElementById('picker-search-input') as HTMLInputElement;
    this.closePickerBtn = document.getElementById('close-picker-btn') as HTMLButtonElement;
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

    if (this.viewModeCards) {
      this.viewModeCards.addEventListener('click', () => {
        this.currentViewMode = 'cards';
        this.render();
      });
    }

    if (this.viewModeTable) {
      this.viewModeTable.addEventListener('click', () => {
        this.currentViewMode = 'table';
        this.render();
      });
    }

    if (this.viewModeBuilder) {
      this.viewModeBuilder.addEventListener('click', () => {
        this.currentViewMode = 'builder';
        this.render();
      });
    }

    if (this.closePickerBtn) {
      this.closePickerBtn.addEventListener('click', () => {
        this.pickerModal.classList.add('hidden');
        this.activeSlotIndexToPick = null;
      });
    }

    if (this.pickerSearchInput) {
      this.pickerSearchInput.addEventListener('input', () => {
        this.renderPickerGrid();
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

    // Update Segmented Control UI
    if (this.viewModeCards) this.viewModeCards.classList.toggle('active', this.currentViewMode === 'cards');
    if (this.viewModeTable) this.viewModeTable.classList.toggle('active', this.currentViewMode === 'table');
    if (this.viewModeBuilder) this.viewModeBuilder.classList.toggle('active', this.currentViewMode === 'builder');

    if (this.currentViewMode === 'builder') {
      this.gridContainer.classList.add('hidden');
      this.tableContainer.classList.add('hidden');
      this.emptyState.classList.add('hidden');
      if (this.teamBuilderContainer) {
        this.teamBuilderContainer.classList.remove('hidden');
        this.renderTeamBuilder();
      }
      return;
    }

    if (this.teamBuilderContainer) {
      this.teamBuilderContainer.classList.add('hidden');
    }

    if (filtered.length === 0) {
      this.gridContainer.innerHTML = '';
      this.tableBody.innerHTML = '';
      this.emptyState.classList.remove('hidden');
      this.gridContainer.classList.add('hidden');
      this.tableContainer.classList.add('hidden');
      return;
    }

    this.emptyState.classList.add('hidden');

    if (this.currentViewMode === 'table') {
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
        
        if (!compData.movesets || compData.movesets.length === 0) {
          tabBodyHTML = `
            <div style="background: rgba(30,41,59,0.8); border: 1px solid rgba(56,189,248,0.25); padding: 2.25rem 1.5rem; border-radius: 20px; text-align: center; margin: 1rem 0;">
              <div style="font-size: 2.75rem; margin-bottom: 0.75rem;">📊</div>
              <h3 style="font-size: 1.15rem; font-weight: 800; color: #f8fafc; margin-bottom: 0.5rem;">
                Não há dados competitivos relevantes no Smogon para este Pokémon
              </h3>
              <p style="font-size: 0.85rem; color: #94a3b8; max-width: 480px; margin: 0 auto 1.25rem auto; line-height: 1.5;">
                Geralmente ocorre com Pokémons em estágio inicial de evolução (NFE), pré-evoluções ou formas não utilizadas nos formatos competitivos oficiais do Smogon (OU, VGC, Ubers).
              </p>
              <div style="display: inline-flex; gap: 1.5rem; background: rgba(15,23,42,0.6); padding: 0.75rem 1.25rem; border-radius: 12px; font-size: 0.85rem; border: 1px solid rgba(255,255,255,0.08);">
                <div><strong style="color: #94a3b8;">Classificação / Tier:</strong> <span style="color: #38bdf8; font-weight: 800;">${compData.tier || 'Untiered / Casual'}</span></div>
              </div>
            </div>
          `;
        } else {
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

  private renderTeamBuilder(): void {
    if (!this.teamBuilderContainer) return;

    const isChampions = this.teamBuilderService.formatMode === 'champions';

    const membersHTML = this.teamBuilderService.members.map((m, slotIdx) => {
      if (!m.name) {
        return `
          <div class="team-slot-card">
            <button class="add-member-btn" data-slot="${slotIdx}">
              <span class="add-plus-icon">+</span>
              <span>Adicionar Pokémon #${slotIdx + 1}</span>
            </button>
          </div>
        `;
      }

      const totalPoints = isChampions ? this.teamBuilderService.getChampionsTotalPoints(m) : this.teamBuilderService.getEVsTotalPoints(m);
      const maxTotal = isChampions ? 66 : 510;
      const typeBadges = (m.types || []).map(t => {
        const color = TYPE_COLORS[t.toLowerCase()] || '#a8a77a';
        return `<span class="type-badge" style="background: ${color}; font-size: 0.65rem; padding: 0.15rem 0.45rem;">${t}</span>`;
      }).join(' ');

      const movesSelectHTML = [0, 1, 2, 3].map(moveIdx => {
        const selectedMove = m.moves[moveIdx] || '';
        const optionsHTML = `<option value="">-- Selecionar Golpe #${moveIdx + 1} --</option>` +
          (m.availableMoves || []).map(mv => `<option value="${mv.name}" ${mv.name.toLowerCase() === selectedMove.toLowerCase() ? 'selected' : ''}>${mv.name} (${mv.type}${mv.power ? ` • ${mv.power} Pow` : ''})</option>`).join('');

        return `
          <div style="margin-bottom: 0.35rem;">
            <select class="member-move-select" data-slot="${slotIdx}" data-move-idx="${moveIdx}" style="width: 100%; padding: 0.4rem; background: rgba(15,23,42,0.8); border: 1px solid var(--border-color); border-radius: 8px; color: #f8fafc; font-size: 0.775rem;">
              ${optionsHTML}
            </select>
          </div>
        `;
      }).join('');

      const statKeys: (keyof StatBlock)[] = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'];
      const statLabels: Record<keyof StatBlock, string> = { hp: 'HP', atk: 'Atk', def: 'Def', spa: 'SpA', spd: 'SpD', spe: 'Spe' };

      const statsInputsHTML = statKeys.map(k => {
        const val = isChampions ? m.championsPoints[k] : m.evs[k];
        const maxSingle = isChampions ? 32 : 252;
        return `
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.35rem; margin-bottom: 0.25rem;">
            <span style="font-size: 0.725rem; font-weight: 700; color: #94a3b8; width: 30px;">${statLabels[k]}</span>
            <input type="range" class="stat-range-input" data-slot="${slotIdx}" data-stat="${k}" min="0" max="${maxSingle}" value="${val}" style="flex: 1; accent-color: var(--accent-blue);">
            <input type="number" class="stat-num-input" data-slot="${slotIdx}" data-stat="${k}" min="0" max="${maxSingle}" value="${val}" style="width: 42px; padding: 0.2rem; background: rgba(0,0,0,0.3); border: 1px solid var(--border-color); border-radius: 6px; color: #38bdf8; font-size: 0.75rem; font-weight: 800; text-align: center;">
          </div>
        `;
      }).join('');

      const itemsOptions = POPULAR_ITEMS.map(it => `<option value="${it}" ${m.item === it ? 'selected' : ''}>${it}</option>`).join('');
      const naturesOptions = Object.keys(NATURES).map(n => `<option value="${n}" ${m.nature === n ? 'selected' : ''}>${n} (${NATURES[n].label})</option>`).join('');
      const abilitiesOptions = (m.availableAbilities || ['Standard Ability']).map(ab => `<option value="${ab}" ${m.ability === ab ? 'selected' : ''}>${ab}</option>`).join('');
      const teraOptions = ALL_TYPES.map(t => `<option value="${t.toUpperCase()}" ${m.teraType === t.toUpperCase() ? 'selected' : ''}>${t.charAt(0).toUpperCase() + t.slice(1)}</option>`).join('');

      return `
        <div class="team-slot-card filled">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem;">
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <img src="${m.officialArtworkUrl || m.spriteUrl}" alt="${m.name}" style="width: 55px; height: 55px; object-fit: contain;">
              <div>
                <h4 style="margin: 0; font-size: 1rem; font-weight: 800; text-transform: capitalize; color: #f8fafc;">${m.name}</h4>
                <div style="margin-top: 0.25rem;">${typeBadges}</div>
              </div>
            </div>
            <button class="remove-member-btn" data-slot="${slotIdx}" style="background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.3); color: #fca5a5; padding: 0.35rem 0.65rem; border-radius: 8px; font-size: 0.75rem; font-weight: 700; cursor: pointer;">&times; Remover</button>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.4rem; margin-bottom: 0.6rem;">
            <div>
              <label style="font-size: 0.7rem; color: #94a3b8; font-weight: 700;">Habilidade</label>
              <select class="member-ability-select" data-slot="${slotIdx}" style="width: 100%; padding: 0.35rem; background: rgba(15,23,42,0.8); border: 1px solid var(--border-color); border-radius: 8px; color: #f8fafc; font-size: 0.75rem;">
                ${abilitiesOptions}
              </select>
            </div>
            <div>
              <label style="font-size: 0.7rem; color: #94a3b8; font-weight: 700;">Item</label>
              <select class="member-item-select" data-slot="${slotIdx}" style="width: 100%; padding: 0.35rem; background: rgba(15,23,42,0.8); border: 1px solid var(--border-color); border-radius: 8px; color: #f8fafc; font-size: 0.75rem;">
                ${itemsOptions}
              </select>
            </div>
            <div>
              <label style="font-size: 0.7rem; color: #94a3b8; font-weight: 700;">Nature</label>
              <select class="member-nature-select" data-slot="${slotIdx}" style="width: 100%; padding: 0.35rem; background: rgba(15,23,42,0.8); border: 1px solid var(--border-color); border-radius: 8px; color: #f8fafc; font-size: 0.75rem;">
                ${naturesOptions}
              </select>
            </div>
            <div>
              <label style="font-size: 0.7rem; color: #94a3b8; font-weight: 700;">Tera Type</label>
              <select class="member-tera-select" data-slot="${slotIdx}" style="width: 100%; padding: 0.35rem; background: rgba(15,23,42,0.8); border: 1px solid var(--border-color); border-radius: 8px; color: #f8fafc; font-size: 0.75rem;">
                ${teraOptions}
              </select>
            </div>
          </div>

          <div style="font-size: 0.75rem; font-weight: 800; color: #38bdf8; margin-bottom: 0.35rem;">⚔️ Golpes Selecionados (Movepool):</div>
          ${movesSelectHTML}

          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.6rem; margin-bottom: 0.35rem; font-size: 0.75rem;">
            <span style="font-weight: 800; color: #f8fafc;">${isChampions ? 'Pontos de Atributo' : 'EVs'}:</span>
            <span style="font-weight: 800; color: ${totalPoints > maxTotal ? '#ef4444' : '#38bdf8'};">${totalPoints} / ${maxTotal} Pts</span>
          </div>
          ${statsInputsHTML}
        </div>
      `;
    }).join('');

    const coverageList = this.teamBuilderService.analyzeTeamCoverage();
    const coverageCardsHTML = coverageList.map(cov => {
      const typeColor = TYPE_COLORS[cov.type.toLowerCase()] || '#94a3b8';

      return `
        <div class="coverage-pill" style="border-left: 4px solid ${typeColor};">
          <div style="font-weight: 800; text-transform: uppercase; font-size: 0.725rem; color: ${typeColor};">${cov.type}</div>
          <div style="font-size: 0.7rem; color: #cbd5e1; margin-top: 0.2rem;">
            <div>🛡️ Fraqueza: <strong style="color: ${cov.weakCount > 2 ? '#ef4444' : '#f8fafc'};">${cov.weakCount}</strong></div>
            <div>🛡️ Resistência: <strong style="color: #4ade80;">${cov.resistCount}</strong></div>
            <div>⚔️ Golpe 2x+: <strong style="color: #38bdf8;">${cov.superEffectiveMovesCount}</strong></div>
          </div>
        </div>
      `;
    }).join('');

    this.teamBuilderContainer.innerHTML = `
      <div class="team-header-bar">
        <div class="team-title-group">
          <h2>⚔️ Criador e Construtor de Time</h2>
          <p>Monte e analise sua equipe de 6 Pokémons com regras personalizadas por formato</p>
        </div>

        <div style="display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;">
          <div class="format-switcher">
            <button class="format-btn ${isChampions ? 'active' : ''}" data-format="champions">🏆 Pokémon Champions</button>
            <button class="format-btn ${!isChampions ? 'sv-active' : ''}" data-format="scarlet-violet">🔴 Scarlet & Violet</button>
          </div>
          <button id="export-team-btn" style="background: var(--accent-blue); color: #0f172a; border: none; font-weight: 800; font-size: 0.85rem; padding: 0.55rem 1rem; border-radius: 12px; cursor: pointer;">📋 Exportar Time</button>
        </div>
      </div>

      <div style="background: rgba(15,23,42,0.6); border: 1px solid rgba(56,189,248,0.25); padding: 0.85rem 1.25rem; border-radius: 14px; margin-bottom: 1.5rem; font-size: 0.85rem; color: #94a3b8; display: flex; align-items: center; gap: 0.75rem;">
        <span style="font-size: 1.25rem;">ℹ️</span>
        <div>
          ${isChampions
            ? `<strong style="color: #fbbf24;">Regras Pokémon Champions:</strong> Todos os IVs são fixados em <strong>31 (6IV)</strong> no nível 50. Distribua até <strong>66 Pontos de Atributo</strong> (máximo de 32 pontos por status individual).`
            : `<strong style="color: #38bdf8;">Regras Scarlet & Violet:</strong> Distribua até <strong>510 EVs</strong> (máximo de 252 por status) e ajuste os IVs de 0 a 31.`
          }
        </div>
      </div>

      <div class="team-slots-grid">
        ${membersHTML}
      </div>

      <div class="coverage-dashboard">
        <h3>📊 Análise de Vantagens e Desvantagens do Time (Matriz Defensiva & Golpes)</h3>
        <p style="font-size: 0.825rem; color: var(--text-muted); margin: 0;">Análise em tempo real das fraquezas defensivas, resistências e da cobertura de golpes súper efetivos dos 6 membros contra todos os 18 tipos elementares.</p>
        <div class="coverage-grid">
          ${coverageCardsHTML}
        </div>
      </div>
    `;

    this.attachTeamBuilderEvents();
  }

  private attachTeamBuilderEvents(): void {
    if (!this.teamBuilderContainer) return;

    // Format buttons click
    const formatBtns = this.teamBuilderContainer.querySelectorAll('.format-btn');
    formatBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.getAttribute('data-format') as FormatMode;
        this.teamBuilderService.setFormatMode(mode);
        this.renderTeamBuilder();
      });
    });

    // Add member buttons click
    const addBtns = this.teamBuilderContainer.querySelectorAll('.add-member-btn');
    addBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const slotIdx = parseInt(btn.getAttribute('data-slot') || '0', 10);
        this.openPokemonPicker(slotIdx);
      });
    });

    // Remove member buttons click
    const removeBtns = this.teamBuilderContainer.querySelectorAll('.remove-member-btn');
    removeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const slotIdx = parseInt(btn.getAttribute('data-slot') || '0', 10);
        this.teamBuilderService.members[slotIdx] = this.teamBuilderService.createEmptyMember(slotIdx);
        this.renderTeamBuilder();
      });
    });

    // Move selects change
    const moveSelects = this.teamBuilderContainer.querySelectorAll('.member-move-select');
    moveSelects.forEach(sel => {
      sel.addEventListener('change', (e) => {
        const target = e.target as HTMLSelectElement;
        const slotIdx = parseInt(target.getAttribute('data-slot') || '0', 10);
        const moveIdx = parseInt(target.getAttribute('data-move-idx') || '0', 10);
        this.teamBuilderService.members[slotIdx].moves[moveIdx] = target.value;
        this.renderTeamBuilder();
      });
    });

    // Ability, Item, Nature, Tera selects
    const abilitySelects = this.teamBuilderContainer.querySelectorAll('.member-ability-select');
    abilitySelects.forEach(s => {
      s.addEventListener('change', (e) => {
        const target = e.target as HTMLSelectElement;
        const slotIdx = parseInt(target.getAttribute('data-slot') || '0', 10);
        this.teamBuilderService.members[slotIdx].ability = target.value;
      });
    });

    const itemSelects = this.teamBuilderContainer.querySelectorAll('.member-item-select');
    itemSelects.forEach(s => {
      s.addEventListener('change', (e) => {
        const target = e.target as HTMLSelectElement;
        const slotIdx = parseInt(target.getAttribute('data-slot') || '0', 10);
        this.teamBuilderService.members[slotIdx].item = target.value;
      });
    });

    const natureSelects = this.teamBuilderContainer.querySelectorAll('.member-nature-select');
    natureSelects.forEach(s => {
      s.addEventListener('change', (e) => {
        const target = e.target as HTMLSelectElement;
        const slotIdx = parseInt(target.getAttribute('data-slot') || '0', 10);
        this.teamBuilderService.members[slotIdx].nature = target.value;
      });
    });

    const teraSelects = this.teamBuilderContainer.querySelectorAll('.member-tera-select');
    teraSelects.forEach(s => {
      s.addEventListener('change', (e) => {
        const target = e.target as HTMLSelectElement;
        const slotIdx = parseInt(target.getAttribute('data-slot') || '0', 10);
        this.teamBuilderService.members[slotIdx].teraType = target.value;
      });
    });

    // Range & Number inputs for Points/EVs
    const rangeInputs = this.teamBuilderContainer.querySelectorAll('.stat-range-input, .stat-num-input');
    rangeInputs.forEach(inp => {
      inp.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement;
        const slotIdx = parseInt(target.getAttribute('data-slot') || '0', 10);
        const statKey = target.getAttribute('data-stat') as keyof StatBlock;
        const val = parseInt(target.value || '0', 10);

        if (this.teamBuilderService.formatMode === 'champions') {
          this.teamBuilderService.members[slotIdx].championsPoints[statKey] = val;
        } else {
          this.teamBuilderService.members[slotIdx].evs[statKey] = val;
        }
        this.renderTeamBuilder();
      });
    });

    // Export button click
    const exportBtn = document.getElementById('export-team-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const text = this.teamBuilderService.exportShowdownText();
        navigator.clipboard.writeText(text).then(() => {
          alert('📋 Time exportado com sucesso para a sua área de transferência!');
        }).catch(() => {
          alert(text);
        });
      });
    }
  }

  private openPokemonPicker(slotIndex: number): void {
    this.activeSlotIndexToPick = slotIndex;
    this.pickerModal.classList.remove('hidden');
    this.renderPickerGrid();
  }

  private renderPickerGrid(): void {
    if (!this.pickerGrid) return;

    const term = (this.pickerSearchInput?.value || '').toLowerCase().trim();
    const filteredGroups = this.speciesGroups.filter(g => {
      if (!term) return true;
      const p = g.selectedPokemon;
      return p.name.toLowerCase().includes(term) ||
             p.id.toString().includes(term) ||
             p.types.some(t => t.name.toLowerCase().includes(term));
    });

    this.pickerGrid.innerHTML = filteredGroups.slice(0, 100).map(g => {
      const p = g.selectedPokemon;
      const artwork = p.media.officialArtworkUrl || p.media.spriteUrl;
      return `
        <div class="picker-item" data-species-id="${g.speciesId}">
          <img src="${artwork}" alt="${p.name}">
          <div class="picker-item-name">${p.name}</div>
        </div>
      `;
    }).join('');

    const items = this.pickerGrid.querySelectorAll('.picker-item');
    items.forEach(it => {
      it.addEventListener('click', () => {
        const sId = parseInt(it.getAttribute('data-species-id') || '0', 10);
        const group = this.speciesGroups.find(g => g.speciesId === sId);
        if (group && this.activeSlotIndexToPick !== null) {
          const p = group.selectedPokemon;
          const member = this.teamBuilderService.members[this.activeSlotIndexToPick];
          member.speciesId = group.speciesId;
          member.pokemonId = p.id;
          member.name = p.name;
          member.types = p.types.map(t => t.name);
          member.spriteUrl = p.media.spriteUrl;
          member.officialArtworkUrl = p.media.officialArtworkUrl;
          member.availableAbilities = (p.abilities || []).map(a => a.name);
          member.availableMoves = p.moves || [];
          member.ability = member.availableAbilities[0] || 'Standard Ability';
          member.item = 'Leftovers';
          member.nature = 'Jolly';
          member.teraType = (p.types[0]?.name || 'NORMAL').toUpperCase();
          member.moves = (p.moves || []).slice(0, 4).map(m => m.name);

          this.pickerModal.classList.add('hidden');
          this.activeSlotIndexToPick = null;
          this.renderTeamBuilder();
        }
      });
    });
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
