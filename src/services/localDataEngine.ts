import * as fs from 'fs';
import * as path from 'path';
import { Pokemon, PokemonQueryParams, PokemonNotFoundError, PokemonStat, PokemonType } from '../types/pokemon';

const STAT_NAMES: Record<number, string> = {
  1: 'hp',
  2: 'attack',
  3: 'defense',
  4: 'special-attack',
  5: 'special-defense',
  6: 'speed',
};

const TYPE_NAMES: Record<number, string> = {
  1: 'normal',
  2: 'fighting',
  3: 'flying',
  4: 'poison',
  5: 'ground',
  6: 'rock',
  7: 'bug',
  8: 'ghost',
  9: 'steel',
  10: 'fire',
  11: 'water',
  12: 'grass',
  13: 'electric',
  14: 'psychic',
  15: 'ice',
  16: 'dragon',
  17: 'dark',
  18: 'fairy',
  10001: 'shadow',
  10002: 'unknown',
};

export class LocalDataEngine {
  private snapshotPath: string;
  private pokemonMap: Map<number, Pokemon> = new Map();
  private nameIndex: Map<string, number> = new Map();
  private initialized: boolean = false;

  constructor(snapshotPath: string) {
    this.snapshotPath = snapshotPath;
  }

  public async initialize(): Promise<void> {
    if (this.initialized) return;

    const csvDir = path.join(this.snapshotPath, 'data', 'v2', 'csv');
    if (!fs.existsSync(csvDir)) {
      throw new Error(`Local snapshot CSV directory not found at: ${csvDir}`);
    }

    // Parse types dictionary if available
    const typeDict = this.loadTypeDictionary(path.join(csvDir, 'types.csv'));
    // Parse stats dictionary if available
    const statDict = this.loadStatDictionary(path.join(csvDir, 'stats.csv'));

    // Load main pokemon.csv
    const pokemonRows = this.parseCsvFile(path.join(csvDir, 'pokemon.csv'));
    for (const row of pokemonRows) {
      const id = parseInt(row['id'], 10);
      const identifier = row['identifier'] || '';
      if (!id || isNaN(id) || !identifier) continue;

      const height = parseInt(row['height'] || '0', 10);
      const weight = parseInt(row['weight'] || '0', 10);
      const baseExperience = parseInt(row['base_experience'] || '0', 10);
      const order = parseInt(row['order'] || '0', 10);
      const isDefault = row['is_default'] === '1';

      // Format name nicely (capitalize first letter)
      const formattedName = identifier.charAt(0).toUpperCase() + identifier.slice(1);
      const speciesId = parseInt(row['species_id'] || row['id'], 10) || id;

      this.pokemonMap.set(id, {
        id,
        speciesId,
        name: formattedName,
        height,
        weight,
        baseExperience,
        order,
        isDefault,
        types: [],
        stats: [],
        abilities: [],
      });
      this.nameIndex.set(identifier.toLowerCase(), id);
    }

    // Load abilities dictionary if available
    const abilityDict = this.loadAbilityDictionary(path.join(csvDir, 'abilities.csv'));

    // Load pokemon_types.csv
    const typeRows = this.parseCsvFile(path.join(csvDir, 'pokemon_types.csv'));
    for (const row of typeRows) {
      const pokemonId = parseInt(row['pokemon_id'], 10);
      const typeId = parseInt(row['type_id'], 10);
      const slot = parseInt(row['slot'] || '1', 10);

      const pokemon = this.pokemonMap.get(pokemonId);
      if (pokemon) {
        const typeName = typeDict[typeId] || TYPE_NAMES[typeId] || `type-${typeId}`;
        pokemon.types.push({ name: typeName, slot });
      }
    }

    // Sort types by slot
    for (const pokemon of this.pokemonMap.values()) {
      pokemon.types.sort((a, b) => a.slot - b.slot);
    }

    // Load pokemon_stats.csv
    const statRows = this.parseCsvFile(path.join(csvDir, 'pokemon_stats.csv'));
    for (const row of statRows) {
      const pokemonId = parseInt(row['pokemon_id'], 10);
      const statId = parseInt(row['stat_id'], 10);
      const baseStat = parseInt(row['base_stat'] || '0', 10);
      const effort = parseInt(row['effort'] || '0', 10);

      const pokemon = this.pokemonMap.get(pokemonId);
      if (pokemon) {
        const statName = statDict[statId] || STAT_NAMES[statId] || `stat-${statId}`;
        pokemon.stats.push({ name: statName, baseStat, effort });
      }
    }

    // Load pokemon_abilities.csv
    const abilityRows = this.parseCsvFile(path.join(csvDir, 'pokemon_abilities.csv'));
    for (const row of abilityRows) {
      const pokemonId = parseInt(row['pokemon_id'], 10);
      const abilityId = parseInt(row['ability_id'], 10);
      const isHidden = row['is_hidden'] === '1';
      const slot = parseInt(row['slot'] || '1', 10);

      const pokemon = this.pokemonMap.get(pokemonId);
      if (pokemon) {
        const abilityName = abilityDict[abilityId] || `ability-${abilityId}`;
        pokemon.abilities.push({ name: abilityName, isHidden, slot });
      }
    }

    for (const pokemon of this.pokemonMap.values()) {
      pokemon.abilities.sort((a, b) => a.slot - b.slot);
    }

    this.initialized = true;
  }

