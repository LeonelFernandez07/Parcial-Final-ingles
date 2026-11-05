function showSection(sectionId, button) {
  const sections = ['quiz', 'wordsearch'];
  sections.forEach(id => {
    const element = document.getElementById(id);
    if (id === sectionId) {
      element.classList.remove('hidden-section');
      element.classList.add('active-section');
    } else {
      element.classList.remove('active-section');
      element.classList.add('hidden-section');
    }
  });

  const buttons = document.querySelectorAll('.nav-btn');
  buttons.forEach(btn => btn.classList.remove('active'));
  if (button) button.classList.add('active');
}

// --- QUIZ LOGIC ---
let currentScore = 0;
let answeredQuestions = 0;
const totalQuestions = 5;

function selectAnswer(questionNum, isCorrect, button) {
  const card = document.querySelector(`.quiz-card[data-question="${questionNum}"]`);
  const buttons = card.querySelectorAll('.option-btn');
  
  buttons.forEach(btn => btn.disabled = true);

  if (isCorrect) {
    button.classList.add('correct');
    currentScore++;
  } else {
    button.classList.add('wrong');
  }

  answeredQuestions++;

  if (answeredQuestions === totalQuestions) {
    setTimeout(showQuizResults, 300);
  }
}

function showQuizResults() {
  const resultCard = document.getElementById('quiz-result');
  const scoreText = document.getElementById('final-score-text');

  scoreText.innerText = `Your Score: ${currentScore} / ${totalQuestions}`;

  resultCard.classList.remove('hidden-section');
  resultCard.scrollIntoView({ behavior: 'smooth' });
}

function resetQuiz() {
  currentScore = 0;
  answeredQuestions = 0;

  document.getElementById('quiz-result').classList.add('hidden-section');

  const buttons = document.querySelectorAll('.quiz-card .option-btn');
  buttons.forEach(btn => {
    btn.disabled = false;
    btn.classList.remove('correct', 'wrong');
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });
}


// --- WORD SEARCH LOGIC ---
const GRID_SIZE = 10;
const targetWords = ['LITTER', 'POLICY', 'WASTE', 'PLASTIC', 'DEBATE'];
let gridData = [];
let placedWordsPositions = {}; 

let selectedCells = [];
let foundWords = [];

let timerInterval = null;
let secondsElapsed = 0;
let timerStarted = false;

document.addEventListener('DOMContentLoaded', () => {
  initWordSearch();
});

function generateRandomGrid() {
  let grid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(''));
  placedWordsPositions = {};

  const directions = [
    { r: 0, c: 1 },   // Horizontal
    { r: 1, c: 0 },   // Vertical
    { r: 1, c: 1 }    // Diagonal
  ];

  targetWords.forEach(word => {
    let placed = false;
    let attempts = 0;

    while (!placed && attempts < 150) {
      attempts++;
      const dir = directions[Math.floor(Math.random() * directions.length)];
      const row = Math.floor(Math.random() * GRID_SIZE);
      const col = Math.floor(Math.random() * GRID_SIZE);

      const endRow = row + (word.length - 1) * dir.r;
      const endCol = col + (word.length - 1) * dir.c;

      if (endRow >= 0 && endRow < GRID_SIZE && endCol >= 0 && endCol < GRID_SIZE) {
        let fit = true;
        let coords = [];

        for (let i = 0; i < word.length; i++) {
          let currR = row + i * dir.r;
          let currC = col + i * dir.c;
          let existingChar = grid[currR][currC];

          if (existingChar !== '' && existingChar !== word[i]) {
            fit = false;
            break;
          }
          coords.push(`${currR}-${currC}`);
        }

        if (fit) {
          for (let i = 0; i < word.length; i++) {
            let currR = row + i * dir.r;
            let currC = col + i * dir.c;
            grid[currR][currC] = word[i];
          }
          placedWordsPositions[word] = coords;
          placed = true;
        }
      }
    }
  });

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] === '') {
        grid[r][c] = alphabet[Math.floor(Math.random() * alphabet.length)];
      }
    }
  }

  return grid;
}

