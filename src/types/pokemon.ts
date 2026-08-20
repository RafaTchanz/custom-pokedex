export interface PokemonStat {
  name: string;
  baseStat: number;
  effort: number;
}

export interface PokemonType {
  name: string;
  slot: number;
}

export interface Pokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  baseExperience: number;
  order: number;
  isDefault: boolean;
  types: PokemonType[];
  stats: PokemonStat[];
  spriteUrl?: string;
  cryUrl?: string;
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
