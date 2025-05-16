// Space Invaders - Main Game File (No Module Version)
console.log("No-module version loading");

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Content Loaded event fired in non-module script");
    
    // If modules already loaded, don't run this
    if (window.gameModulesLoaded) {
        console.log("Modules already loaded, skipping non-module version");
        return;
    }
    
    console.log("Using non-module fallback");
    
    try {
        // Get the canvas and context
        const canvas = document.getElementById('invaders-board');
        console.log("Canvas element found:", canvas);
        const ctx = canvas.getContext('2d');
        
        // Show a message indicating we're using the fallback
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "20px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Using original Space Invaders implementation", canvas.width/2, 50);
        ctx.fillText("Click Start Game to play", canvas.width/2, 80);
        
        // Get Start button
        const startButton = document.getElementById('start-button');
        
        // Redirect to use the original script
        startButton.addEventListener('click', function() {
            console.log("Start button clicked in non-module version");
            
            // Load the original script
            const originalScript = document.createElement('script');
            originalScript.src = 'spaceinvaders.js';
            document.body.appendChild(originalScript);
            
            console.log("Original script loaded");
        });
    } catch (error) {
        console.error("Error in non-module initialization:", error);
    }
}); 