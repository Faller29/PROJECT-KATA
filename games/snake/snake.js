// Snake Game JavaScript

// Load key bindings and prevent scrolling
let keyBindings = {
    moveUp: 'ArrowUp',
    moveDown: 'ArrowDown',
    moveLeft: 'ArrowLeft',
    moveRight: 'ArrowRight',
    pause: 'p'
};

// Prevent scrolling with arrow keys
window.addEventListener('keydown', function(e) {
    // Prevent default behavior for arrow keys and space
    if([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
        e.preventDefault();
    }
});

// Load user key bindings if available
function loadKeyBindings() {
    if (localStorage.getItem('projectKataPreferences')) {
        const preferences = JSON.parse(localStorage.getItem('projectKataPreferences'));
        if (preferences.keyBindings && preferences.keyBindings.snake) {
            keyBindings = preferences.keyBindings.snake;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Load key bindings
    loadKeyBindings();
    // Canvas setup
    const canvas = document.getElementById('snake-board');
    const ctx = canvas.getContext('2d');
    
    // Game constants
    const GRID_SIZE = 20;
    const GRID_WIDTH = canvas.width / GRID_SIZE;
    const GRID_HEIGHT = canvas.height / GRID_SIZE;
    
    // Colors
    const COLORS = {
        background: '#111',
        snake: '#2ecc71',
        snakeHead: '#27ae60',
        food: '#e74c3c',
        grid: '#222'
    };
    
    // Game variables
    let snake = [];
    let food = {};
    let direction = 'right';
    let nextDirection = 'right';
    let score = 0;
    let highScore = localStorage.getItem('snakeHighScore') || 0;
    let gameSpeed = 150; // milliseconds
    let gameInterval;
    let paused = false;
    let gameOver = false;
    
    // DOM elements
    const scoreElement = document.getElementById('score');
    const highScoreElement = document.getElementById('high-score');
    const finalScoreElement = document.getElementById('final-score');
    const startButton = document.getElementById('start-button');
    const playAgainButton = document.getElementById('play-again');
    const resumeButton = document.getElementById('resume');
    const gameOverModal = document.getElementById('game-over');
    const pauseScreen = document.getElementById('pause-screen');
    const slowButton = document.getElementById('slow');
    const mediumButton = document.getElementById('medium');
    const fastButton = document.getElementById('fast');
    
    // Initialize the game
    function init() {
        // Reset game state
        snake = [
            {x: 10, y: 10},
            {x: 9, y: 10},
            {x: 8, y: 10}
        ];
        direction = 'right';
        nextDirection = 'right';
        score = 0;
        gameOver = false;
        
        // Create initial food
        createFood();
        
        // Update UI
        scoreElement.textContent = score;
        highScoreElement.textContent = highScore;
        
        // Clear any existing interval
        if (gameInterval) {
            clearInterval(gameInterval);
        }
        
        // Start the game loop
        gameInterval = setInterval(update, gameSpeed);
    }
    
    // Create food at random position
    function createFood() {
        food = {
            x: Math.floor(Math.random() * GRID_WIDTH),
            y: Math.floor(Math.random() * GRID_HEIGHT)
        };
        
        // Make sure food doesn't spawn on snake
        for (let segment of snake) {
            if (segment.x === food.x && segment.y === food.y) {
                return createFood();
            }
        }
    }
    
    // Draw the grid
    function drawGrid() {
        ctx.strokeStyle = COLORS.grid;
        ctx.lineWidth = 0.5;
        
        // Draw vertical lines
        for (let x = 0; x <= canvas.width; x += GRID_SIZE) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        
        // Draw horizontal lines
        for (let y = 0; y <= canvas.height; y += GRID_SIZE) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
    }
    
    // Draw the snake
    function drawSnake() {
        snake.forEach((segment, index) => {
            ctx.fillStyle = index === 0 ? COLORS.snakeHead : COLORS.snake;
            ctx.fillRect(segment.x * GRID_SIZE, segment.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
            
            // Add a border to each segment
            ctx.strokeStyle = '#111';
            ctx.lineWidth = 1;
            ctx.strokeRect(segment.x * GRID_SIZE, segment.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
            
            // Add eyes to the head
            if (index === 0) {
                ctx.fillStyle = '#fff';
                
                // Position eyes based on direction
                let eyeX1, eyeY1, eyeX2, eyeY2;
                const eyeSize = GRID_SIZE / 5;
                const eyeOffset = GRID_SIZE / 3;
                
                switch (direction) {
                    case 'up':
                        eyeX1 = segment.x * GRID_SIZE + eyeOffset;
                        eyeY1 = segment.y * GRID_SIZE + eyeOffset;
                        eyeX2 = segment.x * GRID_SIZE + GRID_SIZE - eyeOffset - eyeSize;
                        eyeY2 = segment.y * GRID_SIZE + eyeOffset;
                        break;
                    case 'down':
                        eyeX1 = segment.x * GRID_SIZE + eyeOffset;
                        eyeY1 = segment.y * GRID_SIZE + GRID_SIZE - eyeOffset - eyeSize;
                        eyeX2 = segment.x * GRID_SIZE + GRID_SIZE - eyeOffset - eyeSize;
                        eyeY2 = segment.y * GRID_SIZE + GRID_SIZE - eyeOffset - eyeSize;
                        break;
                    case 'left':
                        eyeX1 = segment.x * GRID_SIZE + eyeOffset;
                        eyeY1 = segment.y * GRID_SIZE + eyeOffset;
                        eyeX2 = segment.x * GRID_SIZE + eyeOffset;
                        eyeY2 = segment.y * GRID_SIZE + GRID_SIZE - eyeOffset - eyeSize;
                        break;
                    case 'right':
                        eyeX1 = segment.x * GRID_SIZE + GRID_SIZE - eyeOffset - eyeSize;
                        eyeY1 = segment.y * GRID_SIZE + eyeOffset;
                        eyeX2 = segment.x * GRID_SIZE + GRID_SIZE - eyeOffset - eyeSize;
                        eyeY2 = segment.y * GRID_SIZE + GRID_SIZE - eyeOffset - eyeSize;
                        break;
                }
                
                ctx.fillRect(eyeX1, eyeY1, eyeSize, eyeSize);
                ctx.fillRect(eyeX2, eyeY2, eyeSize, eyeSize);
            }
        });
    }
    
    // Draw the food
    function drawFood() {
        ctx.fillStyle = COLORS.food;
        ctx.beginPath();
        const centerX = food.x * GRID_SIZE + GRID_SIZE / 2;
        const centerY = food.y * GRID_SIZE + GRID_SIZE / 2;
        const radius = GRID_SIZE / 2 - 2;
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Draw the game
    function draw() {
        // Clear the canvas
        ctx.fillStyle = COLORS.background;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw grid
        drawGrid();
        
        // Draw snake and food
        drawSnake();
        drawFood();
    }
    
    // Move the snake
    function moveSnake() {
        // Update direction
        direction = nextDirection;
        
        // Create new head based on direction
        const head = {x: snake[0].x, y: snake[0].y};
        
        switch (direction) {
            case 'up':
                head.y -= 1;
                break;
            case 'down':
                head.y += 1;
                break;
            case 'left':
                head.x -= 1;
                break;
            case 'right':
                head.x += 1;
                break;
        }
        
        // Check for wall collision
        if (head.x < 0 || head.x >= GRID_WIDTH || head.y < 0 || head.y >= GRID_HEIGHT) {
            gameOver = true;
            showGameOver();
            return;
        }
        
        // Check for self collision
        for (let segment of snake) {
            if (head.x === segment.x && head.y === segment.y) {
                gameOver = true;
                showGameOver();
                return;
            }
        }
        
        // Add new head to snake
        snake.unshift(head);
        
        // Check for food collision
        if (head.x === food.x && head.y === food.y) {
            // Increase score
            score += 10;
            scoreElement.textContent = score;
            
            // Update high score
            if (score > highScore) {
                highScore = score;
                highScoreElement.textContent = highScore;
                localStorage.setItem('snakeHighScore', highScore);
            }
            
            // Create new food
            createFood();
        } else {
            // Remove tail if no food was eaten
            snake.pop();
        }
    }
    
    // Game update function
    function update() {
        if (gameOver) return;
        if (paused) return;
        
        moveSnake();
        draw();
    }
    
    // Show game over screen
    function showGameOver() {
        clearInterval(gameInterval);
        finalScoreElement.textContent = score;
        gameOverModal.style.display = 'flex';
    }
    
    // Toggle pause
    function togglePause() {
        paused = !paused;
        if (paused) {
            pauseScreen.style.display = 'flex';
        } else {
            pauseScreen.style.display = 'none';
        }
    }
    
    // Set game speed
    function setGameSpeed(speed) {
        // Clear existing interval
        if (gameInterval) {
            clearInterval(gameInterval);
        }
        
        // Set new speed
        gameSpeed = speed;
        
        // Update speed buttons
        slowButton.classList.remove('active');
        mediumButton.classList.remove('active');
        fastButton.classList.remove('active');
        
        if (speed === 200) {
            slowButton.classList.add('active');
        } else if (speed === 150) {
            mediumButton.classList.add('active');
        } else if (speed === 80) {
            fastButton.classList.add('active');
        }
        
        // Restart interval if game is active
        if (!gameOver && !paused) {
            gameInterval = setInterval(update, gameSpeed);
        }
    }
    
    // Event listeners
    document.addEventListener('keydown', event => {
        if (gameOver) return;
        
        // Use custom key bindings
        if (event.key === keyBindings.moveLeft) {
            if (direction !== 'right') {
                nextDirection = 'left';
            }
        } else if (event.key === keyBindings.moveUp) {
            if (direction !== 'down') {
                nextDirection = 'up';
            }
        } else if (event.key === keyBindings.moveRight) {
            if (direction !== 'left') {
                nextDirection = 'right';
            }
        } else if (event.key === keyBindings.moveDown) {
            if (direction !== 'up') {
                nextDirection = 'down';
            }
        } else if (event.key === keyBindings.pause) {
            togglePause();
        }
    });
    
    startButton.addEventListener('click', () => {
        init();
        if (paused) {
            paused = false;
            pauseScreen.style.display = 'none';
        }
        gameOverModal.style.display = 'none';
    });
    
    playAgainButton.addEventListener('click', () => {
        init();
        gameOverModal.style.display = 'none';
    });
    
    resumeButton.addEventListener('click', () => {
        togglePause();
    });
    
    slowButton.addEventListener('click', () => {
        setGameSpeed(200);
    });
    
    mediumButton.addEventListener('click', () => {
        setGameSpeed(150);
    });
    
    fastButton.addEventListener('click', () => {
        setGameSpeed(80);
    });
    
    // Set initial speed
    setGameSpeed(150);
    
    // Initialize the game
    init();
});
