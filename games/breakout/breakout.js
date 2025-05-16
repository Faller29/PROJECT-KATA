// Breakout Game
document.addEventListener('DOMContentLoaded', () => {
    // Get the canvas and context
    const canvas = document.getElementById('breakout-board');
    const ctx = canvas.getContext('2d');

    // Get DOM elements
    const scoreDisplay = document.getElementById('score');
    const highScoreDisplay = document.getElementById('high-score');
    const livesDisplay = document.getElementById('lives');
    const levelDisplay = document.getElementById('level');
    const startButton = document.getElementById('start-button');
    const gameOverModal = document.getElementById('game-over');
    const finalScoreDisplay = document.getElementById('final-score');
    const playAgainButton = document.getElementById('play-again');
    const levelCompleteModal = document.getElementById('level-complete');
    const nextLevelButton = document.getElementById('next-level');
    const nextLevelNumDisplay = document.getElementById('next-level-num');
    const pauseScreen = document.getElementById('pause-screen');
    const resumeButton = document.getElementById('resume');

    // Key states for input handling
    const keys = {
        ArrowLeft: false,
        ArrowRight: false,
        ' ': false,
        p: false
    };

    // Game settings (can be adjusted from settings menu)
    let gameSettings = {
        moveLeft: 'ArrowLeft',
        moveRight: 'ArrowRight',
        launch: ' ', // Space
        pause: 'p'
    };

    // Try to load key bindings from localStorage
    try {
        const settings = JSON.parse(localStorage.getItem('projectKataPreferences'));
        if (settings && settings.keyBindings && settings.keyBindings.breakout) {
            Object.assign(gameSettings, settings.keyBindings.breakout);
        }
    } catch (e) {
        console.error('Failed to load settings', e);
    }

    // Game state
    let gameRunning = false;
    let gamePaused = false;
    let score = 0;
    let highScore = localStorage.getItem('breakoutHighScore') || 0;
    let lives = 3;
    let level = 1;
    let animationFrameId;
    let ballReleased = false;

    // Game constants
    const PADDLE_HEIGHT = 15;
    const PADDLE_WIDTH = 80;
    const PADDLE_SPEED = 8;
    const BALL_RADIUS = 8;
    const BRICK_ROW_COUNT = 5;
    const BRICK_COLUMN_COUNT = 8;
    const BRICK_WIDTH = 50;
    const BRICK_HEIGHT = 20;
    const BRICK_PADDING = 10;
    const BRICK_OFFSET_TOP = 60;
    const BRICK_OFFSET_LEFT = 35;

    // Game objects
    const ball = {
        x: canvas.width / 2,
        y: canvas.height - PADDLE_HEIGHT - BALL_RADIUS - 10,
        dx: 5,
        dy: -5,
        radius: BALL_RADIUS,
        speed: 5,
        color: '#FFFFFF'
    };

    const paddle = {
        x: canvas.width / 2 - PADDLE_WIDTH / 2,
        y: canvas.height - PADDLE_HEIGHT - 10,
        width: PADDLE_WIDTH,
        height: PADDLE_HEIGHT,
        speed: PADDLE_SPEED,
        color: '#3498db'
    };

    // Create bricks
    const bricks = [];
    function createBricks() {
        bricks.length = 0; // Clear existing bricks
        
        const colors = ['#e74c3c', '#f39c12', '#2ecc71', '#3498db', '#9b59b6'];
        
        for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
            bricks[c] = [];
            for (let r = 0; r < BRICK_ROW_COUNT; r++) {
                const brickX = c * (BRICK_WIDTH + BRICK_PADDING) + BRICK_OFFSET_LEFT;
                const brickY = r * (BRICK_HEIGHT + BRICK_PADDING) + BRICK_OFFSET_TOP;
                
                // Different levels have different brick hitpoints
                let hitPoints = 1;
                if (level >= 2 && r < 2) hitPoints = 2;
                if (level >= 3 && r < 1) hitPoints = 3;
                
                bricks[c][r] = {
                    x: brickX,
                    y: brickY,
                    status: 1, // 1 = active, 0 = destroyed
                    hitPoints: hitPoints,
                    color: colors[r]
                };
            }
        }
    }

    // Initialize the game
    function init() {
        score = 0;
        lives = 3;
        level = 1;
        highScore = localStorage.getItem('breakoutHighScore') || 0;
        
        // Update displays
        scoreDisplay.textContent = score;
        highScoreDisplay.textContent = highScore;
        livesDisplay.textContent = lives;
        levelDisplay.textContent = level;
        
        // Reset ball and paddle positions
        resetBallAndPaddle();
        
        // Create bricks for the first level
        createBricks();
        
        // Reset game state
        ballReleased = false;
        gameRunning = true;
        gamePaused = false;
    }

    // Reset ball and paddle for a new life
    function resetBallAndPaddle() {
        paddle.x = canvas.width / 2 - PADDLE_WIDTH / 2;
        ball.x = paddle.x + PADDLE_WIDTH / 2;
        ball.y = paddle.y - BALL_RADIUS;
        ball.dx = 5 * (Math.random() > 0.5 ? 1 : -1); // Random direction
        ball.dy = -5;
        ball.speed = 5;
        ballReleased = false;
    }

    // Update game objects
    function update() {
        // Move paddle based on keyboard input
        if (keys[gameSettings.moveLeft] && paddle.x > 0) {
            paddle.x -= paddle.speed;
        }
        if (keys[gameSettings.moveRight] && paddle.x + paddle.width < canvas.width) {
            paddle.x += paddle.speed;
        }

        // If ball is not released, make it stick to the paddle
        if (!ballReleased) {
            ball.x = paddle.x + PADDLE_WIDTH / 2;
            
            // Check for launch key
            if (keys[gameSettings.launch]) {
                ballReleased = true;
            }
            return;
        }

        // Move the ball
        ball.x += ball.dx;
        ball.y += ball.dy;

        // Wall collision (left/right)
        if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width) {
            ball.dx = -ball.dx;
        }

        // Wall collision (top)
        if (ball.y - ball.radius < 0) {
            ball.dy = -ball.dy;
        }

        // Floor collision (lose a life)
        if (ball.y + ball.radius > canvas.height) {
            lives--;
            livesDisplay.textContent = lives;
            
            if (lives > 0) {
                resetBallAndPaddle();
            } else {
                gameOver();
            }
        }

        // Paddle collision
        if (
            ball.y + ball.radius > paddle.y &&
            ball.y - ball.radius < paddle.y + paddle.height &&
            ball.x > paddle.x &&
            ball.x < paddle.x + paddle.width
        ) {
            // Calculate where the ball hit the paddle
            const hitPosition = (ball.x - (paddle.x + paddle.width / 2)) / (paddle.width / 2);
            
            // Change ball direction based on where it hit the paddle
            ball.dx = ball.speed * hitPosition;
            ball.dy = -ball.speed * (1 - Math.abs(hitPosition) * 0.5);
            
            // Increase speed slightly
            ball.speed += 0.1;
        }

        // Brick collision
        for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
            for (let r = 0; r < BRICK_ROW_COUNT; r++) {
                const brick = bricks[c][r];
                
                if (brick.status > 0) {
                    if (
                        ball.x + ball.radius > brick.x &&
                        ball.x - ball.radius < brick.x + BRICK_WIDTH &&
                        ball.y + ball.radius > brick.y &&
                        ball.y - ball.radius < brick.y + BRICK_HEIGHT
                    ) {
                        // Reduce brick hit points
                        brick.hitPoints--;
                        
                        // If brick is destroyed
                        if (brick.hitPoints <= 0) {
                            brick.status = 0;
                            score += (r + 1) * 10; // More points for higher bricks
                            scoreDisplay.textContent = score;
                            
                            // Update high score
                            if (score > highScore) {
                                highScore = score;
                                highScoreDisplay.textContent = highScore;
                                localStorage.setItem('breakoutHighScore', highScore);
                            }
                        }
                        
                        // Change ball direction based on which side of the brick was hit
                        const ballCenterX = ball.x;
                        const ballCenterY = ball.y;
                        const brickCenterX = brick.x + BRICK_WIDTH / 2;
                        const brickCenterY = brick.y + BRICK_HEIGHT / 2;
                        
                        // Calculate collision angle
                        const dx = ballCenterX - brickCenterX;
                        const dy = ballCenterY - brickCenterY;
                        const width = BRICK_WIDTH / 2 + ball.radius;
                        const height = BRICK_HEIGHT / 2 + ball.radius;
                        const crossWidth = width * dy;
                        const crossHeight = height * dx;
                        
                        if (Math.abs(dx) <= width && Math.abs(dy) <= height) {
                            if (crossWidth > crossHeight) {
                                ball.dy = Math.abs(ball.dy); // Hit from bottom
                            } else if (crossWidth <= crossHeight) {
                                ball.dy = -Math.abs(ball.dy); // Hit from top
                            }
                            
                            if (crossWidth > -crossHeight) {
                                ball.dx = Math.abs(ball.dx); // Hit from right
                            } else if (crossWidth <= -crossHeight) {
                                ball.dx = -Math.abs(ball.dx); // Hit from left
                            }
                        }
                    }
                }
            }
        }

        // Check if all bricks are destroyed
        let allBricksDestroyed = true;
        for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
            for (let r = 0; r < BRICK_ROW_COUNT; r++) {
                if (bricks[c][r].status > 0) {
                    allBricksDestroyed = false;
                    break;
                }
            }
            if (!allBricksDestroyed) break;
        }

        if (allBricksDestroyed) {
            levelComplete();
        }
    }

    // Game over
    function gameOver() {
        gameRunning = false;
        finalScoreDisplay.textContent = score;
        gameOverModal.style.display = "flex";
    }

    // Level complete
    function levelComplete() {
        level++;
        nextLevelNumDisplay.textContent = level;
        levelDisplay.textContent = level;
        levelCompleteModal.style.display = "flex";
        ballReleased = false;
        gameRunning = false;
    }

    // Start next level
    function startNextLevel() {
        levelCompleteModal.style.display = "none";
        resetBallAndPaddle();
        createBricks();
        gameRunning = true;
    }

    // Render the game
    function render() {
        // Clear the canvas
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw the ball
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fillStyle = ball.color;
        ctx.fill();
        ctx.closePath();
        
        // Draw the paddle
        ctx.fillStyle = paddle.color;
        ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
        
        // Draw the bricks
        for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
            for (let r = 0; r < BRICK_ROW_COUNT; r++) {
                const brick = bricks[c][r];
                
                if (brick.status > 0) {
                    ctx.fillStyle = brick.color;
                    ctx.fillRect(brick.x, brick.y, BRICK_WIDTH, BRICK_HEIGHT);
                    
                    // Draw a border for multi-hit bricks
                    if (brick.hitPoints > 1) {
                        ctx.strokeStyle = '#ffffff';
                        ctx.lineWidth = 2;
                        ctx.strokeRect(brick.x, brick.y, BRICK_WIDTH, BRICK_HEIGHT);
                        
                        // Add hit point indicator
                        ctx.fillStyle = '#ffffff';
                        ctx.font = '12px Arial';
                        ctx.textAlign = 'center';
                        ctx.fillText(brick.hitPoints, brick.x + BRICK_WIDTH / 2, brick.y + BRICK_HEIGHT / 2 + 4);
                    }
                }
            }
        }
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
    
    nextLevelButton.addEventListener('click', startNextLevel);
    
    resumeButton.addEventListener('click', togglePause);
    
    document.addEventListener('keydown', (e) => {
        if (e.key in keys) {
            keys[e.key] = true;
        }
        
        // Check if the key pressed is the pause key
        if (e.key === gameSettings.pause && gameRunning) {
            togglePause();
        }
    });
    
    document.addEventListener('keyup', (e) => {
        if (e.key in keys) {
            keys[e.key] = false;
        }
    });

    // Handle custom key bindings from game-settings.js
    if (window.addEventListener) {
        window.addEventListener('message', function(event) {
            if (event.data && event.data.type === 'gameSettingsUpdate') {
                if (event.data.settings && event.data.settings.breakout) {
                    gameSettings = { ...gameSettings, ...event.data.settings.breakout };
                }
            }
        });
    }

    // Initialize high score display
    highScoreDisplay.textContent = highScore;
    
    // Initial render to show the game before starting
    render();
}); 