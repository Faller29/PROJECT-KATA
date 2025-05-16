import { CELL_SIZE, PACMAN_RADIUS, GHOST_RADIUS, DOT_RADIUS, POWER_DOT_RADIUS, COLORS } from './config.js';

// Draw the game state
export function draw(ctx, maze, pacman, ghosts) {
    // Clear canvas
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // Draw maze
    drawMaze(ctx, maze);
    
    // Draw Pac-Man
    drawPacman(ctx, pacman);
    
    // Draw ghosts
    drawGhosts(ctx, ghosts);
}

// Draw the maze
function drawMaze(ctx, maze) {
    for (let y = 0; y < maze.length; y++) {
        for (let x = 0; x < maze[y].length; x++) {
            const cell = maze[y][x];
            const cellX = x * CELL_SIZE;
            const cellY = y * CELL_SIZE;
            
            switch (cell) {
                case 1: // Wall
                    ctx.fillStyle = COLORS.wall;
                    ctx.fillRect(cellX, cellY, CELL_SIZE, CELL_SIZE);
                    break;
                case 2: // Dot
                    ctx.fillStyle = COLORS.dot;
                    ctx.beginPath();
                    ctx.arc(cellX + CELL_SIZE / 2, cellY + CELL_SIZE / 2, DOT_RADIUS, 0, Math.PI * 2);
                    ctx.fill();
                    break;
                case 3: // Power dot
                    ctx.fillStyle = COLORS.powerDot;
                    ctx.beginPath();
                    ctx.arc(cellX + CELL_SIZE / 2, cellY + CELL_SIZE / 2, POWER_DOT_RADIUS, 0, Math.PI * 2);
                    ctx.fill();
                    break;
            }
        }
    }
}

// Draw Pac-Man
function drawPacman(ctx, pacman) {
    ctx.fillStyle = COLORS.pacman;
    ctx.beginPath();
    
    // Calculate mouth angle based on direction
    let startAngle = 0;
    let endAngle = 2 * Math.PI;
    
    if (pacman.mouthOpen) {
        switch (pacman.direction) {
            case 'right':
                startAngle = -pacman.mouthAngle;
                endAngle = pacman.mouthAngle;
                break;
            case 'left':
                startAngle = Math.PI - pacman.mouthAngle;
                endAngle = Math.PI + pacman.mouthAngle;
                break;
            case 'up':
                startAngle = -Math.PI / 2 - pacman.mouthAngle;
                endAngle = -Math.PI / 2 + pacman.mouthAngle;
                break;
            case 'down':
                startAngle = Math.PI / 2 - pacman.mouthAngle;
                endAngle = Math.PI / 2 + pacman.mouthAngle;
                break;
        }
    }
    
    ctx.arc(pacman.x + CELL_SIZE / 2, pacman.y + CELL_SIZE / 2, PACMAN_RADIUS, startAngle, endAngle);
    ctx.lineTo(pacman.x + CELL_SIZE / 2, pacman.y + CELL_SIZE / 2);
    ctx.fill();
}

// Draw ghosts
function drawGhosts(ctx, ghosts) {
    ghosts.forEach(ghost => {
        ctx.fillStyle = ghost.frightened ? COLORS.frightened : ghost.color;
        
        // Draw body
        ctx.beginPath();
        ctx.arc(ghost.x + CELL_SIZE / 2, ghost.y + CELL_SIZE / 2, GHOST_RADIUS, Math.PI, 0, false);
        ctx.lineTo(ghost.x + CELL_SIZE, ghost.y + CELL_SIZE);
        ctx.lineTo(ghost.x, ghost.y + CELL_SIZE);
        ctx.fill();
        
        // Draw eyes
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(ghost.x + CELL_SIZE / 3, ghost.y + CELL_SIZE / 2, 3, 0, Math.PI * 2);
        ctx.arc(ghost.x + 2 * CELL_SIZE / 3, ghost.y + CELL_SIZE / 2, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw pupils
        ctx.fillStyle = '#000';
        const pupilOffset = {
            up: { x: 0, y: -1 },
            down: { x: 0, y: 1 },
            left: { x: -1, y: 0 },
            right: { x: 1, y: 0 }
        }[ghost.direction] || { x: 0, y: 0 };
        
        ctx.beginPath();
        ctx.arc(ghost.x + CELL_SIZE / 3 + pupilOffset.x * 2, 
                ghost.y + CELL_SIZE / 2 + pupilOffset.y * 2, 1.5, 0, Math.PI * 2);
        ctx.arc(ghost.x + 2 * CELL_SIZE / 3 + pupilOffset.x * 2, 
                ghost.y + CELL_SIZE / 2 + pupilOffset.y * 2, 1.5, 0, Math.PI * 2);
        ctx.fill();
    });
}
