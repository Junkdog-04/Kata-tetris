document.addEventListener("DOMContentLoaded",function(){
  const board = document.getElementById("game-board");
const rows = 20;
const cols = 10;
const blockSize = 30;

function createBoard() {
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const block = document.createElement("div");
      block.className = "block";
      block.style.width = `${blockSize}px`;
      block.style.height = `${blockSize}px`;
      board.appendChild(block);
    }
  }
}

createBoard();

const tetrominoes = [
  // Tetromino I
  {
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    color: "cyan"
  },
  // Tetromino J
  {
    shape: [
      [0, 0, 0],
      [1, 1, 1],
      [0, 0, 1]
    ],
    color: "blue"
  },
  // Tetromino L
  {
    shape: [
      [0, 0, 0],
      [1, 1, 1],
      [1, 0, 0]
    ],
    color: "orange"
  },
  // Tetromino O
  {
    shape: [
      [1, 1],
      [1, 1]
    ],
    color: "yellow"
  },
  // Tetromino T
  {
    shape: [
      [0, 0, 0],
      [1, 1, 1],
      [0, 1, 0]
    ],
    color: "green"
  },
  // Tetromino S
  {
    shape: [
      [0, 0, 0],
      [0, 1, 1],
      [1, 1, 0]
    ],
    color: "purple"
  },
  // Tetromino Z
  {
    shape: [
      [0, 0, 0],
      [1, 1, 0],
      [0, 1, 1]
    ],
    color: "red"
  }
];




const grid = document.getElementById("game-board");
const width = 10;
const height = 20;
let cells = Array.from(grid.querySelectorAll(".block"));
const cellCount = width * height;
const scoreDisplay = document.getElementById("score");
const startButton = document.getElementById("start-button");
let score = 0;
let timerId;
const colors = [
  "cyan",
  "blue",
  "orange",
  "yellow",
  "green",
  "purple",
  "red"
];

let current; // Tetromino actual
let currentPosition; // Posición actual
let currentRotation; // Rotación actual
let random; // Índice aleatorio
let nextRandom; // Siguiente índice aleatorio



let nextRotation = 0;
function draw() {
  if (current && tetrominoes[random].shape) {
    tetrominoes[random].shape.forEach((row, i) => {
      row.forEach((cell, j) => {
        if (cell) {
          const idx = currentPosition + j + width * i;
          cells[idx].classList.add("tetromino");
          cells[idx].style.backgroundColor = current.color;
        }
      });
    });
  }
}

function undraw() {
  if (current && tetrominoes[random].shape) {
    tetrominoes[random].shape.forEach((row, i) => {
      row.forEach((cell, j) => {
        if (cell) {
          const idx = currentPosition + j + width * i;
          cells[idx].classList.remove("tetromino");
          cells[idx].style.backgroundColor = "";
        }
      });
    });
  }
}

function isCollision(shape, position) {
  return shape.some((row, i) => {
    return row.some((cell, j) => {
      if (cell) {
        const nextIdx = position + j + width * i;
        return (
          nextIdx >= cellCount || nextIdx % width < 0 || nextIdx % width >= width || (cells[nextIdx] && cells[nextIdx].classList.contains("taken"))
        );
      }
      return false;
    });
  });
}

function rotate() {
  if (current) {
    undraw();
    const nextRotation = (currentRotation + 1) % tetrominoes[random].shape.length;
    const nextTetromino = tetrominoes[random].shape[nextRotation];

    if (!isCollision(nextTetromino.shape, currentPosition) && currentPosition + width * (nextTetromino.shape.length - 1) < cellCount) {
      currentRotation = nextRotation;
    }

    draw();
  }
}


function moveDown() {
  undraw();
  currentPosition += width;
  if (current && isCollision(tetrominoes[random].shape, currentPosition)) {
    currentPosition -= width;
    freeze();
    return;
  }
  draw();
}

