
const questionEl = document.getElementById("question");
const optionsEl = document.getElementById("options");
const qIndexEl = document.getElementById("qIndex");
const qTotalEl = document.getElementById("qTotal");
const scoreEl = document.getElementById("score");
const correctCountEl = document.getElementById("correctCount");
const wrongCountEl = document.getElementById("wrongCount");
const timeLeftEl = document.getElementById("timeLeft");
const streakEl = document.getElementById("streak");
const bigMark = document.getElementById("bigMark");

const correctSound = document.getElementById("correctSound");
const wrongSound = document.getElementById("wrongSound");

const resultModal = document.getElementById("resultModal");
const finalScore = document.getElementById("finalScore");
const finalCorrect = document.getElementById("finalCorrect");
const finalWrong = document.getElementById("finalWrong");
const reviewUl = document.getElementById("reviewUl");
const reviewList = document.getElementById("reviewList");

const replayBtn = document.getElementById("replayBtn");
const reviewBtn = document.getElementById("reviewBtn");
const closeModal = document.getElementById("closeModal");

const pauseBtn = document.getElementById("pauseBtn");
const skipBtn = document.getElementById("skipBtn");
const timeSelect = document.getElementById("timeSelect");

let qIndex = 0;
let score = 0;
let correctCount = 0;
let wrongCount = 0;
let streak = 0;
let timer = null;
let timePerQ = parseInt(timeSelect.value);
let paused = false;
let wrongQuestions = [];

qTotalEl.textContent = QUESTIONS.length;

function playCorrectSound() { correctSound.play(); }
function playWrongSound() { wrongSound.play(); }

function showQuestion() {
  const q = QUESTIONS[qIndex];
  questionEl.textContent = q.question;
  qIndexEl.textContent = qIndex + 1;
  optionsEl.innerHTML = "";

  q.options.forEach(opt => {
    const btn = document.createElement("button");
    btn.textContent = opt;
    btn.className = "option-btn";
    btn.onclick = () => handleAnswer(btn, q.answer);
    optionsEl.appendChild(btn);
  });

  resetTimer();
}

function handleAnswer(btn, correctAns) {
  const selected = btn.textContent;
  const allBtns = document.querySelectorAll(".option-btn");
  allBtns.forEach(b => b.disabled = true);

  if (selected === correctAns) {
    btn.classList.add("option-correct");
    playCorrectSound();
    showBigMark("✅");
    score += 5;
    correctCount++;
    streak++;
  } else {
    btn.classList.add("option-wrong");
    playWrongSound();
    showBigMark("❌");
    wrongCount++;
    streak = 0;
    wrongQuestions.push(QUESTIONS[qIndex]);
  }

  scoreEl.textContent = score;
  correctCountEl.textContent = correctCount;
  wrongCountEl.textContent = wrongCount;
  streakEl.textContent = streak;

  clearInterval(timer);
  setTimeout(nextQuestion, 1200);
}

function showBigMark(mark) {
  bigMark.textContent = mark;
  bigMark.classList.add("show");
  setTimeout(() => bigMark.classList.remove("show"), 700);
}

function nextQuestion() {
  qIndex++;
  if (qIndex >= QUESTIONS.length) return showResult();
  showQuestion();
}

function showResult() {
  finalScore.textContent = score;
  finalCorrect.textContent = correctCount;
  finalWrong.textContent = wrongCount;

  resultModal.classList.remove("hidden");
}

function resetTimer() {
  clearInterval(timer);
  let timeLeft = timePerQ;
  timeLeftEl.textContent = timeLeft;
  timer = setInterval(() => {
    if (!paused) {
      timeLeft--;
      timeLeftEl.textContent = timeLeft;
      if (timeLeft <= 0) {
        clearInterval(timer);
        wrongCount++;
        streak = 0;
        wrongQuestions.push(QUESTIONS[qIndex]);
        nextQuestion();
      }
    }
  }, 1000);
}

timeSelect.addEventListener("change", () => {
  timePerQ = parseInt(timeSelect.value);
  resetTimer();
});

pauseBtn.addEventListener("click", () => {
  paused = !paused;
  pauseBtn.textContent = paused ? "Resume" : "Pause";
});

skipBtn.addEventListener("click", () => {
  wrongQuestions.push(QUESTIONS[qIndex]);
  nextQuestion();
});

replayBtn.addEventListener("click", () => {
  QUESTIONS.sort(() => Math.random() - 0.5);
  qIndex = 0;
  score = 0;
  correctCount = 0;
  wrongCount = 0;
  streak = 0;
  wrongQuestions = [];
  resultModal.classList.add("hidden");
  showQuestion();
});

reviewBtn.addEventListener("click", () => {
  reviewList.classList.toggle("hidden");
  reviewUl.innerHTML = "";
  wrongQuestions.forEach(wq => {
    const li = document.createElement("li");
    li.textContent = `${wq.question} → সঠিক উত্তর: ${wq.answer}`;
    reviewUl.appendChild(li);
  });
});

closeModal.addEventListener("click", () => resultModal.classList.add("hidden"));

showQuestion();
