// ==================================
// Black Force 007 — Quiz Engine (Final Ready-to-Use Edition)
// ==================================

let questions = [];
let current = 0;
let score = 0;
let correctCount = 0;
let wrongCount = 0;

// ===============================
// HTML Elements
const qEl = document.getElementById("question");
const optsEl = document.getElementById("options");
const qIndexEl = document.getElementById("qIndex");
const qTotalEl = document.getElementById("qTotal");
const scoreEl = document.getElementById("score");
const bigMark = document.getElementById("bigMark");

// ===============================
// Initialize when DOM ready
window.addEventListener("DOMContentLoaded", () => {
  if (typeof QUESTIONS !== "undefined" && Array.isArray(QUESTIONS) && QUESTIONS.length > 0) {
    questions = [...QUESTIONS];
    shuffle(questions);
    qTotalEl.textContent = questions.length;
    loadQuestion();
  } else {
    qEl.textContent = "⚠ প্রশ্ন লোড হয়নি — questions.js ফাইল চেক করুন!";
  }
});

// ===============================
function loadQuestion() {
  if (current >= questions.length) {
    showResult();
    return;
  }

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
}

// ===============================
function handleAnswer(btn, index) {
  const q = questions[current];
  const buttons = document.querySelectorAll(".option-btn");
  buttons.forEach(b => (b.disabled = true));

  const correct = index === q.answer;

  if (correct) {
    btn.classList.add("option-correct");
    playSound("correct");
    showFeedback(true);
    score += 10;
    correctCount++;
  } else {
    btn.classList.add("option-wrong");
    buttons[q.answer].classList.add("option-correct");
    playSound("wrong");
    showFeedback(false);
    wrongCount++;
  }

  scoreEl.textContent = score;

  setTimeout(() => {
    current++;
    loadQuestion();
  }, 1600);
}

// ===============================
function showFeedback(isCorrect) {
  const color = isCorrect ? "#00ff55" : "#ff3333";
  const text = isCorrect ? "সঠিক উত্তর!" : "ভুল উত্তর!";
  const emoji = isCorrect ? "✅" : "❌";

  bigMark.innerHTML = `
    <div style="text-align:center;animation:pop 0.4s ease;">
      <span style="font-size:120px;color:${color};text-shadow:0 0 25px ${color};">${emoji}</span><br>
      <span style="font-size:40px;color:${color};font-weight:900;text-shadow:0 0 30px ${color};">${text}</span>
    </div>`;

  bigMark.classList.add("show");
  setTimeout(() => bigMark.classList.remove("show"), 1200);
}

// ===============================
function playSound(type) {
  const audio = new Audio(
    type === "correct"
      ? "https://cdn.pixabay.com/download/audio/2022/03/15/audio_17ad3df4e0.mp3"
      : "https://cdn.pixabay.com/download/audio/2022/03/15/audio_4e298eae7b.mp3"
  );
  audio.volume = 0.4;
  audio.play();
}

// ===============================
function showResult() {
  qEl.innerHTML = `🎉 কুইজ শেষ!<br>✅ সঠিক: ${correctCount} | ❌ ভুল: ${wrongCount}<br>🏆 মোট স্কোর: ${score}`;
  optsEl.innerHTML = "";
}

// ===============================
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ===============================
// Add style for highlight & animation
const style = document.createElement("style");
style.textContent = `
.option-btn {
  display: block;
  width: 100%;
  margin: 8px 0;
  padding: 12px;
  font-size: 18px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  background: #1c1f26;
  color: #fff;
  transition: 0.3s;
}
.option-btn:hover { background: #2b2f3a; }
.option-correct {
  background: #00cc66 !important;
  color: #fff;
  font-weight: bold;
  box-shadow: 0 0 20px #00ff88;
}
.option-wrong {
  background: #ff3333 !important;
  color: #fff;
  font-weight: bold;
  box-shadow: 0 0 20px #ff4444;
}
.big-mark {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0.8);
  text-align: center;
  opacity: 0;
  transition: all 0.3s ease;
  z-index: 9999;
}
.big-mark.show {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1);
}
@keyframes pop {
  0% {transform:scale(0.8);opacity:0;}
  50% {transform:scale(1.1);opacity:1;}
  100% {transform:scale(1);opacity:1;}
}`;
document.head.appendChild(style);
