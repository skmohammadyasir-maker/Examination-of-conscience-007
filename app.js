/* app.js — ready-to-use quiz engine
   Assumes:
     - questions.js defines QUESTIONS (array)
     - styles.css and index.html elements exist with matching IDs
     - sounds/correct.mp3 and sounds/wrong.mp3 exist
*/

(() => {
  // CONFIG
  const BASE_POINTS = 10;
  const WRONG_PENALTY = 5;     // subtract points on wrong
  const TIME_BONUS_MULT = 1;   // time left itself added as bonus
  const PER_QUESTION_DEFAULT = 20; // default seconds

  // STATE
  let pool = [];
  let idx = 0;
  let score = 0;
  let correctCount = 0;
  let wrongCount = 0;
  let streak = 0;
  let currentTimer = null;
  let timeLeft = PER_QUESTION_DEFAULT;
  let perQuestionTime = PER_QUESTION_DEFAULT;
  let reviewWrong = []; // store objects {q, chosen}

  // DOM
  const qIndexEl = document.getElementById('qIndex');
  const qTotalEl = document.getElementById('qTotal');
  const questionEl = document.getElementById('question');
  const optionsEl = document.getElementById('options');
  const scoreEl = document.getElementById('score');
  const correctEl = document.getElementById('correctCount');
  const wrongEl = document.getElementById('wrongCount');
  const timeLeftEl = document.getElementById('timeLeft');
  const timeSelect = document.getElementById('timeSelect');
  const pauseBtn = document.getElementById('pauseBtn');
  const skipBtn = document.getElementById('skipBtn');
  const bigMark = document.getElementById('bigMark');

  const resultModal = document.getElementById('resultModal');
  const finalScoreEl = document.getElementById('finalScore');
  const finalCorrectEl = document.getElementById('finalCorrect');
  const finalWrongEl = document.getElementById('finalWrong');
  const eduMsgEl = document.getElementById('educationalMsg');
  const replayBtn = document.getElementById('replayBtn');
  const reviewBtn = document.getElementById('reviewBtn');
  const closeModal = document.getElementById('closeModal');
  const reviewList = document.getElementById('reviewList');
  const reviewUl = document.getElementById('reviewUl');
  const streakEl = document.getElementById('streak');

  // Sounds
  const correctSound = new Audio('sounds/correct.mp3');
  const wrongSound = new Audio('sounds/wrong.mp3');

  // Utilities
  function shuffleArray(a){
    for(let i=a.length-1;i>0;i--){
      const j = Math.floor(Math.random()*(i+1));
      [a[i],a[j]]=[a[j],a[i]];
    }
    return a;
  }

  function formatMsg(score, correct, wrong){
    const pct = Math.round((correct/(correct+wrong || 1))*100);
    if(pct >= 80) return "অসাধারণ! আপনি সামাজিক সচেতনতা নিয়ে খুবই ভাল।";
    if(pct >= 50) return "ভালো প্রচেষ্টা — কিছু আরও শিখুন ও মাঠে নীতিবোধ রাখুন।";
    return "জনগণের জন্য দায় শুরুর পয়েন্ট — সততা ও সহানুভূতি গড়ে তুলুন।";
  }

  // Init
  function initGame(){
    pool = shuffleArray(QUESTIONS.slice()); // QUESTIONS from questions.js
    idx = 0; score = 0; correctCount = 0; wrongCount = 0; streak=0; reviewWrong=[];
    perQuestionTime = parseInt(timeSelect.value || PER_QUESTION_DEFAULT, 10);
    qTotalEl.textContent = pool.length;
    updateStats();
    hideResult();
    renderQuestion();
  }

  function updateStats(){
    scoreEl.textContent = score;
    correctEl.textContent = correctCount;
    wrongEl.textContent = wrongCount;
    streakEl.textContent = streak;
  }

  // Render question
  function renderQuestion(){
    clearInterval(currentTimer);
    timeLeft = perQuestionTime;
    timeLeftEl.textContent = timeLeft;
    bigMark.classList.remove('show');
    if(idx >= pool.length){
      endGame();
      return;
    }

    const q = pool[idx];
    qIndexEl.textContent = idx+1;
    questionEl.textContent = q.question;
    optionsEl.innerHTML = '';

    // create buttons (4 options expected)
    q.options.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.type = 'button';
      btn.textContent = opt;
      btn.setAttribute('data-opt', opt);
      btn.setAttribute('aria-label', `option ${i+1}: ${opt}`);
      btn.addEventListener('click', () => handleAnswer(btn, opt));
      optionsEl.appendChild(btn);
    });

    // start timer
    currentTimer = setInterval(()=>{
      timeLeft--;
      timeLeftEl.textContent = timeLeft;
      if(timeLeft <= 0){
        clearInterval(currentTimer);
        handleTimeout();
      }
    }, 1000);
  }

  function disableOptions(){
    const btns = optionsEl.querySelectorAll('button');
    btns.forEach(b=> b.classList.add('disabled') , b=> b.disabled=true);
    btns.forEach(b=> b.disabled = true);
  }

  function handleAnswer(btn, selected){
    clearInterval(currentTimer);
    const q = pool[idx];
    const correct = q.answer;
    const btns = optionsEl.querySelectorAll('button');
    // disable options
    btns.forEach(b=> b.disabled = true);

    // mark correct button
    btns.forEach(b=>{
      if(b.getAttribute('data-opt') === correct){
        b.classList.add('option-correct');
      }
    });

    if(selected === correct){
      // correct
      streak++;
      correctCount++;
      const timeBonus = Math.max(0, timeLeft * TIME_BONUS_MULT);
      const earn = BASE_POINTS + timeBonus;
      score += earn;
      if(score < 0) score = 0;
      playSoundSafe(correctSound);
      showBigMark(true);
    } else {
      // wrong
      streak = 0;
      wrongCount++;
      score -= WRONG_PENALTY;
      if(score < 0) score = 0;
      btn.classList.add('option-wrong');
      playSoundSafe(wrongSound);
      // store for review
      reviewWrong.push({ q, chosen: selected });
      showBigMark(false);
    }
    updateStats();

    // small delay then next
    setTimeout(()=>{
      idx++;
      renderQuestion();
    }, 1100);
  }

  function handleTimeout(){
    // treat like wrong but no penalty maybe? Here we apply penalty but record no chosen
    streak = 0;
    wrongCount++;
    score -= WRONG_PENALTY;
    if(score < 0) score = 0;
    // highlight correct
    const q = pool[idx];
    const btns = optionsEl.querySelectorAll('button');
    btns.forEach(b=>{
      if(b.getAttribute('data-opt') === q.answer) b.classList.add('option-correct');
      b.disabled = true;
    });
    playSoundSafe(wrongSound);
    reviewWrong.push({ q, chosen: null });
    updateStats();
    showBigMark(false);
    setTimeout(()=>{ idx++; renderQuestion(); }, 1100);
  }

  function playSoundSafe(sound){
    try{
      sound.currentTime = 0;
      const p = sound.play();
      if(p && p.catch) p.catch(()=>{/* ignore autoplay blocked */});
    } catch(e){ /* ignore */ }
  }

  function showBigMark(isCorrect){
    bigMark.textContent = isCorrect ? '✅' : '❌';
    bigMark.classList.add('show');
    setTimeout(()=> bigMark.classList.remove('show'), 800);
  }

  function endGame(){
    clearInterval(currentTimer);
    showResult();
  }

  // Result modal
  function showResult(){
    finalScoreEl.textContent = score;
    finalCorrectEl.textContent = correctCount;
    finalWrongEl.textContent = wrongCount;
    eduMsgEl.textContent = formatMsg(score, correctCount, wrongCount);
    resultModal.classList.remove('hidden');
    // fill review list hidden by default
    reviewUl.innerHTML = '';
    reviewWrong.forEach(item=>{
      const li = document.createElement('li');
      const chosenText = item.chosen === null ? "(সময় শেষ)" : item.chosen;
      li.textContent = item.q.question + " — আপনার উত্তর: " + chosenText + " | সঠিক: " + item.q.answer;
      reviewUl.appendChild(li);
    });
    // save highscore
    const prev = parseInt(localStorage.getItem('bf007_high')||'0',10);
    if(score > prev) localStorage.setItem('bf007_high', score);
  }

  function hideResult(){
    resultModal.classList.add('hidden');
    reviewList.classList.add('hidden');
    reviewUl.innerHTML = '';
  }

  // Controls
  timeSelect.addEventListener('change', ()=>{
    perQuestionTime = parseInt(timeSelect.value,10);
  });

  pauseBtn.addEventListener('click', ()=>{
    if(currentTimer){
      clearInterval(currentTimer);
      currentTimer = null;
      pauseBtn.textContent = "Resume";
    } else {
      pauseBtn.textContent = "Pause";
      // resume ticking
      currentTimer = setInterval(()=>{
        timeLeft--;
        timeLeftEl.textContent = timeLeft;
        if(timeLeft <= 0){ clearInterval(currentTimer); handleTimeout(); }
      }, 1000);
    }
  });

  skipBtn.addEventListener('click', ()=>{
    clearInterval(currentTimer);
    // mark as skipped (count as wrong? here mark wrong but with chosen null)
    wrongCount++;
    reviewWrong.push({ q: pool[idx], chosen: "(Skipped)" });
    score -= WRONG_PENALTY;
    if(score < 0) score = 0;
    updateStats();
    showBigMark(false);
    setTimeout(()=>{ idx++; renderQuestion(); }, 600);
  });

  // modal buttons
  replayBtn.addEventListener('click', ()=>{
    hideResult();
    initGame();
  });
  reviewBtn.addEventListener('click', ()=>{
    reviewList.classList.toggle('hidden');
  });
  closeModal.addEventListener('click', ()=>{
    resultModal.classList.add('hidden');
  });

  // keyboard shortcuts
  window.addEventListener('keydown', (e)=>{
    if(resultModal && !resultModal.classList.contains('hidden')) return;
    const key = e.key;
    if(['1','2','3','4'].includes(key)){
      const btns = optionsEl.querySelectorAll('button');
      const idxKey = parseInt(key,10)-1;
      if(btns[idxKey]) btns[idxKey].click();
    } else if(key === 's' || key === 'S') skipBtn.click();
    else if(key === 'p' || key === 'P') pauseBtn.click();
  });

  // initialize on load
  function initGame(){
    // set totals
    qTotalEl.textContent = QUESTIONS.length;
    initGameVars();
    initGame(); // recursive? we'll rename inner to initGameVars to avoid confusion
  }

  // rename to avoid conflict: actual initializer
  function initGameVars(){
    pool = shuffleArray(QUESTIONS.slice());
    idx = 0;
    score = 0;
    correctCount = 0;
    wrongCount = 0;
    streak = 0;
    reviewWrong = [];
    perQuestionTime = parseInt(timeSelect.value || PER_QUESTION_DEFAULT, 10);
    qTotalEl.textContent = pool.length;
    updateStats();
    hideResult();
    renderQuestion();
  }

  // start
  initGameVars();

})();
