/**
 * Flappy Bird Game
 * Project Kata
 */
document.addEventListener('DOMContentLoaded', () => {
    // Canvas setup
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions
    const CANVAS_WIDTH = 400;
    const CANVAS_HEIGHT = 600;
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    
    // Game elements
    const startGameBtn = document.getElementById('start-game-btn');
    const playAgainBtn = document.getElementById('play-again-btn');
    const resumeBtn = document.getElementById('resume-btn');
    const restartBtn = document.getElementById('restart-btn');
    const scoreDisplay = document.getElementById('score');
    const bestScoreDisplay = document.getElementById('best-score');
    const finalScoreDisplay = document.getElementById('final-score');
    const gameOverModal = document.getElementById('game-over');
    const pauseMenu = document.getElementById('pause-menu');
    
    // Game constants
    const GRAVITY = 0.15;
    const FLAP_STRENGTH = -4.8;
    const PIPE_SPEED = 2;
    const PIPE_WIDTH = 52;
    const PIPE_GAP = 150;
    const PIPE_SPAWN_INTERVAL = 140; // frames
    
    // Game state
    let frames = 0;
    let score = 0;
    let bestScore = parseInt(localStorage.getItem('flappybird-best-score')) || 0;
    let gameStarted = false;
    let gameActive = false;
    let gamePaused = false;
    
    // Load sprite atlas
    const sprite = new Image();
    sprite.src = createSpriteAtlas();
    
    // Bird object
    const bird = {
        x: 50,
        y: CANVAS_HEIGHT / 2 - 12,
        width: 34,
        height: 24,
        frame: 0,
        velocity: 0,
        animation: [
            { sX: 0, sY: 0 },    // Wing up position
            { sX: 34, sY: 0 },   // Wing mid position
            { sX: 68, sY: 0 },   // Wing down position
            { sX: 34, sY: 0 },   // Back to mid position
        ],
        draw: function() {
            let bird = this.animation[this.frame];
            
            ctx.drawImage(
                sprite,
                bird.sX, bird.sY,
                this.width, this.height,
                this.x - this.width/2, this.y - this.height/2,
                this.width, this.height
            );
        },
        update: function() {
            // Bird flaps slower before game starts
            const FLAP_RATE = gameStarted ? 5 : 15;
            
            // Animate the bird's wings
            if (frames % FLAP_RATE === 0) {
                this.frame = (this.frame + 1) % this.animation.length;
            }
            
            if (gameStarted) {
                // Apply gravity
                this.velocity += GRAVITY;
                this.y += this.velocity;
                
                // Check for collision with the ground
                if (this.y + this.height/2 >= CANVAS_HEIGHT - foreground.height) {
                    this.y = CANVAS_HEIGHT - foreground.height - this.height/2;
                    if (gameActive) {
                        gameOver();
                    }
                }
                
                // Check for collision with the ceiling
                if (this.y - this.height/2 <= 0) {
                    this.y = this.height/2;
                    this.velocity = 0;
                }
            } else {
                // Before game starts, bird hovers in place
                this.y = CANVAS_HEIGHT / 2 - 12 + Math.sin(frames / 10) * 8;
            }
        },
        flap: function() {
            this.velocity = FLAP_STRENGTH;
        },
        reset: function() {
            this.y = CANVAS_HEIGHT / 2 - 12;
            this.velocity = 0;
            this.frame = 0;
        }
    };
    
    // Pipes array
    const pipes = {
        position: [],
        
        draw: function() {
            for (let i = 0; i < this.position.length; i++) {
                let pipe = this.position[i];
                
                // Top pipe
                ctx.drawImage(
                    sprite,
                    102, 0,
                    PIPE_WIDTH, 320,
                    pipe.x, pipe.y - 320,
                    PIPE_WIDTH, 320
                );
                
                // Bottom pipe
                ctx.drawImage(
                    sprite,
                    154, 0,
                    PIPE_WIDTH, 320,
                    pipe.x, pipe.y + PIPE_GAP,
                    PIPE_WIDTH, 320
                );
            }
        },
        
        update: function() {
            if (!gameStarted || !gameActive) return;
            
            // Add new pipe
            if (frames % PIPE_SPAWN_INTERVAL === 0) {
                this.position.push({
                    x: CANVAS_WIDTH,
                    y: Math.floor(Math.random() * 280) + 120, // Adjusted Y position range
                    passed: false
                });
            }
            
            // Move and remove pipes
            for (let i = 0; i < this.position.length; i++) {
                let pipe = this.position[i];
                
                // Move pipe
                pipe.x -= PIPE_SPEED;
                
                // Remove pipe if it's off-screen
                if (pipe.x + PIPE_WIDTH <= 0) {
                    this.position.shift();
                    // No need to decrement i because we're removing the first element
                }
                
                // Check for pipe passing
                if (!pipe.passed && pipe.x + PIPE_WIDTH < bird.x) {
                    pipe.passed = true;
                    score++;
                    scoreDisplay.textContent = score;
                    
                    // Play score sound
                    playSound('score');
                }
                
                // Collision detection
                // Top pipe collision
                if (
                    bird.x + bird.width/2 > pipe.x && 
                    bird.x - bird.width/2 < pipe.x + PIPE_WIDTH &&
                    bird.y - bird.height/2 < pipe.y
                ) {
                    gameOver();
                }
                
                // Bottom pipe collision
                if (
                    bird.x + bird.width/2 > pipe.x && 
                    bird.x - bird.width/2 < pipe.x + PIPE_WIDTH &&
                    bird.y + bird.height/2 > pipe.y + PIPE_GAP
                ) {
                    gameOver();
                }
            }
        },
        
        reset: function() {
            this.position = [];
        }
    };
    
    // Foreground object (the ground)
    const foreground = {
        x: 0,
        y: CANVAS_HEIGHT - 112,
        width: 336,
        height: 112,
        
        draw: function() {
            // Draw ground multiple times to cover the canvas width
            let xPos = this.x;
            while (xPos < CANVAS_WIDTH + this.width) {
                ctx.drawImage(
                    sprite,
                    0, 160,
                    this.width, this.height,
                    xPos, this.y,
                    this.width, this.height
                );
                xPos += this.width;
            }
        },
        
        update: function() {
            if (!gameStarted || !gameActive) return;
            
            // Move the ground to create scrolling effect
            this.x = (this.x - PIPE_SPEED) % this.width;
        }
    };
    
    // Background object
    const background = {
        draw: function() {
            ctx.fillStyle = "#70c5ce";
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            
            // Draw background multiple times to fill the wider canvas
            const bgWidth = 276;
            let xPos = 0;
            while (xPos < CANVAS_WIDTH) {
                ctx.drawImage(
                    sprite,
                    0, 24,
                    bgWidth, 136,
                    xPos, CANVAS_HEIGHT - 250,
                    bgWidth, 136
                );
                xPos += bgWidth;
            }
        }
    };
    
    // Get Ready screen
    const getReady = {
        draw: function() {
            if (!gameStarted) {
                ctx.drawImage(
                    sprite,
                    0, 272,
                    184, 267,
                    CANVAS_WIDTH/2 - 92, 120,
                    184, 267
                );
            }
        }
    };
    
    // Sound functions
    function playSound(sound) {
        // Create a simple beep sound effect
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        switch (sound) {
            case 'flap':
                oscillator.frequency.value = 300;
                gainNode.gain.value = 0.1;
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.1);
                break;
            case 'score':
                oscillator.frequency.value = 600;
                gainNode.gain.value = 0.1;
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.1);
                break;
            case 'hit':
                oscillator.frequency.value = 200;
                gainNode.gain.value = 0.2;
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.3);
                break;
        }
    }
    
    // Game functions
    function draw() {
        // Clear canvas
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        // Draw game elements
        background.draw();
        pipes.draw();
        foreground.draw();
        bird.draw();
        getReady.draw();
        
        // Draw score
        if (gameStarted) {
            ctx.fillStyle = "white";
            ctx.font = "36px Segoe UI";
            ctx.textAlign = "center";
            ctx.fillText(score, CANVAS_WIDTH/2, 70);
        }
    }
    
    function update() {
        // Update game elements
        bird.update();
        pipes.update();
        foreground.update();
    }
    
    function loop() {
        if (!gamePaused) {
            update();
            draw();
            frames++;
        }
        
        requestAnimationFrame(loop);
    }
    
    function startGame() {
        gameStarted = true;
        gameActive = true;
        score = 0;
        scoreDisplay.textContent = score;
    }
    
    function resetGame() {
        gameStarted = false;
        gameActive = false;
        gamePaused = false;
        frames = 0;
        score = 0;
        scoreDisplay.textContent = score;
        bird.reset();
        pipes.reset();
    }
    
    function gameOver() {
        gameActive = false;
        
        // Play hit sound
        playSound('hit');
        
        // Update best score
        if (score > bestScore) {
            bestScore = score;
            bestScoreDisplay.textContent = bestScore;
            localStorage.setItem('flappybird-best-score', bestScore);
        }
        
        // Show game over modal
        finalScoreDisplay.textContent = score;
        gameOverModal.style.display = 'flex';
    }
    
    function togglePause() {
        if (gameStarted && gameActive) {
            gamePaused = !gamePaused;
            
            if (gamePaused) {
                pauseMenu.style.display = 'flex';
            } else {
                pauseMenu.style.display = 'none';
            }
        }
    }
    
    // Event listeners
    startGameBtn.addEventListener('click', startGame);
    
    playAgainBtn.addEventListener('click', () => {
        resetGame();
        setTimeout(startGame, 100);
        gameOverModal.style.display = 'none';
    });
    
    resumeBtn.addEventListener('click', () => {
        togglePause();
    });
    
    restartBtn.addEventListener('click', () => {
        resetGame();
        setTimeout(startGame, 100);
        pauseMenu.style.display = 'none';
    });
    
    // Canvas click/touch event
    canvas.addEventListener('click', () => {
        if (gameStarted && gameActive && !gamePaused) {
            bird.flap();
            playSound('flap');
        }
    });
    
    // Keyboard events
    document.addEventListener('keydown', (e) => {
        // Space to flap
        if (e.code === 'Space') {
            e.preventDefault();
            if (gameStarted && gameActive && !gamePaused) {
                bird.flap();
                playSound('flap');
            }
        }
        
        // P to pause
        if (e.key.toLowerCase() === 'p') {
            if (gameStarted && gameActive) {
                togglePause();
            }
        }
    });
    
    // Initialize the game
    function init() {
        bestScoreDisplay.textContent = bestScore;
        resetGame();
        loop();
    }
    
    // Function to create sprite atlas dynamically
    function createSpriteAtlas() {
        // Create an off-screen canvas
        const offscreenCanvas = document.createElement('canvas');
        const offCtx = offscreenCanvas.getContext('2d');
        offscreenCanvas.width = 300;
        offscreenCanvas.height = 600;
        
        // Fill with transparency
        offCtx.clearRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);
        
        // Draw bird frames
        drawBird(offCtx, 0, 0, '#e74c3c', '#f39c12'); // Wing up
        drawBird(offCtx, 34, 0, '#e74c3c', '#f39c12', true); // Wing mid
        drawBird(offCtx, 68, 0, '#e74c3c', '#f39c12', false, true); // Wing down
        
        // Draw pipes
        drawPipe(offCtx, 102, 0, false); // Top pipe
        drawPipe(offCtx, 154, 0, true);  // Bottom pipe
        
        // Draw background (simple cloud and grass)
        drawBackground(offCtx, 0, 24);
        
        // Draw ground/foreground
        drawGround(offCtx, 0, 160);
        
        // Draw get ready screen
        drawGetReady(offCtx, 0, 272);
        
        return offscreenCanvas.toDataURL();
    }
    
    // Helper function to draw a bird
    function drawBird(ctx, x, y, bodyColor, beakColor, midWing = false, downWing = false) {
        // Bird body
        ctx.fillStyle = bodyColor;
        ctx.beginPath();
        ctx.ellipse(x + 17, y + 12, 15, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Bird eye
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(x + 24, y + 8, 3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(x + 25, y + 8, 1.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Bird beak
        ctx.fillStyle = beakColor;
        ctx.beginPath();
        ctx.moveTo(x + 30, y + 10);
        ctx.lineTo(x + 34, y + 12);
        ctx.lineTo(x + 30, y + 14);
        ctx.closePath();
        ctx.fill();
        
        // Bird wing
        ctx.fillStyle = '#d35400';
        ctx.beginPath();
        
        if (downWing) {
            // Wing down position
            ctx.moveTo(x + 17, y + 12);
            ctx.lineTo(x + 10, y + 22);
            ctx.lineTo(x + 20, y + 18);
            ctx.closePath();
        } else if (midWing) {
            // Wing mid position
            ctx.moveTo(x + 17, y + 12);
            ctx.lineTo(x + 10, y + 16);
            ctx.lineTo(x + 20, y + 16);
            ctx.closePath();
        } else {
            // Wing up position
            ctx.moveTo(x + 17, y + 12);
            ctx.lineTo(x + 10, y + 6);
            ctx.lineTo(x + 20, y + 10);
            ctx.closePath();
        }
        
        ctx.fill();
    }
    
    // Helper function to draw a pipe
    function drawPipe(ctx, x, y, isBottom) {
        // Pipe body
        ctx.fillStyle = '#2ecc71';
        ctx.fillRect(x, y, PIPE_WIDTH, 320);
        
        // Pipe border
        ctx.strokeStyle = '#27ae60';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, PIPE_WIDTH, 320);
        
        // Pipe cap
        const capHeight = 26;
        const capWidth = 60;
        ctx.fillStyle = '#2ecc71';
        
        if (isBottom) {
            ctx.fillRect(x - (capWidth - PIPE_WIDTH) / 2, y, capWidth, capHeight);
            ctx.strokeRect(x - (capWidth - PIPE_WIDTH) / 2, y, capWidth, capHeight);
        } else {
            ctx.fillRect(x - (capWidth - PIPE_WIDTH) / 2, y + 320 - capHeight, capWidth, capHeight);
            ctx.strokeRect(x - (capWidth - PIPE_WIDTH) / 2, y + 320 - capHeight, capWidth, capHeight);
        }
    }
    
    // Helper function to draw the background
    function drawBackground(ctx, x, y) {
        // Sky has already been drawn with the canvas background
        
        // Draw clouds
        ctx.fillStyle = '#ecf0f1';
        
        // Cloud 1
        ctx.beginPath();
        ctx.arc(x + 80, y + 30, 20, 0, Math.PI * 2);
        ctx.arc(x + 100, y + 30, 25, 0, Math.PI * 2);
        ctx.arc(x + 120, y + 30, 20, 0, Math.PI * 2);
        ctx.fill();
        
        // Cloud 2
        ctx.beginPath();
        ctx.arc(x + 170, y + 50, 15, 0, Math.PI * 2);
        ctx.arc(x + 190, y + 50, 20, 0, Math.PI * 2);
        ctx.arc(x + 210, y + 50, 15, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw hills
        ctx.fillStyle = '#2ecc71';
        ctx.beginPath();
        ctx.moveTo(x, y + 136);
        ctx.bezierCurveTo(x + 50, y + 100, x + 100, y + 120, x + 150, y + 90);
        ctx.bezierCurveTo(x + 200, y + 60, x + 250, y + 100, x + 276, y + 110);
        ctx.lineTo(x + 276, y + 136);
        ctx.lineTo(x, y + 136);
        ctx.closePath();
        ctx.fill();
    }
    
    // Helper function to draw the ground
    function drawGround(ctx, x, y) {
        ctx.fillStyle = '#e67e22';
        ctx.fillRect(x, y, 336, 112);
        
        // Add some texture to the ground
        ctx.fillStyle = '#d35400';
        
        for (let i = 0; i < 20; i++) {
            ctx.fillRect(x + i * 20, y, 3, 112);
        }
        
        // Top border of the ground
        ctx.fillStyle = '#f39c12';
        ctx.fillRect(x, y, 336, 5);
    }
    
    // Helper function to draw the get ready screen
    function drawGetReady(ctx, x, y) {
        // Semi-transparent background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(x, y, 184, 267);
        
        // Get Ready text
        ctx.fillStyle = 'white';
        ctx.font = 'bold 24px Segoe UI';
        ctx.textAlign = 'center';
        ctx.fillText('GET READY!', x + 92, y + 60);
        
        // Instructions
        ctx.font = '16px Segoe UI';
        ctx.fillText('Press Space or Click', x + 92, y + 100);
        ctx.fillText('to flap your wings', x + 92, y + 120);
        
        // Bird image
        drawBird(ctx, x + 70, y + 160, '#e74c3c', '#f39c12');
    }
    
    // Load game settings if available
    function setupGameSettings() {
        if (window.gameSettings) {
            document.addEventListener('keydown', e => {
                const key = e.key;
                
                if (gameStarted && gameActive && !gamePaused) {
                    if (key === window.gameSettings.keyBindings.flappybird.flap) {
                        bird.flap();
                        playSound('flap');
                    }
                }
                
                if (key === window.gameSettings.keyBindings.flappybird.pause) {
                    if (gameStarted && gameActive) {
                        togglePause();
                    }
                }
            });
        }
    }
    
    // Initialize when sprite is loaded
    sprite.onload = init;
    setupGameSettings();
}); 