  public getPokemonById(id: number): Pokemon {
    this.ensureInitialized();
    const pokemon = this.pokemonMap.get(id);
    if (!pokemon) {
      throw new PokemonNotFoundError(id);
    }
    return { ...pokemon };
  }

  public getPokemonByName(name: string): Pokemon {
    this.ensureInitialized();
    const id = this.nameIndex.get(name.toLowerCase());
    if (!id) {
      throw new PokemonNotFoundError(name);
    }
    return this.getPokemonById(id);
  }

  public queryPokemon(params: PokemonQueryParams): Pokemon[] {
    this.ensureInitialized();
    let results = Array.from(this.pokemonMap.values());

    if (params.search) {
      const searchLower = params.search.toLowerCase().trim();
      results = results.filter(
        (p) => p.name.toLowerCase().includes(searchLower) || p.id.toString() === searchLower
      );
    }

    if (params.typeFilter) {
      const typeLower = params.typeFilter.toLowerCase().trim();
      results = results.filter((p) => p.types.some((t) => t.name.toLowerCase() === typeLower));
    }

    const offset = params.offset || 0;
    const limit = params.limit || results.length;

    return results.slice(offset, offset + limit).map((p) => ({ ...p }));
  }

  public getAllPokemonCount(): number {
    this.ensureInitialized();
    return this.pokemonMap.size;
  }

  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error('LocalDataEngine has not been initialized. Call initialize() first.');
    }
  }

  private parseCsvFile(filePath: string): Array<Record<string, string>> {
    if (!fs.existsSync(filePath)) {
      return [];
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split(/\r?\n/).filter((line) => line.trim().length > 0);
    if (lines.length === 0) return [];

    const headers = this.parseCsvLine(lines[0]);
    const records: Array<Record<string, string>> = [];

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCsvLine(lines[i]);
      if (values.length === 0) continue;
      const record: Record<string, string> = {};
      for (let j = 0; j < headers.length; j++) {
        record[headers[j]] = values[j] !== undefined ? values[j] : '';
      }
      records.push(record);
    }

    return records;
  }

  private parseCsvLine(line: string): string[] {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    return values;
  }

  private loadTypeDictionary(filePath: string): Record<number, string> {
    const dict: Record<number, string> = {};
    const rows = this.parseCsvFile(filePath);
    for (const row of rows) {
      const id = parseInt(row['id'], 10);
      const identifier = row['identifier'];
      if (id && identifier) {
        dict[id] = identifier;
      }
    }
    return dict;
  }

  private loadStatDictionary(filePath: string): Record<number, string> {
    const dict: Record<number, string> = {};
    const rows = this.parseCsvFile(filePath);
    for (const row of rows) {
      const id = parseInt(row['id'], 10);
      const identifier = row['identifier'];
      if (id && identifier) {
        dict[id] = identifier;
      }
    }
    return dict;
  }

  private loadAbilityDictionary(filePath: string): Record<number, string> {
    const dict: Record<number, string> = {};
    const rows = this.parseCsvFile(filePath);
    for (const row of rows) {
      const id = parseInt(row['id'], 10);
      const identifier = row['identifier'];
      if (id && identifier) {
        dict[id] = identifier.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      }
    }
    return dict;
  }
}
