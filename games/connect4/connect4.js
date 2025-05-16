/**
 * Connect Four Game
 * Project Kata
 */
document.addEventListener('DOMContentLoaded', () => {
    // Game configuration
    const ROWS = 6;
    const COLS = 7;
    const CONNECT = 4; // Number of pieces needed to connect
    
    // DOM elements
    const board = document.getElementById('board');
    const currentPlayerEl = document.getElementById('current-player');
    const newGameBtn = document.getElementById('new-game-btn');
    const playAgainBtn = document.getElementById('play-again-btn');
    const gameOverModal = document.getElementById('game-over');
    const resultMessage = document.getElementById('result-message');
    const winnerMessage = document.getElementById('winner-message');
    
    // Game state
    let gameActive = false;
    let currentPlayer = 1;
    let gameBoard = [];
    let movesCount = 0;
    
    /**
     * Initialize the game
     */
    function initGame() {
        gameActive = true;
        currentPlayer = 1;
        movesCount = 0;
        gameBoard = Array(ROWS).fill().map(() => Array(COLS).fill(0));
        updateCurrentPlayer();
        renderBoard();
    }
    
    /**
     * Render the game board
     */
    function renderBoard() {
        // Clear the board
        board.innerHTML = '';
        
        // Create cells for each position
        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                // Add player classes
                if (gameBoard[row][col] === 1) {
                    cell.classList.add('player1');
                } else if (gameBoard[row][col] === 2) {
                    cell.classList.add('player2');
                }
                
                cell.addEventListener('click', () => makeMove(col));
                board.appendChild(cell);
            }
        }
    }
    
    /**
     * Update the current player display
     */
    function updateCurrentPlayer() {
        currentPlayerEl.textContent = `Player ${currentPlayer}`;
        currentPlayerEl.style.color = currentPlayer === 1 ? 'var(--player1-color)' : 'var(--player2-color)';
    }
    
    /**
     * Make a move in the specified column
     * @param {number} col - Column to drop the piece
     */
    function makeMove(col) {
        if (!gameActive) return;
        
        // Find the first empty cell from bottom to top
        let row = -1;
        for (let r = ROWS - 1; r >= 0; r--) {
            if (gameBoard[r][col] === 0) {
                row = r;
                break;
            }
        }
        
        // If column is full, do nothing
        if (row === -1) return;
        
        // Update the game board
        gameBoard[row][col] = currentPlayer;
        movesCount++;
        
        // Render the board
        renderBoard();
        
        // Animate the dropped piece
        const cell = board.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        cell.classList.add('animate-drop');
        
        // Check for win
        if (checkWin(row, col)) {
            gameActive = false;
            showGameOver(`Player ${currentPlayer} Wins!`, true);
            return;
        }
        
        // Check for draw
        if (movesCount === ROWS * COLS) {
            gameActive = false;
            showGameOver('Game Ended in a Draw!', false);
            return;
        }
        
        // Switch player
        currentPlayer = currentPlayer === 1 ? 2 : 1;
        updateCurrentPlayer();
    }
    
    /**
     * Check if the current move results in a win
     * @param {number} row - Row of last move
     * @param {number} col - Column of last move
     * @returns {boolean} Whether the move resulted in a win
     */
    function checkWin(row, col) {
        const player = gameBoard[row][col];
        
        // Check horizontal
        if (checkDirection(row, col, 0, 1, player)) return true;
        
        // Check vertical
        if (checkDirection(row, col, 1, 0, player)) return true;
        
        // Check diagonal (↗)
        if (checkDirection(row, col, -1, 1, player)) return true;
        
        // Check diagonal (↘)
        if (checkDirection(row, col, 1, 1, player)) return true;
        
        return false;
    }
    
    /**
     * Check a direction for a win
     * @param {number} row - Starting row
     * @param {number} col - Starting column
     * @param {number} dRow - Row direction
     * @param {number} dCol - Column direction
     * @param {number} player - Player to check for
     * @returns {boolean} Whether there are enough pieces in a row in this direction
     */
    function checkDirection(row, col, dRow, dCol, player) {
        let count = 1; // Start with 1 for the current piece
        
        // Check in the positive direction
        let r = row + dRow;
        let c = col + dCol;
        
        while (r >= 0 && r < ROWS && c >= 0 && c < COLS && gameBoard[r][c] === player) {
            count++;
            r += dRow;
            c += dCol;
        }
        
        // Check in the negative direction
        r = row - dRow;
        c = col - dCol;
        
        while (r >= 0 && r < ROWS && c >= 0 && c < COLS && gameBoard[r][c] === player) {
            count++;
            r -= dRow;
            c -= dCol;
        }
        
        return count >= CONNECT;
    }
    
    /**
     * Show the game over modal
     * @param {string} message - Message to display
     * @param {boolean} isWin - Whether the game ended in a win
     */
    function showGameOver(message, isWin) {
        setTimeout(() => {
            resultMessage.textContent = isWin ? 'Victory!' : 'Game Over!';
            winnerMessage.textContent = message;
            
            if (isWin) {
                resultMessage.style.color = currentPlayer === 1 ? 'var(--player1-color)' : 'var(--player2-color)';
            } else {
                resultMessage.style.color = 'white';
            }
            
            gameOverModal.style.display = 'flex';
        }, 500); // Delay to allow animation to complete
    }
    
    /**
     * Hide the game over modal
     */
    function hideGameOver() {
        gameOverModal.style.display = 'none';
    }
    
    // Event listeners
    newGameBtn.addEventListener('click', () => {
        initGame();
        hideGameOver();
    });
    
    playAgainBtn.addEventListener('click', () => {
        initGame();
        hideGameOver();
    });
    
    // Initialize game
    initGame();
}); 