// This script serves as a compatibility layer for browsers that don't support ES modules
// It will automatically be used as a fallback if module loading fails

console.log("Module adapter script loaded");

// Set this flag to true to prevent the fallback mechanism from loading spaceinvaders.js
window.gameModulesLoaded = true;

document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM Content Loaded in adapter script");
    
    // Get DOM elements
    const canvas = document.getElementById('invaders-board');
    const ctx = canvas.getContext('2d');
    const startButton = document.getElementById('start-button');
    
    // Show a message on the canvas
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Module loading issue detected", canvas.width/2, 50);
    ctx.fillText("Will automatically load original game version on start", canvas.width/2, 80);
    
    // Load the original script when the start button is clicked
    startButton.addEventListener('click', function() {
        // Reset any previous content
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = "#FFFFFF";
        ctx.textAlign = "center";
        ctx.fillText("Loading game...", canvas.width/2, canvas.height/2);
        
        // Load the original script
        const script = document.createElement('script');
        script.src = 'spaceinvaders.js';
        script.onload = function() {
            console.log("Original spaceinvaders.js loaded successfully");
        };
        script.onerror = function() {
            console.error("Failed to load spaceinvaders.js");
            ctx.fillStyle = "#000000";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "#FF0000";
            ctx.fillText("Error loading game", canvas.width/2, canvas.height/2);
        };
        document.body.appendChild(script);
    });
}); 