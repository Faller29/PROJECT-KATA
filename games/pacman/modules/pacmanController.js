import { CELL_SIZE } from './config.js';

// Initial Pac-Man state
export const initialPacmanState = {
    x: 14 * CELL_SIZE,
    y: 23 * CELL_SIZE,
    direction: 'left',
    nextDirection: 'left',
    mouthOpen: true,
    mouthAngle: Math.PI / 4,
    mouthDir: 1
};

// Animate Pac-Man's mouth
export function animatePacmanMouth(pacman) {
    if (pacman.mouthDir === 1) {
        pacman.mouthAngle += Math.PI / 32;
        if (pacman.mouthAngle >= Math.PI / 4) {
            pacman.mouthDir = -1;
        }
    } else {
        pacman.mouthAngle -= Math.PI / 32;
        if (pacman.mouthAngle <= 0) {
            pacman.mouthDir = 1;
        }
    }
}

// Update Pac-Man's position
export function updatePacmanPosition(pacman, maze) {
    // Try to change direction if requested
    if (pacman.nextDirection !== pacman.direction) {
        if (canMove(pacman.x, pacman.y, pacman.nextDirection, maze)) {
            pacman.direction = pacman.nextDirection;
            alignPacmanToGrid(pacman);
        }
    }
    
    // Move in current direction if possible
    if (canMove(pacman.x, pacman.y, pacman.direction, maze)) {
        switch (pacman.direction) {
            case 'up':
                pacman.y -= 2;
                break;
            case 'down':
                pacman.y += 2;
                break;
            case 'left':
                pacman.x -= 2;
                // Wrap around tunnel
                if (pacman.x < 0) {
                    pacman.x = maze[0].length * CELL_SIZE - CELL_SIZE;
                }
                break;
            case 'right':
                pacman.x += 2;
                // Wrap around tunnel
                if (pacman.x >= maze[0].length * CELL_SIZE) {
                    pacman.x = 0;
                }
                break;
        }
    }
}

// Align Pac-Man to the grid for better movement
export function alignPacmanToGrid(pacman) {
    const gridX = Math.round(pacman.x / CELL_SIZE);
    const gridY = Math.round(pacman.y / CELL_SIZE);
    pacman.x = gridX * CELL_SIZE;
    pacman.y = gridY * CELL_SIZE;
}

// Check if Pac-Man can move in the specified direction
export function canMove(x, y, direction, maze) {
    const gridX = Math.round(x / CELL_SIZE);
    const gridY = Math.round(y / CELL_SIZE);
    
    switch (direction) {
        case 'up':
            return gridY > 0 && maze[gridY - 1][gridX] !== 1;
        case 'down':
            return gridY < maze.length - 1 && maze[gridY + 1][gridX] !== 1;
        case 'left':
            return gridX > 0 && maze[gridY][gridX - 1] !== 1;
        case 'right':
            return gridX < maze[0].length - 1 && maze[gridY][gridX + 1] !== 1;
        default:
            return false;
    }
}
