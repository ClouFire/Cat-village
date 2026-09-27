import * as Phaser from 'phaser';


import type { GameState } from '../domain/entities/GameState';


import { GameStore } from '../application/store/GameStore';
import { GameLoop } from '../application/GameLoop';


import { createInteractWithCatUseCase } from '../application/use-cases/interactWithCat';
import { createInteractWithKitchenUseCase } from '../application/use-cases/interactWithKitchen';
import { createMoveCatUseCase } from '../application/use-cases/moveCat';


import { VillageScene } from '../presentation/scenes/VillageScene';

export function createGameApp(
  parent: string,
): Phaser.Game {
  const initialState: GameState = {
    version: 1,

    cats: [
      {
        id: 'cat-001',
        name: 'Mochi',
        appearanceId: 'orange-tabby',
        state: 'idle',

        position: { x: 195, y: 420 },
        targetPosition: null,
        movementSpeed: 80,

        kitchenId: null
      },
    ],

    kitchens: [
      {
        id: 'kitchen-001',
        name: 'first',
        appearanceId: 'black-square',
        state: 'idle',

        position: {
          x: 250,
          y: 620
        },

        producingSpeed: 10,
        producingAmount: 1,
        producingRemainingMs: null,

        catId: null
      }
    ],

    inventory: {
      id: 'inv-001',
      name: 'productionInv',

      kitchenProductionResult: 0,
    }
  };

  const store = new GameStore(initialState);
  const gameLoop = new GameLoop(store);

  const moveCat = createMoveCatUseCase(store);
  const interactWithCat = createInteractWithCatUseCase(store);

  const interactWithKitchen = createInteractWithKitchenUseCase(store);

  const villageScene = new VillageScene({
    store,

    interactWithCat: catId => {
      const result = interactWithCat(catId);

      if (!result.ok) {
        console.warn(
          'Cat interaction failed:',
          result.error,
        );
      }
    },

    moveCat: (catId, target) => {
      moveCat(catId, target);
    },

    tick: (elapsedMs: number) => {
      gameLoop.tick(elapsedMs);
    },

    interactWithKitchen: kitchenId => {
      const result = interactWithKitchen(kitchenId);

      if (!result.ok) {
        console.warn(
          'Kitchen interaction failed',
          result.error
        );
      }
    }

  });

  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,

    parent,

    width: 390,
    height: 844,

    backgroundColor: '#f4ead7',

    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },

    render: {
      pixelArt: false,
      antialias: true,
    },

    scene: [villageScene],
  };
  
  return new Phaser.Game(config);
}