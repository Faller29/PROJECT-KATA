/**
 * Board class for Minesweeper
 * Manages the entire game grid
 */
class Board {
    /**
     * Create a game board
     * @param {number} rows - Number of rows
     * @param {number} cols - Number of columns
     * @param {number} mines - Number of mines
     */
    constructor(rows, cols, mines) {
        this.rows = rows;
        this.cols = cols;
        this.totalMines = mines;
        this.flaggedCount = 0;
        this.revealedCount = 0;
        this.firstClick = true;
        this.cells = [];
        this.boardElement = document.getElementById('game-board');
        
        this.initializeBoard();
    }

    /**
     * Initialize the board with cells
     */
    initializeBoard() {
        // Clear any existing board
        this.boardElement.innerHTML = '';
        
        // Calculate cell size based on difficulty level
        let cellSize;
        let boardPadding;
        
        if (this.cols <= 9) { // Beginner
            cellSize = 32; // Larger cells for beginner level
            boardPadding = 10;
        } else if (this.cols <= 16) { // Intermediate
            cellSize = 26; // Medium cells for intermediate
            boardPadding = 12;
        } else { // Expert
            cellSize = 20; // Smaller cells for expert level
            boardPadding = 15;
        }
        
        // Set up the grid columns and appropriate size
        this.boardElement.style.gridTemplateColumns = `repeat(${this.cols}, ${cellSize}px)`;
        
        // Update cell size in CSS variables for the game board
        document.documentElement.style.setProperty('--cell-size', `${cellSize}px`);
        
        // Reset game state
        this.cells = [];
        this.flaggedCount = 0;
        this.revealedCount = 0;
        this.firstClick = true;

        // Create cell grid
        for (let row = 0; row < this.rows; row++) {
            this.cells[row] = [];
            for (let col = 0; col < this.cols; col++) {
                const cell = new Cell(row, col);
                this.cells[row][col] = cell;
                
                const cellElement = cell.createElement();
                cellElement.style.width = `${cellSize}px`;
                cellElement.style.height = `${cellSize}px`;
                cellElement.style.fontSize = `${cellSize * 0.5}px`;
                this.boardElement.appendChild(cellElement);
            }
        }
        
        // Adjust board container width to fit cells exactly with additional padding
        const cellGap = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--cell-gap').trim() || '2px');
        // Calculate exact width needed plus extra padding
        const boardWidth = (this.cols * cellSize) + ((this.cols - 1) * cellGap) + (boardPadding * 2);
        this.boardElement.style.width = `${boardWidth}px`;
        this.boardElement.style.maxWidth = '100%';
        this.boardElement.style.padding = `${boardPadding}px`;
    }

    /**
     * Place mines on the board, avoiding the first clicked cell
     * @param {number} safeRow - Row of the first click
     * @param {number} safeCol - Column of the first click
     */
    placeMines(safeRow, safeCol) {
        let minesPlaced = 0;
        
        // Create a list of safe cells around the first click
        const safeCells = [];
        for (let r = Math.max(0, safeRow - 1); r <= Math.min(this.rows - 1, safeRow + 1); r++) {
            for (let c = Math.max(0, safeCol - 1); c <= Math.min(this.cols - 1, safeCol + 1); c++) {
                safeCells.push({row: r, col: c});
            }
        }
        
        // Place mines randomly, avoiding safe cells
        while (minesPlaced < this.totalMines) {
            const row = Math.floor(Math.random() * this.rows);
            const col = Math.floor(Math.random() * this.cols);
            
            // Skip if this is a safe cell or already has a mine
            const isSafe = safeCells.some(cell => cell.row === row && cell.col === col);
            if (isSafe || this.cells[row][col].isMine) {
                continue;
            }
            
            this.cells[row][col].isMine = true;
            minesPlaced++;
        }
        
        // Calculate adjacent mines for each cell
        this.calculateAdjacentMines();
    }

    /**
     * Calculate the number of adjacent mines for each cell
     */
    calculateAdjacentMines() {
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];
        
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.cells[row][col].isMine) continue;
                
                let count = 0;
                for (const [dr, dc] of directions) {
                    const r = row + dr;
                    const c = col + dc;
                    
                    if (r >= 0 && r < this.rows && c >= 0 && c < this.cols && this.cells[r][c].isMine) {
                        count++;
                    }
                }
                
                this.cells[row][col].adjacentMines = count;
            }
        }
    }

    /**
     * Handle cell click
     * @param {number} row - Row of clicked cell
     * @param {number} col - Column of clicked cell
     * @returns {boolean} True if the click revealed a mine
     */
    handleCellClick(row, col) {
        const cell = this.cells[row][col];
        
        // Ignore clicks on flagged or revealed cells
        if (cell.state !== CELL_STATE.hidden) {
            return false;
        }
        
        // If this is the first click, place mines
        if (this.firstClick) {
            this.placeMines(row, col);
            this.firstClick = false;
        }
        
        // Reveal the cell and check if it's a mine
        const isMine = cell.reveal();
        if (isMine) {
            this.revealAllMines();
            return true;
        }
        
        this.revealedCount++;
        
        // If cell has no adjacent mines, reveal neighboring cells recursively
        if (cell.adjacentMines === 0) {
            this.revealAdjacentCells(row, col);
        }
        
        return false;
    }

    /**
     * Recursively reveal adjacent cells for empty cells
     * @param {number} row - Row of cell
     * @param {number} col - Column of cell
     */
    revealAdjacentCells(row, col) {
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];
        
        for (const [dr, dc] of directions) {
            const r = row + dr;
            const c = col + dc;
            
            if (r >= 0 && r < this.rows && c >= 0 && c < this.cols) {
                const cell = this.cells[r][c];
                if (cell.state === CELL_STATE.hidden) {
                    cell.reveal();
                    this.revealedCount++;
                    
                    if (cell.adjacentMines === 0) {
                        this.revealAdjacentCells(r, c);
                    }
                }
            }
        }
    }

    /**
     * Handle right-click to toggle flag
     * @param {number} row - Row of cell
     * @param {number} col - Column of cell
     * @returns {number} The number of flags placed
     */
    toggleFlag(row, col) {
        const cell = this.cells[row][col];
        
        if (cell.state === CELL_STATE.revealed) {
            return this.flaggedCount;
        }
        
        const isFlagged = cell.toggleFlag();
        if (isFlagged) {
            this.flaggedCount++;
        } else {
            this.flaggedCount--;
        }
        
        return this.flaggedCount;
    }

    /**
     * Reveal all mines when game is over
     */
    revealAllMines() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const cell = this.cells[row][col];
                if (cell.isMine && cell.state !== CELL_STATE.flagged) {
                    cell.reveal();
                }
            }
        }
    }

    /**
     * Check if the game is won
     * @returns {boolean} True if all non-mine cells are revealed
     */
    checkWin() {
        return this.revealedCount === (this.rows * this.cols - this.totalMines);
    }

    /**
     * Reset the board for a new game
     */
    reset() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                this.cells[row][col].reset();
            }
        }
        
        this.flaggedCount = 0;
        this.revealedCount = 0;
        this.firstClick = true;
    }
} 