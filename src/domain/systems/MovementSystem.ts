import type { GameState } from '../entities/GameState';
import type { Cat } from '../entities/Cat';
import { Game } from 'phaser';

function moveCatByTime(
  cat: Cat,
  elapsedMs: number,
): Cat {
  if (
    cat.state !== 'moving' ||
    cat.targetPosition === null
  ) {
    return cat;
  }

  const dx =
    cat.targetPosition.x - cat.position.x;

  const dy =
    cat.targetPosition.y - cat.position.y;

  const distance = Math.hypot(dx, dy);

  const maxDistance =
    cat.movementSpeed * (elapsedMs / 1000);

  if (distance <= maxDistance) {
    return {
      ...cat,

      position: {
        ...cat.targetPosition,
      },

      targetPosition: null,

      state: 'idle',
    };
  }

  if (distance === 0) {
    return {
      ...cat,
      targetPosition: null,
      state: 'idle',
    };
  }

  const ratio = maxDistance / distance;

  return {
    ...cat,

    position: {
      x: cat.position.x + dx * ratio,
      y: cat.position.y + dy * ratio,
    },
  };
}

export function simulateMovement(
  state: GameState,
  elapsedMs: number,
): GameState {
  if (
    !Number.isFinite(elapsedMs) ||
    elapsedMs <= 0
  ) {
    return state;
  }

  const cats = state.cats.map(
    cat => moveCatByTime(cat, elapsedMs),
  );

  if (
    cats.every(
      (cat, index) => cat === state.cats[index],
    )
  ) {
    return state;
  }

  return {
    ...state,
    cats,
  };
}

export function simulateKitchenArrival(
  state: GameState,
): GameState {
  const cats = state.cats;
  const kitchens = state.kitchens;

  const cat = cats[0];
  const kitchen = kitchens[0];

  if (!cat || !kitchen) {
    return state;
  }

  if (
    cat.state === 'idle' 
    && kitchen.state === 'waiting_for_cat'
    && cat.position.x === kitchen.position.x
    && cat.position.y === kitchen.position.y
    && cat.targetPosition === null) {
      cat.state = 'cooking';
      cat.kitchenId = kitchen.id;

      kitchen.state = 'producing';
      kitchen.catId = cat.id;
      kitchen.producingRemainingMs = 10000;

      return {
        ...state,
        cats,
        kitchens
      }
  }

  return state;
}