function freeze() {
  tetrominoes[random].shape.forEach((row, i) => {
    row.forEach((cell, j) => {
      if (cell) {
        const idx = currentPosition + j + width * i;
        cells[idx].classList.add("taken");
        cells[idx].style.backgroundColor = current.color;
      }
    });
  });
}
function moveLeft() {
  undraw();
  const isAtLeftEdge = tetrominoes[random].shape.some((row, i) =>
    row.some((cell, j) => cell && (currentPosition + j) % width === 0)
  );
  if (!isAtLeftEdge && !isCollision(tetrominoes[random].shape, currentPosition - 1)) {
    currentPosition -= 1;
  }
  draw();
}

function moveRight() {
  undraw();
  const isAtRightEdge = tetrominoes[random].shape.some((row, i) =>
    row.some((cell, j) => cell && (currentPosition + j) % width === width - 1)
  );
  if (!isAtRightEdge && !isCollision(tetrominoes[random].shape, currentPosition + 1)) {
    currentPosition += 1;
  }
  draw();
}


const displaySquares = document.querySelectorAll(".mini-grid div");
const displayWidth = 4;
let displayIndex = 0;
const upNextTetrominoes = [
  [0, 1, 2, 3], // Tetromino I
  [0, 1, 2, 2 + width], // Tetromino J
  [0, 1, 2, 2 - width], // Tetromino L
  [0, 1, width, width + 1], // Tetromino O
  [0, 1, 2, 1 + width], // Tetromino T
  [1, 2, width, width - 1], // Tetromino S
  [0, 1, 2, width - 1] // Tetromino Z
];

function displayShape() {
  displaySquares.forEach((square, index) => {
    square.classList.remove("tetromino");
    square.style.backgroundColor = "";
    if (upNextTetrominoes[nextRandom][index]) {
      square.classList.add("tetromino");
      square.style.backgroundColor = colors[nextRandom];
    }
  });
}

function addScore() {
  let rowCleared = 0;
  for (let i = 0; i < cellCount; i += width) {
    const row = Array.from({ length: width }, (_, j) => j + i);
    if (row.every(index => cells[index].classList.contains("taken")) && !row.some(index => index >= cellCount)) {
      score += 10;
      scoreDisplay.innerHTML = score;
      rowCleared++;
      row.forEach(index => {
        cells[index].classList.remove("taken");
        cells[index].classList.remove("tetromino");
        cells[index].style.backgroundColor = "";
      });
      const squaresRemoved = cells.splice(i, width);
      cells = squaresRemoved.concat(cells);
      cells.forEach(cell => grid.appendChild(cell));
    }
  }

  if (rowCleared > 0) {
    // Si al menos una fila se ha eliminado, llama a la función moveDown nuevamente.
    moveDown();
  }
}

function gameOver() {
  if (tetrominoes[random].shape.some((row, i, j) => row[j] && cells[currentPosition + j + width * i] && cells[currentPosition + j + width * i].classList.contains("taken"))) {
    clearInterval(timerId);
    scoreDisplay.innerHTML = "Game Over";
  }
}


function control(e) {
  if (current) {
    if (e.keyCode === 37) {
      moveLeft();
    } else if (e.keyCode === 38) {
      rotate();
    } else if (e.keyCode === 39) {
      moveRight();
    } else if (e.keyCode === 40) {
      moveDown();
    }
  }
}



document.addEventListener("keydown", control);
startButton.addEventListener("click", () => {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  } else {
    random = Math.floor(Math.random() * tetrominoes.length);
    nextRandom = Math.floor(Math.random() * tetrominoes.length);
    current = {
      shape: JSON.parse(JSON.stringify(tetrominoes[random].shape)),  // Inicializa shape
      color: tetrominoes[random].color   // Inicializa color
    };
    
    currentPosition = 4;
    currentRotation = 0;
    draw();
    timerId = setInterval(moveDown, 1000);
    displayShape();
  }
});


});