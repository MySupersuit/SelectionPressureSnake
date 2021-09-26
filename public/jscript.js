// GAME_PIXEL_COUNT is the pixels on horizontal or vertical axis of the game board (SQUARE).
const GAME_PIXEL_COUNT = 40;
const SQUARE_OF_GAME_PIXEL_COUNT = Math.pow(GAME_PIXEL_COUNT, 2);
const WIDTH = 40;
const HEIGHT = 15;
// forbidden due to the background image covering these pixels
const forbiddenFoodLocs = [317,318,319,320,
                           357,358,359,360,
                           397,398,399,400,
                           432,433,434,435,436,437,438,439,440,
                           471,472,473,474,475,476,477,478,479,480,
                           511,512,513,514,515,516,517,518,519,520,
                           549,550,551,552,552,553,554,555,556,557,558,559,560];

var totalFoodAte = 0;
var intervalID;
let totalDistanceTravelled = 0;
let changingDirection = false;
var scoreTarget = 50;
var won = false;

/// THE GAME BOARD:
const gameContainer = document.getElementById("gameContainer");

const createGameBoardPixels = () => {
  for (let i = 1; i <= (WIDTH*HEIGHT); ++i) {
    gameContainer.innerHTML = `${gameContainer.innerHTML} <div class="gameBoardPixel" id="pixel${i}"></div>`
  }
  document.getElementById("mainGameContainer").style.display = "inline-block";
};

// This variable always holds the updated array of game pixels created by createGameBoardPixels() :
const gameBoardPixels = document.getElementsByClassName("gameBoardPixel");

/// THE FOOD:
let currentFoodPostion = 0;
const createFood = () => {
  // Remove previous food;
  gameBoardPixels[currentFoodPostion].classList.remove("food");

  // Create new food
  currentFoodPostion = Math.random();
  currentFoodPostion = Math.floor(
    // currentFoodPostion * SQUARE_OF_GAME_PIXEL_COUNT
    currentFoodPostion * (WIDTH*HEIGHT)
  );
  while (gameBoardPixels[currentFoodPostion].classList.contains("snakeBodyPixel") ||
                forbiddenFoodLocs.includes(currentFoodPostion) || currentFoodPostion > 560) {
    currentFoodPostion = Math.random();
    currentFoodPostion = Math.floor(currentFoodPostion * (WIDTH*HEIGHT));
  }
  console.log(currentFoodPostion);

  gameBoardPixels[currentFoodPostion].classList.add("food");
};

/// THE SNAKE:

// Direction codes (Keyboard key codes for arrow keys):
const LEFT_DIR = 37;
const UP_DIR = 38;
const RIGHT_DIR = 39;
const DOWN_DIR = 40;
const W = 87;
const A = 65;
const S = 83;
const D = 68; 


// Set snake direction initially to right
var snakeCurrentDirection = RIGHT_DIR;

const changeDirection = (newDirectionCode) => {
  if (changingDirection) return;
  changingDirection = true;
  // Change the direction of the snake
  if (newDirectionCode == snakeCurrentDirection) return;

  if ((newDirectionCode == LEFT_DIR && snakeCurrentDirection != RIGHT_DIR) || (newDirectionCode == A && snakeCurrentDirection != RIGHT_DIR)) {
    snakeCurrentDirection = LEFT_DIR;
  } else if (newDirectionCode == UP_DIR && snakeCurrentDirection != DOWN_DIR || (newDirectionCode == W && snakeCurrentDirection != DOWN_DIR)) {
    snakeCurrentDirection = UP_DIR;
  } else if (
    (newDirectionCode == RIGHT_DIR &&
    snakeCurrentDirection != LEFT_DIR) || (newDirectionCode == D && snakeCurrentDirection != LEFT_DIR)
  ) {
    snakeCurrentDirection = RIGHT_DIR;
  } else if ((newDirectionCode == DOWN_DIR && snakeCurrentDirection != UP_DIR) || (newDirectionCode == S && snakeCurrentDirection != UP_DIR)) {
    snakeCurrentDirection = DOWN_DIR;
  }
};

