// Pong Game
document.addEventListener('DOMContentLoaded', () => {
    // Get the canvas and context
    const canvas = document.getElementById('pong-board');
    const ctx = canvas.getContext('2d');
    
    // Get DOM elements
    const playerScoreDisplay = document.getElementById('player-score');
    const cpuScoreDisplay = document.getElementById('cpu-score');
    const startButton = document.getElementById('start-button');
    const gameOverModal = document.getElementById('game-over');
    const winnerText = document.getElementById('winner-text');
    const finalPlayerScore = document.getElementById('final-player-score');
    const finalCpuScore = document.getElementById('final-cpu-score');
    const playAgainButton = document.getElementById('play-again');
    const pauseScreen = document.getElementById('pause-screen');
    const resumeButton = document.getElementById('resume');
    
    // Key states for input handling
    const keys = {
        ArrowUp: false,
        ArrowDown: false,
        p: false
    };
    
    // Game settings (can be adjusted from settings menu)
    let gameSettings = {
        moveUp: 'ArrowUp',
        moveDown: 'ArrowDown',
        pause: 'p'
    };
    
    // Try to load key bindings from localStorage
    try {
        const settings = JSON.parse(localStorage.getItem('gameSettings'));
        if (settings && settings.pong) {
            Object.assign(gameSettings, settings.pong);
        }
    } catch (e) {
        console.error('Failed to load settings', e);
    }
    
    // Game state
    let gameRunning = false;
    let gamePaused = false;
    let playerScore = 0;
    let cpuScore = 0;
    let animationFrameId;
    
    // Game constants
    const PADDLE_WIDTH = 10;
    const PADDLE_HEIGHT = 80;
    const PADDLE_SPEED = 8;
    const BALL_RADIUS = 8;
    const MAX_SCORE = 10;
    
    // Game objects
    const ball = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        dx: 5,
        dy: 5,
        speed: 5,
        radius: BALL_RADIUS,
        color: '#FFFFFF'
    };
    
    const player = {
        x: 50,
        y: canvas.height / 2 - PADDLE_HEIGHT / 2,
        width: PADDLE_WIDTH,
        height: PADDLE_HEIGHT,
        speed: PADDLE_SPEED,
        color: '#3498db',
        score: 0
    };
    
    const cpu = {
        x: canvas.width - 50 - PADDLE_WIDTH,
        y: canvas.height / 2 - PADDLE_HEIGHT / 2,
        width: PADDLE_WIDTH,
        height: PADDLE_HEIGHT,
        speed: PADDLE_SPEED * 0.7, // CPU is slightly slower for fairness
        color: '#e74c3c',
        score: 0
    };
    
    // Initialize the game
    function init() {
        ball.x = canvas.width / 2;
        ball.y = canvas.height / 2;
        ball.speed = 5;
        
        // Randomize initial direction
        ball.dx = Math.random() > 0.5 ? ball.speed : -ball.speed;
        ball.dy = Math.random() > 0.5 ? ball.speed : -ball.speed;
        
        playerScore = 0;
        cpuScore = 0;
        playerScoreDisplay.textContent = playerScore;
        cpuScoreDisplay.textContent = cpuScore;
        
        player.y = canvas.height / 2 - PADDLE_HEIGHT / 2;
        cpu.y = canvas.height / 2 - PADDLE_HEIGHT / 2;
    }
    
    // Update game objects
    function update() {
        // Move player paddle based on key input
        if (keys[gameSettings.moveUp] && player.y > 0) {
            player.y -= player.speed;
        }
        if (keys[gameSettings.moveDown] && player.y + player.height < canvas.height) {
            player.y += player.speed;
        }
        
        // Simple AI for CPU paddle
        const cpuCenterY = cpu.y + cpu.height / 2;
        const ballCenterY = ball.y;
        
        if (ball.dx > 0) { // Only move when ball is coming towards CPU
            if (cpuCenterY < ballCenterY - 10) {
                cpu.y += cpu.speed;
            } else if (cpuCenterY > ballCenterY + 10) {
                cpu.y -= cpu.speed;
            }
        }
        
        // Keep CPU paddle within bounds
        if (cpu.y < 0) cpu.y = 0;
        if (cpu.y + cpu.height > canvas.height) cpu.y = canvas.height - cpu.height;
        
        // Update ball position
        ball.x += ball.dx;
        ball.y += ball.dy;
        
        // Collision with top and bottom walls
        if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
            ball.dy = -ball.dy;
        }
        
        // Collision with paddles
        if (
            ball.x - ball.radius < player.x + player.width &&
            ball.y > player.y && 
            ball.y < player.y + player.height &&
            ball.dx < 0
        ) {
            ball.dx = -ball.dx;
            
            // Adjust ball angle based on where it hits the paddle
            const impact = (ball.y - (player.y + player.height / 2)) / (player.height / 2);
            ball.dy = impact * ball.speed;
            
            // Increase ball speed slightly
            ball.speed += 0.2;
        }
        
        if (
            ball.x + ball.radius > cpu.x &&
            ball.y > cpu.y && 
            ball.y < cpu.y + cpu.height &&
            ball.dx > 0
        ) {
            ball.dx = -ball.dx;
            
            // Adjust ball angle based on where it hits the paddle
            const impact = (ball.y - (cpu.y + cpu.height / 2)) / (cpu.height / 2);
            ball.dy = impact * ball.speed;
            
            // Increase ball speed slightly
            ball.speed += 0.2;
        }
        
        // Ball goes out of bounds - score
        if (ball.x < 0) {
            cpuScore++;
            cpuScoreDisplay.textContent = cpuScore;
            resetBall();
            checkGameOver();
        }
        
        if (ball.x > canvas.width) {
            playerScore++;
            playerScoreDisplay.textContent = playerScore;
            resetBall();
            checkGameOver();
        }
    }
    
    // Reset the ball after scoring
    function resetBall() {
        ball.x = canvas.width / 2;
        ball.y = canvas.height / 2;
        ball.speed = 5;
        ball.dx = Math.random() > 0.5 ? ball.speed : -ball.speed;
        ball.dy = Math.random() * 4 - 2; // Random vertical direction
    }
    
    // Check if the game is over
    function checkGameOver() {
        if (playerScore >= MAX_SCORE || cpuScore >= MAX_SCORE) {
            gameRunning = false;
            
            if (playerScore >= MAX_SCORE) {
                winnerText.textContent = "You Win!";
            } else {
                winnerText.textContent = "CPU Wins!";
            }
            
            finalPlayerScore.textContent = playerScore;
            finalCpuScore.textContent = cpuScore;
            gameOverModal.style.display = "flex";
        }
    }
    
    // Render the game
    function render() {
        // Clear the canvas
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw the center line
        ctx.beginPath();
        ctx.setLineDash([10, 15]);
        ctx.moveTo(canvas.width / 2, 0);
        ctx.lineTo(canvas.width / 2, canvas.height);
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Draw the ball
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fillStyle = ball.color;
        ctx.fill();
        ctx.closePath();
        
        // Draw player paddle
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x, player.y, player.width, player.height);
        
        // Draw CPU paddle
        ctx.fillStyle = cpu.color;
        ctx.fillRect(cpu.x, cpu.y, cpu.width, cpu.height);
    }
    
    // Game loop
    function gameLoop() {
        if (gameRunning && !gamePaused) {
            update();
            render();
        }
        
        animationFrameId = requestAnimationFrame(gameLoop);
    }
    
    // Start the game
    function startGame() {
        if (!gameRunning) {
            init();
            gameRunning = true;
            gamePaused = false;
            startButton.disabled = true;
            gameLoop();
        }
    }
    
    // Pause the game
    function togglePause() {
        if (gameRunning) {
            gamePaused = !gamePaused;
            if (gamePaused) {
                pauseScreen.style.display = "flex";
            } else {
                pauseScreen.style.display = "none";
            }
        }
    }
    
    // Event listeners
    startButton.addEventListener('click', startGame);
    
    playAgainButton.addEventListener('click', () => {
        gameOverModal.style.display = "none";
        startButton.disabled = false;
        init();
    });
    
    resumeButton.addEventListener('click', () => {
        togglePause();
    });
    
    document.addEventListener('keydown', (e) => {
        keys[e.key] = true;
        
        // Check if the key pressed is the pause key
        if (e.key === gameSettings.pause && gameRunning) {
            togglePause();
        }
    });
    
    document.addEventListener('keyup', (e) => {
        keys[e.key] = false;
    });
    
    // Handle custom key bindings from game-settings.js
    if (window.addEventListener) {
        window.addEventListener('message', function(event) {
            if (event.data && event.data.type === 'gameSettingsUpdate') {
                if (event.data.settings && event.data.settings.pong) {
                    gameSettings = { ...gameSettings, ...event.data.settings.pong };
                }
            }
        });
    }
    
    // Call init once to set up the game
    init();
    render();
}); 