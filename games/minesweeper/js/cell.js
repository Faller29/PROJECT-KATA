/**
 * Cell class for Minesweeper
 * Represents a single cell in the game board
 */
class Cell {
    /**
     * Create a cell
     * @param {number} row - Row position
     * @param {number} col - Column position
     */
    constructor(row, col) {
        this.row = row;
        this.col = col;
        this.state = CELL_STATE.hidden;
        this.isMine = false;
        this.adjacentMines = 0;
        this.element = null;
    }

    /**
     * Create DOM element for this cell
     * @returns {HTMLElement} The created cell element
     */
    createElement() {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.row = this.row;
        cell.dataset.col = this.col;
        
        // Get current cell size from CSS variables or use default
        const cellSize = getComputedStyle(document.documentElement).getPropertyValue('--cell-size').trim() || '32px';
        
        // Set explicit size, which helps with various browsers and responsive displays
        cell.style.width = cellSize;
        cell.style.height = cellSize;
        
        this.element = cell;
        return cell;
    }

    /**
     * Reveal this cell
     * @returns {boolean} True if the cell contained a mine
     */
    reveal() {
        if (this.state === CELL_STATE.hidden) {
            this.state = CELL_STATE.revealed;
            this.element.classList.add('revealed');
            
            if (this.isMine) {
                this.element.classList.add('mine');
                return true;
            } else if (this.adjacentMines > 0) {
                this.element.textContent = this.adjacentMines;
                this.element.dataset.adjacent = this.adjacentMines;
            }
        }
        return false;
    }

    /**
     * Toggle flag on this cell
     * @returns {boolean} New flag state (true if flagged)
     */
    toggleFlag() {
        if (this.state === CELL_STATE.hidden) {
            this.state = CELL_STATE.flagged;
            this.element.classList.add('flagged');
            return true;
        } else if (this.state === CELL_STATE.flagged) {
            this.state = CELL_STATE.hidden;
            this.element.classList.remove('flagged');
            return false;
        }
        return this.state === CELL_STATE.flagged;
    }

    /**
     * Reset the cell to its initial state
     */
    reset() {
        this.state = CELL_STATE.hidden;
        this.isMine = false;
        this.adjacentMines = 0;
        
        if (this.element) {
            this.element.className = 'cell';
            this.element.textContent = '';
            delete this.element.dataset.adjacent;
        }
    }
} 