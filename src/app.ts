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
import { TeamBuilderService, TeamMember, StatBlock, FormatMode, ALL_TYPES, TYPE_CHART, POPULAR_ITEMS, MEGA_STONES, NATURES } from './services/teamBuilderService';

class PokedexApp {
  private pokemonData: PokemonCardData[] = [];
  private speciesGroups: PokemonSpeciesGroup[] = [];
  private currentAudio: HTMLAudioElement | null = null;
  private currentPlayingBtn: HTMLButtonElement | null = null;
  private smogonService: SmogonService = new SmogonService();
  private teamBuilderService: TeamBuilderService = new TeamBuilderService();
  private currentViewMode: 'cards' | 'table' | 'builder' = 'cards';
  private activeSlotIndexToPick: number = 0;
  private tbSearchQuery: string = '';
  private tbSortField: 'id' | 'name' | 'hp' | 'atk' | 'def' | 'spa' | 'spd' | 'spe' | 'bst' = 'id';
  private tbSortOrder: 'asc' | 'desc' = 'asc';
  private tbGenFilter: string = 'all';
  private tbTypeFilter: string = 'all';
  private tbAbilityFilter: string = 'all';
  private tbMoveFilter: string = '';
  private activeModalTab: 'general' | 'moves' | 'evolution' | 'encounters' | 'competitive' = 'general';
  private isShinyActive: boolean = false;
  private is3DModelActive: boolean = false;
  private isGlobalShinyActive: boolean = false;
  private isGlobal3DActive: boolean = false;
  private isFiltersCollapsed: boolean = false;
  private searchDebounceTimer: any = null;
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
        this.toggleFiltersText.textContent = this.isFiltersCollapsed ? '🔍 Abrir Filtros' : '🔍 Ocultar Filtros';
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

  private getTypeGradient(types: (string | { name: string })[], isCircle: boolean = false): string {
    if (!types || types.length === 0) {
      return 'radial-gradient(circle, rgba(59, 130, 246, 0.25) 0%, rgba(15, 23, 42, 0.8) 100%)';
    }

    const typeNames = types.map(t => typeof t === 'string' ? t : t.name);
    const t1 = typeNames[0].toLowerCase();
    const c1 = TYPE_COLORS[t1] || '#a8a77a';

    if (typeNames.length === 1) {
      if (isCircle) {
        return `radial-gradient(circle at 50% 45%, ${c1}ee 0%, ${c1}77 65%, #0f172a 100%)`;
      }
      return `radial-gradient(circle at 50% 40%, ${c1}99 0%, ${c1}33 65%, rgba(30, 41, 59, 0.7) 100%)`;
    }

    const t2 = typeNames[1].toLowerCase();
    const c2 = TYPE_COLORS[t2] || '#a8a77a';

    if (isCircle) {
      return `linear-gradient(135deg, ${c1}ee 0%, ${c1}cc 48%, ${c2}cc 52%, ${c2}ee 100%)`;
    }

    return `linear-gradient(135deg, ${c1}99 0%, ${c1}44 48%, ${c2}44 52%, ${c2}99 100%)`;
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
      if (this.toggleFiltersBtn) this.toggleFiltersBtn.style.display = 'none';
      if (this.filterBar) this.filterBar.style.display = 'none';
      if (this.teamBuilderContainer) {
        this.teamBuilderContainer.classList.remove('hidden');
        this.renderTeamBuilder();
      }
      return;
    }

    if (this.toggleFiltersBtn) this.toggleFiltersBtn.style.display = '';
    if (this.filterBar) this.filterBar.style.display = '';

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

    const imgContainer = cardEl.querySelector('.card-img-container') as HTMLElement;
    if (imgContainer) {
      imgContainer.style.background = this.getTypeGradient(p.types);
    }

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
    const bgGradient = this.getTypeGradient(p.types);

    return `
      <div id="species-card-${group.speciesId}" class="pokemon-card">
        <button id="card-shiny-btn-${group.speciesId}" class="card-shiny-btn ${isShiny ? 'active' : ''}" title="Alternar forma Shiny">✨ Shiny</button>
        <span class="card-number">${formattedId}</span>
        <div class="card-img-container" style="background: ${bgGradient};">
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

      const imgDisplayUrl = this.getPokemonMediaUrl(p, this.isShinyActive, this.is3DModelActive);
      const hdClassModal = this.is3DModelActive ? '' : 'hd-art';
      const modalBg = this.getTypeGradient(p.types);

      const mediaHeroHTML = `
        <div class="modal-hero-container" style="background: ${modalBg}; border-radius: 20px;">
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

  private getSortIcon(field: string): string {
    if (this.tbSortField !== field) return '<span style="opacity: 0.35;">↕</span>';
    return this.tbSortOrder === 'asc' ? '▲' : '▼';
  }

  private isSpeciesInGen(id: number, gen: number): boolean {
    if (gen === 1) return id >= 1 && id <= 151;
    if (gen === 2) return id >= 152 && id <= 251;
    if (gen === 3) return id >= 252 && id <= 386;
    if (gen === 4) return id >= 387 && id <= 493;
    if (gen === 5) return id >= 494 && id <= 649;
    if (gen === 6) return id >= 650 && id <= 721;
    if (gen === 7) return id >= 722 && id <= 809;
    if (gen === 8) return id >= 810 && id <= 905;
    if (gen === 9) return id >= 906;
    return true;
  }

  private getFilteredAndSortedTeamBuilderSpecies(): PokemonSpeciesGroup[] {
    const query = this.tbSearchQuery.toLowerCase().trim();

    const filtered = this.speciesGroups.filter(g => {
      const p = g.selectedPokemon;

      if (this.tbGenFilter !== 'all') {
        const genNum = parseInt(this.tbGenFilter, 10);
        if (!this.isSpeciesInGen(g.speciesId, genNum)) return false;
      }

      if (this.tbTypeFilter !== 'all') {
        const hasType = p.types.some(t => t.name.toLowerCase() === this.tbTypeFilter.toLowerCase());
        if (!hasType) return false;
      }

      if (this.tbAbilityFilter !== 'all') {
        const hasAbility = (p.abilities || []).some(a => a.name.toLowerCase() === this.tbAbilityFilter.toLowerCase());
        if (!hasAbility) return false;
      }

      if (this.tbMoveFilter.trim()) {
        const rawQuery = this.tbMoveFilter.toLowerCase().trim();
        const normQuery = rawQuery.replace(/[^a-z0-9]/g, '');

        const isExactMoveName = (p.moves || []).some(m => m && m.name && (m.name.toLowerCase() === rawQuery || m.name.toLowerCase().replace(/[^a-z0-9]/g, '') === normQuery));

        const hasMove = (p.moves || []).some(m => {
          if (!m || !m.name) return false;
          const mName = m.name.toLowerCase();
          const mNorm = mName.replace(/[^a-z0-9]/g, '');

          if (isExactMoveName || normQuery.length >= 4) {
            return mName === rawQuery || mNorm === normQuery;
          }

          const escaped = rawQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const regex = new RegExp(`\\b${escaped}`, 'i');
          return regex.test(mName) || mNorm.startsWith(normQuery);
        });
        if (!hasMove) return false;
      }

      if (!query) return true;

      const nameMatch = p.name.toLowerCase().includes(query);
      const idMatch = g.speciesId.toString().includes(query) || p.id.toString().includes(query);
      const typeMatch = p.types.some(t => t.name.toLowerCase().includes(query));
      const moveMatch = (p.moves || []).some(m => m.name.toLowerCase().includes(query));
      const abilityMatch = (p.abilities || []).some(a => a.name.toLowerCase().includes(query));

      return nameMatch || idMatch || typeMatch || moveMatch || abilityMatch;
    });

    const dir = this.tbSortOrder === 'asc' ? 1 : -1;

    const getStatVal = (p: PokemonCardData, sName: string) => {
      const found = p.stats.find(s => s.name.toLowerCase() === sName.toLowerCase() || s.name.toLowerCase() === sName.replace('-', ''));
      return found ? found.baseStat : 0;
    };

    const getBSTVal = (p: PokemonCardData) => {
      return p.stats.reduce((acc, s) => acc + s.baseStat, 0);
    };

    return filtered.sort((a, b) => {
      const pA = a.selectedPokemon;
      const pB = b.selectedPokemon;

      switch (this.tbSortField) {
        case 'id':
          return (a.speciesId - b.speciesId) * dir;
        case 'name':
          return pA.name.localeCompare(pB.name) * dir;
        case 'hp':
          return (getStatVal(pA, 'hp') - getStatVal(pB, 'hp')) * dir;
        case 'atk':
          return (getStatVal(pA, 'attack') - getStatVal(pB, 'attack')) * dir;
        case 'def':
          return (getStatVal(pA, 'defense') - getStatVal(pB, 'defense')) * dir;
        case 'spa':
          return (getStatVal(pA, 'special-attack') - getStatVal(pB, 'special-attack')) * dir;
        case 'spd':
          return (getStatVal(pA, 'special-defense') - getStatVal(pB, 'special-defense')) * dir;
        case 'spe':
          return (getStatVal(pA, 'speed') - getStatVal(pB, 'speed')) * dir;
        case 'bst':
          return (getBSTVal(pA) - getBSTVal(pB)) * dir;
        default:
          return (a.speciesId - b.speciesId) * dir;
      }
    });
  }

