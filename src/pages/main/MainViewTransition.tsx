import { type CSSProperties } from 'react';

export type MainViewTransitionDirection = 'forward' | 'backward';

const TILE_COUNT = 12;
const TILE_COLUMNS = 4;

const getSnakeOrder = (index: number) => {
  const row = Math.floor(index / TILE_COLUMNS);
  const column = index % TILE_COLUMNS;
  return row * TILE_COLUMNS + (row % 2 === 0 ? column : TILE_COLUMNS - column - 1);
};

const MainViewTransition = ({ direction, top }: { direction: MainViewTransitionDirection; top: number }) => (
  <div
    className="opus-view-transition"
    data-direction={direction}
    style={{ '--transition-top': `${top}px` } as CSSProperties}
    aria-hidden="true"
  >
    {Array.from({ length: TILE_COUNT }).map((_, index) => {
      const snakeOrder = getSnakeOrder(index);
      const order = direction === 'forward' ? snakeOrder : TILE_COUNT - snakeOrder - 1;

      return (
        <span key={index} className="opus-view-transition__tile" style={{ '--tile-order': order } as CSSProperties} />
      );
    })}
  </div>
);

export default MainViewTransition;
