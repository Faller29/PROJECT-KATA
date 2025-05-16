// Space Invaders Game Constants

// Player constants
export const PLAYER_WIDTH = 60;
export const PLAYER_HEIGHT = 20;
export const PLAYER_SPEED = 5;

// Bullet constants
export const BULLET_SPEED = 7;
export const ALIEN_BULLET_SPEED = 3;
export const BULLET_WIDTH = 3;
export const BULLET_HEIGHT = 15;

// Alien constants
export const ALIEN_ROWS = 5;
export const ALIEN_COLS = 11;
export const ALIEN_WIDTH = 40;
export const ALIEN_HEIGHT = 30;
export const ALIEN_PADDING = 10;
export const ALIEN_TOP_OFFSET = 60;
export const ALIEN_LEFT_OFFSET = 30;
export const ALIEN_MOVE_DOWN = 20;
export const ALIEN_POINTS = [30, 20, 20, 10, 10]; // Points per alien row (top to bottom)

// Default key bindings
export const DEFAULT_KEY_BINDINGS = {
    moveLeft: 'ArrowLeft',
    moveRight: 'ArrowRight',
    fire: ' ', // Space
    pause: 'p'
}; 