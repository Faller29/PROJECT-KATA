// Space Invaders Renderer
console.log("Renderer module loading");
import * as Constants from './constants.js';
console.log("Renderer imported Constants successfully");

export default class Renderer {
    constructor(canvas, ctx) {
        console.log("Renderer constructor called");
        this.canvas = canvas;
        this.ctx = ctx;
    }

    // Main render function
    render(gameState) {
        console.log("Renderer.render called");
        const { player, aliens, shields, playerBullets, alienBullets, explosions } = gameState;
        
        // Clear the canvas
        this.ctx.fillStyle = "#000000";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw the starfield background
        this.drawStarfield();
        
        // Draw the player
        if (!player.isHit || Math.floor(player.hitTimer / 100) % 2 === 0) { // Blink when hit
            this.drawPlayer(player);
        }
        
        // Draw the shields
        this.drawShields(shields);
        
        // Draw the aliens
        this.drawAliens(aliens);
        
        // Draw the bullets
        this.drawBullets(playerBullets, alienBullets);
        
        // Draw the explosions
        this.drawExplosions(explosions);
        
        // Draw the score and lives
        this.drawGameInfo();
    }

    // Draw the starfield background
    drawStarfield() {
        // This would be better with pre-generated stars, but for simplicity we'll just draw random ones
        this.ctx.fillStyle = "white";
        for (let i = 0; i < 100; i++) {
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * this.canvas.height;
            const size = Math.random() * 2 + 1;
            this.ctx.fillRect(x, y, size, size);
        }
    }

    // Draw the player
    drawPlayer(player) {
        // Draw player ship (simple triangle)
        this.ctx.fillStyle = player.color;
        this.ctx.beginPath();
        this.ctx.moveTo(player.x + player.width / 2, player.y);
        this.ctx.lineTo(player.x + player.width, player.y + player.height);
        this.ctx.lineTo(player.x, player.y + player.height);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Draw the player body
        this.ctx.fillRect(player.x, player.y + player.height / 2, player.width, player.height / 2);
    }

    // Draw the shields
    drawShields(shields) {
        for (const shield of shields) {
            // Change color based on health
            switch (shield.health) {
                case 3:
                    this.ctx.fillStyle = "#00ff00"; // Green
                    break;
                case 2:
                    this.ctx.fillStyle = "#ffff00"; // Yellow
                    break;
                case 1:
                    this.ctx.fillStyle = "#ff0000"; // Red
                    break;
            }
            this.ctx.fillRect(shield.x, shield.y, shield.width, shield.height);
        }
    }

    // Draw the aliens
    drawAliens(aliens) {
        for (const alien of aliens) {
            if (alien.alive) {
                // Draw different shapes for different alien types
                switch (alien.type) {
                    case 0: // Top row - squid-like (most points)
                        this.drawAlienType0(alien);
                        break;
                    case 1:
                    case 2: // Middle rows - crab-like
                        this.drawAlienType1(alien);
                        break;
                    default: // Bottom rows - octopus-like
                        this.drawAlienType2(alien);
                        break;
                }
            }
        }
    }

    // Draw alien type 0 (top row)
    drawAlienType0(alien) {
        this.ctx.fillStyle = "#FF69B4"; // Pink
        
        if (alien.animFrame === 0) {
            // Frame 1
            this.ctx.fillRect(alien.x + 15, alien.y, 10, 5);
            this.ctx.fillRect(alien.x + 10, alien.y + 5, 20, 5);
            this.ctx.fillRect(alien.x + 5, alien.y + 10, 30, 5);
            this.ctx.fillRect(alien.x, alien.y + 15, 40, 10);
            this.ctx.fillRect(alien.x + 10, alien.y + 25, 20, 5);
            this.ctx.fillRect(alien.x + 5, alien.y + 15, 5, 10);
            this.ctx.fillRect(alien.x + 30, alien.y + 15, 5, 10);
        } else {
            // Frame 2
            this.ctx.fillRect(alien.x + 15, alien.y, 10, 5);
            this.ctx.fillRect(alien.x + 10, alien.y + 5, 20, 5);
            this.ctx.fillRect(alien.x + 5, alien.y + 10, 30, 5);
            this.ctx.fillRect(alien.x, alien.y + 15, 40, 10);
            this.ctx.fillRect(alien.x + 5, alien.y + 25, 30, 5);
            this.ctx.fillRect(alien.x, alien.y + 20, 5, 5);
            this.ctx.fillRect(alien.x + 35, alien.y + 20, 5, 5);
        }
    }

