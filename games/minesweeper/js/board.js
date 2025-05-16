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
        
        // Get available container width
        const containerWidth = window.innerWidth > 992 ? 800 : window.innerWidth - 40;
        const containerHeight = window.innerHeight - 200; // Leave space for header and other elements
        
        // Calculate cell size based on difficulty level and container size
        let cellSize;
        let boardPadding;
        
        // Base minimum sizes for different difficulties
        let minCellSize;
        if (this.cols <= 9) { // Beginner
            minCellSize = 36; // Minimum cell size for beginner
            boardPadding = 12;
        } else if (this.cols <= 16) { // Intermediate
            minCellSize = 32; // Minimum cell size for intermediate
            boardPadding = 12;
        } else { // Expert
            minCellSize = 26; // Minimum cell size for expert
            boardPadding = 15;
        }
        
        // Calculate cell size that would fit the available space
        const cellGap = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--cell-gap').trim() || '1px');
        
        // Calculate cell size based on available container width and height
        const widthBasedCellSize = Math.floor((containerWidth - (boardPadding * 2)) / this.cols);
        const heightBasedCellSize = Math.floor((containerHeight - (boardPadding * 2)) / this.rows);
        
        // Calculate cell size that would fit container while respecting minimum size
        cellSize = Math.max(Math.min(widthBasedCellSize, heightBasedCellSize), minCellSize);
        
        // Set up the grid layout
        this.boardElement.style.gridTemplateColumns = `repeat(${this.cols}, ${cellSize}px)`;
        this.boardElement.style.gridTemplateRows = `repeat(${this.rows}, ${cellSize}px)`;
        this.boardElement.style.gap = `${cellGap}px`;
        
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
                cellElement.style.fontSize = `${cellSize * 0.45}px`;
                this.boardElement.appendChild(cellElement);
            }
        }
        
        // Calculate exact board dimensions based on cell content
        const totalCellWidth = this.cols * cellSize;
        const totalCellHeight = this.rows * cellSize;
        const totalGapWidth = (this.cols - 1) * cellGap;
        const totalGapHeight = (this.rows - 1) * cellGap;
        
        // Calculate total board size including padding
        const totalWidth = totalCellWidth + totalGapWidth + (boardPadding * 2);
        const totalHeight = totalCellHeight + totalGapHeight + (boardPadding * 2);
        
        // Let the grid expand naturally to fit all cells
        this.boardElement.style.padding = `${boardPadding}px`;
        this.boardElement.style.boxSizing = 'border-box';
        
        // Force redraw to make sure all cells are positioned correctly
        this.boardElement.style.display = 'grid';
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