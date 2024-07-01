let highScore;
document.addEventListener("DOMContentLoaded", function () {
  sendAnalytics('startGame', null);

  const rocketSound = new Audio("rocket.flac");
  const pointsSound = new Audio("points.wav");
  const gameOverSound = new Audio("over.wav");

  const player = document.getElementById("player");
  const gameContainer = document.getElementById("game-container");
  const fallingImages = [];
  const preloadedPlayerFrames = [];
  const preloadedFallingImageFrames = [];
  const preloadedBackgroundFrames = [];


  let touchDirection = 0;
  let arrowDirection = 0;
  const playerSpeed = 5; // Adjust the speed as needed
  const fallingImageSpeed = 30;
  const numberOfFallingImages = 1;
  const backgroundFrameSpeed = 30
  const playerFrameSpeed = 20;
  const highScoreElement = document.getElementById("high-score");

   let score = 0;
   const scoreElement = document.getElementById("score");
   const gameOverScreen = document.getElementById("game-over");
   const finalScoreElement = document.getElementById("final-score");
   const resetButton = document.getElementById("reset-button");

  function updateScore() {
    scoreElement.textContent = "Score: " + score;
  }

    // Create collision text element
  const collisionText = document.createElement("div");
  collisionText.style.position = "absolute";
  collisionText.style.top = "20px";
  collisionText.style.left = "50%";
  collisionText.style.transform = "translateX(-50%)";
  collisionText.style.fontSize = "24px";
  collisionText.style.color = "red";
  collisionText.style.zIndex = "9999";
  document.body.appendChild(collisionText);
  // Initialize high score
  highScore = localStorage.getItem("highScore") || 0;
  highScoreElement.textContent = "High Score: " + highScore;


// Preload boss frames
function preloadBossFrames() {
  const bossFrameCount = 100;
  const bossBaseUrl = "https://raw.githubusercontent.com/Benedict0530/RocketGame-Assets/main/boss%20(";

  for (let i = 1; i <= bossFrameCount; i++) {
    const img = new Image();
    img.src = `${bossBaseUrl}${i}).png`;
    preloadedBossFrames.push(img);
  }
}

// Initialize boss image
const boss = document.createElement("img");
initializeBoss(boss);
document.body.appendChild(boss);

function initializeBoss(boss) {
  const bossSizePercentage = 1; // 80% of the screen size
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  const bossSize = Math.min(screenWidth, screenHeight) * bossSizePercentage;
  const initialBossLeft = Math.random() * (screenWidth - bossSize);
  const initialBossTop = -90; // Set the initial top position to 0

  boss.style.width = bossSize + "px";
  boss.style.height = bossSize + "px";
  boss.style.position = "absolute";
  boss.style.left = initialBossLeft + "px";
  boss.style.top = initialBossTop + "px";
}






// Preload boss frames
const preloadedBossFrames = [];
preloadBossFrames();

// Animate boss image
function animateBoss() {
  const bossFrameCount = 100;
  let currentBossFrame = Math.floor((performance.now() / bossFrameSpeed) % bossFrameCount);
  boss.src = preloadedBossFrames[currentBossFrame].src;
  requestAnimationFrame(animateBoss);
}

// Adjust the bossFrameSpeed variable accordingly
const bossFrameSpeed = 20;

// Call animateBoss to start the animation loop
animateBoss();

  // Preload player frames
function preloadPlayerFrames() {
  const playerFrameCount = 61;
  const playerBaseUrl = "https://raw.githubusercontent.com/Benedict0530/RocketGame-Assets/main/player%20(";

  for (let i = 1; i <= playerFrameCount; i++) {
    const img = new Image();
    img.src = `${playerBaseUrl}${i}).png`;
    preloadedPlayerFrames.push(img);
  }
}

preloadPlayerFrames();


  // Preload falling images frames
  function preloadFallingImageFrames() {
    const fallingImageFrameCount = 33;
    const fallingImageBaseUrl = "https://raw.githubusercontent.com/Benedict0530/RocketGame-Assets/main/";

    for (let i = 0; i < fallingImageFrameCount; i++) {
      const frameIndex = i < 10 ? `0${i}` : i;
      const img = new Image();
      img.src = `${fallingImageBaseUrl}frame_${frameIndex}_delay-0.png`;
      preloadedFallingImageFrames.push(img);
    }
  }

  preloadFallingImageFrames();


  // Preload background frames
  function preloadBackgroundFrames() {
    const backgroundFrameCount = 45;
    const backgroundBaseUrl = "https://raw.githubusercontent.com/Benedict0530/RocketGame-Assets/main/background%20(";

    for (let i = 1; i <= backgroundFrameCount; i++) {
      const img = new Image();
      img.src = `${backgroundBaseUrl}${i}).png`;
      preloadedBackgroundFrames.push(img);
    }
  }

  preloadBackgroundFrames();

      const allImages = [...preloadedPlayerFrames, ...preloadedFallingImageFrames, ...preloadedBackgroundFrames, ...preloadedBossFrames];

        function areAllImagesLoaded() {
          return allImages.every(image => image.complete);
        }

        function hidePreloader() {
          const preloader = document.getElementById("preloader");
          preloader.style.display = "none";
        }



  // Listen for touch start event
  document.addEventListener("touchstart", function (event) {
    const touchX = event.touches[0].clientX;

    if (touchX < window.innerWidth / 2) {
      touchDirection = -10;
    } else {
      touchDirection = 10;
    }
  });

  // Listen for touch end event
  document.addEventListener("touchend", function () {
    touchDirection = 0;
  });

  // Listen for arrow key down event
  document.addEventListener("keydown", function (event) {
    if (event.key === "ArrowLeft") {
      arrowDirection = -5;
    } else if (event.key === "ArrowRight") {
      arrowDirection = 5;
    }
  });

  // Listen for arrow key up event
  document.addEventListener("keyup", function (event) {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      arrowDirection = 0;
    }
  });

  // Move player based on input and animate player frames
  function animate() {
       if (collisionHandler.gameOver) {
          return; // Exit the animation loop if the game is over
        }

    movePlayer();
    animatePlayer();
    checkCollisions();
    moveFallingImages();
    animateBackground();
    requestAnimationFrame(animate);
  }

  // Move player based on input
function movePlayer() {
  const currentPosition = parseInt(player.style.left) || 0;
  const deltaX = (touchDirection + arrowDirection) * playerSpeed;

  // Calculate the maximum allowed positions considering the game container's boundaries
  const maxLeftPosition = 50; // Set the maximum allowed left position
  const maxRightPosition = gameContainer.offsetWidth - 50; // Set the maximum allowed right position

  // Calculate the new position while ensuring it stays within the specified boundaries
  const newPosition = Math.min(Math.max(currentPosition + deltaX, maxLeftPosition), maxRightPosition);

  player.style.left = newPosition + "px";
}




  // Animate player frames
 function animatePlayer() {
    const playerFrameCount = 61;
    let currentFrame = (performance.now() / playerFrameSpeed) % playerFrameCount;
    player.src = preloadedPlayerFrames[Math.floor(currentFrame)].src;
  }


  function animateBackground() {
    const backgroundFrameCount = 45;
    let currentFrame = (performance.now() / backgroundFrameSpeed) % backgroundFrameCount;
    gameContainer.style.backgroundImage = `url('${preloadedBackgroundFrames[Math.floor(currentFrame)].src}')`;
    gameContainer.style.backgroundSize = "cover"; // Ensure the background covers the entire container
  }

// Check for collisions between player and falling images (with a 50px offset on all sides)
function checkCollisions() {
  const playerRect = player.getBoundingClientRect();
  const offset = 75;

  fallingImages.forEach(function (image) {
    const imageRect = image.getBoundingClientRect();

    if (
      playerRect.top + offset < imageRect.bottom &&
      playerRect.bottom - offset > imageRect.top &&
      playerRect.left + offset < imageRect.right &&
      playerRect.right - offset > imageRect.left
    ) {
      collisionHandler.handleCollision();
      updateHighScore(); // Call the function to update and display the high score
    }
  });
}


function updateHighScore() {
  // Get the previous high score from local storage
  const storedHighScore = localStorage.getItem("highScore");

  // Parse the stored high score as an integer
  const previousHighScore = parseInt(storedHighScore) || 0;

  // Check if the current score is higher than the previous high score
  const isNewHighScore = score > previousHighScore;

  // Update the high score if it's a new high score
  if (isNewHighScore) {
    localStorage.setItem("highScore", score);
    highScore = score;
    sendAnalytics('newHighScore',null);
  } else {
    highScore = previousHighScore;
  }

  // Display the appropriate text based on whether it's a new high score
  const highScoreDisplay = document.getElementById("high-score");
  highScoreDisplay.textContent = isNewHighScore ? "New High Score: " + highScore : "High Score: " + highScore;
}





  class CollisionHandler {
  constructor() {
    this.collisionText = document.createElement("div");
    this.collisionText.style.position = "absolute";
    this.collisionText.style.top = "20px";
    this.collisionText.style.left = "50%";
    this.collisionText.style.transform = "translateX(-50%)";
    this.collisionText.style.fontSize = "24px";
    this.collisionText.style.color = "red";
    this.collisionText.style.zIndex = "9999";
    document.body.appendChild(this.collisionText);

    this.gameOverScreen = gameOverScreen;
    this.finalScoreElement = finalScoreElement;
    this.collisionTimeout = null;
    this.gameOver = false;
  }

  handleCollision() {


    // Check if there is a collision timeout already running
    if (!this.collisionTimeout && !this.gameOver) {
      // Set a timeout only if there is no collision timeout running
      this.collisionTimeout = setTimeout(() => {
        this.collisionText.textContent = "";
        this.collisionTimeout = null; // Reset the collision timeout

        // Show game over screen
        this.gameOverScreen.style.display = "block";
        this.finalScoreElement.textContent = score;
        updateScore();
        // Set the game over flag
        this.gameOver = true;
        playGameOverSound();
      }, 20);
    }
  }

}


      const collisionHandler = new CollisionHandler();



  // Load all frames for each falling image
  for (let i = 0; i < numberOfFallingImages; i++) {
    const image = document.createElement("img");
    initializeFallingImage(image);
    fallingImages.push(image);
    document.body.appendChild(image);
     image.classList.add("falling-image");
  }


function initializeFallingImage(image) {
  const fallingImageFrameCount = 33;

  const imageSize = 150;

  // Get boss's position and size
  const bossRect = boss.getBoundingClientRect();
  const bossTop = bossRect.top;
  const bossHeight = bossRect.height;

  // Calculate the initial position randomly with a 30px distance from each other
  const initialLeft = Math.random() * (window.innerWidth - imageSize);
  const initialTop = bossTop + bossHeight / 2 + imageSize / 4; // Adjust the value to control the height

  image.style.width = imageSize + "px";
  image.style.height = imageSize + "px";
  image.style.position = "absolute";
  image.style.left = initialLeft+5 + "px";
  image.style.top = initialTop +5+ "px";

  let currentFrame = Math.floor(Math.random() * fallingImageFrameCount);

  function nextFrame() {
    image.src = preloadedFallingImageFrames[currentFrame].src;
    currentFrame = (currentFrame + 1) % fallingImageFrameCount;
    setTimeout(nextFrame, 100);
  }

  nextFrame();
  playRocketSound();
}

// Move falling images
function moveFallingImages() {
  fallingImages.forEach(function (image) {
    const currentPosition = parseInt(getComputedStyle(image).top);
    const newPosition = currentPosition + fallingImageSpeed; // Adjust the falling image speed here

    if (newPosition <= window.innerHeight) {
      image.style.top = newPosition + "px";
    } else {
      initializeFallingImage(image);

      score += 1;
      playPointsSound();
      updateScore();
      // Check if the score is a multiple of 100
      if (score % 100 === 0) {
        // Increase the number of falling images
        increaseFallingImages();
      }
    }
  });
}

// Function to increase the number of falling images
function increaseFallingImages() {
  // Adjust the number of falling images as needed
  const newNumberOfFallingImages = numberOfFallingImages + 1;

  // Create and initialize new falling images
  for (let i = 0; i < newNumberOfFallingImages; i++) {
    const image = document.createElement("img");
    initializeFallingImage(image);
    fallingImages.push(image);
    document.body.appendChild(image);
    image.classList.add("falling-image");
  }
}

 resetButton.addEventListener("click", function () {
        resetGame();
        stopGameOverSound();
        playPointsSound();
        sendAnalytics('Finished a game', null);
      });

      function resetGame() {
  // Reset variables
  score = 0;
  updateScore();
  collisionHandler.gameOver = false;

  // Clear existing falling images from the DOM
  fallingImages.forEach(function (image) {
    document.body.removeChild(image);
  });

  // Empty the fallingImages array
  fallingImages.length = 0;

  // Hide game over screen
  gameOverScreen.style.display = "none";

  // Reinitialize falling images
  for (let i = 0; i < numberOfFallingImages; i++) {
    const image = document.createElement("img");
    initializeFallingImage(image);
    fallingImages.push(image);
    document.body.appendChild(image);
    image.classList.add("falling-image");
  }
checkImageLoading();

}



  function checkImageLoading() {
    if (areAllImagesLoaded()) {
      hidePreloader();
      animate();
    } else {
      setTimeout(checkImageLoading, 100);
    }
  }

  // Start the animation loop only when all images are loaded
  checkImageLoading();

 function playRocketSound() {
    // Stop the audio if it's playing
    if (!rocketSound.paused) {
      rocketSound.pause();
      rocketSound.currentTime = 0; // Reset to start
    }
    // Play the sound
    rocketSound.play().catch(error => {
      console.error("Failed to play the sound:", error);
    });
  }

   function playPointsSound() {
      // Stop the audio if it's playing
      if (!pointsSound.paused) {
        pointsSound.pause();
        pointsSound.currentTime = 0; // Reset to start
      }
      // Play the sound
      pointsSound.play().catch(error => {
        console.error("Failed to play the sound:", error);
      });
    }

  function playGameOverSound() {
    // Stop the audio if it's playing
    if (!gameOverSound.paused) {
      gameOverSound.pause();
      gameOverSound.currentTime = 0; // Reset to start
    }
    // Play the sound
    gameOverSound.play().catch(error => {
      console.error("Failed to play the game-over sound:", error);
    });
  }

    function stopGameOverSound() {
      if (!gameOverSound.paused) {
        gameOverSound.pause();
        gameOverSound.currentTime = 0; // Reset to start
      }
    }

 function sendAnalytics(eventName, eventData) {
     if (eventName == null) {
         return;
     } else {
         window.jsBridge.postMessage(eventName, JSON.stringify(eventData)); // Pass eventData as a JSON string
         console.log('Event Tracked: ' + eventName);
     }
 }


});
