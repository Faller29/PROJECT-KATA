// Main JavaScript for Project Kata

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const gameCards = document.querySelectorAll('.game-card');
    const settingsButton = document.getElementById('settings-button');
    const settingsModal = document.getElementById('settings-modal');
    const closeButton = document.querySelector('.close-button');
    const saveSettingsButton = document.getElementById('save-settings');
    const resetSettingsButton = document.getElementById('reset-settings');
    const tabButtons = document.querySelectorAll('.tab-button');
    const keyBindButtons = document.querySelectorAll('.key-bind-button');
    const keyBindingModal = document.getElementById('key-binding-modal');
    const cancelKeyBindingButton = document.getElementById('cancel-key-binding');
    
    // Current settings and state
    let currentPreferences = {};
    let currentKeyBindAction = null;
    
    // Simple animation for cards when page loads
    gameCards.forEach((card, index) => {
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 100 * index);
    });

    // Update game icons for better visual representation
    // This fixes any potential Font Awesome icon issues
    const snakeIcon = document.querySelector('#snake-card .game-icon i');
    if (snakeIcon && snakeIcon.classList.contains('fa-snake')) {
        snakeIcon.classList.remove('fa-snake');
        snakeIcon.classList.add('fa-worm'); // Alternative icon
    }

    // Add click sound effect to buttons
    const playButtons = document.querySelectorAll('.play-button');
    playButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Optional: Add click sound effect here
            // const clickSound = new Audio('sounds/click.mp3');
            // clickSound.play();
        });
    });
    
    // Prevent arrow key scrolling throughout the entire site
    window.addEventListener('keydown', function(e) {
        // Prevent default behavior for arrow keys
        if([37, 38, 39, 40].indexOf(e.keyCode) > -1) {
            e.preventDefault();
        }
    });
    
    // Settings Modal Event Listeners
    settingsButton.addEventListener('click', openSettingsModal);
    closeButton.addEventListener('click', closeSettingsModal);
    saveSettingsButton.addEventListener('click', saveSettings);
    resetSettingsButton.addEventListener('click', resetSettings);
    cancelKeyBindingButton.addEventListener('click', cancelKeyBinding);
    
    // Close modal when clicking outside of it
    window.addEventListener('click', function(e) {
        if (e.target === settingsModal) {
            closeSettingsModal();
        }
        if (e.target === keyBindingModal) {
            cancelKeyBinding();
        }
    });
    
    // Scaling functionality removed as requested
    
    // Tab switching
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all tabs
            tabButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Hide all binding containers
            document.querySelectorAll('.key-bindings-container').forEach(container => {
                container.classList.remove('active');
            });
            
            // Show the selected binding container
            const game = this.dataset.game;
            document.getElementById(`${game}-bindings`).classList.add('active');
        });
    });
    
    // Key binding buttons
    keyBindButtons.forEach(button => {
        button.addEventListener('click', function() {
            currentKeyBindAction = {
                game: this.dataset.game,
                action: this.dataset.action,
                button: this
            };
            openKeyBindingModal();
        });
    });
    
    // Listen for key presses when binding keys
    window.addEventListener('keydown', handleKeyBinding);

    // Check if games are ready (for future development)
    checkGamesStatus();
    
    // Load user preferences if they exist
    loadUserPreferences();
    
    // Function to open settings modal
    function openSettingsModal() {
        settingsModal.style.display = 'flex';
        updateSettingsDisplay();
    }
    
    // Function to close settings modal
    function closeSettingsModal() {
        settingsModal.style.display = 'none';
    }
    
    // Function to open key binding modal
    function openKeyBindingModal() {
        keyBindingModal.style.display = 'flex';
    }
    
    // Function to cancel key binding
    function cancelKeyBinding() {
        keyBindingModal.style.display = 'none';
        currentKeyBindAction = null;
    }
    
    // Function to handle key binding
    function handleKeyBinding(e) {
        if (!currentKeyBindAction) return;
        
        // Ignore key presses if the key binding modal is not open
        if (keyBindingModal.style.display !== 'flex') return;
        
        // Prevent default behavior
        e.preventDefault();
        
        // Get the key name
        let keyName = e.key;
        
        // Special case for space
        if (keyName === ' ') {
            keyName = 'Space';
        }
        
        // Update the button text
        currentKeyBindAction.button.textContent = keyName;
        
        // Update the preferences
        currentPreferences.keyBindings[currentKeyBindAction.game][currentKeyBindAction.action] = keyName;
        
        // Close the modal
        keyBindingModal.style.display = 'none';
        currentKeyBindAction = null;
    }
    
    // Function to update settings display
    function updateSettingsDisplay() {
        // Update key binding buttons
        keyBindButtons.forEach(button => {
            const game = button.dataset.game;
            const action = button.dataset.action;
            const key = currentPreferences.keyBindings[game][action];
            
            // Display the key name
            button.textContent = getDisplayKeyName(key);
        });
    }
    
    // Function to get display name for keys
    function getDisplayKeyName(key) {
        const keyMap = {
            'ArrowLeft': '←',
            'ArrowRight': '→',
            'ArrowUp': '↑',
            'ArrowDown': '↓',
            ' ': 'Space'
        };
        
        return keyMap[key] || key;
    }
    
    // Function to save settings
    function saveSettings() {
        // Save to localStorage
        localStorage.setItem('projectKataPreferences', JSON.stringify(currentPreferences));
        
        // Close modal
        closeSettingsModal();
        
        // Show confirmation
        alert('Settings saved successfully!');
    }
    
    // Function to reset settings
    function resetSettings() {
        if (confirm('Are you sure you want to reset all settings to default?')) {
            // Remove from localStorage
            localStorage.removeItem('projectKataPreferences');
            
            // Load default preferences
            loadUserPreferences();
            
            // Update display
            updateSettingsDisplay();
        }
    }
});

// Function to check if all games are implemented and ready
function checkGamesStatus() {
    // This function can be expanded later to dynamically check
    // if games are implemented and ready to play
    console.log('All games are ready to play!');
}

// Function to check if all games are implemented and ready
function checkGamesStatus() {
    // This function can be expanded later to dynamically check
    // if games are implemented and ready to play
    console.log('All games are ready to play!');
}

// Function to load user preferences
function loadUserPreferences() {
    // Load preferences from localStorage if they exist
    if (localStorage.getItem('projectKataPreferences')) {
        const preferences = JSON.parse(localStorage.getItem('projectKataPreferences'));
        
        // Scaling functionality removed as requested
        
        // Store preferences in the current session
        window.currentPreferences = preferences;
        
        console.log('User preferences loaded:', preferences);
    } else {
        // Set default preferences
        const defaultPreferences = {
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
                }
            }
        };
        
        // Store preferences in localStorage and current session
        localStorage.setItem('projectKataPreferences', JSON.stringify(defaultPreferences));
        window.currentPreferences = defaultPreferences;
        
        console.log('Default preferences set');
    }
}
