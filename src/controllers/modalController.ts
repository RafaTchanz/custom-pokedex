import { LocalDataEngine } from '../services/localDataEngine';
import { MediaProvider, PokemonMedia } from '../services/mediaProvider';
import { Pokemon } from '../types/pokemon';

export interface PokemonModalData extends Pokemon {
  media: PokemonMedia;
}

export class ModalController {
  private engine: LocalDataEngine;
  private mediaProvider: MediaProvider;

  constructor(engine: LocalDataEngine, mediaProvider: MediaProvider) {
    this.engine = engine;
    this.mediaProvider = mediaProvider;
  }

  public getModalData(pokemonId: number): PokemonModalData {
    const pokemon = this.engine.getPokemonById(pokemonId);
    const media = this.mediaProvider.getMediaForPokemon(pokemon.id, pokemon.speciesId);

    return {
      ...pokemon,
      media,
    };
  }
}
