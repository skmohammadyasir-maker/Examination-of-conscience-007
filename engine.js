// ==================================
// Black Force 007 — Advanced Quiz Engine (Highlight Edition v3.1)
// ==================================

let questions = [];
let current = 0;
let score = 0;
let correctCount = 0;
let wrongCount = 0;
let streak = 0;
let timer = null;
let timeLeft = 20;
let paused = false;
let wrongList = [];

// Elements
const qEl = document.getElementById("question");
const optsEl = document.getElementById("options");
const qIndexEl = document.getElementById("qIndex");
const qTotalEl = document.getElementById("qTotal");
const scoreEl = document.getElementById("score");
const correctEl = document.getElementById("correctCount");
const wrongEl = document.getElementById("wrongCount");
const streakEl = document.getElementById("streak");
const timeLeftEl = document.getElementById("timeLeft");
const timeSelect = document.getElementById("timeSelect");
const bigMark = document.getElementById("bigMark");
const modal = document.getElementById("resultModal");
const finalScoreEl = document.getElementById("finalScore");
const finalCorrectEl = document.getElementById("finalCorrect");
const finalWrongEl = document.getElementById("finalWrong");
const reviewList = document.getElementById("reviewList");
const reviewUl = document.getElementById("reviewUl");
const eduMsg = document.getElementById("educationalMsg");

// ===============================
// Initialization
if (window.quizData) {
  questions = [...window.quizData];
  shuffle(questions);
  qTotalEl.textContent = questions.length;
  loadQuestion();
} else {
  qEl.textContent = "⚠ প্রশ্ন লোড হয়নি — questions.js ফাইল চেক করুন!";
}

// ===============================
function loadQuestion() {
  if (current >= questions.length) return showResult();
  clearInterval(timer);

  const q = questions[current];
  qIndexEl.textContent = current + 1;
  qEl.textContent = q.q;
  optsEl.innerHTML = "";

  q.options.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.textContent = opt;
    btn.addEventListener("click", () => handleAnswer(btn, i));
    optsEl.appendChild(btn);
  });

  timeLeft = parseInt(timeSelect.value) || 20;
  timeLeftEl.textContent = timeLeft;
  startTimer();
  bigMark.classList.remove("show");
}

// ===============================
function startTimer() {
  timer = setInterval(() => {
    if (!paused) {
      timeLeft--;
      timeLeftEl.textContent = timeLeft;
      if (timeLeft <= 0) {
        clearInterval(timer);
        showFeedback(false);
        wrongList.push(questions[current]);
        wrongCount++;
        wrongEl.textContent = wrongCount;
        setTimeout(nextQuestion, 1800);
      }
    }
  }, 1000);
}

// ===============================
function handleAnswer(btn, index) {
  clearInterval(timer);
  const q = questions[current];
  const buttons = document.querySelectorAll(".option-btn");
  buttons.forEach(b => (b.disabled = true));
  const correct = index === q.answer;

  if (correct) {
    btn.classList.add("option-correct", "pulse-green");
    playSound("correct");
    showFeedback(true, q.options[q.answer]);
    score += 10;
    correctCount++;
    streak++;
  } else {
    btn.classList.add("option-wrong", "shake-red");
    buttons[q.answer].classList.add("option-correct", "pulse-green");
    playSound("wrong");
    showFeedback(false, q.options[q.answer]);
    wrongCount++;
    streak = 0;
    wrongList.push(q);
  }

  scoreEl.textContent = score;
  correctEl.textContent = correctCount;
  wrongEl.textContent = wrongCount;
  streakEl.textContent = streak;

  setTimeout(nextQuestion, 2000);
}

// ===============================
function showFeedback(isCorrect, correctText) {
  const color = isCorrect ? "#00ff55" : "#ff3333";
  const text = isCorrect ? "✅ সঠিক উত্তর!" : "❌ ভুল উত্তর!";
  const glow = isCorrect
    ? "0 0 50px rgba(0,255,100,0.9)"
    : "0 0 50px rgba(255,50,50,0.9)";

  // Highlight text with background overlay
  bigMark.innerHTML = `
    <div style="text-align:center;animation:pop 0.4s ease;">
      <span style="
        font-size:120px;
        color:${color};
        text-shadow:${glow};
        font-weight:900;
        display:block;
      ">${text}</span>
      ${
        !isCorrect
          ? `<span style="font-size:28px;color:#fff;display:block;margin-top:15px;">✅ সঠিক উত্তর: <strong style="color:#00ff55">${correctText}</strong></span>`
          : ""
      }
    </div>`;

  // Background Flash effect
  document.body.style.transition = "background 0.2s ease";
  document.body.style.background = isCorrect
    ? "radial-gradient(circle, #004d00 0%, #000000 90%)"
    : "radial-gradient(circle, #4d0000 0%, #000000 90%)";

  setTimeout(() => {
    document.body.style.background =
      "linear-gradient(180deg, var(--bg1), var(--bg2))";
  }, 600);

  bigMark.classList.add("show");
  setTimeout(() => bigMark.classList.remove("show"), 1600);
}

