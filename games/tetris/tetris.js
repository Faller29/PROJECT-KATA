// Tetris Game JavaScript

// Load key bindings and prevent scrolling
let keyBindings = {
    moveLeft: 'ArrowLeft',
    moveRight: 'ArrowRight',
    moveDown: 'ArrowDown',
    rotate: 'ArrowUp',
    hardDrop: ' ' // Space
};

// Prevent scrolling with arrow keys
window.addEventListener('keydown', function(e) {
    // Prevent default behavior for arrow keys and space
    if([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
        e.preventDefault();
    }
});

// Load user key bindings if available
function loadKeyBindings() {
    if (localStorage.getItem('projectKataPreferences')) {
        const preferences = JSON.parse(localStorage.getItem('projectKataPreferences'));
        if (preferences.keyBindings && preferences.keyBindings.tetris) {
            keyBindings = preferences.keyBindings.tetris;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Load key bindings
    loadKeyBindings();
    // Canvas setup
    const canvas = document.getElementById('tetris');
    const ctx = canvas.getContext('2d');
    const nextPieceCanvas = document.getElementById('next-piece');
    const nextPieceCtx = nextPieceCanvas.getContext('2d');
    
    // Game constants
    const BLOCK_SIZE = 30;
    const BOARD_WIDTH = 10;
    const BOARD_HEIGHT = 20;
    const COLORS = [
        null,
        '#FF0D72', // I
        '#0DC2FF', // J
        '#0DFF72', // L
        '#F538FF', // O
        '#FF8E0D', // S
        '#FFE138', // T
        '#3877FF'  // Z
    ];

    // Game variables
    let dropCounter = 0;
    let dropInterval = 1000; // milliseconds
    let lastTime = 0;
    let score = 0;
    let level = 1;
    let lines = 0;
    let paused = false;
    let gameOver = false;
    
    // DOM elements
    const scoreElement = document.getElementById('score');
    const levelElement = document.getElementById('level');
    const linesElement = document.getElementById('lines');
    const finalScoreElement = document.getElementById('final-score');
    const startButton = document.getElementById('start-button');
    const resetButton = document.getElementById('reset-button');
    const playAgainButton = document.getElementById('play-again');
    const resumeButton = document.getElementById('resume');
    const gameOverModal = document.getElementById('game-over');
    const pauseScreen = document.getElementById('pause-screen');
    
    // Create the game board
    const board = createMatrix(BOARD_WIDTH, BOARD_HEIGHT);
    
    // Tetromino shapes
    const PIECES = [
        [
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ], // I
        [
            [2, 0, 0],
            [2, 2, 2],
            [0, 0, 0]
        ], // J
        [
            [0, 0, 3],
            [3, 3, 3],
            [0, 0, 0]
        ], // L
        [
            [4, 4],
            [4, 4]
        ], // O
        [
            [0, 5, 5],
            [5, 5, 0],
            [0, 0, 0]
        ], // S
        [
            [0, 6, 0],
            [6, 6, 6],
            [0, 0, 0]
        ], // T
        [
            [7, 7, 0],
            [0, 7, 7],
            [0, 0, 0]
        ]  // Z
    ];
    
    // Player object
    const player = {
        pos: {x: 0, y: 0},
        matrix: null,
        score: 0,
        level: 1,
        lines: 0,
        next: null
    };
    
    // Initialize the game
    function init() {
        // Reset game state
        board.forEach(row => row.fill(0));
        player.score = 0;
        player.level = 1;
        player.lines = 0;
        score = 0;
        level = 1;
        lines = 0;
        dropInterval = 1000;
        gameOver = false;
        
        // Update UI
        scoreElement.textContent = score;
        levelElement.textContent = level;
        linesElement.textContent = lines;
        
        // Generate first piece and next piece
        playerReset();
        
        // Start the game loop
        update();
    }
    
    // Helper function to create a matrix
    function createMatrix(w, h) {
        const matrix = [];
        while (h--) {
            matrix.push(new Array(w).fill(0));
        }
        return matrix;
    }
    
    // Helper function to create a random piece
    function createPiece() {
        const index = Math.floor(Math.random() * PIECES.length);
        return PIECES[index];
    }
    
    // Reset player position and get new piece
    function playerReset() {
        // If there's a next piece, use it, otherwise create a new one
        player.matrix = player.next || createPiece();
        player.next = createPiece();
        
        // Position the piece at the top center
        player.pos.y = 0;
        player.pos.x = Math.floor(BOARD_WIDTH / 2) - Math.floor(player.matrix[0].length / 2);
        
        // Draw the next piece preview
        drawNextPiece();
        
        // Check if the game is over (collision right at the start)
        if (collide(board, player)) {
            gameOver = true;
            showGameOver();
        }
    }
    
    // Draw the next piece in the preview area
    function drawNextPiece() {
        nextPieceCtx.fillStyle = '#111';
        nextPieceCtx.fillRect(0, 0, nextPieceCanvas.width, nextPieceCanvas.height);
        
        if (player.next) {
            // Center the piece in the preview canvas
            const offsetX = (nextPieceCanvas.width / 2) - (player.next[0].length * BLOCK_SIZE / 2);
            const offsetY = (nextPieceCanvas.height / 2) - (player.next.length * BLOCK_SIZE / 2);
            
            drawMatrix(player.next, {x: offsetX / BLOCK_SIZE, y: offsetY / BLOCK_SIZE}, nextPieceCtx, BLOCK_SIZE / 1.5);
        }
    }
    
    // Draw a matrix (piece or board)
    function drawMatrix(matrix, offset, context = ctx, size = BLOCK_SIZE) {
        matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    context.fillStyle = COLORS[value];
                    context.fillRect(
                        (x + offset.x) * size,
                        (y + offset.y) * size,
                        size,
                        size
                    );
                    context.strokeStyle = '#000';
                    context.lineWidth = 1;
                    context.strokeRect(
                        (x + offset.x) * size,
                        (y + offset.y) * size,
                        size,
                        size
                    );
                }
            });
        });
    }
    
    // Draw the game board
    function draw() {
        // Clear the canvas
        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw the board
        drawMatrix(board, {x: 0, y: 0});
        
        // Draw the current piece
        drawMatrix(player.matrix, player.pos);
    }
    
    // Check for collision
    function collide(board, player) {
        const [m, o] = [player.matrix, player.pos];
        for (let y = 0; y < m.length; ++y) {
            for (let x = 0; x < m[y].length; ++x) {
                if (m[y][x] !== 0 &&
                    (board[y + o.y] &&
                    board[y + o.y][x + o.x]) !== 0) {
                    return true;
                }
            }
        }
        return false;
    }
    
    // Merge the piece into the board
    function merge(board, player) {
        player.matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    board[y + player.pos.y][x + player.pos.x] = value;
                }
            });
        });
    }
    
    // Move the piece
    function playerMove(dir) {
        player.pos.x += dir;
        if (collide(board, player)) {
            player.pos.x -= dir;
        }
    }
    
    // Rotate the piece
    function playerRotate(dir) {
        const pos = player.pos.x;
        let offset = 1;
        rotate(player.matrix, dir);
        
        // Handle collision during rotation
        while (collide(board, player)) {
            player.pos.x += offset;
            offset = -(offset + (offset > 0 ? 1 : -1));
            if (offset > player.matrix[0].length) {
                rotate(player.matrix, -dir);
                player.pos.x = pos;
                return;
            }
        }
    }
    
    // Helper function to rotate a matrix
    function rotate(matrix, dir) {
        for (let y = 0; y < matrix.length; ++y) {
            for (let x = 0; x < y; ++x) {
                [
                    matrix[x][y],
                    matrix[y][x],
                ] = [
                    matrix[y][x],
                    matrix[x][y],
                ];
            }
        }
        
        if (dir > 0) {
            matrix.forEach(row => row.reverse());
        } else {
            matrix.reverse();
        }
    }
    
    // Drop the piece
    function playerDrop() {
        player.pos.y++;
        if (collide(board, player)) {
            player.pos.y--;
            merge(board, player);
            playerReset();
            sweepLines();
            updateScore();
        }
        dropCounter = 0;
    }
    
    // Hard drop (drop to the bottom)
    function playerHardDrop() {
        while (!collide(board, player)) {
            player.pos.y++;
        }
        player.pos.y--;
        merge(board, player);
        playerReset();
        sweepLines();
        updateScore();
        dropCounter = 0;
    }
    
    // Clear completed lines
    function sweepLines() {
        let rowCount = 0;
        outer: for (let y = board.length - 1; y >= 0; --y) {
            for (let x = 0; x < board[y].length; ++x) {
                if (board[y][x] === 0) {
                    continue outer;
                }
            }
            
            // Remove the completed line
            const row = board.splice(y, 1)[0].fill(0);
            board.unshift(row);
            ++y;
            
            rowCount++;
        }
        
        // Update lines and level
        if (rowCount > 0) {
            player.lines += rowCount;
            lines = player.lines;
            linesElement.textContent = lines;
            
            // Level up every 10 lines
            const newLevel = Math.floor(lines / 10) + 1;
            if (newLevel > level) {
                level = newLevel;
                player.level = level;
                levelElement.textContent = level;
                // Increase speed with level
                dropInterval = 1000 * Math.pow(0.8, level - 1);
            }
        }
    }
    
    // Update the score
    function updateScore() {
        // Get the number of lines cleared in this sweep
        const rowCount = player.lines - lines;
        // Scoring system: 100 points per line, multiplied by level
        const linePoints = [0, 100, 300, 500, 800]; // 0, 1, 2, 3, 4 lines
        score += linePoints[Math.min(rowCount, 4)] * level;
        player.score = score;
        scoreElement.textContent = score;
    }
    
    // Game update loop
    function update(time = 0) {
        if (gameOver) return;
        if (paused) return;
        
        const deltaTime = time - lastTime;
        lastTime = time;
        
        dropCounter += deltaTime;
        if (dropCounter > dropInterval) {
            playerDrop();
        }
        
        draw();
        requestAnimationFrame(update);
    }
    
    // Show game over screen
    function showGameOver() {
        finalScoreElement.textContent = score;
        gameOverModal.style.display = 'flex';
    }
    
    // Show pause screen
    function togglePause() {
        paused = !paused;
        if (paused) {
            pauseScreen.style.display = 'flex';
        } else {
            pauseScreen.style.display = 'none';
            lastTime = performance.now();
            update();
        }
    }
    
    // Event listeners
    document.addEventListener('keydown', event => {
        if (gameOver) return;
        
        // Use custom key bindings
        if (event.key === keyBindings.moveLeft) {
            playerMove(-1);
        } else if (event.key === keyBindings.moveRight) {
            playerMove(1);
        } else if (event.key === keyBindings.moveDown) {
            playerDrop();
        } else if (event.key === keyBindings.rotate) {
            playerRotate(1);
        } else if (event.key === keyBindings.hardDrop) {
            playerHardDrop();
        } else if (event.key === 'p') { // Pause key
            togglePause();
        }
    });
    
    startButton.addEventListener('click', () => {
        if (gameOver) {
            init();
            gameOverModal.style.display = 'none';
        } else {
            togglePause();
        }
    });
    
    resetButton.addEventListener('click', () => {
        init();
        if (paused) {
            paused = false;
            pauseScreen.style.display = 'none';
        }
        gameOverModal.style.display = 'none';
    });
    
    playAgainButton.addEventListener('click', () => {
        init();
        gameOverModal.style.display = 'none';
    });
    
    resumeButton.addEventListener('click', () => {
        togglePause();
    });
    
    // Initialize the game
    init();
});
