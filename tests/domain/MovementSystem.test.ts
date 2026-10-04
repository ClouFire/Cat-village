import {
    describe,
    expect,
    it,
} from 'vitest';

import type {
    GameState,
} from '../../src/domain/entities/GameState';

import {
    simulateMovement,
} from '../../src/domain/systems/MovementSystem';

function createMovingState(): GameState {
    return {
        version: 1,

        cats: [
            {
                id: 'cat-001',
                name: 'Mochi',
                appearanceId: 'orange-tabby',

                state: 'moving',

                position: {
                    x: 0,
                    y: 0,
                },

                targetPosition: {
                    x: 100,
                    y: 0,
                },

                movementSpeed: 50,
                workstationId: null,
            },
        ],

        workstations: [],

        inventory: {
            id: 'inv-001',
            name: 'ProductionInv',
            items: {
                soup: 0,
            },
        },
    };
}

describe('MovementSystem', () => {
    it('moves a cat according to elapsed time', () => {
        const state = createMovingState();

        const result = simulateMovement(
            state,
            1000,
        );

        expect(result.cats[0].position.x).toBe(50);
        expect(result.cats[0].state).toBe('moving');
    });

    it('stops exactly at the target', () => {
        const state = createMovingState();

        const result = simulateMovement(
            state,
            3000,
        );

        expect(result.cats[0].position.x).toBe(100);
        expect(result.cats[0].targetPosition).toBeNull();
        expect(result.cats[0].state).toBe('idle');
    });

    it('does not mutate the original state', () => {
        const state = createMovingState();

        simulateMovement(state, 1000);

        expect(state.cats[0].position.x).toBe(0);
    });

    it('produces the same result with different time steps', () => {
        const initialState = createMovingState();

        const oneStep = simulateMovement(
            initialState,
            1000,
        );

        let tenSteps = initialState;

        for (let i = 0; i < 10; i++) {
            tenSteps = simulateMovement(
                tenSteps,
                100,
            );
        }

        expect(
            tenSteps.cats[0].position.x,
        ).toBeCloseTo(
            oneStep.cats[0].position.x,
        );
    });
});