  private renderTeamBuilder(): void {
    if (!this.teamBuilderContainer) return;

    // Save active element focus and selection range before HTML re-render
    const activeEl = document.activeElement as HTMLInputElement | null;
    const activeId = activeEl && activeEl.id ? activeEl.id : null;
    const selectionStart = activeEl && 'selectionStart' in activeEl ? activeEl.selectionStart : null;
    const selectionEnd = activeEl && 'selectionEnd' in activeEl ? activeEl.selectionEnd : null;

    const isChampions = this.teamBuilderService.formatMode === 'champions';
    const activeSlotIdx = this.activeSlotIndexToPick ?? 0;

    // 1. Top 6 Avatar Strip (Avatares dos 6 Slots)
    const avatarsHTML = this.teamBuilderService.members.map((m, slotIdx) => {
      const isSelected = activeSlotIdx === slotIdx;
      if (!m.name) {
        return `
          <div class="tb-avatar-card ${isSelected ? 'active-slot' : ''}" data-slot="${slotIdx}">
            <div class="tb-avatar-circle" style="background: rgba(15,23,42,0.8);">
              <span style="font-size: 1.5rem; color: var(--accent-blue);">+</span>
            </div>
            <div class="tb-avatar-name" style="color: #94a3b8;">Slot #${slotIdx + 1}</div>
            <div style="font-size: 0.65rem; color: #64748b;">(Vazio)</div>
          </div>
        `;
      }

      const circleBg = this.getTypeGradient(m.types, true);
      const typeBadges = (m.types || []).map(t => {
        const bg = TYPE_COLORS[t.toLowerCase()] || '#a8a77a';
        return `<span class="type-badge-pill" style="background: ${bg}; color: #fff; font-size: 0.6rem; padding: 0.1rem 0.35rem; border-radius: 4px; font-weight: 800;">${t}</span>`;
      }).join(' ');

      const fallbackUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${m.speciesId}.png`;
      return `
        <div class="tb-avatar-card ${isSelected ? 'active-slot' : ''}" data-slot="${slotIdx}">
          <div class="tb-avatar-circle" style="background: ${circleBg};">
            <img src="${m.officialArtworkUrl || m.spriteUrl}" alt="${m.name}" onerror="this.onerror=null; this.src='${fallbackUrl}';">
          </div>
          <div class="tb-avatar-name">${m.name}</div>
          <div class="tb-avatar-types">${typeBadges}</div>
        </div>
      `;
    }).join('');

    // 2. Editor Detalhado do Slot Ativo (Active Member Card)
    const activeMember = this.teamBuilderService.members[activeSlotIdx];
    let activeEditorHTML = '';

    if (!activeMember.name) {
      activeEditorHTML = `
        <div class="tb-member-card" style="align-items: center; justify-content: center; min-height: 180px; border: 2px dashed rgba(56,189,248,0.3); text-align: center;">
          <div style="font-size: 1.1rem; font-weight: 800; color: #38bdf8; margin-bottom: 0.35rem;">📌 Editando Slot #${activeSlotIdx + 1} (Vazio)</div>
          <p style="font-size: 0.85rem; color: #94a3b8; max-width: 520px;">Clique em qualquer linha da tabela interativa abaixo ou ordene por estatísticas base para escolher o Pokémon do Slot #${activeSlotIdx + 1}.</p>
        </div>
      `;
    } else {
      const totalPoints = isChampions ? this.teamBuilderService.getChampionsTotalPoints(activeMember) : this.teamBuilderService.getEVsTotalPoints(activeMember);
      const maxTotal = isChampions ? 66 : 510;
      const typeBadges = (activeMember.types || []).map(t => {
        const bg = TYPE_COLORS[t.toLowerCase()] || '#a8a77a';
        return `<span class="type-badge-pill" style="background: ${bg}; color: #fff; font-size: 0.65rem; padding: 0.12rem 0.45rem; border-radius: 6px; font-weight: 800;">${t}</span>`;
      }).join(' ');

      const group = this.speciesGroups.find(g => g.speciesId === activeMember.speciesId);
      const varietiesHTML = group && group.varieties.length > 1
        ? group.varieties.map(v => `<option value="${v.id}" ${v.id === activeMember.pokemonId ? 'selected' : ''}>${v.name}</option>`).join('')
        : '';

      const varietySelector = varietiesHTML
        ? `<select class="tb-select member-variety-select" data-slot="${activeSlotIdx}" style="margin-top: 0.25rem; font-size: 0.75rem;">${varietiesHTML}</select>`
        : '';

      // Moves Selects (Alphabetically Sorted)
      const sortedAvailableMoves = [...(activeMember.availableMoves || [])].sort((a, b) => a.name.localeCompare(b.name));
      const movesHTML = [0, 1, 2, 3].map(mIdx => {
        const currentMove = activeMember.moves[mIdx] || '';
        const optionsHTML = `<option value="">-- Golpe #${mIdx + 1} --</option>` +
          sortedAvailableMoves.map(mv => {
            return `<option value="${mv.name}" ${mv.name.toLowerCase() === currentMove.toLowerCase() ? 'selected' : ''}>${mv.name} (${mv.type}${mv.power ? ` • ${mv.power} Pow` : ''})</option>`;
          }).join('');

        return `
          <div class="tb-move-item">
            <select class="tb-move-select member-move-select" data-slot="${activeSlotIdx}" data-move-idx="${mIdx}">
              ${optionsHTML}
            </select>
          </div>
        `;
      }).join('');

      // Natures & Ability
      const natureInfo = NATURES[activeMember.nature || 'Hardy'] || NATURES['Hardy'];
      const natureTagHTML = natureInfo.label !== 'Neutra'
        ? `<span class="tb-nature-tag">${natureInfo.label}</span>`
        : `<span class="tb-nature-tag" style="background: rgba(148,163,184,0.15); color: #94a3b8;">Neutra</span>`;

      const naturesOptions = Object.keys(NATURES).map(n => `<option value="${n}" ${activeMember.nature === n ? 'selected' : ''}>${n}</option>`).join('');
      const abilitiesOptions = (activeMember.availableAbilities || ['Standard Ability']).map(ab => `<option value="${ab}" ${activeMember.ability === ab ? 'selected' : ''}>${ab}</option>`).join('');
      const itemList = isChampions ? [...POPULAR_ITEMS, ...MEGA_STONES] : POPULAR_ITEMS;
      const itemsOptions = itemList.map(it => `<option value="${it}" ${activeMember.item === it ? 'selected' : ''}>${it}</option>`).join('');
      const teraOptions = ALL_TYPES.map(t => `<option value="${t.toUpperCase()}" ${activeMember.teraType === t.toUpperCase() ? 'selected' : ''}>${t.charAt(0).toUpperCase() + t.slice(1)}</option>`).join('');

      const teraOptionsField = !isChampions ? `
        <div class="tb-field-group">
          <label>Tera Type</label>
          <select class="tb-select member-tera-select" data-slot="${activeSlotIdx}">${teraOptions}</select>
        </div>
      ` : '';

      // Stats Bars Calculation (Image 3 style)
      const statKeys: (keyof StatBlock)[] = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'];
      const statLabels: Record<keyof StatBlock, string> = { hp: 'HP', atk: 'Ataque', def: 'Defesa', spa: 'Atq.Esp', spd: 'Def.Esp', spe: 'Velocidade' };
      const barClasses: Record<keyof StatBlock, string> = { hp: 'bar-hp', atk: 'bar-atk', def: 'bar-def', spa: 'bar-spa', spd: 'bar-spd', spe: 'bar-spe' };

      let sumBase = 0;
      let sumFinal = 0;

      const statsRowsHTML = statKeys.map(k => {
        const base = activeMember.baseStats ? activeMember.baseStats[k] || 80 : 80;
        const invested = isChampions ? (activeMember.championsPoints[k] || 0) : (activeMember.evs[k] || 0);
        const iv = activeMember.ivs ? activeMember.ivs[k] : 31;
        const finalVal = this.teamBuilderService.calculateStat(k, base, invested, iv, activeMember.nature);

        sumBase += base;
        sumFinal += finalVal;

        const maxSingle = isChampions ? 32 : 252;
        const fillPercent = Math.min(100, Math.max(8, (finalVal / 320) * 100));

        return `
          <div class="tb-stat-row" style="align-items: center; gap: 0.35rem;">
            <span class="tb-stat-label">${statLabels[k]}</span>
            <span class="tb-stat-base">${base}</span>
            <span class="tb-stat-invested">+${invested}</span>
            <div class="tb-stat-bar-container" style="flex: 1;">
              <div class="tb-stat-bar-fill ${barClasses[k]}" style="width: ${fillPercent}%;"></div>
            </div>
            <input type="number" class="stat-number-input" data-slot="${activeSlotIdx}" data-stat="${k}" min="0" max="${maxSingle}" value="${invested}">
            <span class="tb-stat-final">${finalVal}</span>
          </div>
          <div style="margin-bottom: 0.3rem;">
            <input type="range" class="stat-range-input" data-slot="${activeSlotIdx}" data-stat="${k}" min="0" max="${maxSingle}" value="${invested}" style="width: 100%; accent-color: var(--accent-blue);">
          </div>
        `;
      }).join('');

      activeEditorHTML = `
        <div class="tb-member-card" style="max-width: 100%;">
          <div class="tb-card-header" style="flex-direction: row; justify-content: space-between; align-items: center; text-align: left; padding-bottom: 0.75rem;">
            <div style="display: flex; align-items: center; gap: 0.85rem;">
              <span class="tb-slot-number" style="position: static; font-size: 0.8rem; padding: 0.25rem 0.6rem;">Editando Slot #${activeSlotIdx + 1}</span>
              <img class="tb-card-img" src="${activeMember.officialArtworkUrl || activeMember.spriteUrl}" alt="${activeMember.name}" style="width: 54px; height: 54px; margin: 0;" onerror="this.onerror=null; this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${activeMember.speciesId}.png';">
              <div>
                <h3 class="tb-card-title" style="font-size: 1.15rem;">${activeMember.name}</h3>
                <div style="margin-top: 0.2rem;">${typeBadges}</div>
                ${varietySelector}
              </div>
            </div>

            <button class="tb-remove-btn remove-member-btn" data-slot="${activeSlotIdx}" title="Remover Slot" style="position: static; width: 28px; height: 28px; font-size: 1rem;">&times;</button>
          </div>

          <div class="tb-editor-grid">
            <!-- Column 1: Moves -->
            <div>
              <div class="tb-section-label">Movimentos (Golpes)</div>
              ${movesHTML}
            </div>

            <!-- Column 2: Nature, Ability, Item & Tera -->
            <div>
              <div class="tb-section-label">Atributos & Competitivo</div>
              <div class="tb-subgrid" style="grid-template-columns: 1fr; gap: 0.45rem;">
                <div class="tb-field-group">
                  <label>Natureza</label>
                  <select class="tb-select member-nature-select" data-slot="${activeSlotIdx}">${naturesOptions}</select>
                  ${natureTagHTML}
                </div>
                <div class="tb-field-group">
                  <label>Habilidade</label>
                  <select class="tb-select member-ability-select" data-slot="${activeSlotIdx}">${abilitiesOptions}</select>
                </div>
                <div class="tb-field-group">
                  <label>Item</label>
                  <select class="tb-select member-item-select" data-slot="${activeSlotIdx}">${itemsOptions}</select>
                </div>
                ${teraOptionsField}
              </div>
            </div>

            <!-- Column 3: Stats & Sliders -->
            <div>
              <div class="tb-section-label">
                <span>Estatísticas Nível 50</span>
                <span class="tb-total-points-badge" style="color: ${totalPoints > maxTotal ? '#ef4444' : (totalPoints === maxTotal ? '#4ade80' : '#38bdf8')}; font-weight: 800;">${totalPoints} / ${maxTotal} Pts</span>
              </div>
              ${statsRowsHTML}
              <div style="display: flex; justify-content: space-between; font-size: 0.65rem; color: #94a3b8; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 0.35rem; margin-top: 0.2rem;">
                <span>Total Base: <strong class="tb-sum-base" style="color: #cbd5e1;">${sumBase}</strong></span>
                <span>Total Final: <strong class="tb-sum-final" style="color: #4ade80;">${sumFinal}</strong></span>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    // 3. Team Defense & Coverage Tally Analysis
    const coverageList = this.teamBuilderService.analyzeTeamCoverage();
    const defenseAnalysisHTML = coverageList.map(cov => {
      const typeColor = TYPE_COLORS[cov.type.toLowerCase()] || '#a8a77a';
      const redTallies = Array.from({ length: Math.min(6, cov.weakCount) }, () => `<span class="tb-tally-bar red"></span>`).join('');
      const blueTallies = Array.from({ length: Math.min(6, cov.resistCount) }, () => `<span class="tb-tally-bar blue"></span>`).join('');
      const emptyTallies = Array.from({ length: Math.max(0, 6 - cov.weakCount - cov.resistCount) }, () => `<span class="tb-tally-bar empty"></span>`).join('');

      return `
        <div class="tb-analysis-chip" style="border-left: 3px solid ${typeColor};">
          <span style="font-size: 0.725rem; font-weight: 800; text-transform: uppercase; color: ${typeColor}; width: 60px;">${cov.type}</span>
          <div class="tb-tally-bars">
            ${redTallies}${blueTallies}${emptyTallies}
          </div>
        </div>
      `;
    }).join('');

    const coverageAnalysisHTML = coverageList.map(cov => {
      const typeColor = TYPE_COLORS[cov.type.toLowerCase()] || '#a8a77a';
      const blueTallies = Array.from({ length: Math.min(6, cov.superEffectiveMovesCount) }, () => `<span class="tb-tally-bar blue"></span>`).join('');
      const emptyTallies = Array.from({ length: Math.max(0, 6 - cov.superEffectiveMovesCount) }, () => `<span class="tb-tally-bar empty"></span>`).join('');

      return `
        <div class="tb-analysis-chip" style="border-left: 3px solid ${typeColor};">
          <span style="font-size: 0.725rem; font-weight: 800; text-transform: uppercase; color: ${typeColor}; width: 60px;">${cov.type}</span>
          <div class="tb-tally-bars">
            ${blueTallies}${emptyTallies}
          </div>
        </div>
      `;
    }).join('');

    // Compile unique abilities across species for table filter
    const allAbilitiesSet = new Set<string>();
    this.speciesGroups.forEach(g => {
      (g.selectedPokemon.abilities || []).forEach(a => {
        if (a && a.name) allAbilitiesSet.add(a.name);
      });
    });
    const sortedAbilities = Array.from(allAbilitiesSet).sort((a, b) => a.localeCompare(b));
    const abilitiesFilterOptions = sortedAbilities.map(ab => `<option value="${ab}" ${this.tbAbilityFilter === ab ? 'selected' : ''}>${ab}</option>`).join('');

    // Compile unique moves for datalist auto-suggestions
    const allMovesSet = new Set<string>();
    this.speciesGroups.forEach(g => {
      (g.selectedPokemon.moves || []).forEach(m => {
        if (m && m.name) allMovesSet.add(m.name);
      });
    });
    const sortedMoves = Array.from(allMovesSet).sort((a, b) => a.localeCompare(b));
    const movesDatalistOptions = sortedMoves.map(m => `<option value="${m}">`).join('');

    // 4. Table view of species for selecting active slot with base stats sorting!
    const tableSpecies = this.getFilteredAndSortedTeamBuilderSpecies();
    const tableRowsHTML = tableSpecies.map(g => {
      const p = g.selectedPokemon;
      const formattedId = `#${g.speciesId.toString().padStart(4, '0')}`;
      const imgUrl = p.media.officialArtworkUrl || p.media.spriteUrl;

      const typeBadges = p.types.map(t => {
        const bg = TYPE_COLORS[t.name.toLowerCase()] || '#a8a77a';
        return `<span class="type-badge-pill" style="background: ${bg}; color: #fff; font-size: 0.65rem; padding: 0.12rem 0.45rem; border-radius: 4px; font-weight: 800;">${t.name}</span>`;
      }).join(' ');

      const getStat = (name: string) => p.stats.find(s => s.name.toLowerCase() === name.toLowerCase() || s.name.toLowerCase() === name.replace('-', ''))?.baseStat || 0;
      const hp = getStat('hp');
      const atk = getStat('attack');
      const def = getStat('defense');
      const spa = getStat('special-attack');
      const spd = getStat('special-defense');
      const spe = getStat('speed');
      const bst = hp + atk + def + spa + spd + spe;

      const isAlreadyInTeam = this.teamBuilderService.members.some(m => m.speciesId === g.speciesId);
      const actionButtonHTML = isAlreadyInTeam
        ? `<span style="font-size: 0.7rem; font-weight: 800; color: #38bdf8; background: rgba(56,189,248,0.15); border: 1px solid rgba(56,189,248,0.3); padding: 0.25rem 0.5rem; border-radius: 6px; display: inline-block;">✓ No Time</span>`
        : `<button class="tb-btn primary select-species-btn" data-species-id="${g.speciesId}" style="font-size: 0.7rem; padding: 0.25rem 0.6rem;">➕ Selecionar</button>`;

      return `
        <tr class="tb-table-row ${isAlreadyInTeam ? 'already-in-team-row' : ''}" data-species-id="${g.speciesId}" style="border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 0.825rem; ${isAlreadyInTeam ? 'opacity: 0.65;' : ''}">
          <td style="padding: 0.6rem; font-weight: 800; color: #94a3b8;">${formattedId}</td>
          <td style="padding: 0.4rem;"><img src="${imgUrl}" alt="${p.name}" style="width: 38px; height: 38px; object-fit: contain;" onerror="this.onerror=null; this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${g.speciesId}.png';"></td>
          <td style="padding: 0.6rem; font-weight: 700; color: #ffffff; text-transform: capitalize;">${p.name}</td>
          <td style="padding: 0.6rem;">${typeBadges}</td>
          <td style="padding: 0.6rem; font-weight: 700; color: #4ade80;">${hp}</td>
          <td style="padding: 0.6rem; font-weight: 700; color: #f87171;">${atk}</td>
          <td style="padding: 0.6rem; font-weight: 700; color: #fbbf24;">${def}</td>
          <td style="padding: 0.6rem; font-weight: 700; color: #c084fc;">${spa}</td>
          <td style="padding: 0.6rem; font-weight: 700; color: #a7f3d0;">${spd}</td>
          <td style="padding: 0.6rem; font-weight: 700; color: #f472b6;">${spe}</td>
          <td style="padding: 0.6rem;"><span style="font-weight: 800; color: #38bdf8;">${bst}</span></td>
          <td style="padding: 0.6rem; text-align: center;">
            ${actionButtonHTML}
          </td>
        </tr>
      `;
    }).join('');

    this.teamBuilderContainer.innerHTML = `
      <!-- 1. Top 6 Avatar Strip (Avatares dos 6 Slots - Fixed Sticky below header) -->
      <div class="tb-avatars-strip">
        ${avatarsHTML}
      </div>

      <!-- Top Bar & Controls -->
      <div class="tb-top-bar">
        <div class="tb-title-group">
          <h2>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" stroke-width="2.5"><path d="M14.5 17.5L3 6V3h3l11.5 11.5"></path><path d="M13 19l6-6"></path><path d="M16 16l4 4"></path><path d="M19 13l2 2"></path></svg>
            Criador & Construtor de Time
          </h2>
          <p>Monte seu time competitivo, ordene Pokémons por estatísticas base na tabela e ajuste atributos</p>
        </div>

        <div class="tb-actions-row">
          <div class="format-switcher">
            <button class="format-btn ${isChampions ? 'active' : ''}" data-format="champions">🏆 Champions (66 Pts)</button>
            <button class="format-btn ${!isChampions ? 'sv-active' : ''}" data-format="scarlet-violet">🔴 Scarlet & Violet (510 EVs)</button>
          </div>
          <button id="random-team-btn" class="tb-btn">🎲 Time Aleatório</button>
          <button id="export-team-btn" class="tb-btn primary">📋 Exportar Showdown</button>
          <button id="clear-team-btn" class="tb-btn" style="color: #fca5a5;">🗑️ Resetar</button>
        </div>
      </div>

      <!-- 2. Active Slot Detailed Editor -->
      <div class="tb-active-slot-section">
        ${activeEditorHTML}
      </div>

      <!-- 3. Team Defense & Coverage Analysis -->
      <div class="tb-analysis-panel">
        <div class="tb-analysis-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" stroke-width="2.2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
          Análise Defensiva do Time (Team Defense)
        </div>
        <div class="tb-analysis-grid">
          ${defenseAnalysisHTML}
        </div>

        <div class="tb-analysis-title" style="margin-top: 1.25rem;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2.2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          Cobertura de Golpes Súper Efetivos (Coverage)
        </div>
        <div class="tb-analysis-grid">
          ${coverageAnalysisHTML}
        </div>

        <div class="tb-footnote">
          Traços azuis <span style="color: #38bdf8; font-weight: 800;">|||</span> indicam resistências, imunidades ou cobertura de golpes súper efetivos. Traços vermelhos <span style="color: #ef4444; font-weight: 800;">|||</span> indicam fraqueza defensiva do time.
        </div>
      </div>

      <!-- 4. Interactive Spreadsheet Table Picker with Base Stats Sorting -->
      <div class="tb-options-panel" id="tb-species-table-section">
        <div class="tb-options-header">
          <div>
            <h3>📊 Seleção de Pokémon em Tabela (Definir Slot #${activeSlotIdx + 1})</h3>
            <p style="font-size: 0.775rem; color: #94a3b8; margin-top: 0.2rem;">
              Clique em qualquer linha da tabela para adicionar o Pokémon ao Slot #${activeSlotIdx + 1}. Clique no cabeçalho de qualquer estatística para ordenar (HP, Atk, Def, SpA, SpD, Spe, BST).
            </p>
          </div>

          <div class="tb-table-controls-wrapper">
            <input type="text" id="tb-table-search" class="tb-options-search" placeholder="🔍 Nome, #..." value="${this.tbSearchQuery}" style="width: 150px;">
            <select id="tb-table-gen" class="tb-select" style="width: auto; padding: 0.45rem 0.5rem;">
              <option value="all" ${this.tbGenFilter === 'all' ? 'selected' : ''}>Todas Gens</option>
              <option value="1" ${this.tbGenFilter === '1' ? 'selected' : ''}>Gen 1 (Kanto)</option>
              <option value="2" ${this.tbGenFilter === '2' ? 'selected' : ''}>Gen 2 (Johto)</option>
              <option value="3" ${this.tbGenFilter === '3' ? 'selected' : ''}>Gen 3 (Hoenn)</option>
              <option value="4" ${this.tbGenFilter === '4' ? 'selected' : ''}>Gen 4 (Sinnoh)</option>
              <option value="5" ${this.tbGenFilter === '5' ? 'selected' : ''}>Gen 5 (Unova)</option>
              <option value="6" ${this.tbGenFilter === '6' ? 'selected' : ''}>Gen 6 (Kalos)</option>
              <option value="7" ${this.tbGenFilter === '7' ? 'selected' : ''}>Gen 7 (Alola)</option>
              <option value="8" ${this.tbGenFilter === '8' ? 'selected' : ''}>Gen 8 (Galar)</option>
              <option value="9" ${this.tbGenFilter === '9' ? 'selected' : ''}>Gen 9 (Paldea)</option>
            </select>
            <select id="tb-table-type" class="tb-select" style="width: auto; padding: 0.45rem 0.5rem;">
              <option value="all" ${this.tbTypeFilter === 'all' ? 'selected' : ''}>Todos Tipos</option>
              ${ALL_TYPES.map(t => `<option value="${t}" ${this.tbTypeFilter === t ? 'selected' : ''}>${t.charAt(0).toUpperCase() + t.slice(1)}</option>`).join('')}
            </select>
            <select id="tb-table-ability" class="tb-select" style="width: auto; padding: 0.45rem 0.5rem;">
              <option value="all" ${this.tbAbilityFilter === 'all' ? 'selected' : ''}>Todas Habilidades</option>
              ${abilitiesFilterOptions}
            </select>
            <input type="text" id="tb-table-move" class="tb-options-search" list="tb-moves-list" placeholder="🗡️ Filtrar Golpe..." value="${this.tbMoveFilter}" style="width: 160px;">
            <datalist id="tb-moves-list">${movesDatalistOptions}</datalist>
          </div>
        </div>

        <div style="overflow-x: auto; max-height: 480px; overflow-y: auto; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); margin-top: 0.75rem;">
          <table class="stats-table" style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: rgba(15,23,42,0.9); font-size: 0.775rem; text-transform: uppercase;">
                <th class="tb-sort-th" data-sort="id" style="cursor: pointer; padding: 0.65rem;"># ${this.getSortIcon('id')}</th>
                <th style="padding: 0.65rem;">Arte</th>
                <th class="tb-sort-th" data-sort="name" style="cursor: pointer; padding: 0.65rem;">Nome ${this.getSortIcon('name')}</th>
                <th style="padding: 0.65rem;">Tipos</th>
                <th class="tb-sort-th" data-sort="hp" style="cursor: pointer; padding: 0.65rem; color: #4ade80;">HP ${this.getSortIcon('hp')}</th>
                <th class="tb-sort-th" data-sort="atk" style="cursor: pointer; padding: 0.65rem; color: #f87171;">Atk ${this.getSortIcon('atk')}</th>
                <th class="tb-sort-th" data-sort="def" style="cursor: pointer; padding: 0.65rem; color: #fbbf24;">Def ${this.getSortIcon('def')}</th>
                <th class="tb-sort-th" data-sort="spa" style="cursor: pointer; padding: 0.65rem; color: #c084fc;">SpA ${this.getSortIcon('spa')}</th>
                <th class="tb-sort-th" data-sort="spd" style="cursor: pointer; padding: 0.65rem; color: #a7f3d0;">SpD ${this.getSortIcon('spd')}</th>
                <th class="tb-sort-th" data-sort="spe" style="cursor: pointer; padding: 0.65rem; color: #f472b6;">Spe ${this.getSortIcon('spe')}</th>
                <th class="tb-sort-th" data-sort="bst" style="cursor: pointer; padding: 0.65rem; color: #38bdf8;">BST ${this.getSortIcon('bst')}</th>
                <th style="padding: 0.65rem; text-align: center;">Ação</th>
              </tr>
            </thead>
            <tbody id="tb-table-body">
              ${tableRowsHTML || `<tr><td colspan="12" style="text-align: center; padding: 2rem; color: #94a3b8;">Nenhum Pokémon encontrado com os filtros aplicados.</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>
    `;

    this.attachTeamBuilderEvents();

    // Restore focused element and selection range
    if (activeId) {
      const restoredEl = document.getElementById(activeId) as HTMLInputElement | null;
      if (restoredEl) {
        restoredEl.focus();
        if (selectionStart !== null && selectionEnd !== null && typeof restoredEl.setSelectionRange === 'function') {
          try {
            restoredEl.setSelectionRange(selectionStart, selectionEnd);
          } catch {
            // ignore
          }
        }
      }
    }
  }

  private renderPickerOptionsHTML(): string {
    const term = (document.getElementById('tb-options-search') as HTMLInputElement)?.value.toLowerCase().trim() || '';
    const filtered = this.speciesGroups.filter(g => {
      if (!term) return true;
      const p = g.selectedPokemon;
      return p.name.toLowerCase().includes(term) ||
             p.id.toString().includes(term) ||
             p.types.some(t => t.name.toLowerCase().includes(term));
    });

    return filtered.slice(0, 90).map(g => {
      const p = g.selectedPokemon;
      return `
        <div class="tb-option-item" data-species-id="${g.speciesId}">
          <img src="${p.media.officialArtworkUrl || p.media.spriteUrl}" alt="${p.name}">
          <div class="tb-option-name">${p.name}</div>
        </div>
      `;
    }).join('');
  }

  private renderTeamBuilderTableOnly(): void {
    const tbody = document.getElementById('tb-table-body');
    if (!tbody) {
      this.renderTeamBuilder();
      return;
    }

    const tableSpecies = this.getFilteredAndSortedTeamBuilderSpecies();
    const tableRowsHTML = tableSpecies.map(g => {
      const p = g.selectedPokemon;
      const formattedId = `#${g.speciesId.toString().padStart(4, '0')}`;
      const imgUrl = p.media.officialArtworkUrl || p.media.spriteUrl;

      const typeBadges = p.types.map(t => {
        const bg = TYPE_COLORS[t.name.toLowerCase()] || '#a8a77a';
        return `<span class="type-badge-pill" style="background: ${bg}; color: #fff; font-size: 0.65rem; padding: 0.12rem 0.45rem; border-radius: 4px; font-weight: 800;">${t.name}</span>`;
      }).join(' ');

      const getStat = (name: string) => p.stats.find(s => s.name.toLowerCase() === name.toLowerCase() || s.name.toLowerCase() === name.replace('-', ''))?.baseStat || 0;
      const hp = getStat('hp');
      const atk = getStat('attack');
      const def = getStat('defense');
      const spa = getStat('special-attack');
      const spd = getStat('special-defense');
      const spe = getStat('speed');
      const bst = hp + atk + def + spa + spd + spe;

      const isAlreadyInTeam = this.teamBuilderService.members.some(m => m.speciesId === g.speciesId);
      const actionButtonHTML = isAlreadyInTeam
        ? `<span style="font-size: 0.7rem; font-weight: 800; color: #38bdf8; background: rgba(56,189,248,0.15); border: 1px solid rgba(56,189,248,0.3); padding: 0.25rem 0.5rem; border-radius: 6px; display: inline-block;">✓ No Time</span>`
        : `<button class="tb-btn primary select-species-btn" data-species-id="${g.speciesId}" style="font-size: 0.7rem; padding: 0.25rem 0.6rem;">➕ Selecionar</button>`;

      return `
        <tr class="tb-table-row ${isAlreadyInTeam ? 'already-in-team-row' : ''}" data-species-id="${g.speciesId}" style="border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 0.825rem; ${isAlreadyInTeam ? 'opacity: 0.65;' : ''}">
          <td style="padding: 0.6rem; font-weight: 800; color: #94a3b8;">${formattedId}</td>
          <td style="padding: 0.4rem;"><img src="${imgUrl}" alt="${p.name}" style="width: 38px; height: 38px; object-fit: contain;" onerror="this.onerror=null; this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${g.speciesId}.png';"></td>
          <td style="padding: 0.6rem; font-weight: 700; color: #ffffff; text-transform: capitalize;">${p.name}</td>
          <td style="padding: 0.6rem;">${typeBadges}</td>
          <td style="padding: 0.6rem; font-weight: 700; color: #4ade80;">${hp}</td>
          <td style="padding: 0.6rem; font-weight: 700; color: #f87171;">${atk}</td>
          <td style="padding: 0.6rem; font-weight: 700; color: #fbbf24;">${def}</td>
          <td style="padding: 0.6rem; font-weight: 700; color: #c084fc;">${spa}</td>
          <td style="padding: 0.6rem; font-weight: 700; color: #a7f3d0;">${spd}</td>
          <td style="padding: 0.6rem; font-weight: 700; color: #f472b6;">${spe}</td>
          <td style="padding: 0.6rem;"><span style="font-weight: 800; color: #38bdf8;">${bst}</span></td>
          <td style="padding: 0.6rem; text-align: center;">
            ${actionButtonHTML}
          </td>
        </tr>
      `;
    }).join('');

    tbody.innerHTML = tableRowsHTML || `<tr><td colspan="12" style="text-align: center; padding: 2rem; color: #94a3b8;">Nenhum Pokémon encontrado com os filtros aplicados.</td></tr>`;
    this.attachTableRowsEvents();
  }

  private clearTeamBuilderTableFilters(): void {
    this.tbSearchQuery = '';
    this.tbTypeFilter = 'all';
    this.tbGenFilter = 'all';
    this.tbAbilityFilter = 'all';
    this.tbMoveFilter = '';
    const searchInput = document.getElementById('tb-table-search') as HTMLInputElement;
    if (searchInput) searchInput.value = '';
    const moveInput = document.getElementById('tb-table-move') as HTMLInputElement;
    if (moveInput) moveInput.value = '';
    const typeSelect = document.getElementById('tb-table-type') as HTMLSelectElement;
    if (typeSelect) typeSelect.value = 'all';
    const genSelect = document.getElementById('tb-table-gen') as HTMLSelectElement;
    if (genSelect) genSelect.value = 'all';
    const abilitySelect = document.getElementById('tb-table-ability') as HTMLSelectElement;
    if (abilitySelect) abilitySelect.value = 'all';
  }

  private openExportModal(exportText: string): void {
    const oldModal = document.getElementById('export-showdown-modal');
    if (oldModal) oldModal.remove();

    const modalHTML = `
      <div id="export-showdown-modal" class="modal-overlay" style="position: fixed; inset: 0; background: rgba(15,23,42,0.85); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem;">
        <div class="modal-card" style="background: rgba(30,41,59,0.95); border: 1px solid rgba(56,189,248,0.3); border-radius: 16px; padding: 1.5rem; max-width: 580px; width: 100%; box-shadow: 0 20px 40px rgba(0,0,0,0.5); font-family: inherit;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <h3 style="font-size: 1.2rem; font-weight: 800; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 0.5rem;">
              📋 Exportar Time (Pokémon Showdown)
            </h3>
            <button id="close-export-modal-x" style="background: none; border: none; color: #94a3b8; font-size: 1.5rem; cursor: pointer; line-height: 1;">&times;</button>
          </div>

          <p style="font-size: 0.85rem; color: #94a3b8; margin-bottom: 1rem;">
            Abaixo está o seu time formatado no padrão **Poképaste / Pokémon Showdown**. O texto é copiado automaticamente para a sua área de transferência!
          </p>

          <textarea id="export-showdown-textarea" readonly style="width: 100%; height: 220px; background: rgba(15,23,42,0.9); border: 1px solid rgba(255,255,255,0.15); border-radius: 10px; color: #38bdf8; font-family: monospace; font-size: 0.825rem; padding: 0.85rem; resize: vertical; outline: none; margin-bottom: 1.25rem;">${exportText}</textarea>

          <div style="display: flex; justify-content: flex-end; gap: 0.75rem; align-items: center;">
            <span id="copy-feedback-msg" style="font-size: 0.8rem; font-weight: 700; color: #4ade80; display: none;">✓ Copiado para a área de transferência!</span>
            <button id="close-export-modal-btn" class="tb-btn" style="padding: 0.5rem 1rem;">Fechar</button>
            <button id="copy-export-modal-btn" class="tb-btn primary" style="padding: 0.5rem 1.2rem; font-weight: 800;">📋 Copiar Texto</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const modalEl = document.getElementById('export-showdown-modal');
    const copyBtn = document.getElementById('copy-export-modal-btn');
    const closeBtn = document.getElementById('close-export-modal-btn');
    const closeX = document.getElementById('close-export-modal-x');
    const feedbackMsg = document.getElementById('copy-feedback-msg');

    const copyText = () => {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(exportText).then(() => {
          if (feedbackMsg) feedbackMsg.style.display = 'inline-block';
        }).catch(() => {
          const ta = document.getElementById('export-showdown-textarea') as HTMLTextAreaElement;
          if (ta) {
            ta.select();
            document.execCommand('copy');
            if (feedbackMsg) feedbackMsg.style.display = 'inline-block';
          }
        });
      } else {
        const ta = document.getElementById('export-showdown-textarea') as HTMLTextAreaElement;
        if (ta) {
          ta.select();
          document.execCommand('copy');
          if (feedbackMsg) feedbackMsg.style.display = 'inline-block';
        }
      }
    };

    copyText();

    if (copyBtn) copyBtn.addEventListener('click', copyText);

    const closeModal = () => {
      if (modalEl) modalEl.remove();
    };

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (closeX) closeX.addEventListener('click', closeModal);
    if (modalEl) {
      modalEl.addEventListener('click', (e) => {
        if (e.target === modalEl) closeModal();
      });
    }
  }

  private smoothScrollToY(targetY: number, duration: number = 650): void {
    const startY = window.pageYOffset || document.documentElement.scrollTop;
    const distance = targetY - startY;
    if (Math.abs(distance) < 5) return;

    let startTime: number | null = null;

    const easeInOutCubic = (t: number): number => {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };

    const step = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = easeInOutCubic(progress);

      window.scrollTo(0, startY + distance * ease);

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }

  private scrollToSpeciesTable(): void {
    setTimeout(() => {
      const tableSection = document.getElementById('tb-species-table-section') || this.teamBuilderContainer?.querySelector('.tb-options-panel');
      if (tableSection) {
        const isMobile = window.innerWidth <= 768;
        const yOffset = isMobile ? -135 : -150;
        const targetY = Math.max(0, tableSection.getBoundingClientRect().top + window.pageYOffset + yOffset);
        this.smoothScrollToY(targetY, 700);
      }
    }, 60);
  }

  private scrollToActiveSlotEditor(): void {
    setTimeout(() => {
      const editorSection = this.teamBuilderContainer?.querySelector('.tb-active-slot-section') || this.teamBuilderContainer?.querySelector('.tb-member-card');
      if (editorSection) {
        const isMobile = window.innerWidth <= 768;
        const yOffset = isMobile ? -135 : -150;
        const targetY = Math.max(0, editorSection.getBoundingClientRect().top + window.pageYOffset + yOffset);
        this.smoothScrollToY(targetY, 650);
      }
    }, 60);
  }

  private attachTableRowsEvents(): void {
    if (!this.teamBuilderContainer) return;
    const tableRows = this.teamBuilderContainer.querySelectorAll('.tb-table-row');
    tableRows.forEach(row => {
      row.addEventListener('click', () => {
        const sId = parseInt(row.getAttribute('data-species-id') || '0', 10);
        if (sId) {
          this.assignPokemonToSlot(this.activeSlotIndexToPick, sId);
        }
      });
    });
  }

  private assignPokemonToSlot(slotIndex: number, speciesId: number): void {
    const group = this.speciesGroups.find(g => g.speciesId === speciesId);
    if (!group) return;

    // Species Clause: Check if this species is already in a different slot in the team
    const duplicateSlot = this.teamBuilderService.members.findIndex(
      (m, idx) => m.speciesId === speciesId && idx !== slotIndex
    );

    if (duplicateSlot !== -1) {
      const speciesName = group.selectedPokemon.name;
      const formattedName = speciesName.charAt(0).toUpperCase() + speciesName.slice(1);
      alert(`⚠️ O Pokémon "${formattedName}" já está presente no Slot #${duplicateSlot + 1}!\n\nA Regra de Espécie (Species Clause) proíbe Pokémons repetidos na mesma equipe.`);
      return;
    }

    const p = group.selectedPokemon;
    const member = this.teamBuilderService.members[slotIndex];
    member.speciesId = group.speciesId;
    member.pokemonId = p.id;
    member.name = p.name;
    member.types = p.types.map(t => t.name);
    member.spriteUrl = p.media.spriteUrl;
    member.officialArtworkUrl = p.media.officialArtworkUrl;

    const getStat = (sName: string) => p.stats.find(s => s.name.toLowerCase() === sName.toLowerCase() || s.name.toLowerCase() === sName.replace('-', ''))?.baseStat || 80;
    member.baseStats = {
      hp: getStat('hp'),
      atk: getStat('attack'),
      def: getStat('defense'),
      spa: getStat('special-attack'),
      spd: getStat('special-defense'),
      spe: getStat('speed')
    };

    member.availableAbilities = (p.abilities || []).map(a => a.name);
    member.availableMoves = p.moves || [];
    member.ability = member.availableAbilities[0] || 'Standard Ability';
    member.item = 'Leftovers';
    member.nature = 'Jolly';
    member.teraType = (p.types[0]?.name || 'NORMAL').toUpperCase();
    member.moves = (p.moves || []).slice(0, 4).map(m => m.name);

    if (this.activeSlotIndexToPick < 5) {
      this.activeSlotIndexToPick++;
      const nextMember = this.teamBuilderService.members[this.activeSlotIndexToPick];
      if (!nextMember || !nextMember.name) {
        this.clearTeamBuilderTableFilters();
      }
    }

    this.teamBuilderService.saveToLocalStorage();
    this.renderTeamBuilder();

    const currentMember = this.teamBuilderService.members[this.activeSlotIndexToPick];
    if (!currentMember || !currentMember.name) {
      this.scrollToSpeciesTable();
    } else {
      this.scrollToActiveSlotEditor();
    }
  }

  private attachTeamBuilderEvents(): void {
    if (!this.teamBuilderContainer) return;

    // Avatar Strip clicks
    const avatarCards = this.teamBuilderContainer.querySelectorAll('.tb-avatar-card');
    avatarCards.forEach(card => {
      card.addEventListener('click', () => {
        const slotIdx = parseInt(card.getAttribute('data-slot') || '0', 10);
        this.activeSlotIndexToPick = slotIdx;
        const isEmpty = !this.teamBuilderService.members[slotIdx].name;
        if (isEmpty) {
          this.clearTeamBuilderTableFilters();
        }
        this.renderTeamBuilder();
        if (isEmpty) {
          this.scrollToSpeciesTable();
        } else {
          this.scrollToActiveSlotEditor();
        }
      });
    });

    // Format buttons click
    const formatBtns = this.teamBuilderContainer.querySelectorAll('.format-btn');
    formatBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.getAttribute('data-format') as FormatMode;
        this.teamBuilderService.setFormatMode(mode);
        this.renderTeamBuilder();
      });
    });

    // Remove member buttons click (Stays at the top of the page upon removal)
    const removeBtns = this.teamBuilderContainer.querySelectorAll('.remove-member-btn');
    removeBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const slotIdx = parseInt(btn.getAttribute('data-slot') || '0', 10);
        this.teamBuilderService.members[slotIdx] = this.teamBuilderService.createEmptyMember(slotIdx);
        this.activeSlotIndexToPick = slotIdx;
        this.clearTeamBuilderTableFilters();
        this.teamBuilderService.saveToLocalStorage();
        this.renderTeamBuilder();
      });
    });

    // Variety / Form select change
    const varietySelect = this.teamBuilderContainer.querySelector('.member-variety-select') as HTMLSelectElement;
    if (varietySelect) {
      varietySelect.addEventListener('change', () => {
        const pId = parseInt(varietySelect.value, 10);
        const activeMember = this.teamBuilderService.members[this.activeSlotIndexToPick];
        const group = this.speciesGroups.find(g => g.speciesId === activeMember.speciesId);
        if (group) {
          const varPokemon = group.varieties.find(v => v.id === pId);
          if (varPokemon) {
            activeMember.pokemonId = varPokemon.id;
            activeMember.name = varPokemon.name;
            activeMember.types = varPokemon.types.map(t => t.name);
            activeMember.spriteUrl = varPokemon.media.spriteUrl || group.defaultPokemon.media.spriteUrl;
            activeMember.officialArtworkUrl = varPokemon.media.officialArtworkUrl || group.defaultPokemon.media.officialArtworkUrl || group.defaultPokemon.media.spriteUrl;

            const getStat = (sName: string) => varPokemon.stats.find(s => s.name.toLowerCase() === sName.toLowerCase() || s.name.toLowerCase() === sName.replace('-', ''))?.baseStat || 80;
            activeMember.baseStats = {
              hp: getStat('hp'),
              atk: getStat('attack'),
              def: getStat('defense'),
              spa: getStat('special-attack'),
              spd: getStat('special-defense'),
              spe: getStat('speed')
            };

            activeMember.availableAbilities = (varPokemon.abilities || []).map(a => a.name);
            activeMember.availableMoves = varPokemon.moves || [];
            activeMember.ability = activeMember.availableAbilities[0] || 'Standard Ability';
            activeMember.moves = (varPokemon.moves || []).slice(0, 4).map(m => m.name);

            this.teamBuilderService.saveToLocalStorage();
            this.renderTeamBuilder();
          }
        }
      });
    }

    // Randomize Team button click
    const randomBtn = document.getElementById('random-team-btn');
    if (randomBtn) {
      randomBtn.addEventListener('click', () => {
        const available = [...this.speciesGroups];
        for (let i = 0; i < 6; i++) {
          if (available.length === 0) break;
          const randIdx = Math.floor(Math.random() * available.length);
          const pickedGroup = available.splice(randIdx, 1)[0];
          this.assignPokemonToSlot(i, pickedGroup.speciesId);
        }
        this.teamBuilderService.saveToLocalStorage();
      });
    }

    // Export Showdown Team button click
    const exportBtn = document.getElementById('export-team-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const text = this.teamBuilderService.exportShowdownText();
        this.openExportModal(text);
      });
    }

    // Clear Team button click
    const clearBtn = document.getElementById('clear-team-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        for (let i = 0; i < 6; i++) {
          this.teamBuilderService.members[i] = this.teamBuilderService.createEmptyMember(i);
        }
        this.activeSlotIndexToPick = 0;
        this.teamBuilderService.clearStorage();
        this.renderTeamBuilder();
      });
    }

    // Table Search Input (Debounced In-Place DOM Update)
    const tableSearch = document.getElementById('tb-table-search') as HTMLInputElement;
    if (tableSearch) {
      tableSearch.addEventListener('input', () => {
        this.tbSearchQuery = tableSearch.value;
        clearTimeout(this.searchDebounceTimer);
        this.searchDebounceTimer = setTimeout(() => {
          this.renderTeamBuilderTableOnly();
        }, 120);
      });
    }

    // Table Gen Filter
    const tableGen = document.getElementById('tb-table-gen') as HTMLSelectElement;
    if (tableGen) {
      tableGen.addEventListener('change', () => {
        this.tbGenFilter = tableGen.value;
        this.renderTeamBuilderTableOnly();
      });
    }

    // Table Type Filter
    const tableType = document.getElementById('tb-table-type') as HTMLSelectElement;
    if (tableType) {
      tableType.addEventListener('change', () => {
        this.tbTypeFilter = tableType.value;
        this.renderTeamBuilderTableOnly();
      });
    }

    // Table Ability Filter
    const tableAbility = document.getElementById('tb-table-ability') as HTMLSelectElement;
    if (tableAbility) {
      tableAbility.addEventListener('change', () => {
        this.tbAbilityFilter = tableAbility.value;
        this.renderTeamBuilderTableOnly();
      });
    }

    // Table Move Filter (Debounced In-Place DOM Update)
    const tableMove = document.getElementById('tb-table-move') as HTMLInputElement;
    if (tableMove) {
      tableMove.addEventListener('input', () => {
        this.tbMoveFilter = tableMove.value;
        clearTimeout(this.searchDebounceTimer);
        this.searchDebounceTimer = setTimeout(() => {
          this.renderTeamBuilderTableOnly();
        }, 120);
      });
    }

    // Table Column Sort Headers
    const sortThs = this.teamBuilderContainer.querySelectorAll('.tb-sort-th');
    sortThs.forEach(th => {
      th.addEventListener('click', () => {
        const sortField = th.getAttribute('data-sort') as any;
        if (this.tbSortField === sortField) {
          this.tbSortOrder = this.tbSortOrder === 'asc' ? 'desc' : 'asc';
        } else {
          this.tbSortField = sortField;
          this.tbSortOrder = sortField === 'id' || sortField === 'name' ? 'asc' : 'desc';
        }
        this.renderTeamBuilderTableOnly();
      });
    });

    // Attach row events initial
    this.attachTableRowsEvents();

    // Move selects change
    const moveSelects = this.teamBuilderContainer.querySelectorAll('.member-move-select');
    moveSelects.forEach(sel => {
      sel.addEventListener('change', (e) => {
        const target = e.target as HTMLSelectElement;
        const slotIdx = parseInt(target.getAttribute('data-slot') || '0', 10);
        const moveIdx = parseInt(target.getAttribute('data-move-idx') || '0', 10);
        this.teamBuilderService.members[slotIdx].moves[moveIdx] = target.value;
        this.teamBuilderService.saveToLocalStorage();
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
        this.teamBuilderService.saveToLocalStorage();
      });
    });

    const itemSelects = this.teamBuilderContainer.querySelectorAll('.member-item-select');
    itemSelects.forEach(s => {
      s.addEventListener('change', (e) => {
        const target = e.target as HTMLSelectElement;
        const slotIdx = parseInt(target.getAttribute('data-slot') || '0', 10);
        this.teamBuilderService.members[slotIdx].item = target.value;
        this.teamBuilderService.saveToLocalStorage();
      });
    });

    const natureSelects = this.teamBuilderContainer.querySelectorAll('.member-nature-select');
    natureSelects.forEach(s => {
      s.addEventListener('change', (e) => {
        const target = e.target as HTMLSelectElement;
        const slotIdx = parseInt(target.getAttribute('data-slot') || '0', 10);
        this.teamBuilderService.members[slotIdx].nature = target.value;
        this.teamBuilderService.saveToLocalStorage();
        this.renderTeamBuilder();
      });
    });

    const teraSelects = this.teamBuilderContainer.querySelectorAll('.member-tera-select');
    teraSelects.forEach(s => {
      s.addEventListener('change', (e) => {
        const target = e.target as HTMLSelectElement;
        const slotIdx = parseInt(target.getAttribute('data-slot') || '0', 10);
        this.teamBuilderService.members[slotIdx].teraType = target.value;
        this.teamBuilderService.saveToLocalStorage();
      });
    });

    // In-place real-time updating for sliders and number inputs WITHOUT HTML tear-down!
    const handleStatChange = (slotIdx: number, statKey: keyof StatBlock, val: number) => {
      const member = this.teamBuilderService.members[slotIdx];
      const isChampions = this.teamBuilderService.formatMode === 'champions';

      const clampedVal = isChampions
        ? this.teamBuilderService.clampChampionsPoints(member, statKey, val)
        : this.teamBuilderService.clampEVs(member, statKey, val);

      const sliderEl = this.teamBuilderContainer?.querySelector(`.stat-range-input[data-slot="${slotIdx}"][data-stat="${statKey}"]`) as HTMLInputElement;
      const numInputEl = this.teamBuilderContainer?.querySelector(`.stat-number-input[data-slot="${slotIdx}"][data-stat="${statKey}"]`) as HTMLInputElement;

      if (sliderEl && parseInt(sliderEl.value, 10) !== clampedVal) sliderEl.value = clampedVal.toString();
      if (numInputEl && parseInt(numInputEl.value, 10) !== clampedVal) numInputEl.value = clampedVal.toString();

      const base = member.baseStats ? member.baseStats[statKey] || 80 : 80;
      const iv = member.ivs ? member.ivs[statKey] : 31;
      const finalVal = this.teamBuilderService.calculateStat(statKey, base, clampedVal, iv, member.nature);
      const fillPercent = Math.min(100, Math.max(8, (finalVal / 320) * 100));

      if (sliderEl) {
        const rowEl = sliderEl.closest('div')?.previousElementSibling as HTMLElement;
        if (rowEl) {
          const investedSpan = rowEl.querySelector('.tb-stat-invested');
          const fillBar = rowEl.querySelector('.tb-stat-bar-fill') as HTMLElement;
          const finalSpan = rowEl.querySelector('.tb-stat-final');

          if (investedSpan) investedSpan.textContent = `+${clampedVal}`;
          if (fillBar) fillBar.style.width = `${fillPercent}%`;
          if (finalSpan) finalSpan.textContent = finalVal.toString();
        }
      }

      const totalPoints = isChampions ? this.teamBuilderService.getChampionsTotalPoints(member) : this.teamBuilderService.getEVsTotalPoints(member);
      const maxTotal = isChampions ? 66 : 510;
      const pointsCounterEl = this.teamBuilderContainer?.querySelector('.tb-total-points-badge') as HTMLElement;
      if (pointsCounterEl) {
        pointsCounterEl.textContent = `${totalPoints} / ${maxTotal} Pts`;
        pointsCounterEl.style.color = totalPoints > maxTotal ? '#ef4444' : (totalPoints === maxTotal ? '#4ade80' : '#38bdf8');
      }

      let sumBase = 0;
      let sumFinal = 0;
      const statKeys: (keyof StatBlock)[] = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'];
      statKeys.forEach(k => {
        const b = member.baseStats ? member.baseStats[k] || 80 : 80;
        const inv = isChampions ? (member.championsPoints[k] || 0) : (member.evs[k] || 0);
        const f = this.teamBuilderService.calculateStat(k, b, inv, member.ivs ? member.ivs[k] : 31, member.nature);
        sumBase += b;
        sumFinal += f;
      });

      const totalBaseEl = this.teamBuilderContainer?.querySelector('.tb-sum-base') as HTMLElement;
      const totalFinalEl = this.teamBuilderContainer?.querySelector('.tb-sum-final') as HTMLElement;
      if (totalBaseEl) totalBaseEl.textContent = sumBase.toString();
      if (totalFinalEl) totalFinalEl.textContent = sumFinal.toString();
    };

    const rangeInputs = this.teamBuilderContainer.querySelectorAll('.stat-range-input');
    rangeInputs.forEach(inp => {
      inp.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement;
        const slotIdx = parseInt(target.getAttribute('data-slot') || '0', 10);
        const statKey = target.getAttribute('data-stat') as keyof StatBlock;
        const val = parseInt(target.value || '0', 10);
        handleStatChange(slotIdx, statKey, val);
      });
    });

    const numberInputs = this.teamBuilderContainer.querySelectorAll('.stat-number-input');
    numberInputs.forEach(inp => {
      inp.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement;
        const slotIdx = parseInt(target.getAttribute('data-slot') || '0', 10);
        const statKey = target.getAttribute('data-stat') as keyof StatBlock;
        const val = parseInt(target.value || '0', 10);
      });
    });
  }

  private attachOptionsItemsEvents(): void {
    const gridEl = document.getElementById('tb-options-grid');
    if (!gridEl) return;

    const items = gridEl.querySelectorAll('.tb-option-item');
    items.forEach(it => {
      it.addEventListener('click', () => {
        const sId = parseInt(it.getAttribute('data-species-id') || '0', 10);
        let targetSlot = this.activeSlotIndexToPick;
        if (targetSlot === null) {
          // Find first empty slot
          const emptyIdx = this.teamBuilderService.members.findIndex(m => !m.name);
          targetSlot = emptyIdx !== -1 ? emptyIdx : 0;
        }
        this.assignPokemonToSlot(targetSlot, sId);
      });
    });
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
        if (this.activeSlotIndexToPick !== null) {
          this.assignPokemonToSlot(this.activeSlotIndexToPick, sId);
          this.pickerModal.classList.add('hidden');
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
