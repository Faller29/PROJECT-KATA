/**
 * 2048 Game
 * Project Kata
 */
document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const gameBoard = document.getElementById('game-board');
    const scoreElement = document.getElementById('score');
    const bestScoreElement = document.getElementById('best-score');
    const newGameBtn = document.getElementById('new-game-btn');
    const playAgainBtn = document.getElementById('play-again-btn');
    const keepGoingBtn = document.getElementById('keep-going-btn');
    const restartBtn = document.getElementById('restart-btn');
    const gameOverModal = document.getElementById('game-over');
    const gameWonModal = document.getElementById('game-won');
    const finalScoreElement = document.getElementById('final-score');
    const winScoreElement = document.getElementById('win-score');
    
    // Game constants
    const GRID_SIZE = 4;
    const CELL_SIZE = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--cell-size'));
    const CELL_GAP = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--cell-gap'));
    
    // Game state
    let board;
    let score;
    let bestScore;
    let gameActive;
    let won2048;
    
    // Initialize game
    function initGame() {
        // Clear the board
        gameBoard.innerHTML = '';
        
        // Create the cells
        createCells();
        
        // Initialize the game state
        board = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0));
        score = 0;
        gameActive = true;
        won2048 = false;
        
        // Load best score from localStorage
        bestScore = localStorage.getItem('2048-best-score') || 0;
        bestScoreElement.textContent = bestScore;
        
        // Add two starting tiles
        addRandomTile();
        addRandomTile();
        
        // Update the score display
        updateScore();
    }
    
    // Create the empty cells in the grid
    function createCells() {
        for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            gameBoard.appendChild(cell);
        }
    }
    
    // Add a random tile (either 2 or 4) to an empty cell
    function addRandomTile() {
        // Get all empty cells
        const emptyCells = [];
        for (let row = 0; row < GRID_SIZE; row++) {
            for (let col = 0; col < GRID_SIZE; col++) {
                if (board[row][col] === 0) {
                    emptyCells.push({ row, col });
                }
            }
        }
        
        // If there are no empty cells, return
        if (emptyCells.length === 0) return false;
        
        // Select a random empty cell
        const { row, col } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        
        // Add a 2 (90% chance) or 4 (10% chance)
        board[row][col] = Math.random() < 0.9 ? 2 : 4;
        
        // Update the UI
        renderBoard();
        return true;
    }
    
    // Render the board based on the current state
    function renderBoard() {
        // Remove existing tiles
        const existingTiles = document.querySelectorAll('.tile');
        existingTiles.forEach(tile => tile.remove());
        
        // Create new tiles based on the board state
        for (let row = 0; row < GRID_SIZE; row++) {
            for (let col = 0; col < GRID_SIZE; col++) {
                if (board[row][col] !== 0) {
                    createTile(row, col, board[row][col]);
                }
            }
        }
    }
    
    // Create a tile at the specified position with the given value
    function createTile(row, col, value) {
        const tile = document.createElement('div');
        tile.classList.add('tile', `tile-${value}`);
        tile.textContent = value;
        tile.style.setProperty('--row', row);
        tile.style.setProperty('--col', col);
        
        // Position the tile
        positionTile(tile, row, col);
        
        gameBoard.appendChild(tile);
        return tile;
    }
    
    // Position a tile at the specified grid position
    function positionTile(tile, row, col) {
        tile.style.transform = `translate(${col * (CELL_SIZE + CELL_GAP)}px, ${row * (CELL_SIZE + CELL_GAP)}px)`;
    }
    
    // Update the score display
    function updateScore() {
        scoreElement.textContent = score;
        
        if (score > bestScore) {
            bestScore = score;
            bestScoreElement.textContent = bestScore;
            localStorage.setItem('2048-best-score', bestScore);
        }
    }
    
    // Check if the game is over (no more valid moves)
    function isGameOver() {
        // If there are empty cells, the game is not over
        for (let row = 0; row < GRID_SIZE; row++) {
            for (let col = 0; col < GRID_SIZE; col++) {
                if (board[row][col] === 0) return false;
            }
        }
        
        // Check if any adjacent cells have the same value
        for (let row = 0; row < GRID_SIZE; row++) {
            for (let col = 0; col < GRID_SIZE; col++) {
                const value = board[row][col];
                
                // Check cell to the right
                if (col < GRID_SIZE - 1 && board[row][col + 1] === value) return false;
                
                // Check cell below
                if (row < GRID_SIZE - 1 && board[row + 1][col] === value) return false;
            }
        }
        
        // No valid moves
        return true;
    }
    
    // Show game over modal
    function showGameOver() {
        finalScoreElement.textContent = score;
        gameOverModal.style.display = 'flex';
    }
    
    // Show game won modal
    function showGameWon() {
        winScoreElement.textContent = score;
        gameWonModal.style.display = 'flex';
    }
    
    // Hide the modals
    function hideModals() {
        gameOverModal.style.display = 'none';
        gameWonModal.style.display = 'none';
    }
    
    // Handle arrow key input
    function handleInput(direction) {
        if (!gameActive) return;
        
        // Record the previous state for comparison
        const previousBoard = board.map(row => [...row]);
        
        // Move tiles in the specified direction
        let moved = false;
        let mergedScore = 0;
        
        switch (direction) {
            case 'up':
                for (let col = 0; col < GRID_SIZE; col++) {
                    const result = moveTilesInColumn(col, -1); // Move up
                    moved = moved || result.moved;
                    mergedScore += result.mergedScore;
                }
                break;
            case 'right':
                for (let row = 0; row < GRID_SIZE; row++) {
                    const result = moveTilesInRow(row, 1); // Move right
                    moved = moved || result.moved;
                    mergedScore += result.mergedScore;
                }
                break;
            case 'down':
                for (let col = 0; col < GRID_SIZE; col++) {
                    const result = moveTilesInColumn(col, 1); // Move down
                    moved = moved || result.moved;
                    mergedScore += result.mergedScore;
                }
                break;
            case 'left':
                for (let row = 0; row < GRID_SIZE; row++) {
                    const result = moveTilesInRow(row, -1); // Move left
                    moved = moved || result.moved;
                    mergedScore += result.mergedScore;
                }
                break;
        }
        
        // Update score
        if (mergedScore > 0) {
            score += mergedScore;
            updateScore();
        }
        
        // If tiles moved, add a new random tile
        if (moved) {
            renderBoard();
            setTimeout(() => {
                addRandomTile();
                
                // Check for win or game over
                checkGameState();
            }, 200);
        }
    }
    
    // Move tiles in a row
    function moveTilesInRow(row, direction) {
        // direction: 1 for right, -1 for left
        let moved = false;
        let mergedScore = 0;
        
        // Determine the order to process cells
        const start = direction === 1 ? GRID_SIZE - 2 : 1;
        const end = direction === 1 ? -1 : GRID_SIZE;
        const step = direction === 1 ? -1 : 1;
        
        for (let col = start; direction === 1 ? col > end : col < end; col += step) {
            if (board[row][col] === 0) continue;
            
            let currentCol = col;
            let nextCol = currentCol + direction;
            
            // Move the tile until it hits a wall or another tile
            while (
                nextCol >= 0 && 
                nextCol < GRID_SIZE && 
                board[row][nextCol] === 0
            ) {
                board[row][nextCol] = board[row][currentCol];
                board[row][currentCol] = 0;
                currentCol = nextCol;
                nextCol += direction;
                moved = true;
            }
            
            // Check if we can merge with the next tile
            if (
                nextCol >= 0 && 
                nextCol < GRID_SIZE && 
                board[row][nextCol] === board[row][currentCol] &&
                board[row][nextCol] !== 0
            ) {
                // Merge the tiles
                board[row][nextCol] *= 2;
                board[row][currentCol] = 0;
                moved = true;
                
                // Add to score
                mergedScore += board[row][nextCol];
                
                // Check for 2048 tile
                if (board[row][nextCol] === 2048 && !won2048) {
                    won2048 = true;
                    showGameWon();
                }
            }
        }
        
        return { moved, mergedScore };
    }
    
    // Move tiles in a column
    function moveTilesInColumn(col, direction) {
        // direction: 1 for down, -1 for up
        let moved = false;
        let mergedScore = 0;
        
        // Determine the order to process cells
        const start = direction === 1 ? GRID_SIZE - 2 : 1;
        const end = direction === 1 ? -1 : GRID_SIZE;
        const step = direction === 1 ? -1 : 1;
        
        for (let row = start; direction === 1 ? row > end : row < end; row += step) {
            if (board[row][col] === 0) continue;
            
            let currentRow = row;
            let nextRow = currentRow + direction;
            
            // Move the tile until it hits a wall or another tile
            while (
                nextRow >= 0 && 
                nextRow < GRID_SIZE && 
                board[nextRow][col] === 0
            ) {
                board[nextRow][col] = board[currentRow][col];
                board[currentRow][col] = 0;
                currentRow = nextRow;
                nextRow += direction;
                moved = true;
            }
            
            // Check if we can merge with the next tile
            if (
                nextRow >= 0 && 
                nextRow < GRID_SIZE && 
                board[nextRow][col] === board[currentRow][col] &&
                board[nextRow][col] !== 0
            ) {
                // Merge the tiles
                board[nextRow][col] *= 2;
                board[currentRow][col] = 0;
                moved = true;
                
                // Add to score
                mergedScore += board[nextRow][col];
                
                // Check for 2048 tile
                if (board[nextRow][col] === 2048 && !won2048) {
                    won2048 = true;
                    showGameWon();
                }
            }
        }
        
        return { moved, mergedScore };
    }
    
    // Check if the game is over or won
    function checkGameState() {
        if (isGameOver()) {
            gameActive = false;
            showGameOver();
        }
    }
    
    // Set up key event listeners
    function setupEventListeners() {
        document.addEventListener('keydown', e => {
            if (!gameActive && !won2048) return;
            
            switch (e.key) {
                case 'ArrowUp':
                    e.preventDefault();
                    handleInput('up');
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    handleInput('right');
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    handleInput('down');
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    handleInput('left');
                    break;
            }
        });
        
        // Touch event handling for mobile
        let touchStartX, touchStartY, touchEndX, touchEndY;
        
        gameBoard.addEventListener('touchstart', e => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }, false);
        
        gameBoard.addEventListener('touchend', e => {
            if (!gameActive && !won2048) return;
            
            touchEndX = e.changedTouches[0].clientX;
            touchEndY = e.changedTouches[0].clientY;
            
            handleSwipe();
        }, false);
        
        function handleSwipe() {
            const dx = touchEndX - touchStartX;
            const dy = touchEndY - touchStartY;
            
            // Determine if the swipe was horizontal or vertical
            if (Math.abs(dx) > Math.abs(dy)) {
                // Horizontal swipe
                if (dx > 0) {
                    handleInput('right');
                } else {
                    handleInput('left');
                }
            } else {
                // Vertical swipe
                if (dy > 0) {
                    handleInput('down');
                } else {
                    handleInput('up');
                }
            }
        }
        
        // Button event listeners
        newGameBtn.addEventListener('click', () => {
            initGame();
            hideModals();
        });
        
        playAgainBtn.addEventListener('click', () => {
            initGame();
            hideModals();
        });
        
        keepGoingBtn.addEventListener('click', () => {
            hideModals();
            gameActive = true;
        });
        
        restartBtn.addEventListener('click', () => {
            initGame();
            hideModals();
        });
        
        // Add keyboard shortcut for new game
        document.addEventListener('keydown', e => {
            if (e.key.toLowerCase() === 'n') {
                initGame();
                hideModals();
            }
        });
    }
    
    // Check if game settings exist for key bindings
    function setupGameSettings() {
        if (window.gameSettings) {
            // Setup key bindings
            document.removeEventListener('keydown', defaultKeyHandler);
            document.addEventListener('keydown', e => {
                const key = e.key;
                const settings = window.gameSettings.keyBindings['2048'];
                
                if (key === settings.moveUp) {
                    e.preventDefault();
                    handleInput('up');
                } else if (key === settings.moveRight) {
                    e.preventDefault();
                    handleInput('right');
                } else if (key === settings.moveDown) {
                    e.preventDefault();
                    handleInput('down');
                } else if (key === settings.moveLeft) {
                    e.preventDefault();
                    handleInput('left');
                } else if (key === settings.newGame) {
                    initGame();
                    hideModals();
                }
            });
        }
    }
    
    // Add CSS for the tile positioning
    function setupGridStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .tile {
                position: absolute;
                transition: transform 0.15s ease-in-out;
                z-index: 1;
                transform: translate(
                    calc(var(--col) * (var(--cell-size) + var(--cell-gap))),
                    calc(var(--row) * (var(--cell-size) + var(--cell-gap)))
                );
            }
        `;
        document.head.appendChild(style);
    }
    
    // Initialize the game
    setupGridStyles();
    setupEventListeners();
    setupGameSettings();
    initGame();
}); 