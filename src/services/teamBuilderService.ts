export type FormatMode = 'champions' | 'scarlet-violet';

export interface StatBlock {
  hp: number;
  atk: number;
  def: number;
  spa: number;
  spd: number;
  spe: number;
}

export interface TeamMember {
  slotIndex: number;
  speciesId?: number;
  pokemonId?: number;
  name?: string;
  types?: string[];
  spriteUrl?: string;
  officialArtworkUrl?: string;
  baseStats?: StatBlock;
  availableAbilities?: string[];
  availableMoves?: Array<{ name: string; type: string; damageClass?: string; power?: number }>;
  ability?: string;
  item?: string;
  nature?: string;
  teraType?: string;
  moves: string[]; // Up to 4 moves
  championsPoints: StatBlock; // Max 66 total, Max 32 per stat
  evs: StatBlock; // Max 510 total, Max 252 per stat
  ivs: StatBlock; // Fixed to 31 in Champions mode
}

export interface TypeCoverageSummary {
  type: string;
  weakCount: number; // Team members weak (2x/4x)
  resistCount: number; // Team members resisting (0.5x/0.25x/0x)
  superEffectiveMovesCount: number; // Moves in team dealing 2x/4x
  superEffectiveMoveNames: string[];
}

export const ALL_TYPES = [
  'normal', 'fire', 'water', 'grass', 'electric', 'ice', 'fighting',
  'poison', 'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost',
  'dragon', 'dark', 'steel', 'fairy'
];

