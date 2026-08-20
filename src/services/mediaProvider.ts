import * as fs from 'fs';
import * as path from 'path';

export interface PokemonMedia {
  pokemonId: number;
  spriteUrl: string;
  officialArtworkUrl: string;
  cryUrl: string | null;
  hasCry: boolean;
}

export class MediaProvider {
  private snapshotPath: string;

  constructor(snapshotPath: string) {
    this.snapshotPath = snapshotPath;
  }

  public getMediaForPokemon(id: number): PokemonMedia {
    if (id <= 0 || id > 1025) {
      return {
        pokemonId: id,
        spriteUrl: '/placeholder-pokemon.svg',
        officialArtworkUrl: '/placeholder-pokemon.svg',
        cryUrl: null,
        hasCry: false,
      };
    }

    const localSprite = path.join(this.snapshotPath, 'data', 'v2', 'sprites', 'pokemon', `${id}.png`);
    const localArtwork = path.join(this.snapshotPath, 'data', 'v2', 'sprites', 'pokemon', 'other', 'official-artwork', `${id}.png`);
    const localCry = path.join(this.snapshotPath, 'data', 'v2', 'cries', 'pokemon', 'latest', `${id}.ogg`);

    const spriteUrl = fs.existsSync(localSprite)
      ? localSprite
      : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

    const officialArtworkUrl = fs.existsSync(localArtwork)
      ? localArtwork
      : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

    const hasLocalCry = fs.existsSync(localCry);
    const cryUrl = hasLocalCry
      ? localCry
      : `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${id}.ogg`;

    return {
      pokemonId: id,
      spriteUrl,
      officialArtworkUrl,
      cryUrl,
      hasCry: true,
    };
  }
}
