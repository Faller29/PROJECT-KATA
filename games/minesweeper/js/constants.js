/**
 * Game constants and configuration
 */

// Game difficulty presets
const DIFFICULTY = {
    beginner: {
        rows: 9,
        cols: 9,
        mines: 10
    },
    intermediate: {
        rows: 16,
        cols: 16,
        mines: 40
    },
    expert: {
        rows: 16,
        cols: 30,
        mines: 99
    }
};

// Cell states
const CELL_STATE = {
    hidden: 'hidden',
    revealed: 'revealed',
    flagged: 'flagged'
};

// Game states
const GAME_STATE = {
    notStarted: 'notStarted',
    playing: 'playing',
    won: 'won',
    lost: 'lost'
}; 