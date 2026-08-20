import { LocalDataEngine } from '../services/localDataEngine';
import { MediaProvider, PokemonMedia } from '../services/mediaProvider';
import { Pokemon } from '../types/pokemon';

export interface PokemonCardData extends Pokemon {
  media: PokemonMedia;
}

export interface FilterOptions {
  search?: string;
  typeFilter?: string;
}

export interface FilterResult {
  items: PokemonCardData[];
  total: number;
  isEmpty: boolean;
  emptyMessage: string;
}

export class PokedexController {
  private engine: LocalDataEngine;
  private mediaProvider: MediaProvider;

  constructor(engine: LocalDataEngine, mediaProvider: MediaProvider) {
    this.engine = engine;
    this.mediaProvider = mediaProvider;
  }

  public filter(options: FilterOptions = {}): FilterResult {
    const rawItems = this.engine.queryPokemon({
      search: options.search,
      typeFilter: options.typeFilter,
    });

    const items: PokemonCardData[] = rawItems.map(p => ({
      ...p,
      media: this.mediaProvider.getMediaForPokemon(p.id),
    }));

    const isEmpty = items.length === 0;

    return {
      items,
      total: items.length,
      isEmpty,
      emptyMessage: isEmpty ? 'Nenhum Pokémon encontrado' : '',
    };
  }

  public clearFilters(): FilterResult {
    return this.filter({});
  }
}
