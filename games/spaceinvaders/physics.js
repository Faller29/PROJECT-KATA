// Space Invaders Physics
import * as Constants from './constants.js';

export default class Physics {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
    }

    // Create player
    createPlayer() {
        return {
            x: this.canvasWidth / 2 - Constants.PLAYER_WIDTH / 2,
            y: this.canvasHeight - Constants.PLAYER_HEIGHT - 20,
            width: Constants.PLAYER_WIDTH,
            height: Constants.PLAYER_HEIGHT,
            speed: Constants.PLAYER_SPEED,
            color: '#3498db',
            isHit: false,
            hitTimer: 0
        };
    }

    // Create aliens
    createAliens() {
        const aliens = [];
        
        for (let row = 0; row < Constants.ALIEN_ROWS; row++) {
            for (let col = 0; col < Constants.ALIEN_COLS; col++) {
                const alienType = row;
                const alien = {
                    x: col * (Constants.ALIEN_WIDTH + Constants.ALIEN_PADDING) + Constants.ALIEN_LEFT_OFFSET,
                    y: row * (Constants.ALIEN_HEIGHT + Constants.ALIEN_PADDING) + Constants.ALIEN_TOP_OFFSET,
                    width: Constants.ALIEN_WIDTH,
                    height: Constants.ALIEN_HEIGHT,
                    type: alienType,
                    alive: true,
                    points: Constants.ALIEN_POINTS[row],
                    animFrame: 0,
                    lastAnimTime: 0
                };
                aliens.push(alien);
            }
        }
        
        return aliens;
    }

    // Create shields
    createShields() {
        const shields = [];
        
        // Create 4 shields
        const shieldWidth = 80;
        const shieldHeight = 60;
        const shieldPadding = 60;
        const shieldY = this.canvasHeight - 150;
        
        // Number of shield parts
        const shieldPartsX = 8;
        const shieldPartsY = 6;
        const partWidth = shieldWidth / shieldPartsX;
        const partHeight = shieldHeight / shieldPartsY;
        
        for (let s = 0; s < 4; s++) {
            const shieldX = (s * (shieldWidth + shieldPadding)) + (this.canvasWidth - (4 * shieldWidth + 3 * shieldPadding)) / 2;
            
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
        
        return shields;
    }

    // Create player bullet
    createPlayerBullet(player, lastPlayerFireTime, currentTime, playerFireRate) {
        if (currentTime - lastPlayerFireTime >= playerFireRate) {
            return {
                x: player.x + player.width / 2 - Constants.BULLET_WIDTH / 2,
                y: player.y - Constants.BULLET_HEIGHT,
                width: Constants.BULLET_WIDTH,
                height: Constants.BULLET_HEIGHT,
                speed: Constants.BULLET_SPEED,
                color: '#ffffff'
            };
        }
        return null;
    }

    // Create alien bullet
    createAlienBullet(alien) {
        return {
            x: alien.x + alien.width / 2 - Constants.BULLET_WIDTH / 2,
            y: alien.y + alien.height,
            width: Constants.BULLET_WIDTH,
            height: Constants.BULLET_HEIGHT,
            speed: Constants.ALIEN_BULLET_SPEED,
            color: '#ff0000'
        };
    }

    // Create explosion
    createExplosion(x, y, size = 30) {
        return {
            x,
            y,
            size,
            opacity: 1,
            frame: 0
        };
    }

    // Check collision between two objects
    checkCollision(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }

    // Check if alien is the bottom-most in its column
    isBottomAlien(alien, aliens) {
        for (const otherAlien of aliens) {
            if (otherAlien.alive && otherAlien.x === alien.x && otherAlien.y > alien.y) {
                return false;
            }
        }
        return true;
    }
} 