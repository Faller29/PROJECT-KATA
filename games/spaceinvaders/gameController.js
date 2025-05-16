// Space Invaders Game Controller
console.log("GameController module loading");
import * as Constants from './constants.js';
console.log("GameController imported Constants successfully");

export default class GameController {
    constructor(physics, renderer, canvas) {
        console.log("GameController constructor called");
        this.physics = physics;
        this.renderer = renderer;
        this.canvas = canvas;
        
        // Game state
        this.gameRunning = false;
        this.gamePaused = false;
        this.score = 0;
        this.highScore = localStorage.getItem('spaceinvadersHighScore') || 0;
        this.lives = 3;
        this.level = 1;
        this.animationFrameId = null;
        this.lastTime = 0;
        this.alienDirection = 1; // 1 for right, -1 for left
        this.alienMoveDownTimer = 0;
        this.alienMoveSpeed = 0.5; // Base speed
        this.alienFireRate = 0.005; // Chance of alien firing per frame
        this.playerFireRate = 300; // ms between shots
        this.lastPlayerFireTime = 0;
        
        // Game objects
        this.player = null;
        this.aliens = [];
        this.shields = [];
        this.playerBullets = [];
        this.alienBullets = [];
        this.explosions = [];
        
        // Key states for input handling
        this.keys = {
            ArrowLeft: false,
            ArrowRight: false,
            ' ': false,
            p: false
        };
        
        // Game settings (can be adjusted from settings menu)
        this.gameSettings = { ...Constants.DEFAULT_KEY_BINDINGS };
        
        // Try to load key bindings from localStorage
        this.loadKeyBindings();
        
        console.log("GameController initialization complete");
    }
    
    // Load key bindings from localStorage
    loadKeyBindings() {
        try {
            const settings = JSON.parse(localStorage.getItem('projectKataPreferences'));
            if (settings && settings.keyBindings && settings.keyBindings.spaceinvaders) {
                Object.assign(this.gameSettings, settings.keyBindings.spaceinvaders);
            }
        } catch (e) {
            console.error('Failed to load settings', e);
        }
    }
    
    // Initialize the game
    init() {
        console.log("GameController.init called");
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.highScore = localStorage.getItem('spaceinvadersHighScore') || 0;
        
        // Reset player position
        this.player = this.physics.createPlayer();
        
        // Clear game objects
        this.playerBullets = [];
        this.alienBullets = [];
        this.explosions = [];
        
        // Reset alien movement
        this.alienDirection = 1;
        this.alienMoveDownTimer = 0;
        this.alienMoveSpeed = 0.5 + (this.level - 1) * 0.1; // Increase speed with level
        this.alienFireRate = 0.005 + (this.level - 1) * 0.001; // Increase fire rate with level
        
        // Create aliens and shields
        this.aliens = this.physics.createAliens();
        this.shields = this.physics.createShields();
        
        // Reset game state
        this.gameRunning = true;
        this.gamePaused = false;
        
        // Return the state for UI updates
        return {
            score: this.score,
            highScore: this.highScore,
            lives: this.lives,
            level: this.level
        };
    }
    
    // Game over
    gameOver() {
        console.log("GameController.gameOver called");
        this.gameRunning = false;
        return {
            score: this.score
        };
    }
    
    // Level complete
    levelComplete() {
        console.log("GameController.levelComplete called");
        this.level++;
        this.gameRunning = false;
        return {
            level: this.level
        };
    }
    
    // Start next level
    startNextLevel() {
        console.log("GameController.startNextLevel called");
        // Clear game objects
        this.playerBullets = [];
        this.alienBullets = [];
        this.explosions = [];
        
        // Reset alien movement
        this.alienDirection = 1;
        this.alienMoveDownTimer = 0;
        this.alienMoveSpeed = 0.5 + (this.level - 1) * 0.1; // Increase speed with level
        this.alienFireRate = 0.005 + (this.level - 1) * 0.001; // Increase fire rate with level
        
        // Create aliens and shields
        this.aliens = this.physics.createAliens();
        this.shields = this.physics.createShields();
        
        // Reset player position
        this.player.x = this.canvas.width / 2 - Constants.PLAYER_WIDTH / 2;
        this.player.isHit = false;
        this.player.hitTimer = 0;
        
        this.gameRunning = true;
    }
    