export const TYPE_CHART: Record<string, Record<string, number>> = {
  normal:   { rock: 0.5, ghost: 0, steel: 0.5 },
  fire:     { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
  water:    { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  grass:    { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
  electric: { water: 2, grass: 0.5, electric: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  ice:      { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
  fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
  poison:   { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
  ground:   { fire: 2, grass: 0.5, electric: 2, poison: 2, bug: 0.5, rock: 2, flying: 0, steel: 2 },
  flying:   { grass: 2, electric: 0.5, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
  psychic:  { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug:      { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
  rock:     { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
  ghost:    { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon:   { dragon: 2, steel: 0.5, fairy: 0 },
  dark:     { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
  steel:    { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
  fairy:    { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 }
};

export const POPULAR_ITEMS = [
  // --- Core Competitive Essentials ---
  'Leftovers', 'Focus Sash', 'Choice Scarf', 'Choice Band', 'Choice Specs',
  'Life Orb', 'Assault Vest', 'Heavy-Duty Boots', 'Rocky Helmet', 'Eviolite',
  'Booster Energy', 'Loaded Dice', 'Clear Amulet', 'Covert Cloak', 'Mirror Herb',
  'Weakness Policy', 'Air Balloon', 'Light Clay', 'Flame Orb', 'Toxic Orb',
  'White Herb', 'Power Herb', 'Mental Herb', 'Eject Button', 'Eject Pack', 'Red Card',
  'Safety Goggles', 'Utility Umbrella', 'Punching Glove', 'Blunder Policy',
  'Expert Belt', 'Muscle Band', 'Wise Glasses', 'Scope Lens', 'Razor Claw',
  'King\'s Rock', 'Metronome', 'Shell Bell', 'Big Root',

  // --- Type-Boosting Items (20% Damage Boost) ---
  'Charcoal', 'Mystic Water', 'Miracle Seed', 'Magnet', 'Never-Melt Ice',
  'Sharp Beak', 'Poison Barb', 'Soft Sand', 'Hard Stone', 'Silver Powder',
  'Spell Tag', 'Dragon Fang', 'Black Glasses', 'Metal Coat', 'Silk Scarf',
  'Twisted Spoon', 'Black Belt', 'Pixie Plate',

  // --- Arceus Elemental Plates ---
  'Draco Plate', 'Dread Plate', 'Earth Plate', 'Fist Plate', 'Flame Plate',
  'Icicle Plate', 'Insect Plate', 'Iron Plate', 'Meadow Plate', 'Mind Plate',
  'Sky Plate', 'Splash Plate', 'Spooky Plate', 'Stone Plate', 'Toxic Plate', 'Zap Plate',

  // --- Weather & Terrain Extenders ---
  'Damp Rock', 'Heat Rock', 'Smooth Rock', 'Icy Rock', 'Terrain Extender',

  // --- Species & Form Specific Items ---
  'Light Ball', 'Thick Club', 'Soul Dew', 'Deep Sea Tooth', 'Deep Sea Scale',
  'Adamant Orb', 'Lustrous Orb', 'Griseous Orb', 'Rusted Sword', 'Rusted Shield',
  'Wellspring Mask', 'Hearthflame Mask', 'Cornerstone Mask',

  // --- Competitive Berries (HP & Status) ---
  'Sitrus Berry', 'Lum Berry', 'Chesto Berry', 'Pecha Berry', 'Rawst Berry',
  'Aspear Berry', 'Persim Berry', 'Cheri Berry',

  // --- Pinch & Stat Boosting Berries ---
  'Liechi Berry', 'Ganlon Berry', 'Salac Berry', 'Petaya Berry', 'Apicot Berry',
  'Lansat Berry', 'Starf Berry', 'Mago Berry', 'Figy Berry', 'Aguav Berry',
  'Wiki Berry', 'Iapapa Berry', 'Kee Berry', 'Maranga Berry',

  // --- Type-Resist Berries (Damage Reduction) ---
  'Occa Berry', 'Passho Berry', 'Wacan Berry', 'Rindo Berry', 'Yache Berry',
  'Chople Berry', 'Kebia Berry', 'Shuca Berry', 'Coba Berry', 'Payapa Berry',
  'Tanga Berry', 'Charti Berry', 'Kasib Berry', 'Haban Berry', 'Colbur Berry',
  'Babiri Berry', 'Roseli Berry'
];

export const MEGA_STONES = [
  'Charizardite X', 'Charizardite Y', 'Blastoisinite', 'Venusaurite', 'Gengarite',
  'Lucarionite', 'Mewtwonite X', 'Mewtwonite Y', 'Salamencite', 'Metagrossite',
  'Gardevoirite', 'Galladite', 'Gyaradosite', 'Tyranitarite', 'Alakazamite',
  'Garchompite', 'Sablenite', 'Mawilite', 'Aggronite', 'Scizorite',
  'Heracronite', 'Houndoominite', 'Aerodactylite', 'Pinsirite', 'Slowbronite',
  'Abomasite', 'Manectrite', 'Banettite', 'Absolite', 'Medichamite',
  'Ampharosite', 'Kangaskhanite', 'Latiasite', 'Latiosite', 'Beedrillite',
  'Pidgeotite', 'Sceptilite', 'Swampertite', 'Steelixite', 'Cameruptite',
  'Sharpedonite', 'Altariaite', 'Glalitite', 'Audinite', 'Diancite'
];

export const NATURES: Record<string, { plus?: keyof StatBlock; minus?: keyof StatBlock; label: string }> = {
  Adamant: { plus: 'atk', minus: 'spa', label: '+Atk, -SpA' },
  Jolly:   { plus: 'spe', minus: 'spa', label: '+Spe, -SpA' },
  Modest:  { plus: 'spa', minus: 'atk', label: '+SpA, -Atk' },
  Timid:   { plus: 'spe', minus: 'atk', label: '+Spe, -Atk' },
  Bold:    { plus: 'def', minus: 'atk', label: '+Def, -Atk' },
  Impish:  { plus: 'def', minus: 'spa', label: '+Def, -SpA' },
  Calm:    { plus: 'spd', minus: 'atk', label: '+SpD, -Atk' },
  Careful: { plus: 'spd', minus: 'spa', label: '+SpD, -SpA' },
  Hardy:   { label: 'Neutra' }
};

const STORAGE_KEY = 'tchanzdex_team_builder_state_v1';

export class TeamBuilderService {
  public formatMode: FormatMode = 'champions';
  public members: TeamMember[] = Array.from({ length: 6 }, (_, i) => this.createEmptyMember(i));

  constructor() {
    this.loadFromLocalStorage();
  }

  public saveToLocalStorage(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const state = {
        formatMode: this.formatMode,
        members: this.members
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore
    }
  }

  public loadFromLocalStorage(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.members) && parsed.members.length === 6) {
        if (parsed.formatMode === 'champions' || parsed.formatMode === 'scarlet-violet') {
          this.formatMode = parsed.formatMode;
        }
        this.members = parsed.members.map((m: any, idx: number) => {
          const empty = this.createEmptyMember(idx);
          if (!m || typeof m !== 'object') return empty;
          return {
            ...empty,
            ...m,
            slotIndex: idx,
            championsPoints: { ...empty.championsPoints, ...(m.championsPoints || {}) },
            evs: { ...empty.evs, ...(m.evs || {}) },
            ivs: { ...empty.ivs, ...(m.ivs || {}) },
            moves: Array.isArray(m.moves) ? m.moves : []
          };
        });
      }
    } catch {
      // ignore
    }
  }

  public clearStorage(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }

  public createEmptyMember(slotIndex: number): TeamMember {
    return {
      slotIndex,
      name: '',
      moves: [],
      championsPoints: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
      evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
      ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 }
    };
  }

  public setFormatMode(mode: FormatMode): void {
    this.formatMode = mode;
    if (mode === 'champions') {
      // Lock IVs to 31 in Champions mode
      this.members.forEach(m => {
        m.ivs = { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 };
      });
    }
    this.saveToLocalStorage();
  }

  public getChampionsTotalPoints(m: TeamMember): number {
    return (m.championsPoints.hp || 0) + (m.championsPoints.atk || 0) +
           (m.championsPoints.def || 0) + (m.championsPoints.spa || 0) +
           (m.championsPoints.spd || 0) + (m.championsPoints.spe || 0);
  }

  public getEVsTotalPoints(m: TeamMember): number {
    return (m.evs.hp || 0) + (m.evs.atk || 0) + (m.evs.def || 0) +
           (m.evs.spa || 0) + (m.evs.spd || 0) + (m.evs.spe || 0);
  }

  public validateChampionsPoints(m: TeamMember): boolean {
    const total = this.getChampionsTotalPoints(m);
    if (total > 66) return false;
    const stats: (keyof StatBlock)[] = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'];
    return stats.every(s => (m.championsPoints[s] || 0) <= 32);
  }

  public validateEVsPoints(m: TeamMember): boolean {
    const total = this.getEVsTotalPoints(m);
    if (total > 510) return false;
    const stats: (keyof StatBlock)[] = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'];
    return stats.every(s => (m.evs[s] || 0) <= 252);
  }

  public clampChampionsPoints(m: TeamMember, stat: keyof StatBlock, requestedValue: number): number {
    const clampedSingle = Math.min(32, Math.max(0, requestedValue));
    const otherSum = (['hp', 'atk', 'def', 'spa', 'spd', 'spe'] as (keyof StatBlock)[])
      .filter(k => k !== stat)
      .reduce((sum, k) => sum + (m.championsPoints[k] || 0), 0);

    const allowed = Math.max(0, 66 - otherSum);
    const finalVal = Math.min(clampedSingle, allowed);
    m.championsPoints[stat] = finalVal;
    this.saveToLocalStorage();
    return finalVal;
  }

  public clampEVs(m: TeamMember, stat: keyof StatBlock, requestedValue: number): number {
    const clampedSingle = Math.min(252, Math.max(0, requestedValue));
    const otherSum = (['hp', 'atk', 'def', 'spa', 'spd', 'spe'] as (keyof StatBlock)[])
      .filter(k => k !== stat)
      .reduce((sum, k) => sum + (m.evs[k] || 0), 0);

    const allowed = Math.max(0, 510 - otherSum);
    const finalVal = Math.min(clampedSingle, allowed);
    m.evs[stat] = finalVal;
    this.saveToLocalStorage();
    return finalVal;
  }

  public calculateStat(
    statKey: keyof StatBlock,
    base: number,
    invested: number,
    iv: number = 31,
    natureName: string = 'Hardy'
  ): number {
    if (statKey === 'hp') {
      if (this.formatMode === 'champions') {
        return Math.floor(((2 * base + iv + Math.floor(invested * 8 / 4)) * 50) / 100) + 60;
      }
      return Math.floor(((2 * base + iv + Math.floor(invested / 4)) * 50) / 100) + 60;
    }

    const evEquivalent = this.formatMode === 'champions' ? Math.floor(invested * 8 / 4) : Math.floor(invested / 4);
    let val = Math.floor(((2 * base + iv + evEquivalent) * 50) / 100) + 5;

    const natureInfo = NATURES[natureName];
    if (natureInfo) {
      if (natureInfo.plus === statKey) val = Math.floor(val * 1.1);
      else if (natureInfo.minus === statKey) val = Math.floor(val * 0.9);
    }
    return val;
  }

  public calculateDefenseEffectiveness(defenderTypes: string[], attackType: string): number {
    if (!defenderTypes || defenderTypes.length === 0) return 1.0;
    let multiplier = 1.0;
    const chart = TYPE_CHART[attackType.toLowerCase()];
    if (!chart) return 1.0;

    defenderTypes.forEach(t => {
      const mult = chart[t.toLowerCase()];
      if (mult !== undefined) {
        multiplier *= mult;
      }
    });

    return multiplier;
  }

  public analyzeTeamCoverage(): TypeCoverageSummary[] {
    const activeMembers = this.members.filter(m => m.name && m.types && m.types.length > 0);

    return ALL_TYPES.map(targetType => {
      let weakCount = 0;
      let resistCount = 0;
      const superEffectiveMoveNames: string[] = [];

      // Defensive Analysis
      activeMembers.forEach(m => {
        const mult = this.calculateDefenseEffectiveness(m.types!, targetType);
        if (mult > 1.0) weakCount++;
        else if (mult < 1.0) resistCount++;
      });

      // Offensive Move Coverage Analysis (Only Damaging Moves)
      activeMembers.forEach(m => {
        if (!m.availableMoves || !m.moves || m.moves.length === 0) return;
        m.moves.forEach(mName => {
          if (!mName) return;
          const moveData = m.availableMoves?.find(am => am.name.toLowerCase() === mName.toLowerCase());
          if (!moveData || !moveData.type) return;

          // Exclude Status / Non-damaging moves (e.g. Agility, Swords Dance, Recover, Will-O-Wisp)
          const isStatusMove = moveData.damageClass === 'status' || (!moveData.power && moveData.damageClass !== 'physical' && moveData.damageClass !== 'special');
          if (isStatusMove) return;

          const chart = TYPE_CHART[moveData.type.toLowerCase()];
          if (chart && chart[targetType.toLowerCase()] !== undefined && chart[targetType.toLowerCase()] > 1.0) {
            if (!superEffectiveMoveNames.includes(`${m.name} (${moveData.name})`)) {
              superEffectiveMoveNames.push(`${m.name} (${moveData.name})`);
            }
          }
        });
      });

      return {
        type: targetType,
        weakCount,
        resistCount,
        superEffectiveMovesCount: superEffectiveMoveNames.length,
        superEffectiveMoveNames
      };
    });
  }

  public exportShowdownText(): string {
    const active = this.members.filter(m => m.name);
    if (active.length === 0) return '# Seu time está vazio no TchanzDex!';

    let output = `# TchanzDex Team Export - Format: ${this.formatMode === 'champions' ? 'Pokémon Champions' : 'Scarlet & Violet'}\n\n`;

    active.forEach(m => {
      output += `${m.name} @ ${m.item || 'Leftovers'}\n`;
      if (m.ability) output += `Ability: ${m.ability}\n`;
      if (m.teraType) output += `Tera Type: ${m.teraType}\n`;

      if (this.formatMode === 'champions') {
        output += `# Status Points (66 Max): HP: ${m.championsPoints.hp} | Atk: ${m.championsPoints.atk} | Def: ${m.championsPoints.def} | SpA: ${m.championsPoints.spa} | SpD: ${m.championsPoints.spd} | Spe: ${m.championsPoints.spe}\n`;
      } else {
        const evParts: string[] = [];
        if (m.evs.hp) evParts.push(`${m.evs.hp} HP`);
        if (m.evs.atk) evParts.push(`${m.evs.atk} Atk`);
        if (m.evs.def) evParts.push(`${m.evs.def} Def`);
        if (m.evs.spa) evParts.push(`${m.evs.spa} SpA`);
        if (m.evs.spd) evParts.push(`${m.evs.spd} SpD`);
        if (m.evs.spe) evParts.push(`${m.evs.spe} Spe`);
        if (evParts.length > 0) output += `EVs: ${evParts.join(' / ')}\n`;
      }

      if (m.nature) output += `${m.nature} Nature\n`;
      m.moves.forEach(move => {
        if (move) output += `- ${move}\n`;
      });
      output += '\n';
    });

    return output;
  }
}