function initWordSearch() {
  gridData = generateRandomGrid();
  const gridContainer = document.getElementById('grid-container');
  gridContainer.innerHTML = '';

  gridData.forEach((row, rowIndex) => {
    row.forEach((letter, colIndex) => {
      const cell = document.createElement('div');
      cell.classList.add('grid-cell');
      cell.innerText = letter;
      cell.dataset.row = rowIndex;
      cell.dataset.col = colIndex;
      
      cell.addEventListener('click', () => handleCellClick(cell, rowIndex, colIndex));
      gridContainer.appendChild(cell);
    });
  });
}

function startTimer() {
  if (!timerStarted) {
    timerStarted = true;
    timerInterval = setInterval(() => {
      secondsElapsed++;
      let mins = Math.floor(secondsElapsed / 60).toString().padStart(2, '0');
      let secs = (secondsElapsed % 60).toString().padStart(2, '0');
      document.getElementById('timer').innerText = `${mins}:${secs}`;
    }, 1000);
  }
}

function stopTimer() {
  clearInterval(timerInterval);
}

function handleCellClick(cell, row, col) {
  if (cell.classList.contains('found')) return;

  startTimer();

  if (cell.classList.contains('selected')) {
    cell.classList.remove('selected');
    selectedCells = selectedCells.filter(item => !(item.row === row && item.col === col));
  } else {
    cell.classList.add('selected');
    selectedCells.push({ element: cell, row: row, col: col });
  }

  checkWordSearchFast();
}

function checkWordSearchFast() {
  if (selectedCells.length === 0) return;

  const currentCoords = selectedCells.map(item => `${item.row}-${item.col}`);
  const currentString = selectedCells.map(item => gridData[item.row][item.col]).join('');
  const reversedString = currentString.split('').reverse().join('');

  targetWords.forEach(word => {
    if (!foundWords.includes(word)) {
      const targetCoords = placedWordsPositions[word];
      if (!targetCoords) return;

      if (currentString === word || reversedString === word) {
        if (currentCoords.length === targetCoords.length) {
          const isExactMatch = currentCoords.every(coord => targetCoords.includes(coord));

          if (isExactMatch) {
            foundWords.push(word);

            selectedCells.forEach(item => {
              item.element.classList.remove('selected');
              item.element.classList.add('found');
            });

            const wordListItem = document.querySelector(`#words-list li[data-word="${word}"]`);
            if (wordListItem) {
              wordListItem.classList.add('found-word');
            }

            document.getElementById('found-count').innerText = foundWords.length;
            selectedCells = [];

            if (foundWords.length === targetWords.length) {
              stopTimer();
              setTimeout(showWordSearchVictory, 100);
            }
          }
        }
      }
    }
  });

  if (selectedCells.length >= 8) {
    selectedCells.forEach(item => item.element.classList.remove('selected'));
    selectedCells = [];
  }
}

function showWordSearchVictory() {
  const wsResult = document.getElementById('ws-result');
  const finalTimeText = document.getElementById('ws-final-time');
  const scoreMsg = document.getElementById('ws-score-msg');

  finalTimeText.innerText = `You finished in: ${secondsElapsed} seconds!`;

  if (secondsElapsed <= 25) {
    scoreMsg.innerText = "🏆 Outstanding speed! You're an environmental vocabulary pro.";
  } else if (secondsElapsed <= 55) {
    scoreMsg.innerText = "🌟 Great job! Fast and sharp.";
  } else {
    scoreMsg.innerText = "👍 Solid effort! Practice makes perfect.";
  }

  wsResult.classList.remove('hidden-section');
  wsResult.scrollIntoView({ behavior: 'smooth' });
}

function resetWordSearch() {
  stopTimer();
  timerStarted = false;
  secondsElapsed = 0;
  foundWords = [];
  selectedCells = [];

  document.getElementById('timer').innerText = "00:00";
  document.getElementById('found-count').innerText = "0";
  document.getElementById('ws-result').classList.add('hidden-section');

  const listItems = document.querySelectorAll('#words-list li');
  listItems.forEach(li => {
    li.classList.remove('found-word');
  });

  initWordSearch();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}