// Get canvas and context
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Set up game constants
const box = 20; // size of each grid box (snake and food)
const canvasSize = canvas.width;

// Initial game variables
let snake = [{ x: 9 * box, y: 9 * box }];
let direction = "RIGHT";
let food = generateFood();
let score = 0;
let bestScore = parseInt(localStorage.getItem("bestScore")) || 0; // Load best score from localStorage, default 0
let gameSpeed = 90; // milliseconds (lower is faster)
let gameInterval;
let speedIncreaseRate = 5; // Increase speed every N points
let speedReductionRate = 2; // Reduce speed after each speed-up
let lastFoodTime = 0; // Time when the food was last generated
let powerUp = null;

// Sounds
const eatSound = new Audio('eat-sound.mp3');
const gameOverSound = new Audio('game-over.mp3');

// Control the snake with keyboard events
document.addEventListener("keydown", directionControl);

function directionControl(event) {
    if (event.keyCode === 37 && direction !== "RIGHT") {
        direction = "LEFT";
    } else if (event.keyCode === 38 && direction !== "DOWN") {
        direction = "UP";
    } else if (event.keyCode === 39 && direction !== "LEFT") {
        direction = "RIGHT";
    } else if (event.keyCode === 40 && direction !== "UP") {
        direction = "DOWN";
    }
}

// Generate food at random positions
function generateFood() {
    return {
        x: Math.floor(Math.random() * 20) * box,
        y: Math.floor(Math.random() * 20) * box,
    };
}

// Generate random power-ups
function generatePowerUp() {
    return {
        x: Math.floor(Math.random() * 20) * box,
        y: Math.floor(Math.random() * 20) * box,
        type: Math.random() < 0.5 ? "SPEED" : "SCORE"
    };
}

// Update the game state
function updateGame() {
    let snakeHead = { x: snake[0].x, y: snake[0].y };

    if (direction === "LEFT") snakeHead.x -= box;
    if (direction === "RIGHT") snakeHead.x += box;
    if (direction === "UP") snakeHead.y -= box;
    if (direction === "DOWN") snakeHead.y += box;

    // Check for food collision
    if (snakeHead.x === food.x && snakeHead.y === food.y) {
        food = generateFood();
        score++;
        eatSound.play();
        if (score % speedIncreaseRate === 0) {
            gameSpeed = Math.max(50, gameSpeed - speedReductionRate); // reduce speed gradually
            clearInterval(gameInterval);
            gameInterval = setInterval(updateGame, gameSpeed); // Restart the game loop at the new speed
        }
    } else {
        snake.pop(); // Remove tail
    }

    // Check for power-up collision
    if (powerUp && snakeHead.x === powerUp.x && snakeHead.y === powerUp.y) {
        if (powerUp.type === "SPEED") {
            gameSpeed = Math.max(50, gameSpeed - 30); // Boost speed temporarily
            clearInterval(gameInterval);
            gameInterval = setInterval(updateGame, gameSpeed);
        } else if (powerUp.type === "SCORE") {
            score += 2; // Double score for the next food
        }
        powerUp = null; // Remove the power-up
    }

    // Add new head
    snake.unshift(snakeHead);

    // Check for collisions with walls or self
    if (snakeHead.x < 0 || snakeHead.x >= canvasSize || snakeHead.y < 0 || snakeHead.y >= canvasSize || collisionWithSelf(snakeHead)) {
        gameOver();
    }

    // Randomly generate a power-up every 20 seconds
    if (Date.now() - lastFoodTime > 20000) {
        powerUp = generatePowerUp();
        lastFoodTime = Date.now();
    }

    // Redraw the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawSnake();
    drawFood();
    drawScore();
    if (powerUp) {
        drawPowerUp();
    }
}

// Check if the snake collides with itself
function collisionWithSelf(head) {
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    return false;
}

// Draw the snake
function drawSnake() {
    snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? "#00FF00" : "#00CC00"; // Green head, darker green body
        ctx.fillRect(segment.x, segment.y, box, box);
    });
}

// Draw the food
function drawFood() {
    ctx.fillStyle = "#FF0000"; // Red food
    ctx.fillRect(food.x, food.y, box, box);
}

// Draw power-up (if present)
function drawPowerUp() {
    if (powerUp) {
        ctx.fillStyle = powerUp.type === "SPEED" ? "#FF4500" : "#FFD700"; // Orange for speed, gold for score
        ctx.fillRect(powerUp.x, powerUp.y, box, box);
    }
}

// Draw the score
function drawScore() {
    document.getElementById("scoreText").innerText = `Score: ${score}`;
    document.getElementById("bestScoreText").innerText = `Best Score: ${bestScore}`;
}

// End the game
function gameOver() {
    gameOverSound.play();
    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem("bestScore", bestScore); // Save the new best score to localStorage
    }
    clearInterval(gameInterval);
    document.getElementById("restartBtn").style.display = "block"; // Show restart button
}

// Restart the game
document.getElementById("restartBtn").addEventListener("click", () => {
    snake = [{ x: 9 * box, y: 9 * box }];
    direction = "RIGHT";
    food = generateFood();
    score = 0;
    gameSpeed = 90;
    document.getElementById("restartBtn").style.display = "none";
    powerUp = null; // Reset power-up
    gameInterval = setInterval(updateGame, gameSpeed); // Restart game loop
});

// Start the game loop
gameInterval = setInterval(updateGame, gameSpeed);