// Let the starting position of the snake be at the middle of game board
// let currentSnakeHeadPosition = SQUARE_OF_GAME_PIXEL_COUNT / 2;
var currentSnakeHeadPosition = (WIDTH*HEIGHT) / 2;
// let currentSnakeHeadPosition = 786;

// Initial snake length
var snakeLength = 500;

// Move snake continously by calling this function repeatedly :
const moveSnake = () => {
  changingDirection = false;
  switch (snakeCurrentDirection) {
    case LEFT_DIR:
      --currentSnakeHeadPosition;
      const isSnakeHeadAtLastGameBoardPixelTowardsLeft =
        currentSnakeHeadPosition % WIDTH == WIDTH - 1 ||
        currentSnakeHeadPosition < 0;
      if (isSnakeHeadAtLastGameBoardPixelTowardsLeft) {
        currentSnakeHeadPosition = currentSnakeHeadPosition + WIDTH;
      }
      break;
    case UP_DIR:
      currentSnakeHeadPosition = currentSnakeHeadPosition - WIDTH;
      const isSnakeHeadAtLastGameBoardPixelTowardsUp =
        currentSnakeHeadPosition < 0;
      if (isSnakeHeadAtLastGameBoardPixelTowardsUp) {
        currentSnakeHeadPosition =
          currentSnakeHeadPosition + (WIDTH*HEIGHT);
      }
      break;
    case RIGHT_DIR:
      ++currentSnakeHeadPosition;
      const isSnakeHeadAtLastGameBoardPixelTowardsRight =
        currentSnakeHeadPosition % WIDTH == 0;
      if (isSnakeHeadAtLastGameBoardPixelTowardsRight) {
        currentSnakeHeadPosition = currentSnakeHeadPosition - WIDTH;
      }
      break;
    case DOWN_DIR:
      currentSnakeHeadPosition = currentSnakeHeadPosition + WIDTH;
      const isSnakeHeadAtLastGameBoardPixelTowardsDown =
        currentSnakeHeadPosition > (WIDTH*HEIGHT) - 1;
      if (isSnakeHeadAtLastGameBoardPixelTowardsDown) {
        currentSnakeHeadPosition =
          currentSnakeHeadPosition - (WIDTH*HEIGHT);
      }
      break;
    default:
      break;
  }

  let nextSnakeHeadPixel = gameBoardPixels[currentSnakeHeadPosition];

  // Kill snake if it bites itself:
  if (nextSnakeHeadPixel.classList.contains("snakeBodyPixel")) {
    // Stop moving the snake
    clearInterval(moveSnakeInterval);
    toggleGameOver();
  }

  nextSnakeHeadPixel.classList.add("snakeBodyPixel");

  setTimeout(() => {
    nextSnakeHeadPixel.classList.remove("snakeBodyPixel");
  }, snakeLength);

  if (currentSnakeHeadPosition == currentFoodPostion) {
    // Update total food ate
    totalFoodAte++;
    // Update in UI:
    let newPoint = ""+totalFoodAte;
    if (totalFoodAte <= scoreTarget) {
      newPoint += "/"+scoreTarget;
    }
    document.getElementById("pointsEarned").innerHTML = newPoint;
    if (totalFoodAte == scoreTarget) {
      won = true;
      document.getElementById("playpause").style["color"] = "#ffffff";
      document.getElementById("playpause").style.animation = "glowing 1300ms infinite";
      document.getElementById("buttonSpan").innerHTML = '<i class="fa fa-play"></i>';
    }

    // Increase Snake length:
    snakeLength = snakeLength + 100;
    createFood();
  }
};

const toggleGameOver = () => {
  var elem = document.getElementById("gameover");
  if (elem.style.display != "block") elem.style.display = "block";
  else elem.style.display = "none";

  document.getElementById("gameOverH1").innerHTML = "GAME OVER :(<br>YA GOT " + totalFoodAte + 
  ((totalFoodAte==1) ? " POINT" : " POINTS");
}

