// Variabel dasar
const board = document.getElementById("game-board");
const rollBtn = document.getElementById("roll-dice");
const diceResult = document.getElementById("dice-result");
const questionBox = document.getElementById("question-box");
const questionText = document.getElementById("question-text");
const optionsContainer = document.getElementById("options");
const statusText = document.getElementById("status");

let currentPlayer = 0;
const players = [
  { color: "red", position: 1, element: null },
  { color: "yellow", position: 1, element: null },
];

let winStats = { red: 0, yellow: 0 };
let askedQuestions = {};

const music = document.getElementById('bg-music');
const toggleMusicBtn = document.getElementById('toggle-music');
const sfx = {
  dice: document.getElementById('sfx-dice'),
  ladder: document.getElementById('sfx-ladder'),
  snake: document.getElementById('sfx-snake'),
  correct: document.getElementById('sfx-correct'),
  wrong: document.getElementById('sfx-wrong'),
};

toggleMusicBtn.addEventListener('click', () => {
  if (music.paused) {
    music.play();
    toggleMusicBtn.textContent = '🔊 Musik';
  } else {
    music.pause();
    toggleMusicBtn.textContent = '🔇 Musik';
  }
});

function playSFX(name) {
  if (sfx[name]) {
    sfx[name].currentTime = 0;
    sfx[name].play();
  }
}

function updateStats() {
  document.getElementById('player1-stats').textContent = `Pemain 1 (Merah): ${winStats.red} kemenangan`;
  document.getElementById('player2-stats').textContent = `Pemain 2 (Kuning): ${winStats.yellow} kemenangan`;
}

const snakes = {
  16: 6,
  48: 30,
  64: 60,
  79: 19,
  93: 68,
  95: 24,
  97: 76,
  98: 78,
};

const ladders = {
  1: 38,
  4: 14,
  9: 31,
  21: 42,
  28: 84,
  36: 44,
  51: 67,
  71: 91,
  80: 100,
};

const questionSpots = [5, 13, 22, 35, 47, 53, 66, 73, 88, 94];

const questions = [
  {
    question: "Apa ibu kota Indonesia?",
    options: ["Bandung", "Surabaya", "Jakarta", "Medan"],
    answer: "Jakarta",
  },
  {
    question: "Siapa presiden pertama Indonesia?",
    options: ["Soekarno", "Jokowi", "Soeharto", "BJ Habibie"],
    answer: "Soekarno",
  },
  {
    question: "Pulau terbesar di Indonesia adalah?",
    options: ["Jawa", "Sulawesi", "Sumatera", "Kalimantan"],
    answer: "Kalimantan",
  },
];

function createBoard() {
  board.innerHTML = "";
  for (let i = 100; i > 0; i--) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.id = `cell-${i}`;
    cell.textContent = i;
    board.appendChild(cell);
  }
}

function createPawns() {
  players.forEach((player) => {
    const pawn = document.createElement("div");
    pawn.classList.add("pawn", player.color);
    board.appendChild(pawn);
    player.element = pawn;
    movePawn(player);
  });
}

function movePawn(player) {
  const cell = document.getElementById(`cell-${player.position}`);
  if (!cell) return;
  const rect = cell.getBoundingClientRect();
  const boardRect = board.getBoundingClientRect();
  player.element.style.left = `${cell.offsetLeft}px`;
  player.element.style.top = `${cell.offsetTop}px`;
}

function rollDice() {
  playSFX('dice');
  const roll = Math.floor(Math.random() * 6) + 1;
  diceResult.textContent = `Dadu: ${roll}`;

  let player = players[currentPlayer];
  let newPos = player.position + roll;
  if (newPos > 100) newPos = 100 - (newPos - 100);

  setTimeout(() => {
    player.position = newPos;

    if (snakes[player.position]) {
      player.position = snakes[player.position];
      playSFX('snake');
    } else if (ladders[player.position]) {
      player.position = ladders[player.position];
      playSFX('ladder');
    }

    movePawn(player);

    if (questionSpots.includes(player.position)) {
      if (!askedQuestions[player.position]) {
        showQuestion(player);
        return;
      }
    }

    checkWin(player);
    currentPlayer = (currentPlayer + 1) % 2;
  }, 500);
}

function showQuestion(player) {
  const q = questions[Math.floor(Math.random() * questions.length)];
  questionBox.classList.remove("hidden");
  questionText.textContent = q.question;
  optionsContainer.innerHTML = "";
  q.options.forEach((opt) => {
    const btn = document.createElement("button");
    btn.textContent = opt;
    btn.classList.add("option-btn");
    btn.onclick = () => {
      questionBox.classList.add("hidden");
      if (opt === q.answer) {
        playSFX('correct');
        askedQuestions[player.position] = true;
        statusText.textContent = "Benar! Lanjutkan permainan.";
      } else {
        playSFX('wrong');
        player.position = Math.max(1, player.position - 3);
        movePawn(player);
        statusText.textContent = "Salah! Mundur 3 langkah.";
      }
      checkWin(player);
      currentPlayer = (currentPlayer + 1) % 2;
    };
    optionsContainer.appendChild(btn);
  });
}

function checkWin(player) {
  if (player.position === 100) {
    const winner = player.color === "red" ? "Pemain 1 (Merah)" : "Pemain 2 (Kuning)";
    statusText.textContent = `${winner} menang!`;
    rollBtn.disabled = true;
    winStats[player.color]++;
    updateStats();
  }
}

rollBtn.addEventListener("click", rollDice);

createBoard();
createPawns();
updateStats();