    // Toggle pause
    togglePause() {
        console.log("GameController.togglePause called");
        if (this.gameRunning) {
            this.gamePaused = !this.gamePaused;
            return this.gamePaused;
        }
        return false;
    }
    
    // Update game state for one frame
    update(deltaTime) {
        if (!this.gameRunning || this.gamePaused) return null;

        // Player movement
        if (this.keys[this.gameSettings.moveLeft] && this.player.x > 0) {
            this.player.x -= this.player.speed;
        }
        if (this.keys[this.gameSettings.moveRight] && this.player.x + this.player.width < this.canvas.width) {
            this.player.x += this.player.speed;
        }

        // Player firing
        if (this.keys[this.gameSettings.fire]) {
            const now = Date.now();
            const bullet = this.physics.createPlayerBullet(this.player, this.lastPlayerFireTime, now, this.playerFireRate);
            if (bullet) {
                this.playerBullets.push(bullet);
                this.lastPlayerFireTime = now;
            }
        }

        // Update player hit state
        if (this.player.isHit) {
            this.player.hitTimer += deltaTime;
            if (this.player.hitTimer >= 1000) { // 1 second invincibility
                this.player.isHit = false;
                this.player.hitTimer = 0;
            }
        }

        // Update player bullets
        for (let i = this.playerBullets.length - 1; i >= 0; i--) {
            const bullet = this.playerBullets[i];
            bullet.y -= bullet.speed;
            
            // Remove bullets that go off screen
            if (bullet.y + bullet.height < 0) {
                this.playerBullets.splice(i, 1);
                continue;
            }
            
            // Check collision with aliens
            for (let j = this.aliens.length - 1; j >= 0; j--) {
                const alien = this.aliens[j];
                if (alien.alive && this.physics.checkCollision(bullet, alien)) {
                    // Alien hit
                    alien.alive = false;
                    this.explosions.push(this.physics.createExplosion(alien.x + alien.width / 2, alien.y + alien.height / 2));
                    this.playerBullets.splice(i, 1);
                    
                    // Increase score
                    this.score += alien.points;
                    
                    // Update high score
                    if (this.score > this.highScore) {
                        this.highScore = this.score;
                        localStorage.setItem('spaceinvadersHighScore', this.highScore);
                    }
                    break;
                }
            }
            
            // Check collision with shields
            for (let j = this.shields.length - 1; j >= 0; j--) {
                const shieldPart = this.shields[j];
                if (this.physics.checkCollision(bullet, shieldPart)) {
                    shieldPart.health--;
                    this.playerBullets.splice(i, 1);
                    
                    if (shieldPart.health <= 0) {
                        this.shields.splice(j, 1);
                    }
                    break;
                }
            }
        }

        // Update alien bullets
        for (let i = this.alienBullets.length - 1; i >= 0; i--) {
            const bullet = this.alienBullets[i];
            bullet.y += bullet.speed;
            
            // Remove bullets that go off screen
            if (bullet.y > this.canvas.height) {
                this.alienBullets.splice(i, 1);
                continue;
            }
            
            // Check collision with player
            if (!this.player.isHit && this.physics.checkCollision(bullet, this.player)) {
                // Player hit
                this.alienBullets.splice(i, 1);
                this.lives--;
                
                if (this.lives <= 0) {
                    return this.gameOver();
                } else {
                    this.player.isHit = true;
                    this.player.hitTimer = 0;
                    this.explosions.push(this.physics.createExplosion(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2));
                }
                continue;
            }
            
            // Check collision with shields
            for (let j = this.shields.length - 1; j >= 0; j--) {
                const shieldPart = this.shields[j];
                if (this.physics.checkCollision(bullet, shieldPart)) {
                    shieldPart.health--;
                    this.alienBullets.splice(i, 1);
                    
                    if (shieldPart.health <= 0) {
                        this.shields.splice(j, 1);
                    }
                    break;
                }
            }
        }

        // Update explosions
        for (let i = this.explosions.length - 1; i >= 0; i--) {
            const explosion = this.explosions[i];
            explosion.opacity -= 0.05;
            explosion.frame++;
            
            if (explosion.opacity <= 0) {
                this.explosions.splice(i, 1);
            }
        }

        // Update aliens
        let moveDown = false;
        let allDead = true;
        let lowestAlien = 0;
        
        // Increase the move timer
        this.alienMoveDownTimer += deltaTime;
        
        // Move aliens every X milliseconds
        if (this.alienMoveDownTimer >= 30 / this.alienMoveSpeed) {
            this.alienMoveDownTimer = 0;
            
            // Check if any alien has reached the edge
            for (const alien of this.aliens) {
                if (alien.alive) {
                    allDead = false;
                    
                    if ((this.alienDirection === 1 && alien.x + alien.width >= this.canvas.width - 20) ||
                        (this.alienDirection === -1 && alien.x <= 20)) {
                        moveDown = true;
                        this.alienDirection *= -1;
                        break;
                    }
                    
                    // Track lowest alien for game over condition
                    if (alien.y + alien.height > lowestAlien) {
                        lowestAlien = alien.y + alien.height;
                    }
                }
            }
            
            // Move the aliens
            for (const alien of this.aliens) {
                if (alien.alive) {
                    if (moveDown) {
                        alien.y += Constants.ALIEN_MOVE_DOWN;
                    }
                    alien.x += this.alienDirection * 5;
                    
                    // Animate aliens - cycle between frames
                    alien.animFrame = alien.animFrame === 0 ? 1 : 0;
                }
            }
        }
        
        // Check if aliens have reached the bottom (game over)
        if (lowestAlien >= this.player.y) {
            return this.gameOver();
        }
        
        // Check if all aliens are dead (level complete)
        // Only check if there has been some gameplay (at least a bullet fired or 1 second passed)
        if (allDead && (this.playerBullets.length > 0 || deltaTime > 1000)) {
            return this.levelComplete();
        }
        
        // Aliens randomly shoot
        for (const alien of this.aliens) {
            if (alien.alive && Math.random() < this.alienFireRate) {
                // Only bottom-most aliens in each column can shoot
                let isBottomAlien = this.physics.isBottomAlien(alien, this.aliens);
                
                if (isBottomAlien) {
                    this.alienBullets.push(this.physics.createAlienBullet(alien));
                }
            }
        }

        // Return the current game state for UI updates
        return {
            score: this.score,
            highScore: this.highScore,
            lives: this.lives,
            level: this.level
        };
    }
    
