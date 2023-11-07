document.addEventListener("DOMContentLoaded", () => {
  const tetrominoes = [
    [[1, 1, 1, 1]], // I
    [[1, 1, 1], [1]], // J
    [[1, 1, 1], [0, 0, 1]], // L
    [[1, 1], [1, 1]], // O
    [[1, 1, 1], [0, 1]], // T
    [[1, 1, 1], [1, 0]], // S
    [[1, 1, 1], [0, 1, 0]] // Z
  ];

  let current; // Tetromino actual
  let currentPosition; // Posición actual
  let currentRotation; // Rotación actual
  let random; // Índice aleatorio
  let nextRandom; // Siguiente índice aleatorio

  const grid = document.querySelector(".tetris");
  const width = 10;
  const height = 20;
  let cells = Array.from(grid.querySelectorAll("div"));
  const cellCount = width * height;
  const scoreDisplay = document.querySelector("#score");
  const startButton = document.querySelector("#start-button");
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

  function draw() {
    current.forEach((row, i) => {
      row.forEach((cell, j) => {
        if (cell) {
          const idx = currentPosition + j + width * i;
          console.log("idx:", idx);
          console.log("cells:", cells);
          cells[idx].classList.add("tetromino");
          cells[idx].style.backgroundColor = colors[random];
        }
      });
    });
  }

  function undraw() {
    current.forEach((row, i) => {
      row.forEach((cell, j) => {
        if (cell) {
          const idx = currentPosition + j + width * i;
          cells[idx].classList.remove("tetromino");
          cells[idx].style.backgroundColor = "";
        }
      });
    });
  }

  function moveDown() {
    undraw();
    currentPosition += width;
    draw();
    if (isCollision()) {
      currentPosition -= width;
      freeze();
      return;
    }
  }

  function isCollision() {
    return current.some((row, i) =>
      row.some((cell, j) => {
        if (cell) {
          const nextIdx = currentPosition + j + width * (i + 1);
          return (
            nextIdx >= cellCount || cells[nextIdx].classList.contains("taken")
          );
        }
        return false;
      })
    );
  }

  function freeze() {
    current.forEach((row, i) => {
      row.forEach((cell, j) => {
        if (cell) {
          const idx = currentPosition + j + width * i;
          cells[idx].classList.add("taken");
        }
      });
    });

    random = nextRandom;
    nextRandom = Math.floor(Math.random() * tetrominoes.length);
    current = tetrominoes[random];
    currentPosition = 4;
    currentRotation = 0;
    draw();
    displayShape();
    addScore();
    gameOver();
  }

  function moveLeft() {
    undraw();
    const isAtLeftEdge = current.some((row, i) =>
      row.some((cell, j) => cell && (currentPosition + j) % width === 0)
    );
    if (!isAtLeftEdge) currentPosition -= 1;
    if (isCollision()) currentPosition += 1;
    draw();
  }

  function moveRight() {
    undraw();
    const isAtRightEdge = current.some((row, i) =>
      row.some(
        (cell, j) => cell && (currentPosition + j) % width === width - 1
      )
    );
    if (!isAtRightEdge) currentPosition += 1;
    if (isCollision()) currentPosition -= 1;
    draw();
  }

  function rotate() {
    undraw();
    currentRotation = (currentRotation + 1) % current.length;
    current = tetrominoes[random][currentRotation];
    draw();
  }

  const displaySquares = document.querySelectorAll(".mini-grid div");
  const displayWidth = 4;
  let displayIndex = 0;
  const upNextTetrominoes = [
    [1, displayWidth + 1, displayWidth * 2 + 1, 2], // L
    [0, displayWidth, displayWidth + 1, displayWidth * 2 + 1], // Z
    [1, displayWidth, displayWidth + 1, displayWidth + 2], // T
    [0, 1, displayWidth, displayWidth + 1] // O
  ];

  function displayShape() {
    displaySquares.forEach(square => {
      square.classList.remove("tetromino");
      square.style.backgroundColor = "";
    });
    upNextTetrominoes[nextRandom].forEach(index => {
      displaySquares[displayIndex + index].classList.add("tetromino");
      displaySquares[displayIndex + index].style.backgroundColor = colors[nextRandom];
    });
  }

  function addScore() {
    for (let i = 0; i < cellCount; i += width) {
      const row = Array.from({ length: width }, (_, j) => j + i);
      if (row.every(index => cells[index].classList.contains("taken"))) {
        score += 10;
        scoreDisplay.innerHTML = score;
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
  }

  function gameOver() {
    if (current.some((cell, i, j) => cell && cells[currentPosition + j + width * i].classList.contains("taken"))) {
      scoreDisplay.innerHTML = "Game Over";
      clearInterval(timerId);
    }
  }

  function control(e) {
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

  document.addEventListener("keydown", control);

  startButton.addEventListener("click", () => {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    } else {
      random = Math.floor(Math.random() * tetrominoes.length);
      nextRandom = Math.floor(Math.random() * tetrominoes.length);
      current = tetrominoes[random];
      currentPosition = 4;
      currentRotation = 0;
      draw();
      timerId = setInterval(moveDown, 1000);
      displayShape();
    }
  });
});
