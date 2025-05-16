// UI element references
export const UI = {
    canvas: null,
    ctx: null,
    scoreElement: null,
    highScoreElement: null,
    livesElement: null,
    finalScoreElement: null,
    startButton: null,
    playAgainButton: null,
    resumeButton: null,
    nextLevelButton: null,
    gameOverModal: null,
    levelCompleteModal: null,
    pauseScreen: null,
    
    init() {
        this.canvas = document.getElementById('pacman-board');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('score');
        this.highScoreElement = document.getElementById('high-score');
        this.livesElement = document.getElementById('lives');
        this.finalScoreElement = document.getElementById('final-score');
        this.startButton = document.getElementById('start-button');
        this.playAgainButton = document.getElementById('play-again');
        this.resumeButton = document.getElementById('resume');
        this.nextLevelButton = document.getElementById('next-level');
        this.gameOverModal = document.getElementById('game-over');
        this.levelCompleteModal = document.getElementById('level-complete');
        this.pauseScreen = document.getElementById('pause-screen');
    },
    
    updateScore(score) {
        this.scoreElement.textContent = score;
    },
    
    updateHighScore(highScore) {
        this.highScoreElement.textContent = highScore;
    },
    
    updateLives(lives) {
        this.livesElement.textContent = lives;
    },
    
    showGameOver(finalScore) {
        this.finalScoreElement.textContent = finalScore;
        this.gameOverModal.style.display = 'flex';
    },
    
    hideGameOver() {
        this.gameOverModal.style.display = 'none';
    },
    
    showLevelComplete() {
        this.levelCompleteModal.style.display = 'flex';
    },
    
    hideLevelComplete() {
        this.levelCompleteModal.style.display = 'none';
    },
    
    showPauseScreen() {
        this.pauseScreen.style.display = 'flex';
    },
    
    hidePauseScreen() {
        this.pauseScreen.style.display = 'none';
    }
};
