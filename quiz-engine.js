// =============================
// Black Force 007 — Quiz Engine
// =============================

let questions = [];
let current = 0;
let score = 0;

// Elements
const qEl = document.getElementById("question");
const optsEl = document.getElementById("options");
const qIndexEl = document.getElementById("qIndex");
const qTotalEl = document.getElementById("qTotal");
const scoreEl = document.getElementById("score");
const bigMark = document.getElementById("bigMark");

// =============================
// Initialize Game
// =============================
if (window.quizData && window.quizData.length > 0) {
  questions = [...window.quizData];
  shuffle(questions);
  qTotalEl.textContent = questions.length;
  loadQuestion();
} else {
  qEl.textContent = "⚠ প্রশ্ন লোড হয়নি — questions.js ফাইল চেক করুন!";
}

// =============================
function loadQuestion() {
  if (current >= questions.length) {
    showEndScreen();
    return;
  }

  const q = questions[current];
  qEl.textContent = q.q;
  qIndexEl.textContent = current + 1;
  optsEl.innerHTML = "";

  q.options.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.textContent = opt;
    btn.onclick = () => handleAnswer(btn, i);
    optsEl.appendChild(btn);
  });
}

// =============================
function handleAnswer(btn, index) {
  const q = questions[current];
  const buttons = document.querySelectorAll(".option-btn");
  buttons.forEach(b => (b.disabled = true));

  const isCorrect = index === q.answer;

  if (isCorrect) {
    btn.classList.add("correct");
    showFeedback(true);
    score += 10;
  } else {
    btn.classList.add("wrong");
    buttons[q.answer].classList.add("correct");
    showFeedback(false);
  }

  scoreEl.textContent = score;
  setTimeout(() => {
    current++;
    loadQuestion();
  }, 1400);
}

// =============================
function showFeedback(isCorrect) {
  const color = isCorrect ? "#00ff55" : "#ff3333";
  const text = isCorrect ? "সঠিক!" : "ভুল!";
  const emoji = isCorrect ? "✅" : "❌";

  bigMark.innerHTML = `
    <div style="text-align:center;animation:pop 0.4s ease;">
      <span style="font-size:100px;color:${color};text-shadow:0 0 25px ${color};">${emoji}</span><br>
      <span style="font-size:36px;color:${color};font-weight:900;text-shadow:0 0 25px ${color};">${text}</span>
    </div>`;

  bigMark.classList.add("show");
  setTimeout(() => bigMark.classList.remove("show"), 1000);
}

// =============================
function showEndScreen() {
  qEl.textContent = `🎯 কুইজ শেষ!`;
  optsEl.innerHTML = `<p style="font-size:20px;color:#0f0;">মোট স্কোর: ${score}</p>`;
}

// =============================
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// =============================
// Styles Inject (Highlight Animations)
// =============================
const style = document.createElement("style");
style.textContent = `
.option-btn {
  display:block;
  width:90%;
  margin:8px auto;
  padding:12px;
  font-size:18px;
  border:none;
  border-radius:10px;
  background:#202833;
  color:#fff;
  transition:all 0.25s ease;
}
.option-btn:hover {
  background:#2a3345;
  transform:scale(1.03);
}
.option-btn.correct {
  background:#1eff65 !important;
  color:#000;
  font-weight:700;
  box-shadow:0 0 15px #1eff65;
}
.option-btn.wrong {
  background:#ff4040 !important;
  color:#fff;
  font-weight:700;
  box-shadow:0 0 15px #ff4040;
}
.big-mark {
  position:fixed;
  top:50%;
  left:50%;
  transform:translate(-50%,-50%) scale(0.8);
  opacity:0;
  transition:all 0.3s ease;
  z-index:9999;
}
.big-mark.show {
  opacity:1;
  transform:translate(-50%,-50%) scale(1);
}
@keyframes pop {
  0% {transform:scale(0.8);opacity:0;}
  50% {transform:scale(1.1);opacity:1;}
  100% {transform:scale(1);opacity:1;}
}
`;
document.head.appendChild(style);