// ===============================
function playSound(type) {
  const audio = new Audio(
    type === "correct"
      ? "https://cdn.pixabay.com/download/audio/2022/03/15/audio_17ad3df4e0.mp3"
      : "https://cdn.pixabay.com/download/audio/2022/03/15/audio_4e298eae7b.mp3"
  );
  audio.volume = 0.6;
  audio.play();
}

// ===============================
function nextQuestion() {
  clearInterval(timer);
  current++;
  loadQuestion();
}

// ===============================
document.getElementById("pauseBtn").addEventListener("click", e => {
  paused = !paused;
  e.target.textContent = paused ? "Resume" : "Pause";
});

document.getElementById("skipBtn").addEventListener("click", () => {
  clearInterval(timer);
  streak = 0;
  nextQuestion();
});

// ===============================
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ===============================
function showResult() {
  clearInterval(timer);
  modal.classList.remove("hidden");
  finalScoreEl.textContent = score;
  finalCorrectEl.textContent = correctCount;
  finalWrongEl.textContent = wrongCount;

  if (score < 100)
    eduMsg.textContent = "চেষ্টা চালিয়ে যাও! তুমি আরও ভালো করতে পারবে 💪";
  else if (score < 200)
    eduMsg.textContent = "দারুণ! তুমি সচেতন নাগরিক হিসেবে অগ্রসর হচ্ছো 🔥";
  else eduMsg.textContent = "অসাধারণ! তুমি সমাজ সচেতনতার হিরো 🏆";

  reviewUl.innerHTML = "";
  wrongList.forEach(q => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${q.q}</strong><br><span style="color:#2ecc71">সঠিক উত্তর:</span> ${q.options[q.answer]}`;
    reviewUl.appendChild(li);
  });
}

// ===============================
document.getElementById("replayBtn").addEventListener("click", () => {
  modal.classList.add("hidden");
  resetGame();
});
document.getElementById("reviewBtn").addEventListener("click", () => {
  reviewList.classList.toggle("hidden");
});
document.getElementById("closeModal").addEventListener("click", () => {
  modal.classList.add("hidden");
});

function resetGame() {
  score = 0;
  correctCount = 0;
  wrongCount = 0;
  streak = 0;
  current = 0;
  wrongList = [];
  shuffle(questions);
  scoreEl.textContent = 0;
  correctEl.textContent = 0;
  wrongEl.textContent = 0;
  streakEl.textContent = 0;
  loadQuestion();
}

// ===============================
// Extra Animation Styles
const style = document.createElement("style");
style.textContent = `
@keyframes pop {
  0% {transform:scale(0.8);opacity:0;}
  50% {transform:scale(1.15);opacity:1;}
  100% {transform:scale(1);opacity:1;}
}
@keyframes shake {
  0%,100% {transform:translateX(0);}
  20%,60% {transform:translateX(-6px);}
  40%,80% {transform:translateX(6px);}
}
@keyframes pulse {
  0% {box-shadow:0 0 0 0 rgba(0,255,100,0.6);}
  70% {box-shadow:0 0 20px 20px rgba(0,255,100,0);}
  100% {box-shadow:0 0 0 0 rgba(0,255,100,0);}
}
.big-mark {
  position:fixed;
  top:50%;
  left:50%;
  transform:translate(-50%,-50%) scale(0.8);
  text-align:center;
  opacity:0;
  transition:all 0.3s ease;
  z-index:9999;
}
.big-mark.show {
  opacity:1;
  transform:translate(-50%,-50%) scale(1);
}
.option-correct {
  box-shadow:0 0 35px rgba(0,255,100,0.9);
  border:3px solid #00ff88;
  transition:all 0.25s ease;
}
.option-wrong {
  box-shadow:0 0 35px rgba(255,50,50,0.9);
  border:3px solid #ff3333;
  transition:all 0.25s ease;
}
.pulse-green { animation:pulse 0.8s ease forwards; }
.shake-red { animation:shake 0.5s ease; }
`;
document.head.appendChild(style);
