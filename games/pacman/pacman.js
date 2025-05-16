// Pac-Man Game - Core Structure

// Constants and configurations
const CELL_SIZE = 16;
const COLORS = {
    pacman: '#FFFF00',
    wall: '#2121FF',
    dot: '#FFFFFF',
    powerDot: '#FFFFFF',
    blinky: '#FF0000',
    pinky: '#FFC0CB',
    inky: '#00FFFF',
    clyde: '#FFB852',
    frightened: '#2121FF'
};

const DEFAULT_KEY_BINDINGS = {
    moveLeft: 'ArrowLeft',
    moveRight: 'ArrowRight',
    moveUp: 'ArrowUp',
    moveDown: 'ArrowDown',
    pause: 'p'
};

// UI elements
const UI = {
    scoreElement: null,
    highScoreElement: null,
    livesElement: null,
    gameOverModal: null,
    levelCompleteModal: null,
    pauseScreen: null,
    finalScoreElement: null,
    ctx: null,
    
    init: function() {
        this.scoreElement = document.getElementById('score');
        this.highScoreElement = document.getElementById('high-score');
        this.livesElement = document.getElementById('lives');
        this.gameOverModal = document.getElementById('game-over');
        this.levelCompleteModal = document.getElementById('level-complete');
        this.pauseScreen = document.getElementById('pause-screen');
        this.finalScoreElement = document.getElementById('final-score');
        this.ctx = document.getElementById('pacman-board').getContext('2d');
    },
    
    updateScore: function(score) {
        this.scoreElement.textContent = score;
    },
    
    updateHighScore: function(highScore) {
        this.highScoreElement.textContent = highScore;
    },
    
    updateLives: function(lives) {
        this.livesElement.textContent = lives;
    },
    
    showGameOver: function() {
        this.finalScoreElement.textContent = gameState.score;
        this.gameOverModal.style.display = 'flex';
    },
    
    hideGameOver: function() {
        this.gameOverModal.style.display = 'none';
    },
    
    showLevelComplete: function() {
        this.levelCompleteModal.style.display = 'flex';
    },
    
    hideLevelComplete: function() {
        this.levelCompleteModal.style.display = 'none';
    },
    
    showPauseScreen: function() {
        this.pauseScreen.style.display = 'flex';
    },
    
    hidePauseScreen: function() {
        this.pauseScreen.style.display = 'none';
    }
};

// Constants for game elements
const PACMAN_RADIUS = 7;
const GHOST_RADIUS = 7;
const DOT_RADIUS = 2;
const POWER_DOT_RADIUS = 4;

// Game state
const gameState = {
    score: 0,
    highScore: localStorage.getItem('pacmanHighScore') ? parseInt(localStorage.getItem('pacmanHighScore')) : 0,
    lives: 3,
    level: 1,
    paused: false,
    gameOver: false,
    gameWon: false,
    dotCount: 0,
    maze: [],
    pacman: null,
    ghosts: [],
    
    reset: function() {
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.paused = false;
        this.gameOver = false;
        this.gameWon = false;
        this.initMaze();
        this.initPacman();
        this.initGhosts();
    },
    
    togglePause: function() {
        this.paused = !this.paused;
        return this.paused;
    },
    
    initMaze: function() {
        // Initialize maze from template
        this.maze = JSON.parse(JSON.stringify(MAZE_TEMPLATE));
        this.dotCount = countDots(this.maze);
    },
    
    initPacman: function() {
        this.pacman = {
            x: 14 * CELL_SIZE,
            y: 23 * CELL_SIZE,
            direction: 'left',
            nextDirection: 'left',
            mouthOpen: true,
            mouthAngle: Math.PI / 4,
            mouthDir: 1
        };
    },
    
    initGhosts: function() {
        this.ghosts = [
            { x: 13 * CELL_SIZE, y: 11 * CELL_SIZE, direction: 'left', speed: 1, color: COLORS.blinky, frightened: false, name: 'blinky', inGhostHouse: false },
            { x: 14 * CELL_SIZE, y: 13 * CELL_SIZE, direction: 'right', speed: 1, color: COLORS.pinky, frightened: false, name: 'pinky', inGhostHouse: true, releaseTime: 2000 },
            { x: 13 * CELL_SIZE, y: 14 * CELL_SIZE, direction: 'up', speed: 1, color: COLORS.inky, frightened: false, name: 'inky', inGhostHouse: true, releaseTime: 4000 },
            { x: 14 * CELL_SIZE, y: 14 * CELL_SIZE, direction: 'down', speed: 1, color: COLORS.clyde, frightened: false, name: 'clyde', inGhostHouse: true, releaseTime: 6000 }
        ];
    }
};