const togglePlay = () => {

  if (won == false && totalFoodAte < scoreTarget) return;

  var elem = document.getElementById("buttonSpan");
  if (elem.innerHTML == '<i class="fa fa-pause"></i>') {
    elem.innerHTML = '<i class="fa fa-play"></i>'
    stopMusic();
  }
  else {
    elem.innerHTML = '<i class="fa fa-pause"></i>'
    playMusic();
  }
}

const toggleLeaderboard = () => {
  var leaderboardElem = document.getElementById("leaderboardDiv");
  var gameElem = document.getElementById("mainGameContainer");
  var scoreElem = document.getElementById("scoreContainer");
  var loaderElem = document.getElementById("loader");
  loaderElem.style.display = "block";
  if (leaderboardElem.style.display != "block") {
    leaderboardElem.style.display = "block";
    gameElem.style.display = "none";
    scoreElem.style.display = "none";
    getLeaderboard(loaderElem);
    document.getElementById("submit_conf").innerHTML = "";
  } else {
    loaderElem.style.display = "none";
    leaderboardElem.style.display = "none";
    gameElem.style.display = "inline-block";
    document.getElementById("lboardBody").innerHTML = "";
    scoreElem.style.display = "flex";
  }
  
}

const getLeaderboard = (loaderElem) => {
  fetch("https://selection-pressure.herokuapp.com/read")
    .then((resp) => resp.json())
    .then(function(data) {
      let table = document.getElementById("lboardBody");
      let pos = 1;
      data.forEach( item => {
        let row = table.insertRow();
        let position = row.insertCell(0);
        position.innerHTML = pos;

        let name = row.insertCell(1);
        name.innerHTML = item.name;

        let score = row.insertCell(2);
        score.innerHTML = item.score;

        pos++;
      });
      loaderElem.style.display = "none";
    }).catch(function(err) {
      console.log(err);
    });
}

const playMusic = () => {
  console.log("playing music");
  document.getElementById("music").play();
}

const stopMusic = () => {
  document.getElementById("music").pause();
}

const restart = () => {
  toggleGameOver();
  currentSnakeHeadPosition = (WIDTH*HEIGHT) / 2;
  snakeLength = 500;
  snakeCurrentDirection = RIGHT_DIR;
  createFood();
  moveSnakeInterval = setInterval(moveSnake, 80);
  totalFoodAte = 0;
  if (won == false) {
    document.getElementById("playpause").style.animation = "none";
    document.getElementById("pointsEarned").innerHTML = totalFoodAte +"/"+scoreTarget;
  }
}

function submitScore() {
  let score = totalFoodAte;
  let name = document.getElementById("submit_name").value;
  shortenedName = name.substring(0,13);
  if (name != shortenedName) {
    name = shortenedName + "...";
  }
  let url = "https://selection-pressure.herokuapp.com/write/" + name + "/" + score;
  fetch(url)
    .then(function() {
      document.getElementById("submit_conf").innerHTML = "SUBMITTED!";
      document.getElementById("submit_name").value = "";
    });
}

/// CALL THE FOLLOWING FUNCTIONS TO RUN THE GAME:

// Create game board pixels:
createGameBoardPixels();

// Create initial food:
createFood();

document.getElementById("pointsEarned").innerHTML = "0/"+scoreTarget;

// Move snake:
var moveSnakeInterval = setInterval(moveSnake, 80);

// Call change direction function on keyboard key-down event:
addEventListener("keydown", (e) => changeDirection(e.keyCode));

// ON SCREEN CONTROLLERS:
const leftButton = document.getElementById("leftButton");
const rightButton = document.getElementById("rightButton");
const upButton = document.getElementById("upButton");
const downButton = document.getElementById("downButton");

leftButton.onclick = () => changeDirection(LEFT_DIR);
rightButton.onclick = () => changeDirection(RIGHT_DIR);
upButton.onclick = () => changeDirection(UP_DIR);
downButton.onclick = () => changeDirection(DOWN_DIR);
