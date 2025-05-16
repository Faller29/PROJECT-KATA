import { MAZE_TEMPLATE } from './maze.js';
import { initialPacman } from './pacman.js';
import { initialGhosts } from './ghosts.js';

// Initial game state
export const createGameState = () => ({
    maze: JSON.parse(JSON.stringify(MAZE_TEMPLATE)),
    pacman: { ...initialPacman },
    ghosts: initialGhosts.map(ghost => ({ ...ghost })),
    score: 0,
    highScore: localStorage.getItem('pacmanHighScore') || 0,
    lives: 3,
    level: 1,
    dotCount: 0,
    paused: false,
    gameOver: false,
    gameWon: false
});

// Game state manager
export class GameStateManager {
    constructor() {
        this.state = createGameState();
    }
    
    reset() {
        this.state = createGameState();
    }
    
    updateScore(points) {
        this.state.score += points;
        if (this.state.score > this.state.highScore) {
            this.state.highScore = this.state.score;
            localStorage.setItem('pacmanHighScore', this.state.highScore);
        }
    }
    
    loseLife() {
        this.state.lives--;
        return this.state.lives <= 0;
    }
    
    togglePause() {
        this.state.paused = !this.state.paused;
        return this.state.paused;
    }
    
    nextLevel() {
        this.state.level++;
        this.state.maze = JSON.parse(JSON.stringify(MAZE_TEMPLATE));
        this.state.pacman = { ...initialPacman };
        this.state.ghosts = initialGhosts.map(ghost => ({ ...ghost }));
    }
}
