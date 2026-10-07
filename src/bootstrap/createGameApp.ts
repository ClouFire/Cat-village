import * as Phaser from 'phaser';

import type { GameState } from '../domain/entities/GameState';

import { GameStore } from '../application/store/GameStore';
import { GameLoop } from '../application/GameLoop';

import { createInteractWithCatUseCase } from '../application/use-cases/interactWithCat';
import { createCollectWorkstationProductionUseCase } from '../application/use-cases/collectWorkstationProductionUseCase';
import { createAssignCatToWorkstationUseCase } from '../application/use-cases/assignCatToWorkstationUseCase';
import { createWorkstationClickActionUseCase } from '../application/use-cases/workstationClickActionUseCase';
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

                workstationId: null,
                restingTimeRemaining: 0,
                restingDuration: 10000,
            },
        ],

        workstations: [
            {
                id: 'kitchen-001',
                name: 'first kitchen',
                appearanceId: 'black-square',
                state: 'idle',
                productionType: 'soup',
                type: 'kitchen',

                position: {
                    x: 250,
                    y: 620,
                },

                productionSpeed: 10,
                productionAmount: 1,
                productionDuration: 1000,
                productionRemaining: null,

                assignedCatId: null,
            },
        ],

        inventory: {
            id: 'inv-001',
            name: 'productionInv',

            items: {
                soup: 0,
            },
        },
    };

    const store = new GameStore(initialState);
    const gameLoop = new GameLoop(store);

    const moveCat = createMoveCatUseCase(store);
    const interactWithCat = createInteractWithCatUseCase(store);

    const resolveWorkstationClickAction = createWorkstationClickActionUseCase(store);
    const collectWorkstationProduction = createCollectWorkstationProductionUseCase(store);
    const assignCatToWorkstation = createAssignCatToWorkstationUseCase(store);

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

        resolveWorkstationClickAction: (workstationId: string) => {
            const result = resolveWorkstationClickAction(workstationId);

            if (!result.ok) {
                console.warn(
                    'Action failed',
                    result.error,
                );
            }

            return result;
        },

        assignCatToWorkstation: (catId: string, workstationId: string) => {
            const result = assignCatToWorkstation(catId, workstationId);

            if (!result.ok) {
                console.warn(
                    'Assignment failed',
                    result.error,
                );
            }
        },

        collectWorkstationProduction: workstationId => {
            const result = collectWorkstationProduction(workstationId);

            if (!result.ok) {
                console.warn(
                    'Workstation production collection failed',
                    result.error,
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
