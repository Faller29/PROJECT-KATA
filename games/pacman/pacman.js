// Pac-Man Game - Core Structure

// Load key bindings and prevent scrolling
let keyBindings = {
    moveUp: 'ArrowUp',
    moveDown: 'ArrowDown',
    moveLeft: 'ArrowLeft',
    moveRight: 'ArrowRight',
    pause: 'p'
};

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
    const ctx = canvas.getContext('2d');
    
    // Game constants
    const CELL_SIZE = 16; // Size of each cell in the maze
    const PACMAN_RADIUS = CELL_SIZE / 2;
    const GHOST_RADIUS = CELL_SIZE / 2;
    const DOT_RADIUS = 2;
    const POWER_DOT_RADIUS = 4;
    
    // Colors
    const COLORS = {
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
    
    // Game variables
    let score = 0;
    let highScore = localStorage.getItem('pacmanHighScore') || 0;
    let lives = 3;
    let level = 1;
    let gameInterval;
    let dotCount = 0;
    let paused = false;
    let gameOver = false;
    let gameWon = false;
    
    // Player and ghost positions
    let pacman = {
        x: 0,
        y: 0,
        direction: 'right',
        nextDirection: 'right',
        speed: 2,
        mouthOpen: 0,
        mouthDir: 1
    };
    
    let ghosts = [
    { type: 'blinky', x: 13 * CELL_SIZE, y: 11 * CELL_SIZE, direction: 'left', speed: 2, frightened: false, inGhostHouse: false, lastBehaviorChange: Date.now() },
    { type: 'pinky', x: 13 * CELL_SIZE, y: 13 * CELL_SIZE, direction: 'right', speed: 2, frightened: false, inGhostHouse: false, lastBehaviorChange: Date.now() },
    { type: 'inky', x: 11 * CELL_SIZE, y: 13 * CELL_SIZE, direction: 'up', speed: 2, frightened: false, inGhostHouse: false, lastBehaviorChange: Date.now(), targeting: false },
    { type: 'clyde', x: 15 * CELL_SIZE, y: 13 * CELL_SIZE, direction: 'down', speed: 2, frightened: false, inGhostHouse: false, lastBehaviorChange: Date.now() }
];
    
    // DOM elements
    const scoreElement = document.getElementById('score');
    const highScoreElement = document.getElementById('high-score');
    
    // Event listeners for key bindings
    document.addEventListener('keydown', event => {
        if (gameOver || gameWon) return;
        
        // Use custom key bindings
        if (event.key === keyBindings.moveLeft) {
            pacman.nextDirection = 'left';
        } else if (event.key === keyBindings.moveUp) {
            pacman.nextDirection = 'up';
        } else if (event.key === keyBindings.moveRight) {
            pacman.nextDirection = 'right';
        } else if (event.key === keyBindings.moveDown) {
            pacman.nextDirection = 'down';
        } else if (event.key === keyBindings.pause) {
            togglePause();
        }
    });
    const livesElement = document.getElementById('lives');
    const finalScoreElement = document.getElementById('final-score');
    const startButton = document.getElementById('start-button');
    const playAgainButton = document.getElementById('play-again');
    const resumeButton = document.getElementById('resume');
    const nextLevelButton = document.getElementById('next-level');
    const gameOverModal = document.getElementById('game-over');
    const levelCompleteModal = document.getElementById('level-complete');
    const pauseScreen = document.getElementById('pause-screen');
    
    // Maze layout (0 = empty, 1 = wall, 2 = dot, 3 = power dot, 4 = ghost house)
    // This is a simplified maze layout for Pac-Man
    let maze = [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
        [1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1],
        [1, 3, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 3, 1],
        [1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1],
        [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
        [1, 2, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 2, 1],
        [1, 2, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 2, 1],
        [1, 2, 2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 1],
        [1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1],
        [0, 0, 0, 0, 0, 1, 2, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 2, 1, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 1, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 1, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 1, 2, 1, 1, 0, 1, 1, 1, 4, 4, 1, 1, 1, 0, 1, 1, 2, 1, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 1, 2, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 2, 1, 1, 1, 1, 1, 1],
        [0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 1, 2, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 2, 1, 1, 1, 1, 1, 1],
        [0, 0, 0, 0, 0, 1, 2, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 2, 1, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 1, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 1, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 1, 2, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 2, 1, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 1, 2, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 2, 1, 1, 1, 1, 1, 1],
        [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
        [1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1],
        [1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1],
        [1, 3, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 1, 1, 2, 2, 3, 1],
        [1, 1, 1, 2, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 2, 1, 1, 1],
        [1, 1, 1, 2, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 2, 1, 1, 1],
        [1, 2, 2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 1],
        [1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1],
        [1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1],
        [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ];
    
    // Initialize the game
    function init() {
        // Reset game state
        score = 0;
        lives = 3;
        level = 1;
        gameOver = false;
        gameWon = false;
        dotCount = 0;
        
        // Update UI
        scoreElement.textContent = score;
        highScoreElement.textContent = highScore;
        livesElement.textContent = lives;
        
        // Initialize maze and count dots
        initMaze();
        
        // Position pacman and ghosts
        resetPositions();
        
        // Clear any existing interval
        if (gameInterval) {
            clearInterval(gameInterval);
        }
        
        // Start the game loop
        gameInterval = setInterval(update, 30);
    }
    
    // Initialize the maze for the current level
    function initMaze() {
        // For higher levels, we could modify the maze or increase ghost speed
        // For now, we'll just use the same maze layout
        
        // Count dots for level completion check
        countDots();
    }
    
    // Count dots in the maze
    function countDots() {
        dotCount = 0;
        for (let y = 0; y < maze.length; y++) {
            for (let x = 0; x < maze[y].length; x++) {
                if (maze[y][x] === 2 || maze[y][x] === 3) {
                    dotCount++;
                }
            }
        }
    }
    
    // Reset positions of pacman and ghosts
    function resetPositions() {
        // Set Pac-Man's starting position (middle of the bottom section)
        // Ensure perfect grid alignment
        pacman = {
            x: 14 * CELL_SIZE,
            y: 23 * CELL_SIZE,
            direction: 'left',
            nextDirection: 'left',
            speed: 1, // Reduced speed for better alignment
            mouthOpen: 0,
            mouthDir: 1
        };
        
        // Initialize ghosts with exact grid positions
        ghosts = [
            { x: 13 * CELL_SIZE, y: 11 * CELL_SIZE, direction: 'left', speed: 1, color: COLORS.blinky, frightened: false, name: 'blinky', inGhostHouse: false },
            { x: 14 * CELL_SIZE, y: 13 * CELL_SIZE, direction: 'right', speed: 1, color: COLORS.pinky, frightened: false, name: 'pinky', inGhostHouse: true, releaseTime: 2000 },
            { x: 13 * CELL_SIZE, y: 14 * CELL_SIZE, direction: 'up', speed: 1, color: COLORS.inky, frightened: false, name: 'inky', inGhostHouse: true, releaseTime: 4000 },
            { x: 14 * CELL_SIZE, y: 14 * CELL_SIZE, direction: 'down', speed: 1, color: COLORS.clyde, frightened: false, name: 'clyde', inGhostHouse: true, releaseTime: 6000 }
        ];
        
        // Set timers to release ghosts from the ghost house
        ghosts.forEach(ghost => {
            if (ghost.inGhostHouse && ghost.releaseTime) {
                setTimeout(() => {
                    ghost.inGhostHouse = false;
                    // Move ghost to the exit position with exact grid alignment
                    ghost.x = 13 * CELL_SIZE;
                    ghost.y = 11 * CELL_SIZE;
                }, ghost.releaseTime);
            }
        });
    }
    
    // Draw the game
    function draw() {
        // Clear the canvas
        ctx.fillStyle = COLORS.background;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw maze
        drawMaze();
        
        // Draw pacman
        drawPacman();
        
        // Draw ghosts
        drawGhosts();
    }
    
    // Draw the maze
    function drawMaze() {
        for (let y = 0; y < maze.length; y++) {
            for (let x = 0; x < maze[y].length; x++) {
                const cell = maze[y][x];
                const cellX = x * CELL_SIZE;
                const cellY = y * CELL_SIZE;
                
                if (cell === 1) {
                    // Wall
                    ctx.fillStyle = COLORS.wall;
                    ctx.fillRect(cellX, cellY, CELL_SIZE, CELL_SIZE);
                } else if (cell === 2) {
                    // Dot
                    ctx.fillStyle = COLORS.dot;
                    ctx.beginPath();
                    ctx.arc(cellX + CELL_SIZE / 2, cellY + CELL_SIZE / 2, DOT_RADIUS, 0, Math.PI * 2);
                    ctx.fill();
                } else if (cell === 3) {
                    // Power dot
                    ctx.fillStyle = COLORS.powerDot;
                    ctx.beginPath();
                    ctx.arc(cellX + CELL_SIZE / 2, cellY + CELL_SIZE / 2, POWER_DOT_RADIUS, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }
    }
    
    // Draw Pac-Man
    function drawPacman() {
        ctx.fillStyle = COLORS.pacman;
        ctx.beginPath();
        
        // Calculate mouth angle based on animation state
        const mouthAngle = Math.PI / 4 * pacman.mouthOpen;
        
        // Calculate starting angle based on direction
        let startAngle = 0;
        let endAngle = 0;
        
        switch (pacman.direction) {
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
        ctx.arc(pacman.x + CELL_SIZE / 2, pacman.y + CELL_SIZE / 2, PACMAN_RADIUS, startAngle, endAngle);
        ctx.lineTo(pacman.x + CELL_SIZE / 2, pacman.y + CELL_SIZE / 2);
        ctx.fill();
    }
    
    // Draw ghosts
    function drawGhosts() {
        ghosts.forEach(ghost => {
            // Draw ghost body
            ctx.fillStyle = ghost.frightened ? COLORS.frightened : ghost.color;
            
            // Draw ghost body (semi-circle top and wavy bottom)
            ctx.beginPath();
            ctx.arc(ghost.x + CELL_SIZE / 2, ghost.y + CELL_SIZE / 2 - 2, GHOST_RADIUS, Math.PI, 0, false);
            
            // Draw the wavy bottom part
            ctx.lineTo(ghost.x + CELL_SIZE, ghost.y + CELL_SIZE / 2 + 4);
            ctx.lineTo(ghost.x + CELL_SIZE - 4, ghost.y + CELL_SIZE / 2);
            ctx.lineTo(ghost.x + CELL_SIZE - 8, ghost.y + CELL_SIZE / 2 + 4);
            ctx.lineTo(ghost.x + CELL_SIZE - 12, ghost.y + CELL_SIZE / 2);
            ctx.lineTo(ghost.x + 4, ghost.y + CELL_SIZE / 2);
            ctx.lineTo(ghost.x, ghost.y + CELL_SIZE / 2 + 4);
            ctx.lineTo(ghost.x, ghost.y + CELL_SIZE / 2 - 2);
            ctx.fill();
            
            // Draw eyes
            ctx.fillStyle = '#FFFFFF';
            
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
            ctx.beginPath();
            ctx.arc(eyeX1, eyeY1, eyeRadius, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(eyeX2, eyeY2, eyeRadius, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw pupils
            ctx.fillStyle = '#000000';
            
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
            ctx.beginPath();
            ctx.arc(pupilX1, pupilY1, pupilRadius, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(pupilX2, pupilY2, pupilRadius, 0, Math.PI * 2);
            ctx.fill();
        });
    }
    
    // Update game state
    function update() {
        if (gameOver || gameWon) return;
        if (paused) return;
        
        // Update Pac-Man
        updatePacman();
        
        // Update ghosts
        updateGhosts();
        
        // Check for collisions
        checkCollisions();
        
        // Animate Pac-Man's mouth
        animatePacman();
        
        // Draw the game
        draw();
        
        // Check if level is complete
        if (dotCount === 0) {
            gameWon = true;
            showLevelComplete();
        }
    }
    
    // Animate Pac-Man's mouth
    function animatePacman() {
        pacman.mouthOpen += 0.1 * pacman.mouthDir;
        
        if (pacman.mouthOpen >= 1) {
            pacman.mouthDir = -1;
        } else if (pacman.mouthOpen <= 0) {
            pacman.mouthDir = 1;
        }
    }
    
    // Update Pac-Man's position
    function updatePacman() {
        // Always try to align to grid at intersections for better control
        const gridX = Math.round(pacman.x / CELL_SIZE);
        const gridY = Math.round(pacman.y / CELL_SIZE);
        const atIntersection = (pacman.x % CELL_SIZE === 0) && (pacman.y % CELL_SIZE === 0);
        
        // Try to change direction if a new direction is requested and we're at an intersection
        if (pacman.nextDirection !== pacman.direction && atIntersection) {
            if (canMove(pacman.x, pacman.y, pacman.nextDirection)) {
                pacman.direction = pacman.nextDirection;
                
                // Ensure perfect grid alignment when changing direction
                pacman.x = gridX * CELL_SIZE;
                pacman.y = gridY * CELL_SIZE;
            }
        }
        
        // Move in the current direction if possible
        if (canMove(pacman.x, pacman.y, pacman.direction)) {
            switch (pacman.direction) {
                case 'up':
                    pacman.y -= pacman.speed;
                    break;
                case 'down':
                    pacman.y += pacman.speed;
                    break;
                case 'left':
                    pacman.x -= pacman.speed;
                    break;
                case 'right':
                    pacman.x += pacman.speed;
                    break;
            }
        } else {
            // If we can't move, ensure perfect grid alignment
            pacman.x = gridX * CELL_SIZE;
            pacman.y = gridY * CELL_SIZE;
        }
        
        // Check for wrapping around the tunnel
        if (pacman.x < 0) {
            pacman.x = canvas.width - CELL_SIZE;
        } else if (pacman.x >= canvas.width) {
            pacman.x = 0;
        }
        
        // Check for dot collection
        eatDot();
    }
    
    // Align Pac-Man to the grid for better movement
    function alignToGrid() {
        // Get the current grid position
        const gridX = Math.round(pacman.x / CELL_SIZE);
        const gridY = Math.round(pacman.y / CELL_SIZE);
        
        // Align to the grid
        pacman.x = gridX * CELL_SIZE;
        pacman.y = gridY * CELL_SIZE;
    }
    
    // Check if Pac-Man can move in the specified direction
    function canMove(x, y, direction) {
        // Ensure we're perfectly aligned to the grid before checking movement
        // This prevents getting stuck between cells
        const perfectlyAligned = (x % CELL_SIZE === 0) && (y % CELL_SIZE === 0);
        
        // Calculate the grid position
        const gridX = Math.floor(x / CELL_SIZE);
        const gridY = Math.floor(y / CELL_SIZE);
        
        // If not perfectly aligned, only allow continuing in the same direction
        if (!perfectlyAligned && direction !== pacman.direction) {
            return false;
        }
        
        // Calculate the next position based on direction
        let nextX = gridX;
        let nextY = gridY;
        
        switch (direction) {
            case 'up':
                nextY = gridY - 1;
                break;
            case 'down':
                nextY = gridY + 1;
                break;
            case 'left':
                nextX = gridX - 1;
                break;
            case 'right':
                nextX = gridX + 1;
                break;
        }
        
        // Check if the next position is a wall
        if (nextY < 0 || nextY >= maze.length || nextX < 0 || nextX >= maze[0].length) {
            return true; // Allow movement outside the maze (for tunnel)
        }
        
        return maze[nextY][nextX] !== 1; // Can move if not a wall
    }
    
    // Check if Pac-Man is eating a dot
    function eatDot() {
        // Calculate the grid position
        const gridX = Math.floor((pacman.x + CELL_SIZE / 2) / CELL_SIZE);
        const gridY = Math.floor((pacman.y + CELL_SIZE / 2) / CELL_SIZE);
        
        // Check if the current position has a dot
        if (gridY >= 0 && gridY < maze.length && gridX >= 0 && gridX < maze[0].length) {
            if (maze[gridY][gridX] === 2) {
                // Regular dot
                maze[gridY][gridX] = 0;
                score += 10;
                dotCount--;
                scoreElement.textContent = score;
                
                // Update high score
                if (score > highScore) {
                    highScore = score;
                    highScoreElement.textContent = highScore;
                    localStorage.setItem('pacmanHighScore', highScore);
                }
            } else if (maze[gridY][gridX] === 3) {
                // Power dot
                maze[gridY][gridX] = 0;
                score += 50;
                dotCount--;
                scoreElement.textContent = score;
                
                // Make ghosts frightened
                frightenGhosts();
                
                // Update high score
                if (score > highScore) {
                    highScore = score;
                    highScoreElement.textContent = highScore;
                    localStorage.setItem('pacmanHighScore', highScore);
                }
            }
        }
    }
    function frightenGhosts() {
        ghosts.forEach(ghost => {
            ghost.frightened = true;
            
            // Reverse direction
            switch (ghost.direction) {
                case 'up':
                    ghost.direction = 'down';
                    break;
                case 'down':
                    ghost.direction = 'up';
                    break;
                case 'left':
                    ghost.direction = 'right';
                    break;
                case 'right':
                    ghost.direction = 'left';
                    break;
            }
        });
        
        // Reset after 7 seconds
        setTimeout(() => {
            ghosts.forEach(ghost => {
                ghost.frightened = false;
            });
        }, 7000); // 7 seconds of frightened mode
    }
    
    // Update ghosts' positions
    function updateGhosts() {
        ghosts.forEach(ghost => {
            // Skip ghosts that are still in the ghost house
            if (ghost.inGhostHouse) return;
            
            // Get current grid position
            const currentGridX = Math.round(ghost.x / CELL_SIZE);
            const currentGridY = Math.round(ghost.y / CELL_SIZE);
            
            // Check if ghost is at a grid intersection
            const isAtIntersection = 
                Math.abs(ghost.x - currentGridX * CELL_SIZE) < 2 &&
                Math.abs(ghost.y - currentGridY * CELL_SIZE) < 2;
            
            if (isAtIntersection) {
                // Determine possible directions
                const possibleDirections = getPossibleDirections(ghost);
                
                // Choose new direction at intersections or when blocked
                if (possibleDirections.length > 1 || !canMove(ghost.x, ghost.y, ghost.direction)) {
                    const newDirection = chooseDirection(ghost, possibleDirections);
                    if (newDirection && newDirection !== ghost.direction) {
                        // Align to grid when changing direction
                        ghost.x = currentGridX * CELL_SIZE;
                        ghost.y = currentGridY * CELL_SIZE;
                        ghost.direction = newDirection;
                    }
                }
            }
            
            // Move in the current direction
            const moveSpeed = ghost.frightened ? ghost.speed * 0.5 : ghost.speed;
            switch (ghost.direction) {
                case 'up':
                    if (canMove(ghost.x, ghost.y - moveSpeed, 'up')) {
                        ghost.y -= moveSpeed;
                    }
                    break;
                case 'down':
                    if (canMove(ghost.x, ghost.y + moveSpeed, 'down')) {
                        ghost.y += moveSpeed;
                    }
                    break;
                case 'left':
                    if (canMove(ghost.x - moveSpeed, ghost.y, 'left')) {
                        ghost.x -= moveSpeed;
                    }
                    break;
                case 'right':
                    if (canMove(ghost.x + moveSpeed, ghost.y, 'right')) {
                        ghost.x += moveSpeed;
                    }
                    break;
            }
            
            // Check for wrapping around the tunnel
            if (ghost.x < 0) {
                ghost.x = canvas.width - CELL_SIZE;
            } else if (ghost.x >= canvas.width) {
                ghost.x = 0;
            }
        });
    }
    
    // Get possible directions for a ghost
    function getPossibleDirections(ghost) {
        const directions = ['up', 'down', 'left', 'right'];
        const oppositeDirections = {
            'up': 'down',
            'down': 'up',
            'left': 'right',
            'right': 'left'
        };
        
        // Filter out walls and the opposite direction (to prevent backtracking)
        return directions.filter(dir => {
            // Don't allow the opposite direction unless at a dead end
            if (dir === oppositeDirections[ghost.direction] && directions.length > 1) {
                return false;
            }
            return canMove(ghost.x, ghost.y, dir);
        });
    }
    
    // Choose a direction for a ghost
    function chooseDirection(ghost, possibleDirections) {
        if (possibleDirections.length === 0) {
            // If no valid directions, allow backtracking
            const oppositeDirections = {
                'up': 'down',
                'down': 'up',
                'left': 'right',
                'right': 'left'
            };
            return oppositeDirections[ghost.direction];
        }
        
        if (ghost.frightened) {
            // Choose a random direction when frightened
            return possibleDirections[Math.floor(Math.random() * possibleDirections.length)];
        }
        
        // Each ghost has unique behavior
        switch(ghost.type) {
            case 'blinky': // Red ghost - directly chases Pacman
                return getBlinkyDirection(ghost, possibleDirections);
            case 'pinky': // Pink ghost - tries to ambush Pacman
                return getPinkyDirection(ghost, possibleDirections);
            case 'inky': // Cyan ghost - unpredictable movement
                return getInkyDirection(ghost, possibleDirections);
            case 'clyde': // Orange ghost - random movement when far, chase when close
                return getClydeDirection(ghost, possibleDirections);
            default:
                return possibleDirections[Math.floor(Math.random() * possibleDirections.length)];
        }
    }
    
    // Pinky tries to ambush Pacman by targeting 4 cells ahead
    function getPinkyDirection(ghost, possibleDirections) {
        let targetX = pacman.x;
        let targetY = pacman.y;
        
        // Target 4 cells ahead of Pacman
        switch(pacman.direction) {
            case 'up':
                targetY -= CELL_SIZE * 4;
                break;
            case 'down':
                targetY += CELL_SIZE * 4;
                break;
            case 'left':
                targetX -= CELL_SIZE * 4;
                break;
            case 'right':
                targetX += CELL_SIZE * 4;
                break;
        }
        
        return getDirectionToTarget(ghost, possibleDirections, targetX, targetY);
    }
    
    // Inky has erratic movement
    function getInkyDirection(ghost, possibleDirections) {
        // Every few seconds, change between targeting Pacman and moving randomly
        const now = Date.now();
        if (now - ghost.lastBehaviorChange > 3000) { // Change behavior every 3 seconds
            ghost.targeting = !ghost.targeting;
            ghost.lastBehaviorChange = now;
        }
        
        if (ghost.targeting) {
            return getDirectionToTarget(ghost, possibleDirections, pacman.x, pacman.y);
        } else {
            return possibleDirections[Math.floor(Math.random() * possibleDirections.length)];
        }
    }
    
    // Clyde moves randomly when far from Pacman, but chases when close
    function getClydeDirection(ghost, possibleDirections) {
        const dx = ghost.x - pacman.x;
        const dy = ghost.y - pacman.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // If Clyde is more than 8 cells away from Pacman, move randomly
        if (distance > CELL_SIZE * 8) {
            return possibleDirections[Math.floor(Math.random() * possibleDirections.length)];
        } else {
            return getDirectionToTarget(ghost, possibleDirections, pacman.x, pacman.y);
        }
    }
    
    // Helper function to get direction towards a target position
    function getDirectionToTarget(ghost, possibleDirections, targetX, targetY) {
        const distances = possibleDirections.map(dir => {
            let nextX = ghost.x;
            let nextY = ghost.y;
            
            switch (dir) {
                case 'up': nextY -= CELL_SIZE; break;
                case 'down': nextY += CELL_SIZE; break;
                case 'left': nextX -= CELL_SIZE; break;
                case 'right': nextX += CELL_SIZE; break;
            }
            
            const dx = nextX - targetX;
            const dy = nextY - targetY;
            return Math.sqrt(dx * dx + dy * dy);
        });
        
        let minIndex = 0;
        for (let i = 1; i < distances.length; i++) {
            if (distances[i] < distances[minIndex]) {
                minIndex = i;
            }
        }
        
        return possibleDirections[minIndex];
    }
    // Check for ghost collisions
    function checkGhostCollisions() {
        ghosts.forEach(ghost => {
            const dx = (pacman.x + CELL_SIZE / 2) - (ghost.x + CELL_SIZE / 2);
            const dy = (pacman.y + CELL_SIZE / 2) - (ghost.y + CELL_SIZE / 2);
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // If collision detected
            if (distance < PACMAN_RADIUS + GHOST_RADIUS - 5) {
                if (ghost.frightened) {
                    // Eat the ghost
                    ghost.x = 13 * CELL_SIZE;
                    ghost.y = 13 * CELL_SIZE;
                    ghost.frightened = false;
                    
                    // Add score
                    score += 200;
                    scoreElement.textContent = score;
                    
                    // Update high score
                    if (score > highScore) {
                        highScore = score;
                        highScoreElement.textContent = highScore;
                        localStorage.setItem('pacmanHighScore', highScore);
                    }
                } else {
                    // Lose a life
                    lives--;
                    livesElement.textContent = lives;
                    
                    if (lives <= 0) {
                        // Game over
                        gameOver = true;
                        showGameOver();
                    } else {
                        // Reset positions
                        resetPositions();
                    }
                }
            }
        });
    }
    
    // Show game over screen
    function showGameOver() {
        clearInterval(gameInterval);
        finalScoreElement.textContent = score;
        gameOverModal.style.display = 'flex';
    }
    
    // Show level complete screen
    function showLevelComplete() {
        clearInterval(gameInterval);
        levelCompleteModal.style.display = 'flex';
    }
    
    // Toggle pause
    function togglePause() {
        paused = !paused;
        if (paused) {
            pauseScreen.style.display = 'flex';
        } else {
            pauseScreen.style.display = 'none';
        }
    }

    
    startButton.addEventListener('click', () => {
        init();
        if (paused) {
            paused = false;
            pauseScreen.style.display = 'none';
        }
        gameOverModal.style.display = 'none';
        levelCompleteModal.style.display = 'none';
    });
    
    playAgainButton.addEventListener('click', () => {
        init();
        gameOverModal.style.display = 'none';
    });
    
    resumeButton.addEventListener('click', () => {
        togglePause();
    });
    
    nextLevelButton.addEventListener('click', () => {
        level++;
        initMaze();
        resetPositions();
        levelCompleteModal.style.display = 'none';
        gameInterval = setInterval(update, 30);
    });
    
    // Initialize the game when Start button is clicked
    startButton.addEventListener('click', init);
});
