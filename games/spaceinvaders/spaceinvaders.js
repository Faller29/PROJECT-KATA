// Space Invaders Game
document.addEventListener('DOMContentLoaded', () => {
    // Get the canvas and context
    const canvas = document.getElementById('invaders-board');
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
        fire: ' ', // Space
        pause: 'p'
    };

    // Try to load key bindings from localStorage
    try {
        const settings = JSON.parse(localStorage.getItem('projectKataPreferences'));
        if (settings && settings.keyBindings && settings.keyBindings.spaceinvaders) {
            Object.assign(gameSettings, settings.keyBindings.spaceinvaders);
        }
    } catch (e) {
        console.error('Failed to load settings', e);
    }

    // Game state
    let gameRunning = false;
    let gamePaused = false;
    let score = 0;
    let highScore = localStorage.getItem('spaceinvadersHighScore') || 0;
    let playerHealth = 100; // Health percentage instead of lives
    let level = 1;
    let animationFrameId;
    let lastTime = 0;
    let alienDirection = 1; // 1 for right, -1 for left
    let alienMoveDownTimer = 0;
    let alienMoveSpeed = 0.3; // Reduced base speed
    let alienFireRate = 0.002; // Reduced chance of alien firing per frame
    let playerFireRate = 300; // ms between shots
    let lastPlayerFireTime = 0;
    const ALIEN_DAMAGE = 15; // Damage per alien bullet
    const MAX_ALIEN_DESCENT = canvas.height / 2; // Aliens can't go below half the screen

    // Game constants
    const PLAYER_WIDTH = 60;
    const PLAYER_HEIGHT = 20;
    const PLAYER_SPEED = 5;
    const BULLET_SPEED = 7;
    const ALIEN_BULLET_SPEED = 3;
    const BULLET_WIDTH = 3;
    const BULLET_HEIGHT = 15;
    const ALIEN_ROWS = 5;
    const ALIEN_COLS = 11;
    const ALIEN_WIDTH = 40;
    const ALIEN_HEIGHT = 30;
    const ALIEN_PADDING = 10;
    const ALIEN_TOP_OFFSET = 60;
    const ALIEN_LEFT_OFFSET = 30;
    const ALIEN_MOVE_DOWN = 20;
    const ALIEN_POINTS = [30, 20, 20, 10, 10]; // Points per alien row (top to bottom)

    // Game objects
    const player = {
        x: canvas.width / 2 - PLAYER_WIDTH / 2,
        y: canvas.height - PLAYER_HEIGHT - 20,
        width: PLAYER_WIDTH,
        height: PLAYER_HEIGHT,
        speed: PLAYER_SPEED,
        color: '#3498db',
        isHit: false,
        hitTimer: 0
    };

    const playerBullets = [];
    const alienBullets = [];
    const explosions = [];
    const aliens = [];
    const shields = [];

    // Create aliens
    function createAliens() {
        aliens.length = 0; // Clear existing aliens
        
        for (let row = 0; row < ALIEN_ROWS; row++) {
            for (let col = 0; col < ALIEN_COLS; col++) {
                const alienType = row;
                const alien = {
                    x: col * (ALIEN_WIDTH + ALIEN_PADDING) + ALIEN_LEFT_OFFSET,
                    y: row * (ALIEN_HEIGHT + ALIEN_PADDING) + ALIEN_TOP_OFFSET,
                    width: ALIEN_WIDTH,
                    height: ALIEN_HEIGHT,
                    type: alienType,
                    alive: true,
                    points: ALIEN_POINTS[row],
                    animFrame: 0,
                    lastAnimTime: 0
                };
                aliens.push(alien);
            }
        }
        
        // Return the number of aliens created for verification
        return aliens.length;
    }

    // Create shields
    function createShields() {
        shields.length = 0; // Clear existing shields
        
        // Create 4 shields
        const shieldWidth = 80;
        const shieldHeight = 60;
        const shieldPadding = 60;
        const shieldY = canvas.height - 150;
        
        // Number of shield parts
        const shieldPartsX = 8;
        const shieldPartsY = 6;
        const partWidth = shieldWidth / shieldPartsX;
        const partHeight = shieldHeight / shieldPartsY;
        
        for (let s = 0; s < 4; s++) {
            const shieldX = (s * (shieldWidth + shieldPadding)) + (canvas.width - (4 * shieldWidth + 3 * shieldPadding)) / 2;
            
            // Create shield parts
            for (let row = 0; row < shieldPartsY; row++) {
                for (let col = 0; col < shieldPartsX; col++) {
                    // Create a shield part (skip the middle-bottom part to create the typical Space Invaders shield shape)
                    if (!(row >= 4 && col >= 2 && col < 6)) {
                        const shieldPart = {
                            x: shieldX + col * partWidth,
                            y: shieldY + row * partHeight,
                            width: partWidth,
                            height: partHeight,
                            health: 3
                        };
                        shields.push(shieldPart);
                    }
                }
            }
        }
        
        // Return the number of shield parts created
        return shields.length;
    }

    // Initialize the game
    function init() {
        console.log("Initializing game...");
        score = 0;
        playerHealth = 100;
        level = 1;
        highScore = localStorage.getItem('spaceinvadersHighScore') || 0;
        
        // Update displays
        scoreDisplay.textContent = score;
        highScoreDisplay.textContent = highScore;
        livesDisplay.textContent = Math.floor(playerHealth);
        levelDisplay.textContent = level;
        
        // Reset player position
        player.x = canvas.width / 2 - PLAYER_WIDTH / 2;
        player.isHit = false;
        player.hitTimer = 0;
        
        // Clear game objects
        playerBullets.length = 0;
        alienBullets.length = 0;
        explosions.length = 0;
        aliens.length = 0; // Explicitly clear aliens array
        shields.length = 0; // Explicitly clear shields array
        
        // Reset alien movement
        alienDirection = 1;
        alienMoveDownTimer = 0;
        alienMoveSpeed = 0.3 + (level - 1) * 0.05; // Increase speed with level
        alienFireRate = 0.002 + (level - 1) * 0.0005; // Increase fire rate with level
        
        // Create aliens and shields
        const alienCount = createAliens();
        const shieldCount = createShields();
        console.log(`Created ${alienCount} aliens and ${shieldCount} shield parts`);
        
        // Reset game state
        gameRunning = true;
        gamePaused = false;
        
        // Close any open modals
        gameOverModal.style.display = "none";
        levelCompleteModal.style.display = "none";
        pauseScreen.style.display = "none";
        
        console.log("Game initialization complete");
        return true;
    }

    // Create player bullet
    function createPlayerBullet() {
        const now = Date.now();
        if (now - lastPlayerFireTime >= playerFireRate) {
            const bullet = {
                x: player.x + player.width / 2 - BULLET_WIDTH / 2,
                y: player.y - BULLET_HEIGHT,
                width: BULLET_WIDTH,
                height: BULLET_HEIGHT,
                speed: BULLET_SPEED,
                color: '#ffffff'
            };
            playerBullets.push(bullet);
            lastPlayerFireTime = now;
        }
    }

    // Create alien bullet
    function createAlienBullet(alien) {
        const bullet = {
            x: alien.x + alien.width / 2 - BULLET_WIDTH / 2,
            y: alien.y + alien.height,
            width: BULLET_WIDTH,
            height: BULLET_HEIGHT,
            speed: ALIEN_BULLET_SPEED,
            color: '#ff0000'
        };
        alienBullets.push(bullet);
    }

    // Create explosion
    function createExplosion(x, y, size = 30) {
        const explosion = {
            x,
            y,
            size,
            opacity: 1,
            frame: 0
        };
        explosions.push(explosion);
    }

    // Update game objects
    function update(deltaTime) {
        // Player movement
        if (keys[gameSettings.moveLeft] && player.x > 0) {
            player.x -= player.speed;
        }
        if (keys[gameSettings.moveRight] && player.x + player.width < canvas.width) {
            player.x += player.speed;
        }
        
        // Gradually recover a small amount of health over time
        if (playerHealth < 100 && !player.isHit) {
            // Recover 1 health point every 3 seconds
            playerHealth += deltaTime * 0.0003;
            if (playerHealth > 100) playerHealth = 100;
            livesDisplay.textContent = Math.floor(playerHealth);
        }

        // Player firing
        if (keys[gameSettings.fire]) {
            createPlayerBullet();
        }

        // Update player hit state
        if (player.isHit) {
            player.hitTimer += deltaTime;
            if (player.hitTimer >= 1000) { // 1 second invincibility
                player.isHit = false;
                player.hitTimer = 0;
            }
        }

        // Update player bullets
        for (let i = playerBullets.length - 1; i >= 0; i--) {
            const bullet = playerBullets[i];
            bullet.y -= bullet.speed;
            
            // Remove bullets that go off screen
            if (bullet.y + bullet.height < 0) {
                playerBullets.splice(i, 1);
                continue;
            }
            
            // Check collision with aliens
            for (let j = aliens.length - 1; j >= 0; j--) {
                const alien = aliens[j];
                if (alien.alive && checkCollision(bullet, alien)) {
                    // Alien hit
                    alien.alive = false;
                    createExplosion(alien.x + alien.width / 2, alien.y + alien.height / 2);
                    playerBullets.splice(i, 1);
                    
                    // Increase score
                    score += alien.points;
                    scoreDisplay.textContent = score;
                    
                    // Update high score
                    if (score > highScore) {
                        highScore = score;
                        highScoreDisplay.textContent = highScore;
                        localStorage.setItem('spaceinvadersHighScore', highScore);
                    }
                    break;
                }
            }
            
            // Player bullets pass through shields completely
            // No collision check needed for shields with player bullets
        }

        // Update alien bullets
        for (let i = alienBullets.length - 1; i >= 0; i--) {
            const bullet = alienBullets[i];
            bullet.y += bullet.speed;
            
            // Remove bullets that go off screen
            if (bullet.y > canvas.height) {
                alienBullets.splice(i, 1);
                continue;
            }
            
            // Check collision with player
            if (!player.isHit && checkCollision(bullet, player)) {
                // Player hit
                alienBullets.splice(i, 1);
                playerHealth -= ALIEN_DAMAGE;
                livesDisplay.textContent = Math.floor(playerHealth);
                
                if (playerHealth <= 0) {
                    gameOver();
                } else {
                    player.isHit = true;
                    player.hitTimer = 0;
                    createExplosion(player.x + player.width / 2, player.y + player.height / 2);
                }
                continue;
            }
            
            // Check collision with shields
            for (let j = shields.length - 1; j >= 0; j--) {
                const shieldPart = shields[j];
                if (checkCollision(bullet, shieldPart)) {
                    shieldPart.health--;
                    alienBullets.splice(i, 1);
                    
                    if (shieldPart.health <= 0) {
                        shields.splice(j, 1);
                    }
                    break;
                }
            }
        }

        // Update explosions
        for (let i = explosions.length - 1; i >= 0; i--) {
            const explosion = explosions[i];
            explosion.opacity -= 0.05;
            explosion.frame++;
            
            if (explosion.opacity <= 0) {
                explosions.splice(i, 1);
            }
        }

        // Update aliens
        let moveDown = false;
        let allDead = true;
        let lowestAlien = 0;
        
        // Increase the move timer
        alienMoveDownTimer += deltaTime;
        
        // Move aliens every X milliseconds
        if (alienMoveDownTimer >= 30 / alienMoveSpeed) {
            alienMoveDownTimer = 0;
            
            // Check if any alien has reached the edge
            for (const alien of aliens) {
                if (alien.alive) {
                    allDead = false;
                    
                    if ((alienDirection === 1 && alien.x + alien.width >= canvas.width - 20) ||
                        (alienDirection === -1 && alien.x <= 20)) {
                        moveDown = true;
                        alienDirection *= -1;
                        break;
                    }
                    
                    // Track lowest alien for game over condition
                    if (alien.y + alien.height > lowestAlien) {
                        lowestAlien = alien.y + alien.height;
                    }
                }
            }
            
            // Move the aliens
            for (const alien of aliens) {
                if (alien.alive) {
                    if (moveDown) {
                        // Only move down if it won't exceed the maximum descent limit
                        if (alien.y + ALIEN_MOVE_DOWN < MAX_ALIEN_DESCENT) {
                            alien.y += ALIEN_MOVE_DOWN;
                        }
                    }
                    alien.x += alienDirection * 5;
                    
                    // Check collision with shields - destroy shields if aliens touch them
                    for (let j = shields.length - 1; j >= 0; j--) {
                        const shield = shields[j];
                        if (checkCollision(alien, shield)) {
                            // Remove the shield part
                            shields.splice(j, 1);
                        }
                    }
                    
                    // Animate aliens - cycle between frames
                    alien.animFrame = alien.animFrame === 0 ? 1 : 0;
                }
            }
        }
        
        // Check if all aliens are dead (level complete)
        // First make sure there are aliens to begin with (allDead will be true if there were never any aliens)
        let hasAliens = aliens.length > 0;
        
        // Only log when state might be concerning (too few aliens or all dead)
        if (aliens.length < 10 || allDead) {
            console.log(`Alien status: ${aliens.length} aliens, allDead=${allDead}, hasAliens=${hasAliens}`);
        }
        
        if (hasAliens && allDead) {
            console.log("Level complete condition met!");
            levelComplete();
        }
        
        // Aliens randomly shoot
        for (const alien of aliens) {
            if (alien.alive && Math.random() < alienFireRate) {
                // Only bottom-most aliens in each column can shoot
                let isBottomAlien = true;
                for (const otherAlien of aliens) {
                    if (otherAlien.alive && otherAlien.x === alien.x && otherAlien.y > alien.y) {
                        isBottomAlien = false;
                        break;
                    }
                }
                
                if (isBottomAlien) {
                    createAlienBullet(alien);
                }
            }
        }
    }

    // Check collision between two objects
    function checkCollision(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }

    // Game over
    function gameOver() {
        gameRunning = false;
        finalScoreDisplay.textContent = score;
        gameOverModal.style.display = "flex";
    }

    // Level complete
    function levelComplete() {
        console.log(`Level ${level} completed!`);
        
        // Double-check aliens are actually gone
        let aliveAliens = aliens.filter(alien => alien.alive).length;
        console.log(`Alive aliens at level completion: ${aliveAliens}`);
        
        // Only proceed if all aliens are truly dead
        if (aliveAliens === 0) {
            level++;
            nextLevelNumDisplay.textContent = level;
            levelDisplay.textContent = level;
            levelCompleteModal.style.display = "flex";
            gameRunning = false;
            console.log(`Advanced to level ${level}`);
        } else {
            console.error("Level complete called but aliens still remain!");
            // Keep playing - don't show level complete
        }
    }

    // Start next level
    function startNextLevel() {
        levelCompleteModal.style.display = "none";
        
        // Clear game objects
        playerBullets.length = 0;
        alienBullets.length = 0;
        explosions.length = 0;
        
        // Reset alien movement
        alienDirection = 1;
        alienMoveDownTimer = 0;
        alienMoveSpeed = 0.3 + (level - 1) * 0.05; // Increase speed with level
        alienFireRate = 0.002 + (level - 1) * 0.0005; // Increase fire rate with level
        
        // Create aliens and shields
        createAliens();
        createShields();
        
        // Reset player position and restore health
        player.x = canvas.width / 2 - PLAYER_WIDTH / 2;
        player.isHit = false;
        player.hitTimer = 0;
        playerHealth = 100; // Restore full health for next level
        livesDisplay.textContent = Math.floor(playerHealth);
        
        gameRunning = true;
    }

    // Render the game
    function render() {
        // Clear the canvas
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw the starfield background
        drawStarfield();
        
        // Draw the player
        if (!player.isHit || Math.floor(player.hitTimer / 100) % 2 === 0) { // Blink when hit
            drawPlayer();
        }
        
        // Draw the shields
        drawShields();
        
        // Draw the aliens
        drawAliens();
        
        // Draw the bullets
        drawBullets();
        
        // Draw the explosions
        drawExplosions();
        
        // Draw the score and lives
        drawGameInfo();
    }

    // Draw the starfield background
    function drawStarfield() {
        // This would be better with pre-generated stars, but for simplicity we'll just draw random ones
        ctx.fillStyle = "white";
        for (let i = 0; i < 100; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const size = Math.random() * 2 + 1;
            ctx.fillRect(x, y, size, size);
        }
    }

    // Draw the player
    function drawPlayer() {
        // Draw player ship (simple triangle)
        ctx.fillStyle = player.color;
        ctx.beginPath();
        ctx.moveTo(player.x + player.width / 2, player.y);
        ctx.lineTo(player.x + player.width, player.y + player.height);
        ctx.lineTo(player.x, player.y + player.height);
        ctx.closePath();
        ctx.fill();
        
        // Draw the player body
        ctx.fillRect(player.x, player.y + player.height / 2, player.width, player.height / 2);
    }

    // Draw the shields
    function drawShields() {
        for (const shield of shields) {
            // Change color based on health
            switch (shield.health) {
                case 3:
                    ctx.fillStyle = "#00ff00"; // Green
                    break;
                case 2:
                    ctx.fillStyle = "#ffff00"; // Yellow
                    break;
                case 1:
                    ctx.fillStyle = "#ff0000"; // Red
                    break;
            }
            ctx.fillRect(shield.x, shield.y, shield.width, shield.height);
        }
    }

    // Draw the aliens
    function drawAliens() {
        for (const alien of aliens) {
            if (alien.alive) {
                // Draw different shapes for different alien types
                switch (alien.type) {
                    case 0: // Top row - squid-like (most points)
                        drawAlienType0(alien);
                        break;
                    case 1:
                    case 2: // Middle rows - crab-like
                        drawAlienType1(alien);
                        break;
                    default: // Bottom rows - octopus-like
                        drawAlienType2(alien);
                        break;
                }
            }
        }
    }

    // Draw alien type 0 (top row)
    function drawAlienType0(alien) {
        ctx.fillStyle = "#FF69B4"; // Pink
        
        if (alien.animFrame === 0) {
            // Frame 1
            ctx.fillRect(alien.x + 15, alien.y, 10, 5);
            ctx.fillRect(alien.x + 10, alien.y + 5, 20, 5);
            ctx.fillRect(alien.x + 5, alien.y + 10, 30, 5);
            ctx.fillRect(alien.x, alien.y + 15, 40, 10);
            ctx.fillRect(alien.x + 10, alien.y + 25, 20, 5);
            ctx.fillRect(alien.x + 5, alien.y + 15, 5, 10);
            ctx.fillRect(alien.x + 30, alien.y + 15, 5, 10);
        } else {
            // Frame 2
            ctx.fillRect(alien.x + 15, alien.y, 10, 5);
            ctx.fillRect(alien.x + 10, alien.y + 5, 20, 5);
            ctx.fillRect(alien.x + 5, alien.y + 10, 30, 5);
            ctx.fillRect(alien.x, alien.y + 15, 40, 10);
            ctx.fillRect(alien.x + 5, alien.y + 25, 30, 5);
            ctx.fillRect(alien.x, alien.y + 20, 5, 5);
            ctx.fillRect(alien.x + 35, alien.y + 20, 5, 5);
        }
    }

    // Draw alien type 1 (middle rows)
    function drawAlienType1(alien) {
        ctx.fillStyle = "#00BFFF"; // Light blue
        
        if (alien.animFrame === 0) {
            // Frame 1
            ctx.fillRect(alien.x + 5, alien.y, 30, 5);
            ctx.fillRect(alien.x, alien.y + 5, 40, 15);
            ctx.fillRect(alien.x + 10, alien.y + 20, 5, 5);
            ctx.fillRect(alien.x + 25, alien.y + 20, 5, 5);
            ctx.fillRect(alien.x + 5, alien.y + 20, 5, 5);
            ctx.fillRect(alien.x + 30, alien.y + 20, 5, 5);
        } else {
            // Frame 2
            ctx.fillRect(alien.x + 5, alien.y, 30, 5);
            ctx.fillRect(alien.x, alien.y + 5, 40, 15);
            ctx.fillRect(alien.x + 10, alien.y + 20, 5, 5);
            ctx.fillRect(alien.x + 25, alien.y + 20, 5, 5);
            ctx.fillRect(alien.x, alien.y + 15, 5, 5);
            ctx.fillRect(alien.x + 35, alien.y + 15, 5, 5);
        }
    }

    // Draw alien type 2 (bottom rows)
    function drawAlienType2(alien) {
        ctx.fillStyle = "#7FFF00"; // Chartreuse
        
        if (alien.animFrame === 0) {
            // Frame 1
            ctx.fillRect(alien.x + 10, alien.y, 5, 5);
            ctx.fillRect(alien.x + 25, alien.y, 5, 5);
            ctx.fillRect(alien.x + 5, alien.y + 5, 30, 15);
            ctx.fillRect(alien.x, alien.y + 10, 40, 5);
            ctx.fillRect(alien.x + 15, alien.y + 20, 10, 5);
        } else {
            // Frame 2
            ctx.fillRect(alien.x + 10, alien.y, 5, 5);
            ctx.fillRect(alien.x + 25, alien.y, 5, 5);
            ctx.fillRect(alien.x + 5, alien.y + 5, 30, 15);
            ctx.fillRect(alien.x, alien.y + 10, 40, 5);
            ctx.fillRect(alien.x + 5, alien.y + 20, 5, 5);
            ctx.fillRect(alien.x + 30, alien.y + 20, 5, 5);
        }
    }

    // Draw the bullets
    function drawBullets() {
        // Draw player bullets
        ctx.fillStyle = "#ffffff";
        for (const bullet of playerBullets) {
            ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        }
        
        // Draw alien bullets
        ctx.fillStyle = "#ff0000";
        for (const bullet of alienBullets) {
            // Draw zigzag bullet
            ctx.beginPath();
            ctx.moveTo(bullet.x, bullet.y);
            ctx.lineTo(bullet.x + bullet.width, bullet.y + bullet.height / 3);
            ctx.lineTo(bullet.x, bullet.y + bullet.height * 2/3);
            ctx.lineTo(bullet.x + bullet.width, bullet.y + bullet.height);
            ctx.fill();
        }
    }

    // Draw the explosions
    function drawExplosions() {
        for (const explosion of explosions) {
            ctx.fillStyle = `rgba(255, 255, 0, ${explosion.opacity})`;
            
            // Draw explosion as expanding circle
            ctx.beginPath();
            ctx.arc(explosion.x, explosion.y, explosion.size * (1 - explosion.opacity), 0, Math.PI * 2);
            ctx.fill();
            
            // Draw inner circle
            ctx.fillStyle = `rgba(255, 128, 0, ${explosion.opacity})`;
            ctx.beginPath();
            ctx.arc(explosion.x, explosion.y, explosion.size * (1 - explosion.opacity) * 0.7, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Draw game info (score, level, etc.)
    function drawGameInfo() {
        ctx.fillStyle = "#ffffff";
        ctx.font = "16px monospace";
        ctx.textAlign = "left";
        
        // Draw divider line
        ctx.fillRect(0, 35, canvas.width, 1);
        
        // Draw health bar at the bottom of the screen
        const healthBarWidth = 200;
        const healthBarHeight = 15;
        const healthBarX = canvas.width - healthBarWidth - 20;
        const healthBarY = canvas.height - 30;
        
        // Health bar background
        ctx.fillStyle = "#333333";
        ctx.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);
        
        // Health bar fill
        let healthColor;
        if (playerHealth > 70) {
            healthColor = "#00ff00"; // Green for high health
        } else if (playerHealth > 30) {
            healthColor = "#ffff00"; // Yellow for medium health
        } else {
            healthColor = "#ff0000"; // Red for low health
        }
        
        ctx.fillStyle = healthColor;
        const fillWidth = (playerHealth / 100) * healthBarWidth;
        ctx.fillRect(healthBarX, healthBarY, fillWidth, healthBarHeight);
        
        // Health text (keep percentage for visual clarity in the health bar)
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.fillText(`${Math.floor(playerHealth)}%`, healthBarX + healthBarWidth / 2, healthBarY - 5);
    }

    // Game loop
    function gameLoop(timestamp) {
        // Calculate time since last frame
        const deltaTime = timestamp - lastTime;
        lastTime = timestamp;
        
        if (gameRunning && !gamePaused) {
            update(deltaTime);
            render();
        }
        
        animationFrameId = requestAnimationFrame(gameLoop);
    }

    // Start the game
    function startGame() {
        if (!gameRunning) {
            console.log("Starting game...");
            init();
            
            // Verify aliens were created
            console.log(`Game initialized with ${aliens.length} aliens`);
            
            gameRunning = true;
            gamePaused = false;
            startButton.disabled = true;
            lastTime = performance.now();
            gameLoop(lastTime);
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
                if (event.data.settings && event.data.settings.spaceinvaders) {
                    gameSettings = { ...gameSettings, ...event.data.settings.spaceinvaders };
                }
            }
        });
    }

    // Initialize high score display
    highScoreDisplay.textContent = highScore;
    
    // Initial setup - just show empty game without running update logic
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawStarfield();
    
    // Create aliens for display purposes only (won't be checked for level complete)
    createAliens();
    drawAliens();
    
    // Draw player and UI elements
    drawPlayer();
    drawGameInfo();
}); 