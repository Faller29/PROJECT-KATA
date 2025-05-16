// Game Settings Manager
// This file manages game settings across all games

// Load settings from localStorage
function loadGameSettings() {
    if (localStorage.getItem('projectKataPreferences')) {
        return JSON.parse(localStorage.getItem('projectKataPreferences'));
    } else {
        // Default settings
        const defaultSettings = {
            keyBindings: {
                tetris: {
                    moveLeft: 'ArrowLeft',
                    moveRight: 'ArrowRight',
                    moveDown: 'ArrowDown',
                    rotate: 'ArrowUp',
                    hardDrop: ' ' // Space
                },
                snake: {
                    moveLeft: 'ArrowLeft',
                    moveRight: 'ArrowRight',
                    moveDown: 'ArrowDown',
                    moveUp: 'ArrowUp',
                    pause: 'p'
                },
                pacman: {
                    moveLeft: 'ArrowLeft',
                    moveRight: 'ArrowRight',
                    moveDown: 'ArrowDown',
                    moveUp: 'ArrowUp',
                    pause: 'p'
                },
                chess: {
                    // Chess uses mouse primarily, but could have keyboard shortcuts
                    undo: 'z'
                },
                pong: {
                    moveUp: 'ArrowUp',
                    moveDown: 'ArrowDown',
                    pause: 'p'
                },
                breakout: {
                    moveLeft: 'ArrowLeft',
                    moveRight: 'ArrowRight',
                    launch: ' ', // Space
                    pause: 'p'
                },
                spaceinvaders: {
                    moveLeft: 'ArrowLeft',
                    moveRight: 'ArrowRight',
                    fire: ' ', // Space
                    pause: 'p'
                },
                minesweeper: {
                    flag: 'f',
                    newGame: 'n'
                },
                connect4: {
                    moveLeft: 'ArrowLeft',
                    moveRight: 'ArrowRight',
                    drop: ' ', // Space
                    newGame: 'n'
                },
                '2048': {
                    moveLeft: 'ArrowLeft',
                    moveRight: 'ArrowRight',
                    moveDown: 'ArrowDown',
                    moveUp: 'ArrowUp',
                    newGame: 'n'
                },
                flappybird: {
                    flap: ' ', // Space
                    pause: 'p'
                },
                tictactoe: {
                    select: ' ', // Space
                    restart: 'r'
                },
                memory: {
                    select: ' ', // Space
                    restart: 'r'
                },
                hangman: {
                    restart: 'r'
                },
                asteroids: {
                    moveLeft: 'ArrowLeft',
                    moveRight: 'ArrowRight',
                    thrust: 'ArrowUp',
                    fire: ' ', // Space
                    pause: 'p'
                }
            }
        };
        
        // Save default settings
        localStorage.setItem('projectKataPreferences', JSON.stringify(defaultSettings));
        return defaultSettings;
    }
}

// Get key bindings for a specific game
function getKeyBindings(game) {
    const settings = loadGameSettings();
    return settings.keyBindings[game] || {};
}

// Prevent scrolling with arrow keys
function preventArrowKeyScrolling() {
    window.addEventListener('keydown', function(e) {
        // Prevent default behavior for arrow keys and space
        if([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
            e.preventDefault();
        }
    });
}
