const qElem = document.getElementById("question");
const optionsElem = document.getElementById("options");
const scoreElem = document.getElementById("score");
const correctElem = document.getElementById("correctCount");
const wrongElem = document.getElementById("wrongCount");
const qIndexElem = document.getElementById("qIndex");
const qTotalElem = document.getElementById("qTotal");
const timeLeftElem = document.getElementById("timeLeft");
const streakElem = document.getElementById("streak");
const timeSelect = document.getElementById("timeSelect");
const bigMark = document.getElementById("bigMark");

const modal = document.getElementById("resultModal");
const finalScore = document.getElementById("finalScore");
const finalCorrect = document.getElementById("finalCorrect");
const finalWrong = document.getElementById("finalWrong");
const replayBtn = document.getElementById("replayBtn");
const reviewBtn = document.getElementById("reviewBtn");
const closeModal = document.getElementById("closeModal");
const reviewList = document.getElementById("reviewList");
const reviewUl = document.getElementById("reviewUl");
const educationalMsg = document.getElementById("educationalMsg");

let qIndex = 0, score = 0, correct = 0, wrong = 0, streak = 0;
let timer, timeLeft, paused = false;
let wrongQuestions = [];

let questions = [...QUESTIONS];
qTotalElem.textContent = questions.length;

function shuffle(arr){return arr.sort(()=>Math.random()-0.5);}
function showQuestion(){
  if(qIndex >= questions.length) return showResult();
  const q = questions[qIndex];
  qIndexElem.textContent = qIndex + 1;
  qElem.textContent = q.question;
  optionsElem.innerHTML = "";
  q.options.forEach(opt=>{
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.textContent = opt;
    btn.onclick = ()=>checkAnswer(opt,q.answer,btn);
    optionsElem.appendChild(btn);
  });
  resetTimer();
}

function resetTimer(){
  clearInterval(timer);
  timeLeft = parseInt(timeSelect.value);
  timeLeftElem.textContent = timeLeft;
  timer = setInterval(()=>{
    if(!paused){
      timeLeft--;
      timeLeftElem.textContent = timeLeft;
      if(timeLeft<=0){
        clearInterval(timer);
        handleWrong("সময় শেষ!");
      }
    }
  },1000);
}

function checkAnswer(selected,correctAns,btn){
  clearInterval(timer);
  const all = document.querySelectorAll(".option-btn");
  all.forEach(b=>b.disabled=true);
  if(selected === correctAns){
    btn.style.boxShadow = "0 0 15px #00ff99";
    showBigMark(true);
    score+=10; correct++; streak++;
  }else{
    btn.style.boxShadow = "0 0 15px #ff3b3b";
    showBigMark(false);
    wrong++; streak=0;
    wrongQuestions.push({q:questions[qIndex].question,a:correctAns});
  }
  updateHUD();
  setTimeout(()=>{qIndex++;showQuestion();},800);
}

function handleWrong(msg){
  wrong++; streak=0;
  wrongQuestions.push({q:questions[qIndex].question,a:questions[qIndex].answer});
  updateHUD();
  showBigMark(false);
  setTimeout(()=>{qIndex++;showQuestion();},800);
}

function updateHUD(){
  scoreElem.textContent = score;
  correctElem.textContent = correct;
  wrongElem.textContent = wrong;
  streakElem.textContent = streak;
}

function showBigMark(correctAns){
  bigMark.textContent = correctAns ? "✔️" : "❌";
  bigMark.className = `big-mark show ${correctAns ? "correct" : "wrong"}`;
  setTimeout(()=> bigMark.className="big-mark",500);
}

function showResult(){
  clearInterval(timer);
  modal.classList.remove("hidden");
  finalScore.textContent = score;
  finalCorrect.textContent = correct;
  finalWrong.textContent = wrong;
  educationalMsg.textContent = score > 300 ? "দারুণ কাজ! সমাজ সচেতনতার চ্যাম্পিয়ন!" :
                                score > 150 ? "ভালো হয়েছে, আরও উন্নতি করো!" :
                                "চেষ্টা চালিয়ে যাও — প্রতিটি প্রশ্ন শেখার সুযোগ।";
}

replayBtn.onclick = ()=>{
  modal.classList.add("hidden");
  qIndex=score=correct=wrong=streak=0;
  wrongQuestions=[]; shuffle(questions);
  updateHUD(); showQuestion();
};
reviewBtn.onclick = ()=>{
  reviewList.classList.toggle("hidden");
  reviewUl.innerHTML = wrongQuestions.map(x=>`<li>${x.q}<br><small>✔️ ${x.a}</small></li>`).join("");
};
closeModal.onclick = ()=> modal.classList.add("hidden");
document.getElementById("pauseBtn").onclick = ()=> paused=!paused;
document.getElementById("skipBtn").onclick = ()=>{
  clearInterval(timer);
  wrong++; streak=0; updateHUD();
  qIndex++; showQuestion();
};

shuffle(questions);
showQuestion();
