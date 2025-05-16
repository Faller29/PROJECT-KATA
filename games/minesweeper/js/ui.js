/**
 * UI Manager for Minesweeper
 * Handles UI updates and interactions
 */
class UIManager {
    /**
     * Initialize UI manager
     */
    constructor() {
        // Get DOM elements
        this.minesLeftElement = document.getElementById('mines-left');
        this.timerElement = document.getElementById('timer');
        this.difficultySelect = document.getElementById('difficulty');
        this.newGameBtn = document.getElementById('new-game-btn');
        this.gameOverModal = document.getElementById('game-over');
        this.resultMessageElement = document.getElementById('result-message');
        this.finalTimeElement = document.getElementById('final-time');
        this.playAgainBtn = document.getElementById('play-again-btn');
        
        // Timer variables
        this.timerInterval = null;
        this.startTime = 0;
        this.elapsedTime = 0;
    }

    /**
     * Update the mines left counter
     * @param {number} count - Number of mines left
     */
    updateMinesLeft(count) {
        this.minesLeftElement.textContent = count;
    }

    /**
     * Start the game timer
     */
    startTimer() {
        this.stopTimer();
        this.startTime = Date.now();
        this.timerElement.textContent = '0';
        
        this.timerInterval = setInterval(() => {
            this.elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
            this.timerElement.textContent = this.elapsedTime;
        }, 1000);
    }

    /**
     * Stop the game timer
     */
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    /**
     * Reset the timer to 0
     */
    resetTimer() {
        this.stopTimer();
        this.elapsedTime = 0;
        this.timerElement.textContent = '0';
    }

    /**
     * Show the game over modal with appropriate message
     * @param {boolean} isWin - Whether the player won
     */
    showGameOver(isWin) {
        this.stopTimer();
        
        if (isWin) {
            this.resultMessageElement.textContent = 'You Win!';
            this.resultMessageElement.style.color = '#2ecc71';
        } else {
            this.resultMessageElement.textContent = 'Game Over!';
            this.resultMessageElement.style.color = '#e74c3c';
        }
        
        this.finalTimeElement.textContent = this.elapsedTime;
        this.gameOverModal.style.display = 'flex';
    }

    /**
     * Hide the game over modal
     */
    hideGameOver() {
        this.gameOverModal.style.display = 'none';
    }

    /**
     * Get the current selected difficulty
     * @returns {Object} Difficulty settings
     */
    getSelectedDifficulty() {
        const selectedValue = this.difficultySelect.value;
        return DIFFICULTY[selectedValue];
    }

    /**
     * Attach event handlers for UI elements
     * @param {Function} newGameCallback - Callback for new game button
     * @param {Function} cellClickCallback - Callback for cell click
     * @param {Function} cellRightClickCallback - Callback for cell right click
     */
    attachEventHandlers(newGameCallback, cellClickCallback, cellRightClickCallback) {
        // New game button
        this.newGameBtn.addEventListener('click', () => {
            newGameCallback();
        });
        
        // Play again button
        this.playAgainBtn.addEventListener('click', () => {
            this.hideGameOver();
            newGameCallback();
        });
        
        // Game board cell click events
        const gameBoard = document.getElementById('game-board');
        
        gameBoard.addEventListener('click', (event) => {
            if (event.target.classList.contains('cell')) {
                const row = parseInt(event.target.dataset.row);
                const col = parseInt(event.target.dataset.col);
                cellClickCallback(row, col);
            }
        });
        
        gameBoard.addEventListener('contextmenu', (event) => {
            event.preventDefault();
            
            if (event.target.classList.contains('cell')) {
                const row = parseInt(event.target.dataset.row);
                const col = parseInt(event.target.dataset.col);
                cellRightClickCallback(row, col);
            }
        });
    }
} 