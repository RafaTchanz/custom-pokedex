interface PokemonStat {
  name: string;
  baseStat: number;
}

interface PokemonType {
  slot: number;
  name: string;
}

interface PokemonMedia {
  officialArtworkUrl: string;
  spriteUrl: string;
  cryUrl: string;
  hasCry: boolean;
}

interface PokemonCardData {
  id: number;
  name: string;
  height: number;
  weight: number;
  stats: PokemonStat[];
  types: PokemonType[];
  media: PokemonMedia;
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

class PokedexApp {
  private allPokemon: PokemonCardData[] = [];
  private currentAudio: HTMLAudioElement | null = null;
  private currentPlayingBtn: HTMLButtonElement | null = null;

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
      this.render();
    } catch (err) {
      console.error('Error loading Pokédex dataset:', err);
      this.totalCountText.textContent = 'Erro ao carregar dados locais';
    }
  }

  private filterPokemon(): PokemonCardData[] {
    const search = this.searchInput.value.trim().toLowerCase();
    const typeFilter = this.typeSelect.value.trim().toLowerCase();

    return this.allPokemon.filter(p => {
      // Type Filter
      if (typeFilter && !p.types.some(t => t.name.toLowerCase() === typeFilter)) {
        return false;
      }

      // Search by Name or ID
      if (search) {
        const matchesName = p.name.toLowerCase().includes(search);
        const matchesId = p.id.toString() === search || `#${p.id}` === search;
        if (!matchesName && !matchesId) {
          return false;
        }
      }

      return true;
    });
  }

  private render(): void {
    const filtered = this.filterPokemon();

    this.totalCountText.textContent = `${filtered.length} Pokémons Exibidos (Total: ${this.allPokemon.length})`;

    if (filtered.length === 0) {
      this.gridContainer.innerHTML = '';
      this.emptyState.classList.remove('hidden');
      return;
    }

    this.emptyState.classList.add('hidden');

    // Render cards
    this.gridContainer.innerHTML = filtered.map(p => this.createCardHTML(p)).join('');

    // Attach event handlers for cards and cry buttons
    filtered.forEach(p => {
      const cardEl = document.getElementById(`pokemon-card-${p.id}`);
      if (cardEl) {
        cardEl.addEventListener('click', (e) => {
          const target = e.target as HTMLElement;
          if (target.closest('.cry-btn')) return; // Ignore modal click if cry button pressed
          this.openModal(p);
        });
      }

      const cryBtn = document.getElementById(`cry-btn-${p.id}`) as HTMLButtonElement;
      if (cryBtn) {
        cryBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.playCry(p.media.cryUrl, cryBtn);
        });
      }
    });
  }

  private createCardHTML(p: PokemonCardData): string {
    const formattedId = `#${p.id.toString().padStart(4, '0')}`;
    const typeBadges = p.types
      .map(t => {
        const color = TYPE_COLORS[t.name.toLowerCase()] || '#a8a77a';
        return `<span class="type-badge" style="background-color: ${color};">${t.name}</span>`;
      })
      .join('');

    const imgUrl = p.media.officialArtworkUrl || p.media.spriteUrl;

    return `
      <div id="pokemon-card-${p.id}" class="pokemon-card">
        <span class="card-number">${formattedId}</span>
        <div class="card-img-container">
          <img class="card-artwork" src="${imgUrl}" alt="${p.name}" loading="lazy" onerror="this.src='${p.media.spriteUrl}'">
        </div>
        <h3 class="card-title">${p.name}</h3>
        <div class="type-badges">
          ${typeBadges}
        </div>
        <button id="cry-btn-${p.id}" class="cry-btn" title="Ouvir som do cry">
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

  private openModal(p: PokemonCardData): string {
    const formattedId = `#${p.id.toString().padStart(4, '0')}`;
    const typeBadges = p.types
      .map(t => {
        const color = TYPE_COLORS[t.name.toLowerCase()] || '#a8a77a';
        return `<span class="type-badge" style="background-color: ${color}; padding: 0.35rem 1rem; font-size: 0.85rem;">${t.name}</span>`;
      })
      .join('');

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

    this.modalContent.innerHTML = `
      <div style="text-align: center;">
        <span style="font-size: 0.9rem; font-weight: 800; color: #94a3b8;">${formattedId}</span>
        <h2 style="font-size: 2rem; font-weight: 800; text-transform: capitalize; margin: 0.2rem 0 0.8rem 0;">${p.name}</h2>
        
        <div style="display: flex; justify-content: center; gap: 0.5rem; margin-bottom: 1.5rem;">
          ${typeBadges}
        </div>

        <div style="width: 180px; height: 180px; margin: 0 auto 1.5rem auto;">
          <img src="${p.media.officialArtworkUrl || p.media.spriteUrl}" alt="${p.name}" style="width: 100%; height: 100%; object-fit: contain; filter: drop-shadow(0 12px 20px rgba(0,0,0,0.5));">
        </div>

        <div style="display: flex; justify-content: center; gap: 2rem; background: rgba(15,23,42,0.6); padding: 0.75rem 1.5rem; border-radius: 16px; margin-bottom: 1.5rem; font-size: 0.9rem;">
          <div><strong>Altura:</strong> ${(p.height / 10).toFixed(1)} m</div>
          <div><strong>Peso:</strong> ${(p.weight / 10).toFixed(1)} kg</div>
        </div>

        <div style="text-align: left; background: rgba(15,23,42,0.4); padding: 1.25rem; border-radius: 16px; margin-bottom: 1.5rem;">
          <h4 style="font-size: 0.95rem; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8; margin-bottom: 0.75rem;">Estatísticas Base (Base Stats)</h4>
          ${statsHTML}
        </div>

        <button id="modal-cry-btn" class="cry-btn" style="width: 100%; justify-content: center; padding: 0.75rem; font-size: 1rem;">
          🔊 Play Cry Audio
        </button>
      </div>
    `;

    this.modalBackdrop.classList.remove('hidden');

    const modalCryBtn = document.getElementById('modal-cry-btn') as HTMLButtonElement;
    if (modalCryBtn) {
      modalCryBtn.addEventListener('click', () => {
        this.playCry(p.media.cryUrl, modalCryBtn);
      });
    }

    return formattedId;
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
