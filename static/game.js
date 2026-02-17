const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreElement = document.getElementById("score");
const highScoreElement = document.getElementById("high-score");
const overlay = document.getElementById("overlay");
const statusText = document.getElementById("status-text");

let box = 20;
let snake = [{ x: 200, y: 200 }];
let direction = "RIGHT";
let nextDirection = "RIGHT";
let score = 0;
let highScore = localStorage.getItem("snakeHighScore") || 0;
let gameInterval;
let gameRunning = false;

highScoreElement.innerText = `BEST: ${highScore}`;

let food = getRandomFood();

document.addEventListener("keydown", setDirection);

function getRandomFood() {
  return {
    x: Math.floor(Math.random() * (canvas.width / box)) * box,
    y: Math.floor(Math.random() * (canvas.height / box)) * box
  };
}

function setDirection(event) {
  const key = event.keyCode;
  if (key === 37 && direction !== "RIGHT") nextDirection = "LEFT";
  else if (key === 38 && direction !== "DOWN") nextDirection = "UP";
  else if (key === 39 && direction !== "LEFT") nextDirection = "RIGHT";
  else if (key === 40 && direction !== "UP") nextDirection = "DOWN";
}

function startGame() {
  // Reset Game State
  snake = [{ x: 100, y: 100 }];
  direction = "RIGHT";
  nextDirection = "RIGHT";
  score = 0;
  scoreElement.innerText = "SCORE: 0";
  overlay.style.display = "none";
  gameRunning = true;
  
  if(gameInterval) clearInterval(gameInterval);
  gameInterval = setInterval(draw, 250); // Slightly faster for better feel
}

function draw() {
  direction = nextDirection;
  
  // Clear Canvas with a slight trail effect
  ctx.fillStyle = "rgba(0, 0, 0, 0.3)"; 
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw Food with Glow
  ctx.shadowBlur = 15;
  ctx.shadowColor = "#ff00ff";
  ctx.fillStyle = "#ff00ff";
  ctx.beginPath();
  ctx.arc(food.x + box/2, food.y + box/2, box/2 - 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0; // Reset blur for other elements

  // Draw Snake
  snake.forEach((segment, index) => {
    const isHead = index === 0;
    ctx.shadowBlur = isHead ? 20 : 10;
    ctx.shadowColor = "#0ff";
    ctx.fillStyle = isHead ? "#0ff" : "rgba(0, 255, 255, 0.5)";
    
    // Draw rounded segments
    ctx.beginPath();
    ctx.roundRect(segment.x + 1, segment.y + 1, box - 2, box - 2, 5);
    ctx.fill();
  });
  ctx.shadowBlur = 0;

  let snakeX = snake[0].x;
  let snakeY = snake[0].y;

  if (direction === "LEFT") snakeX -= box;
  if (direction === "UP") snakeY -= box;
  if (direction === "RIGHT") snakeX += box;
  if (direction === "DOWN") snakeY += box;

  // Food Collision
  if (snakeX === food.x && snakeY === food.y) {
    score++;
    scoreElement.innerText = "SCORE: " + score;
    food = getRandomFood();
  } else {
    snake.pop();
  }

  const newHead = { x: snakeX, y: snakeY };

  // Game Over Logic
  if (
    snakeX < 0 || snakeY < 0 ||
    snakeX >= canvas.width || snakeY >= canvas.height ||
    collision(newHead, snake)
  ) {
    gameOver();
    return;
  }

  snake.unshift(newHead);
}

function collision(head, array) {
  return array.some(segment => segment.x === head.x && segment.y === head.y);
}

function gameOver() {
  clearInterval(gameInterval);
  gameRunning = false;
  
  if (score > highScore) {
    highScore = score;
    localStorage.setItem("snakeHighScore", highScore);
    highScoreElement.innerText = `BEST: ${highScore}`;
  }
  
  statusText.innerText = "MISSION FAILED";
  overlay.style.display = "flex";
}