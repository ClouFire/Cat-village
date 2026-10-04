import { describe, expect, it } from 'vitest';

import type { GameState } from '../../src/domain/entities/GameState';

import { interactWithCat } from '../../src/domain/rules/interactWithCat';

function createState(): GameState {
    return {
        version: 1,

        cats: [
            {
                id: 'cat-001',
                name: 'Mochi',
                appearanceId: 'orange-tabby',
                state: 'idle',
                position: {
                    x: 0,
                    y: 0,
                },
                targetPosition: null,
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

describe('interactWithCat', () => {
    it('switches an idle cat to resting', () => {
        const state = createState();

        const result = interactWithCat(
            state,
            'cat-001',
        );

        expect(result.ok).toBe(true);

        if (result.ok) {
            expect(result.state.cats[0].state).toBe(
                'resting',
            );
        }
    });

    it('does not mutate the original state', () => {
        const state = createState();

        interactWithCat(state, 'cat-001');

        expect(state.cats[0].state).toBe('idle');
    });

    it('returns an error for an unknown cat', () => {
        const state = createState();

        const result = interactWithCat(
            state,
            'unknown-cat',
        );

        expect(result).toEqual({
            ok: false,
            error: 'CAT_NOT_FOUND',
        });
    });
});
