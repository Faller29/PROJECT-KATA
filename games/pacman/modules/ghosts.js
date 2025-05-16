import { CELL_SIZE } from './config.js';

// Ghost initial states
export const initialGhosts = [
    { x: 14 * CELL_SIZE, y: 11 * CELL_SIZE, direction: 'up', color: '#FF0000', name: 'blinky', frightened: false, inGhostHouse: false, releaseTimer: 0 },
    { x: 13 * CELL_SIZE, y: 14 * CELL_SIZE, direction: 'up', color: '#FFB8FF', name: 'pinky', frightened: false, inGhostHouse: true, releaseTimer: 2000 },
    { x: 14 * CELL_SIZE, y: 14 * CELL_SIZE, direction: 'up', color: '#00FFFF', name: 'inky', frightened: false, inGhostHouse: true, releaseTimer: 4000 },
    { x: 15 * CELL_SIZE, y: 14 * CELL_SIZE, direction: 'up', color: '#FFB852', name: 'clyde', frightened: false, inGhostHouse: true, releaseTimer: 6000 }
];

// Get possible directions for a ghost
export function getPossibleDirections(ghost, maze) {
    const gridX = Math.round(ghost.x / CELL_SIZE);
    const gridY = Math.round(ghost.y / CELL_SIZE);
    const directions = ['up', 'down', 'left', 'right'];
    
    return directions.filter(dir => {
        switch (dir) {
            case 'up':
                return gridY > 0 && maze[gridY - 1][gridX] !== 1;
            case 'down':
                return gridY < maze.length - 1 && maze[gridY + 1][gridX] !== 1;
            case 'left':
                return gridX > 0 && maze[gridY][gridX - 1] !== 1;
            case 'right':
                return gridX < maze[0].length - 1 && maze[gridY][gridX + 1] !== 1;
        }
    });
}

// Choose direction for each ghost type
export function chooseDirection(ghost, possibleDirections, pacman) {
    switch (ghost.name) {
        case 'blinky':
            return getDirectionToTarget(ghost, possibleDirections, pacman.x, pacman.y);
        case 'pinky':
            return getPinkyDirection(ghost, possibleDirections, pacman);
        case 'inky':
            return getInkyDirection(ghost, possibleDirections);
        case 'clyde':
            return getClydeDirection(ghost, possibleDirections, pacman);
        default:
            return possibleDirections[Math.floor(Math.random() * possibleDirections.length)];
    }
}

// Pinky tries to ambush Pacman by targeting 4 cells ahead
function getPinkyDirection(ghost, possibleDirections, pacman) {
    let targetX = pacman.x;
    let targetY = pacman.y;
    
    // Target 4 cells ahead of Pacman
    switch (pacman.direction) {
        case 'up':
            targetY -= 4 * CELL_SIZE;
            break;
        case 'down':
            targetY += 4 * CELL_SIZE;
            break;
        case 'left':
            targetX -= 4 * CELL_SIZE;
            break;
        case 'right':
            targetX += 4 * CELL_SIZE;
            break;
    }
    
    return getDirectionToTarget(ghost, possibleDirections, targetX, targetY);
}

// Inky has erratic movement
function getInkyDirection(ghost, possibleDirections) {
    if (Math.random() < 0.3) { // 30% chance to move randomly
        return possibleDirections[Math.floor(Math.random() * possibleDirections.length)];
    }
    return ghost.direction; // Continue in current direction
}

// Clyde moves randomly when far from Pacman, but chases when close
function getClydeDirection(ghost, possibleDirections, pacman) {
    const dx = ghost.x - pacman.x;
    const dy = ghost.y - pacman.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 8 * CELL_SIZE) { // Move randomly when far
        return possibleDirections[Math.floor(Math.random() * possibleDirections.length)];
    }
    return getDirectionToTarget(ghost, possibleDirections, pacman.x, pacman.y);
}

// Helper function to get direction towards a target position
function getDirectionToTarget(ghost, possibleDirections, targetX, targetY) {
    const distances = possibleDirections.map(dir => {
        let nextX = ghost.x;
        let nextY = ghost.y;
        
        switch (dir) {
            case 'up': nextY -= CELL_SIZE; break;
            case 'down': nextY += CELL_SIZE; break;
            case 'left': nextX -= CELL_SIZE; break;
            case 'right': nextX += CELL_SIZE; break;
        }
        
        const dx = nextX - targetX;
        const dy = nextY - targetY;
        return Math.sqrt(dx * dx + dy * dy);
    });
    
    let minIndex = 0;
    for (let i = 1; i < distances.length; i++) {
        if (distances[i] < distances[minIndex]) {
            minIndex = i;
        }
    }
    
    return possibleDirections[minIndex];
}

// Update ghost house and release ghosts
export function updateGhostHouse(ghosts) {
    ghosts.forEach(ghost => {
        if (ghost.inGhostHouse) {
            ghost.releaseTimer -= 30; // Decrease timer each game tick
            if (ghost.releaseTimer <= 0) {
                ghost.inGhostHouse = false;
                ghost.y = 11 * CELL_SIZE; // Move to ghost house exit
            }
        }
    });
}

// Make ghosts frightened
export function frightenGhosts(ghosts) {
    ghosts.forEach(ghost => {
        ghost.frightened = true;
        
        // Reverse direction
        switch (ghost.direction) {
            case 'up': ghost.direction = 'down'; break;
            case 'down': ghost.direction = 'up'; break;
            case 'left': ghost.direction = 'right'; break;
            case 'right': ghost.direction = 'left'; break;
        }
    });
    
    // Reset after 7 seconds
    setTimeout(() => {
        ghosts.forEach(ghost => {
            ghost.frightened = false;
        });
    }, 7000);
}
