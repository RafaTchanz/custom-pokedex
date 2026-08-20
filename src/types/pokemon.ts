export interface PokemonStat {
  name: string;
  baseStat: number;
  effort: number;
}

export interface PokemonType {
  name: string;
  slot: number;
}

export interface PokemonAbility {
  name: string;
  isHidden: boolean;
  slot: number;
}

export interface PokemonMove {
  name: string;
  type: string;
  method: 'level-up' | 'egg' | 'machine' | 'tutor';
  level?: number;
  power?: number;
  damageClass?: string;
}

export interface PokemonEvolutionStep {
  speciesId: number;
  name: string;
  triggerDetails?: string;
  isCurrent?: boolean;
}

export interface PokemonEncounter {
  game: string;
  location: string;
  minLevel: number;
  maxLevel: number;
}

export interface PokemonMedia {
  officialArtworkUrl: string;
  spriteUrl: string;
  shinyArtwork?: string;
  shinySpriteFront?: string;
  shinyOfficialArtworkUrl?: string;
  shinySpriteUrl?: string;
  cryUrl: string | null;
  hasCry?: boolean;
}

export interface Pokemon {
  id: number;
  speciesId: number;
  name: string;
  height: number;
  weight: number;
  baseExperience: number;
  order: number;
  isDefault: boolean;
  types: PokemonType[];
  stats: PokemonStat[];
  abilities: PokemonAbility[];
  spriteUrl?: string;
  cryUrl?: string;
  media?: PokemonMedia;
  moves?: PokemonMove[];
  evolutionChain?: PokemonEvolutionStep[];
  obtainMethod?: string;
  encounters?: PokemonEncounter[];
}

export interface PokemonQueryParams {
  search?: string;
  typeFilter?: string;
  limit?: number;
  offset?: number;
}

export class PokemonNotFoundError extends Error {
  constructor(identifier: string | number) {
    super(`POKEMON_NOT_FOUND: Pokémon '${identifier}' was not found.`);
    this.name = 'PokemonNotFoundError';
  }
}
