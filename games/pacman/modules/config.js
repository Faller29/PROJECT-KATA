// Game configuration constants
export const CELL_SIZE = 16;
export const PACMAN_RADIUS = CELL_SIZE / 2;
export const GHOST_RADIUS = CELL_SIZE / 2;
export const DOT_RADIUS = 2;
export const POWER_DOT_RADIUS = 4;

// Colors
export const COLORS = {
    background: '#000',
    wall: '#2121DE',
    pacman: '#FFFF00',
    blinky: '#FF0000', // Red ghost
    pinky: '#FFB8FF',  // Pink ghost
    inky: '#00FFFF',   // Cyan ghost
    clyde: '#FFB852',  // Orange ghost
    frightened: '#2121DE', // Blue (frightened ghost)
    dot: '#FFFFFF',
    powerDot: '#FFFFFF'
};

// Default key bindings
export const DEFAULT_KEY_BINDINGS = {
    moveUp: 'ArrowUp',
    moveDown: 'ArrowDown',
    moveLeft: 'ArrowLeft',
    moveRight: 'ArrowRight',
    pause: 'p'
};