    // Draw alien type 1 (middle rows)
    drawAlienType1(alien) {
        this.ctx.fillStyle = "#00BFFF"; // Light blue
        
        if (alien.animFrame === 0) {
            // Frame 1
            this.ctx.fillRect(alien.x + 5, alien.y, 30, 5);
            this.ctx.fillRect(alien.x, alien.y + 5, 40, 15);
            this.ctx.fillRect(alien.x + 10, alien.y + 20, 5, 5);
            this.ctx.fillRect(alien.x + 25, alien.y + 20, 5, 5);
            this.ctx.fillRect(alien.x + 5, alien.y + 20, 5, 5);
            this.ctx.fillRect(alien.x + 30, alien.y + 20, 5, 5);
        } else {
            // Frame 2
            this.ctx.fillRect(alien.x + 5, alien.y, 30, 5);
            this.ctx.fillRect(alien.x, alien.y + 5, 40, 15);
            this.ctx.fillRect(alien.x + 10, alien.y + 20, 5, 5);
            this.ctx.fillRect(alien.x + 25, alien.y + 20, 5, 5);
            this.ctx.fillRect(alien.x, alien.y + 15, 5, 5);
            this.ctx.fillRect(alien.x + 35, alien.y + 15, 5, 5);
        }
    }

    // Draw alien type 2 (bottom rows)
    drawAlienType2(alien) {
        this.ctx.fillStyle = "#7FFF00"; // Chartreuse
        
        if (alien.animFrame === 0) {
            // Frame 1
            this.ctx.fillRect(alien.x + 10, alien.y, 5, 5);
            this.ctx.fillRect(alien.x + 25, alien.y, 5, 5);
            this.ctx.fillRect(alien.x + 5, alien.y + 5, 30, 15);
            this.ctx.fillRect(alien.x, alien.y + 10, 40, 5);
            this.ctx.fillRect(alien.x + 15, alien.y + 20, 10, 5);
        } else {
            // Frame 2
            this.ctx.fillRect(alien.x + 10, alien.y, 5, 5);
            this.ctx.fillRect(alien.x + 25, alien.y, 5, 5);
            this.ctx.fillRect(alien.x + 5, alien.y + 5, 30, 15);
            this.ctx.fillRect(alien.x, alien.y + 10, 40, 5);
            this.ctx.fillRect(alien.x + 5, alien.y + 20, 5, 5);
            this.ctx.fillRect(alien.x + 30, alien.y + 20, 5, 5);
        }
    }

    // Draw the bullets
    drawBullets(playerBullets, alienBullets) {
        // Draw player bullets
        this.ctx.fillStyle = "#ffffff";
        for (const bullet of playerBullets) {
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        }
        
        // Draw alien bullets
        this.ctx.fillStyle = "#ff0000";
        for (const bullet of alienBullets) {
            // Draw zigzag bullet
            this.ctx.beginPath();
            this.ctx.moveTo(bullet.x, bullet.y);
            this.ctx.lineTo(bullet.x + bullet.width, bullet.y + bullet.height / 3);
            this.ctx.lineTo(bullet.x, bullet.y + bullet.height * 2/3);
            this.ctx.lineTo(bullet.x + bullet.width, bullet.y + bullet.height);
            this.ctx.fill();
        }
    }

    // Draw the explosions
    drawExplosions(explosions) {
        for (const explosion of explosions) {
            this.ctx.fillStyle = `rgba(255, 255, 0, ${explosion.opacity})`;
            
            // Draw explosion as expanding circle
            this.ctx.beginPath();
            this.ctx.arc(explosion.x, explosion.y, explosion.size * (1 - explosion.opacity), 0, Math.PI * 2);
            this.ctx.fill();
            
            // Draw inner circle
            this.ctx.fillStyle = `rgba(255, 128, 0, ${explosion.opacity})`;
            this.ctx.beginPath();
            this.ctx.arc(explosion.x, explosion.y, explosion.size * (1 - explosion.opacity) * 0.7, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    // Draw game info (score, level, etc.)
    drawGameInfo() {
        this.ctx.fillStyle = "#ffffff";
        this.ctx.font = "16px monospace";
        this.ctx.textAlign = "left";
        
        // Draw divider line
        this.ctx.fillRect(0, 35, this.canvas.width, 1);
    }
} 