// Maze template and functions
const MAZE_TEMPLATE = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
    [1,3,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,3,1],
    [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,2,1],
    [1,2,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,2,1],
    [1,2,2,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,2,2,1],
    [1,1,1,1,1,1,2,1,1,1,1,1,0,1,1,0,1,1,1,1,1,2,1,1,1,1,1,1],
    [0,0,0,0,0,1,2,1,1,1,1,1,0,1,1,0,1,1,1,1,1,2,1,0,0,0,0,0],
    [0,0,0,0,0,1,2,1,1,0,0,0,0,0,0,0,0,0,0,1,1,2,1,0,0,0,0,0],
    [0,0,0,0,0,1,2,1,1,0,1,1,1,0,0,1,1,1,0,1,1,2,1,0,0,0,0,0],
    [1,1,1,1,1,1,2,1,1,0,1,0,0,0,0,0,0,1,0,1,1,2,1,1,1,1,1,1],
    [0,0,0,0,0,0,2,0,0,0,1,0,0,0,0,0,0,1,0,0,0,2,0,0,0,0,0,0],
    [1,1,1,1,1,1,2,1,1,0,1,0,0,0,0,0,0,1,0,1,1,2,1,1,1,1,1,1],
    [0,0,0,0,0,1,2,1,1,0,1,1,1,1,1,1,1,1,0,1,1,2,1,0,0,0,0,0],
    [0,0,0,0,0,1,2,1,1,0,0,0,0,0,0,0,0,0,0,1,1,2,1,0,0,0,0,0],
    [0,0,0,0,0,1,2,1,1,0,1,1,1,1,1,1,1,1,0,1,1,2,1,0,0,0,0,0],
    [1,1,1,1,1,1,2,1,1,0,1,1,1,1,1,1,1,1,0,1,1,2,1,1,1,1,1,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
    [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
    [1,3,2,2,1,1,2,2,2,2,2,2,2,0,0,2,2,2,2,2,2,2,1,1,2,2,3,1],
    [1,1,1,2,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,2,1,1,1],
    [1,1,1,2,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,2,1,1,1],
    [1,2,2,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,2,2,1],
    [1,2,1,1,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,1,1,2,1],
    [1,2,1,1,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,1,1,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

function countDots(maze) {
    let count = 0;
    for (let y = 0; y < maze.length; y++) {
        for (let x = 0; x < maze[y].length; x++) {
            if (maze[y][x] === 2 || maze[y][x] === 3) {
                count++;
            }
        }
    }
    return count;
}

// Load key bindings and prevent scrolling
let keyBindings = { ...DEFAULT_KEY_BINDINGS };

// Only prevent scrolling when game is focused
window.addEventListener('keydown', function(e) {
    const gameContainer = document.getElementById('game-container');
    if (gameContainer.contains(document.activeElement)) {
        if([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
            e.preventDefault();
        }
    }
});

// Load user key bindings if available
function loadKeyBindings() {
    if (localStorage.getItem('projectKataPreferences')) {
        const preferences = JSON.parse(localStorage.getItem('projectKataPreferences'));
        if (preferences.keyBindings && preferences.keyBindings.pacman) {
            keyBindings = preferences.keyBindings.pacman;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Load key bindings
    loadKeyBindings();

    // Canvas setup
    const canvas = document.getElementById('pacman-board');
    
    // Set canvas size based on maze dimensions
    canvas.width = MAZE_TEMPLATE[0].length * CELL_SIZE;
    canvas.height = MAZE_TEMPLATE.length * CELL_SIZE;

    // Initialize game state and UI
    UI.init();
    gameState.reset();
    
    // Game loop interval
    let gameInterval = null;
    
    // Make canvas and ctx available globally
    window.canvas = canvas;
    window.ctx = canvas.getContext('2d');

    // Event listeners for key bindings
    document.addEventListener('keydown', event => {
        if (gameState.gameOver || gameState.gameWon) return;

        // Use custom key bindings
        if (event.key === keyBindings.moveLeft) {
            gameState.pacman.nextDirection = 'left';
        } else if (event.key === keyBindings.moveUp) {
            gameState.pacman.nextDirection = 'up';
        } else if (event.key === keyBindings.moveRight) {
            gameState.pacman.nextDirection = 'right';
        } else if (event.key === keyBindings.moveDown) {
            gameState.pacman.nextDirection = 'down';
        } else if (event.key === keyBindings.pause) {
            const isPaused = gameState.togglePause();
            if (isPaused) {
                UI.showPauseScreen();
            } else {
                UI.hidePauseScreen();
            }
        }
    });

    // Main game update loop
    function update() {
        if (gameState.gameOver || gameState.gameWon || gameState.paused) return;
        
        // Update ghosts
        updateGhosts();
        
        // Update Pac-Man
        updatePacman();
        animatePacman();
            
        // Check for dot eating
        const gridX = Math.round(gameState.pacman.x / CELL_SIZE);
        const gridY = Math.round(gameState.pacman.y / CELL_SIZE);
        
        if (gridY >= 0 && gridY < gameState.maze.length && 
            gridX >= 0 && gridX < gameState.maze[0].length) {
            
            if (gameState.maze[gridY][gridX] === 2) { // Regular dot
                gameState.maze[gridY][gridX] = 0;
                gameState.score += 10;
                gameState.dotCount--;
                UI.updateScore(gameState.score);
                
                // Check for level complete
                if (gameState.dotCount === 0) {
                    // Level complete
                    gameState.gameWon = true;
                    UI.showLevelComplete();
                }
            } else if (gameState.maze[gridY][gridX] === 3) { // Power dot
                gameState.maze[gridY][gridX] = 0;
                gameState.score += 50;
                gameState.dotCount--;
                UI.updateScore(gameState.score);
                
                // Frighten ghosts
                frightenGhosts();
                
                // Check for level complete
                if (gameState.dotCount === 0) {
                    // Level complete
                    gameState.gameWon = true;
                    UI.showLevelComplete();
                }
            }
        }
    
    // Check for ghost collisions
    checkGhostCollisions();
    
    // Draw game state
    draw();
}

// Update ghosts
function updateGhosts() {
    gameState.ghosts.forEach(ghost => {
        // Move ghost
        switch (ghost.direction) {
            case 'up':
                ghost.y -= ghost.speed;
                break;
            case 'down':
                ghost.y += ghost.speed;
                break;
            case 'left':
                ghost.x -= ghost.speed;
                break;
            case 'right':
                ghost.x += ghost.speed;
                break;
        }
        
        // Check for collision with walls
        if (gameState.maze[Math.round(ghost.y / CELL_SIZE)][Math.round(ghost.x / CELL_SIZE)] === 1) {
            // Reverse direction
            switch (ghost.direction) {
                case 'up':
                    ghost.y += ghost.speed;
                    ghost.direction = 'down';
                    break;
                case 'down':
                    ghost.y -= ghost.speed;
                    ghost.direction = 'up';
                    break;
                case 'left':
                    ghost.x += ghost.speed;
                    ghost.direction = 'right';
                    break;
                case 'right':
                    ghost.x -= ghost.speed;
                    ghost.direction = 'left';
                    break;
            }
        }
        
        // Check for collision with Pac-Man
        const dx = (gameState.pacman.x + CELL_SIZE / 2) - (ghost.x + CELL_SIZE / 2);
        const dy = (gameState.pacman.y + CELL_SIZE / 2) - (ghost.y + CELL_SIZE / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < CELL_SIZE - 4) {
            if (ghost.frightened) {
                // Eat the ghost
                ghost.x = 13 * CELL_SIZE;
                ghost.y = 13 * CELL_SIZE;
                ghost.frightened = false;
                gameState.score += 200;
                UI.updateScore(gameState.score);
            } else {
                // Lose a life
                gameState.lives--;
                UI.updateLives(gameState.lives);
                if (gameState.lives <= 0) {
                    gameState.gameOver = true;
                    UI.showGameOver();
                } else {
                    // Reset positions
                    resetPositions();
                }
            }
        }
    });
}

// Update Pac-Man
function updatePacman() {
    // Try to change direction if requested
    if (gameState.pacman.nextDirection !== gameState.pacman.direction) {
        // Check if we can move in the next direction
        let canChangeDirection = true;
        const nextX = gameState.pacman.x;
        const nextY = gameState.pacman.y;
        const gridX = Math.round(nextX / CELL_SIZE);
        const gridY = Math.round(nextY / CELL_SIZE);
        
        // Check if the next cell in the requested direction is a wall
        switch (gameState.pacman.nextDirection) {
            case 'up':
                if (gridY > 0 && gameState.maze[gridY - 1][gridX] === 1) {
                    canChangeDirection = false;
                }
                break;
            case 'down':
                if (gridY < gameState.maze.length - 1 && gameState.maze[gridY + 1][gridX] === 1) {
                    canChangeDirection = false;
                }
                break;
            case 'left':
                if (gridX > 0 && gameState.maze[gridY][gridX - 1] === 1) {
                    canChangeDirection = false;
                }
                break;
            case 'right':
                if (gridX < gameState.maze[0].length - 1 && gameState.maze[gridY][gridX + 1] === 1) {
                    canChangeDirection = false;
                }
                break;
        }
        
        if (canChangeDirection) {
            gameState.pacman.direction = gameState.pacman.nextDirection;
        }
    }
    
    // Move Pac-Man in current direction
    let nextX = gameState.pacman.x;
    let nextY = gameState.pacman.y;
    
    switch (gameState.pacman.direction) {
        case 'up':
            nextY -= gameState.pacman.speed;
            break;
        case 'down':
            nextY += gameState.pacman.speed;
            break;
        case 'left':
            nextX -= gameState.pacman.speed;
            break;
        case 'right':
            nextX += gameState.pacman.speed;
            break;
    }
    
    // Check for collision with walls
    const gridX = Math.round(nextX / CELL_SIZE);
    const gridY = Math.round(nextY / CELL_SIZE);
    
    if (gridY >= 0 && gridY < gameState.maze.length && 
        gridX >= 0 && gridX < gameState.maze[0].length && 
        gameState.maze[gridY][gridX] !== 1) {
        // No wall collision, update position
        gameState.pacman.x = nextX;
        gameState.pacman.y = nextY;
    }
    
    // Check for collision with ghosts
    gameState.ghosts.forEach(ghost => {
        const dx = (gameState.pacman.x + CELL_SIZE / 2) - (ghost.x + CELL_SIZE / 2);
        const dy = (gameState.pacman.y + CELL_SIZE / 2) - (ghost.y + CELL_SIZE / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < CELL_SIZE - 4) {
            if (ghost.frightened) {
                // Eat the ghost
                ghost.x = 13 * CELL_SIZE;
                ghost.y = 13 * CELL_SIZE;
                ghost.frightened = false;
                gameState.score += 200;
                UI.updateScore(gameState.score);
            } else {
                // Lose a life
                gameState.lives--;
                UI.updateLives(gameState.lives);
                if (gameState.lives <= 0) {
                    gameState.gameOver = true;
                    UI.showGameOver();
                } else {
                    // Reset positions
                    resetPositions();
                }
            }
        }
    });
}

// Animate Pac-Man
function animatePacman() {
    // Open and close mouth
    gameState.pacman.mouthOpen += gameState.pacman.mouthDir * 0.1;
    if (gameState.pacman.mouthOpen > 1) {
        gameState.pacman.mouthOpen = 1;
        gameState.pacman.mouthDir = -1;
    } else if (gameState.pacman.mouthOpen < 0) {
        gameState.pacman.mouthOpen = 0;
        gameState.pacman.mouthDir = 1;
    }
}

// Frighten ghosts
function frightenGhosts() {
    gameState.ghosts.forEach(ghost => {
        ghost.frightened = true;
    });
}

// Check for ghost collisions
function checkGhostCollisions() {
    gameState.ghosts.forEach(ghost => {
        const dx = (gameState.pacman.x + CELL_SIZE / 2) - (ghost.x + CELL_SIZE / 2);
        const dy = (gameState.pacman.y + CELL_SIZE / 2) - (ghost.y + CELL_SIZE / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < CELL_SIZE - 4) {
            if (ghost.frightened) {
                // Eat the ghost
                ghost.x = 13 * CELL_SIZE;
                ghost.y = 13 * CELL_SIZE;
                ghost.frightened = false;
                gameState.score += 200;
                UI.updateScore(gameState.score);
            } else {
                // Lose a life
                gameState.lives--;
                UI.updateLives(gameState.lives);
                if (gameState.lives <= 0) {
                    gameState.gameOver = true;
                    UI.showGameOver();
                } else {
                    // Reset positions
                    resetPositions();
                }
            }
        }
    });
}

// Draw game state
function draw() {
    // Clear the canvas
    UI.ctx.fillStyle = '#000000'; // Black background
    UI.ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw maze
    drawMaze();
    
    // Draw Pac-Man
    drawPacman();
    
    // Draw ghosts
    drawGhosts();
}

// Draw maze
function drawMaze() {
    for (let y = 0; y < gameState.maze.length; y++) {
        for (let x = 0; x < gameState.maze[y].length; x++) {
            const cell = gameState.maze[y][x];
            const cellX = x * CELL_SIZE;
            const cellY = y * CELL_SIZE;
            
            if (cell === 1) {
                // Wall
                UI.ctx.fillStyle = COLORS.wall;
                UI.ctx.fillRect(cellX, cellY, CELL_SIZE, CELL_SIZE);
            } else if (cell === 2) {
                // Dot
                UI.ctx.fillStyle = COLORS.dot;
                UI.ctx.beginPath();
                UI.ctx.arc(cellX + CELL_SIZE / 2, cellY + CELL_SIZE / 2, DOT_RADIUS, 0, Math.PI * 2);
                UI.ctx.fill();
            } else if (cell === 3) {
                // Power dot
                UI.ctx.fillStyle = COLORS.powerDot;
                UI.ctx.beginPath();
                UI.ctx.arc(cellX + CELL_SIZE / 2, cellY + CELL_SIZE / 2, POWER_DOT_RADIUS, 0, Math.PI * 2);
                UI.ctx.fill();
            }
        }
    }
}

// Draw Pac-Man
function drawPacman() {
    UI.ctx.fillStyle = COLORS.pacman;
    UI.ctx.beginPath();
    
    // Calculate mouth angle based on animation state
    const mouthAngle = Math.PI / 4 * gameState.pacman.mouthOpen;
    
    // Calculate starting angle based on direction
    let startAngle = 0;
    let endAngle = 0;
    
    switch (gameState.pacman.direction) {
        case 'right':
            startAngle = mouthAngle;
            endAngle = 2 * Math.PI - mouthAngle;
            break;
        case 'left':
            startAngle = Math.PI + mouthAngle;
            endAngle = 3 * Math.PI - mouthAngle;
            break;
        case 'up':
            startAngle = 1.5 * Math.PI + mouthAngle;
            endAngle = 3.5 * Math.PI - mouthAngle;
            break;
        case 'down':
            startAngle = 0.5 * Math.PI + mouthAngle;
            endAngle = 2.5 * Math.PI - mouthAngle;
            break;
    }
    
    // Draw Pac-Man
    UI.ctx.arc(gameState.pacman.x + CELL_SIZE / 2, gameState.pacman.y + CELL_SIZE / 2, PACMAN_RADIUS, startAngle, endAngle);
    UI.ctx.lineTo(gameState.pacman.x + CELL_SIZE / 2, gameState.pacman.y + CELL_SIZE / 2);
    UI.ctx.fill();
}

// Draw ghosts
function drawGhosts() {
    gameState.ghosts.forEach(ghost => {
        // Draw ghost body
        UI.ctx.fillStyle = ghost.frightened ? COLORS.frightened : ghost.color;
        
        // Draw ghost body (semi-circle top and wavy bottom)
        UI.ctx.beginPath();
        UI.ctx.arc(ghost.x + CELL_SIZE / 2, ghost.y + CELL_SIZE / 2 - 2, GHOST_RADIUS, Math.PI, 0, false);
        
        // Draw the wavy bottom part
        UI.ctx.lineTo(ghost.x + CELL_SIZE, ghost.y + CELL_SIZE / 2 + 4);
        UI.ctx.lineTo(ghost.x + CELL_SIZE - 4, ghost.y + CELL_SIZE / 2);
        UI.ctx.lineTo(ghost.x + CELL_SIZE - 8, ghost.y + CELL_SIZE / 2 + 4);
        UI.ctx.lineTo(ghost.x + CELL_SIZE - 12, ghost.y + CELL_SIZE / 2);
        UI.ctx.lineTo(ghost.x + 4, ghost.y + CELL_SIZE / 2);
        UI.ctx.lineTo(ghost.x, ghost.y + CELL_SIZE / 2 + 4);
        UI.ctx.lineTo(ghost.x, ghost.y + CELL_SIZE / 2 - 2);
        UI.ctx.fill();
        
        // Draw eyes
        UI.ctx.fillStyle = '#FFFFFF';
        
        // Position eyes based on direction
        let eyeX1, eyeY1, eyeX2, eyeY2;
        const eyeRadius = CELL_SIZE / 5;
        const eyeOffset = CELL_SIZE / 6;
        
        switch (ghost.direction) {
            case 'up':
                eyeX1 = ghost.x + CELL_SIZE / 2 - eyeOffset;
                eyeY1 = ghost.y + CELL_SIZE / 2 - eyeOffset;
                eyeX2 = ghost.x + CELL_SIZE / 2 + eyeOffset;
                eyeY2 = ghost.y + CELL_SIZE / 2 - eyeOffset;
                break;
            case 'down':
                eyeX1 = ghost.x + CELL_SIZE / 2 - eyeOffset;
                eyeY1 = ghost.y + CELL_SIZE / 2 + eyeOffset - 2;
                eyeX2 = ghost.x + CELL_SIZE / 2 + eyeOffset;
                eyeY2 = ghost.y + CELL_SIZE / 2 + eyeOffset - 2;
                break;
            case 'left':
                eyeX1 = ghost.x + CELL_SIZE / 2 - eyeOffset;
                eyeY1 = ghost.y + CELL_SIZE / 2 - 2;
                eyeX2 = ghost.x + CELL_SIZE / 2 + eyeOffset - 2;
                eyeY2 = ghost.y + CELL_SIZE / 2 - 2;
                break;
            case 'right':
                eyeX1 = ghost.x + CELL_SIZE / 2 - eyeOffset + 2;
                eyeY1 = ghost.y + CELL_SIZE / 2 - 2;
                eyeX2 = ghost.x + CELL_SIZE / 2 + eyeOffset;
                eyeY2 = ghost.y + CELL_SIZE / 2 - 2;
                break;
        }
        
        // Draw white part of eyes
        UI.ctx.beginPath();
        UI.ctx.arc(eyeX1, eyeY1, eyeRadius, 0, Math.PI * 2);
        UI.ctx.fill();
        
        UI.ctx.beginPath();
        UI.ctx.arc(eyeX2, eyeY2, eyeRadius, 0, Math.PI * 2);
        UI.ctx.fill();
        
        // Draw pupils
        UI.ctx.fillStyle = '#000000';
        
        // Position pupils based on direction
        let pupilX1, pupilY1, pupilX2, pupilY2;
        const pupilRadius = CELL_SIZE / 10;
        const pupilOffset = CELL_SIZE / 15;
        
        switch (ghost.direction) {
            case 'up':
                pupilX1 = eyeX1;
                pupilY1 = eyeY1 - pupilOffset;
                pupilX2 = eyeX2;
                pupilY2 = eyeY2 - pupilOffset;
                break;
            case 'down':
                pupilX1 = eyeX1;
                pupilY1 = eyeY1 + pupilOffset;
                pupilX2 = eyeX2;
                pupilY2 = eyeY2 + pupilOffset;
                break;
            case 'left':
                pupilX1 = eyeX1 - pupilOffset;
                pupilY1 = eyeY1;
                pupilX2 = eyeX2 - pupilOffset;
                pupilY2 = eyeY2;
                break;
            case 'right':
                pupilX1 = eyeX1 + pupilOffset;
                pupilY1 = eyeY1;
                pupilX2 = eyeX2 + pupilOffset;
                pupilY2 = eyeY2;
                break;
        }
        
        // Draw pupils
        UI.ctx.beginPath();
        UI.ctx.arc(pupilX1, pupilY1, pupilRadius, 0, Math.PI * 2);
        UI.ctx.fill();
        
        UI.ctx.beginPath();
        UI.ctx.arc(pupilX2, pupilY2, pupilRadius, 0, Math.PI * 2);
        UI.ctx.fill();
    });
});
