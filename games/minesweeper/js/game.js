/**
 * Main game controller for Minesweeper
 * Coordinates game logic and UI
 */
document.addEventListener('DOMContentLoaded', () => {
    class MinesweeperGame {
        /**
         * Initialize the game
         */
        constructor() {
            this.ui = new UIManager();
            this.state = GAME_STATE.notStarted;
            this.board = null;
            
            // Initialize with default difficulty
            const defaultDifficulty = DIFFICULTY.beginner;
            this.initializeBoard(defaultDifficulty.rows, defaultDifficulty.cols, defaultDifficulty.mines);
            
            // Attach event handlers
            this.ui.attachEventHandlers(
                this.startNewGame.bind(this),
                this.handleCellClick.bind(this),
                this.handleCellRightClick.bind(this)
            );
        }
        
        /**
         * Initialize the game board
         * @param {number} rows - Number of rows
         * @param {number} cols - Number of columns
         * @param {number} mines - Number of mines
         */
        initializeBoard(rows, cols, mines) {
            this.board = new Board(rows, cols, mines);
            this.ui.updateMinesLeft(mines);
            this.state = GAME_STATE.notStarted;
        }
        
        /**
         * Start a new game
         */
        startNewGame() {
            const difficulty = this.ui.getSelectedDifficulty();
            
            if (this.board) {
                this.board.reset();
                if (this.board.rows !== difficulty.rows || 
                    this.board.cols !== difficulty.cols || 
                    this.board.totalMines !== difficulty.mines) {
                    this.initializeBoard(difficulty.rows, difficulty.cols, difficulty.mines);
                }
            } else {
                this.initializeBoard(difficulty.rows, difficulty.cols, difficulty.mines);
            }
            
            this.ui.resetTimer();
            this.ui.updateMinesLeft(difficulty.mines);
            this.state = GAME_STATE.notStarted;
        }
        
        /**
         * Handle cell left-click
         * @param {number} row - Row of clicked cell
         * @param {number} col - Column of clicked cell
         */
        handleCellClick(row, col) {
            // Ignore clicks if game is over
            if (this.state === GAME_STATE.won || this.state === GAME_STATE.lost) {
                return;
            }
            
            // Start timer on first click
            if (this.state === GAME_STATE.notStarted) {
                this.state = GAME_STATE.playing;
                this.ui.startTimer();
            }
            
            // Handle the click on the board
            const hitMine = this.board.handleCellClick(row, col);
            
            if (hitMine) {
                // Game over - player lost
                this.state = GAME_STATE.lost;
                this.ui.showGameOver(false);
            } else if (this.board.checkWin()) {
                // Game over - player won
                this.state = GAME_STATE.won;
                this.ui.showGameOver(true);
            }
        }
        
        /**
         * Handle cell right-click (flag)
         * @param {number} row - Row of clicked cell
         * @param {number} col - Column of clicked cell
         */
        handleCellRightClick(row, col) {
            // Ignore clicks if game is over
            if (this.state === GAME_STATE.won || this.state === GAME_STATE.lost) {
                return;
            }
            
            // Start timer on first interaction
            if (this.state === GAME_STATE.notStarted) {
                this.state = GAME_STATE.playing;
                this.ui.startTimer();
            }
            
            // Toggle flag and update UI
            const flaggedCount = this.board.toggleFlag(row, col);
            const minesLeft = this.board.totalMines - flaggedCount;
            this.ui.updateMinesLeft(minesLeft);
        }
    }
    
    // Initialize the game
    const game = new MinesweeperGame();
}); 