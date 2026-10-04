import * as Phaser from 'phaser';


import type { GameState } from '../domain/entities/GameState';


import { GameStore } from '../application/store/GameStore';
import { GameLoop } from '../application/GameLoop';


import { createInteractWithCatUseCase } from '../application/use-cases/interactWithCat';
import { createInteractWithKitchenUseCase } from '../application/use-cases/interactWithKitchen';
import { createAssignCatToKitchenUseCase } from '../application/use-cases/assignCatToKitchenUseCase';
import { createKitchenClickActionUseCase } from '../application/use-cases/kitchenClickActionUseCase';
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
        productionType: 'soup',
        type: 'kitchen',

        position: {
          x: 250,
          y: 620
        },

        productionSpeed: 10,
        productionAmount: 1,
        productionDuration: 1000,
        productionRemaining: null,

        catId: null
      }
    ],

    inventory: {
      id: 'inv-001',
      name: 'productionInv',

      items: {
        soup: 0
      },
    }
  };

  const store = new GameStore(initialState);
  const gameLoop = new GameLoop(store);

  const moveCat = createMoveCatUseCase(store);
  const interactWithCat = createInteractWithCatUseCase(store);

  const resolveKitchenClickAction = createKitchenClickActionUseCase(store);
  const interactWithKitchen = createInteractWithKitchenUseCase(store);
  const assignCatToKitchen = createAssignCatToKitchenUseCase(store);

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

    resolveKitchenClickAction: (kitchenId: string) => {
      const result = resolveKitchenClickAction(kitchenId);

      if (!result.ok) {
        console.warn(
          'Action failed',
          result.error,
        );
      }

      return result;
    },

    assignCatToKitchen: (catId: string, kitchenId: string) => {
      const result = assignCatToKitchen(kitchenId, catId);

      if (!result.ok) {
        console.warn(
          'Assigment failed',
          result.error
        );
      }
    },

    interactWithKitchen: kitchenId => {
      const result = interactWithKitchen(kitchenId);

      if (!result.ok) {
        console.warn(
          'Kitchen interaction failed',
          result.error
        );
      }
    },

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