let selectedShip = null;
const startBtn = document.getElementById("start-btn");
const shipOptions = document.querySelectorAll(".ship-option");
const startScreen = document.getElementById("start-screen");
const gameCanvas = document.getElementById("gameCanvas");
const ctx = gameCanvas.getContext("2d");

// Ship selection logic
shipOptions.forEach(ship => {
  ship.addEventListener("click", () => {
    shipOptions.forEach(s => s.classList.remove("selected"));
    ship.classList.add("selected");
    selectedShip = ship.getAttribute("data-ship");
    console.log("Selected ship:", selectedShip);
  });
});

// Start game button
startBtn.addEventListener("click", () => {
  if (!selectedShip) {
    alert("Please select a spaceship!");
    return;
  }

  // Hide start screen and show canvas
  startScreen.style.display = "none";
  gameCanvas.style.display = "block";

  // Resize canvas to tablet size
  gameCanvas.width = 800;  // Tablet-like width
  gameCanvas.height = 600; // Tablet-like height

  startGame();
});

// === GAME START FUNCTION === //
function startGame() {
  // Create ship image
  const shipImage = new Image();
  shipImage.src = `assets/ships/ship${selectedShip}.png`;
  
  // Create asteroid image
  const asteroidImage = new Image();
  asteroidImage.src = 'assets/asteroid.png';

  // Create background music
  const backgroundMusic = new Audio('assets/space.mp3');
  backgroundMusic.loop = true; // Loop the music
  backgroundMusic.volume = 0.5; // Set volume to 50%
  
  // Start playing background music
  backgroundMusic.play().catch(error => {
    console.log('Background music failed to play:', error);
    console.log('This might be due to browser autoplay policies');
  });

  let gameRunning = true;
  let score = 0;
  let difficultyLevel = 1;

  const ship = {
    x: gameCanvas.width / 2 - 50, // Adjusted for medium ship
    y: gameCanvas.height - 140,
    width: 100, // Medium size between 80 and 160
    height: 100, // Medium size between 80 and 160
    speed: 8
  };

  const asteroids = [];
  const bullets = [];
  let spawnInterval;
  let currentSpawnRate = 1200; // Start slower, will get faster

  function spawnAsteroid() {
    if (!gameRunning) return;
    
    // Create different asteroid sizes with different point values
    const sizeType = Math.random();
    let size, pointValue;
    
    if (sizeType < 0.4) {
      // Small asteroids (40% chance)
      size = 30 + Math.random() * 20; // 30-50 pixels
      pointValue = 100;
    } else if (sizeType < 0.8) {
      // Medium asteroids (40% chance)
      size = 50 + Math.random() * 25; // 50-75 pixels
      pointValue = 200;
    } else {
      // Large asteroids (20% chance)
      size = 75 + Math.random() * 35; // 75-110 pixels
      pointValue = 500;
    }
    
    const x = Math.random() * (gameCanvas.width - size);
    asteroids.push({
      x,
      y: -size,
      width: size,
      height: size,
      speed: 2 + Math.random() * 3 + (difficultyLevel * 0.5), // Speed increases with difficulty
      pointValue: pointValue // Store point value for this asteroid
    });
  }

  function updateDifficulty() {
    // Increase difficulty every 500 points
    const newDifficultyLevel = Math.floor(score / 500) + 1;
    if (newDifficultyLevel > difficultyLevel) {
      difficultyLevel = newDifficultyLevel;
      
      // Increase spawn rate (decrease interval)
      currentSpawnRate = Math.max(400, 1200 - (difficultyLevel * 100));
      clearInterval(spawnInterval);
      spawnInterval = setInterval(spawnAsteroid, currentSpawnRate);
      
      console.log(`Difficulty increased to level ${difficultyLevel}! Spawn rate: ${currentSpawnRate}ms`);
    }
  }

  // Start spawning asteroids
  spawnInterval = setInterval(spawnAsteroid, currentSpawnRate);

  // Controls
  const keys = {};
  
  document.addEventListener('keydown', function (e) {
    keys[e.code] = true;
    
    // Shoot bullets with spacebar
    if (e.code === 'Space') {
      e.preventDefault(); // Prevent page scroll
      shootBullet();
    }
  });
  
  document.addEventListener('keyup', function (e) {
    keys[e.code] = false;
  });

  // Bullet shooting function
  function shootBullet() {
    bullets.push({
      x: ship.x + ship.width / 2 - 2.5, // Adjusted for medium ship
      y: ship.y,
      width: 5, // Slightly bigger bullets for medium ship
      height: 12,
      speed: 12
    });
  }

  // Collision detection
  function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
  }

  // Game over function
  function gameOver() {
    gameRunning = false;
    clearInterval(spawnInterval);
    
    // Stop background music
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0; // Reset to beginning
    
    // Draw game over screen
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
    
    ctx.fillStyle = '#ff0000';
    ctx.font = 'bold 48px Orbitron, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', gameCanvas.width / 2, gameCanvas.height / 2 - 50);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px Orbitron, monospace';
    ctx.fillText(`Final Score: ${score}`, gameCanvas.width / 2, gameCanvas.height / 2);
    ctx.fillText(`Difficulty Level: ${difficultyLevel}`, gameCanvas.width / 2, gameCanvas.height / 2 + 30);
    ctx.fillText('Press R to restart', gameCanvas.width / 2, gameCanvas.height / 2 + 60);
    
    // Listen for restart
    document.addEventListener('keydown', function restartHandler(e) {
      if (e.code === 'KeyR') {
        document.removeEventListener('keydown', restartHandler);
        location.reload(); // Simple restart - reload the page
      }
    });
  }

  function update() {
    if (!gameRunning) return;

    // Clear canvas (but keep wormhole background visible)
    ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

    // Update difficulty
    updateDifficulty();

    // Handle continuous key presses
    if (keys['ArrowLeft'] && ship.x > 0) {
      ship.x -= ship.speed;
    }
    if (keys['ArrowRight'] && ship.x < gameCanvas.width - ship.width) {
      ship.x += ship.speed;
    }
    if (keys['ArrowUp'] && ship.y > 0) {
      ship.y -= ship.speed;
    }
    if (keys['ArrowDown'] && ship.y < gameCanvas.height - ship.height) {
      ship.y += ship.speed;
    }

    // Update bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
      const bullet = bullets[i];
      bullet.y -= bullet.speed;

      // Remove bullets that are off screen
      if (bullet.y < 0) {
        bullets.splice(i, 1);
        continue;
      }

      // Check bullet collision with asteroids
      for (let j = asteroids.length - 1; j >= 0; j--) {
        if (checkCollision(bullet, asteroids[j])) {
          // Remove both bullet and asteroid, add points based on asteroid size
          const destroyedAsteroid = asteroids[j];
          bullets.splice(i, 1);
          asteroids.splice(j, 1);
          score += destroyedAsteroid.pointValue; // Use the asteroid's specific point value
          break;
        }
      }
    }

    // Update asteroids
    for (let i = asteroids.length - 1; i >= 0; i--) {
      const asteroid = asteroids[i];
      asteroid.y += asteroid.speed;

      // Remove asteroids that are off screen
      if (asteroid.y > gameCanvas.height) {
        asteroids.splice(i, 1);
        score += 10; // Points for surviving
        continue;
      }

      // Check collision with ship
      if (checkCollision(ship, asteroid)) {
        gameOver();
        return;
      }

      // Draw asteroid - CLEAN VERSION without borders
      ctx.save(); // Save current context state
      
      // Force the browser to wait for the image to load properly
      if (asteroidImage.complete && asteroidImage.naturalHeight !== 0 && asteroidImage.naturalWidth !== 0) {
        try {
          // Draw the actual asteroid image without any border
          ctx.drawImage(asteroidImage, asteroid.x, asteroid.y, asteroid.width, asteroid.height);
          
        } catch (error) {
          console.log('Error drawing asteroid image:', error);
          // Use fallback if image fails to draw
          drawAsteroidFallback(asteroid);
        }
      } else {
        // Fallback: draw a more asteroid-like shape
        drawAsteroidFallback(asteroid);
      }
      
      ctx.restore(); // Restore context state
    }

    // Fallback asteroid drawing function
    function drawAsteroidFallback(asteroid) {
      ctx.fillStyle = '#8B4513';
      ctx.strokeStyle = '#654321';
      ctx.lineWidth = 2;
      
      // Draw irregular asteroid shape
      ctx.beginPath();
      const centerX = asteroid.x + asteroid.width / 2;
      const centerY = asteroid.y + asteroid.height / 2;
      const radius = asteroid.width / 2;
      
      // Create jagged edges
      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 6) {
        const variance = 0.7 + Math.random() * 0.6; // Random variance for jagged edges
        const x = centerX + Math.cos(angle) * radius * variance;
        const y = centerY + Math.sin(angle) * radius * variance;
        
        if (angle === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      
      // Add some detail spots
      ctx.fillStyle = '#654321';
      ctx.beginPath();
      ctx.arc(centerX - radius * 0.3, centerY - radius * 0.2, radius * 0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(centerX + radius * 0.2, centerY + radius * 0.3, radius * 0.1, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw bullets
    ctx.fillStyle = '#00ffff';
    bullets.forEach(bullet => {
      ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
      
      // Add bullet glow effect
      ctx.shadowColor = '#00ffff';
      ctx.shadowBlur = 10;
      ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
      ctx.shadowBlur = 0; // Reset shadow
    });

    // Draw ship
    if (shipImage.complete && shipImage.naturalHeight !== 0) {
      ctx.drawImage(shipImage, ship.x, ship.y, ship.width, ship.height);
    } else {
      // Fallback: draw colored triangle/rocket shape (larger)
      ctx.fillStyle = '#00ffff';
      ctx.beginPath();
      ctx.moveTo(ship.x + ship.width / 2, ship.y); // Top point
      ctx.lineTo(ship.x, ship.y + ship.height); // Bottom left
      ctx.lineTo(ship.x + ship.width, ship.y + ship.height); // Bottom right
      ctx.closePath();
      ctx.fill();
      
      // Add some detail
      ctx.fillStyle = '#0099cc';
      ctx.fillRect(ship.x + ship.width * 0.3, ship.y + ship.height * 0.6, ship.width * 0.4, ship.height * 0.3);
    }

    // Draw UI
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px Orbitron, monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${score}`, 20, 40);
    ctx.fillText(`Asteroids: ${asteroids.length}`, 20, 70);
    ctx.fillText(`Difficulty: ${difficultyLevel}`, 20, 100);

    // Draw scoring legend
    ctx.font = '14px Orbitron, monospace';
    ctx.fillStyle = '#00ff00';
    ctx.fillText('Small: 100pts', gameCanvas.width - 200, 30);
    ctx.fillStyle = '#ffff00';
    ctx.fillText('Medium: 200pts', gameCanvas.width - 200, 50);
    ctx.fillStyle = '#ff0000';
    ctx.fillText('Large: 500pts', gameCanvas.width - 200, 70);

    // Draw instructions
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px Orbitron, monospace';
    ctx.fillText('Arrow keys: Move | Spacebar: Shoot', 20, gameCanvas.height - 40);
    ctx.fillText('Bigger asteroids = More points! Difficulty increases every 500 points', 20, gameCanvas.height - 20);

    requestAnimationFrame(update);
  }

  // Handle image loading with better error handling
  asteroidImage.onload = () => {
    console.log('Asteroid image loaded successfully from:', asteroidImage.src);
    console.log('Image dimensions:', asteroidImage.naturalWidth, 'x', asteroidImage.naturalHeight);
  };

  shipImage.onload = () => {
    console.log('Ship image loaded successfully');
  };

  // Handle image loading errors
  shipImage.onerror = () => {
    console.log('Ship image failed to load, using fallback graphics');
  };
  
  asteroidImage.onerror = () => {
    console.log('Asteroid image failed to load from:', asteroidImage.src);
    console.log('Make sure asteroid.png exists in the assets folder');
    console.log('Using fallback graphics');
  };

  // Start the game loop
  update();
}