    // Main game loop
    gameLoop(timestamp) {
        // Calculate time since last frame
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;
        
        // Update game state
        const gameState = this.update(deltaTime);
        
        // Only render if game is running
        if (this.gameRunning) {
            // Create the state object for rendering
            const renderState = {
                player: this.player,
                aliens: this.aliens, 
                shields: this.shields,
                playerBullets: this.playerBullets,
                alienBullets: this.alienBullets,
                explosions: this.explosions
            };
            
            // Render the current state
            this.renderer.render(renderState);
        }
        
        // Continue the game loop
        this.animationFrameId = requestAnimationFrame(this.gameLoop.bind(this));
        
        // Return any important state changes
        return gameState;
    }
    
    // Start the game
    startGame() {
        console.log("GameController.startGame called");
        if (!this.gameRunning) {
            const gameState = this.init();
            this.lastTime = performance.now();
            this.gameLoop(this.lastTime);
            return gameState;
        }
        return null;
    }
    
    // Set key state
    setKeyState(key, isPressed) {
        if (key in this.keys) {
            this.keys[key] = isPressed;
        }
        
        // Check for pause key
        if (isPressed && key === this.gameSettings.pause && this.gameRunning) {
            this.togglePause();
        }
    }
    
    // Get game state
    getGameState() {
        return {
            score: this.score,
            highScore: this.highScore,
            lives: this.lives,
            level: this.level,
            gameRunning: this.gameRunning,
            gamePaused: this.gamePaused
        };
    }
    
    // Update key bindings
    updateKeyBindings(newBindings) {
        this.gameSettings = { ...this.gameSettings, ...newBindings };
    }
    
    // Clean up resources
    cleanup() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }
} 