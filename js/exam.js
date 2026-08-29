/* ============================================================
   RUI CONECTI — exam.js
   Motor da prova interativa (usado em pages/prova.html).
   Espera que window.EXAM_DATA já esteja definido por um
   script de dados (ex.: js/data/2015-d1.js) carregado antes
   deste arquivo.
   ============================================================ */

(function () {
  const data = window.EXAM_DATA;
  if (!data) return;

  const state = {
    current: 0,
    answers: new Array(data.total).fill(null), // letra escolhida, por índice
    score: 0,
    seconds: 0,
    timerId: null,
    running: false,
    finished: false,
  };

  const els = {};

  // Este arquivo é carregado dinamicamente (via prova.html), depois que a
  // página já terminou de carregar — então o evento DOMContentLoaded já
  // disparou antes dele existir. Por isso, iniciamos direto, sem esperar
  // por esse evento.
  init();

  function init() {
    cacheEls();
    fillStaticInfo();
    bindStartScreen();
  }

  function cacheEls() {
    els.startScreen = document.getElementById('exam-start');
    els.quizScreen = document.getElementById('exam-quiz');
    els.resultScreen = document.getElementById('exam-result');

    els.startTitle = document.getElementById('exam-start-title');
    els.startAreas = document.getElementById('exam-start-areas');
    els.startTotal = document.getElementById('exam-start-total');
    els.startPdf = document.getElementById('exam-start-pdf');
    els.startBtn = document.getElementById('exam-start-btn');

    els.timerDisplay = document.getElementById('exam-timer-display');
    els.timerToggle = document.getElementById('exam-timer-toggle');
    els.timerPlayIcon = document.getElementById('exam-timer-play-icon');
    els.timerPauseIcon = document.getElementById('exam-timer-pause-icon');
    els.progressInfo = document.getElementById('exam-progress-info');
    els.scorePill = document.getElementById('exam-score-pill');

    els.questionImage = document.getElementById('exam-question-image');
    els.altGrid = document.getElementById('exam-alt-grid');
    els.feedback = document.getElementById('exam-feedback');
    els.nextBtn = document.getElementById('exam-next-btn');

    els.resultScoreValue = document.getElementById('exam-result-score-value');
    els.resultTime = document.getElementById('exam-result-time');
    els.resultCorrect = document.getElementById('exam-result-correct');
    els.resultWrong = document.getElementById('exam-result-wrong');
    els.resultPdf = document.getElementById('exam-result-pdf');
  }

  function fillStaticInfo() {
    document.title = data.titulo + ' — Rui Conecti';
    if (els.startTitle) els.startTitle.textContent = data.titulo;
    if (els.startAreas) els.startAreas.textContent = data.areas;
    if (els.startTotal) els.startTotal.textContent = data.total + ' questões';
    if (els.startPdf) els.startPdf.setAttribute('href', data.pdf);
    if (els.resultPdf) els.resultPdf.setAttribute('href', data.pdf);
  }

  function bindStartScreen() {
    if (!els.startBtn) return;
    els.startBtn.addEventListener('click', () => {
      els.startScreen.hidden = true;
      els.quizScreen.hidden = false;
      startTimer();
      renderQuestion();
    });

    if (els.timerToggle) {
      els.timerToggle.addEventListener('click', toggleTimer);
    }
    if (els.nextBtn) {
      els.nextBtn.addEventListener('click', goNext);
    }
  }

  /* ---------------- Cronômetro ---------------- */

  function startTimer() {
    state.running = true;
    updateTimerBtn();
    // Só cria o interval uma vez; pausar/continuar apenas alterna a flag
    // state.running, que o próprio interval verifica a cada tick. Isso evita
    // bugs de criar/destruir o timer repetidamente.
    if (!state.timerId) {
      state.timerId = setInterval(() => {
        if (!state.running) return;
        state.seconds++;
        renderTimer();
      }, 1000);
    }
  }

  function pauseTimer() {
    state.running = false;
    updateTimerBtn();
  }

  function toggleTimer() {
    if (state.finished) return;
    if (state.running) {
      pauseTimer();
    } else {
      startTimer();
    }
  }

  function stopTimer() {
    state.running = false;
    clearInterval(state.timerId);
    state.timerId = null;
  }

  function updateTimerBtn() {
    if (!els.timerPlayIcon || !els.timerPauseIcon) return;
    els.timerPlayIcon.hidden = state.running;
    els.timerPauseIcon.hidden = !state.running;
    els.timerToggle.setAttribute('aria-label', state.running ? 'Pausar cronômetro' : 'Continuar cronômetro');
  }

  function renderTimer() {
    if (!els.timerDisplay) return;
    const h = Math.floor(state.seconds / 3600);
    const m = Math.floor((state.seconds % 3600) / 60);
    const s = state.seconds % 60;
    const pad = (n) => String(n).padStart(2, '0');
    els.timerDisplay.textContent = h > 0
      ? `${pad(h)}:${pad(m)}:${pad(s)}`
      : `${pad(m)}:${pad(s)}`;
  }

  function formatDuration(totalSeconds) {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    const pad = (n) => String(n).padStart(2, '0');
    return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
  }

  /* ---------------- Questões ---------------- */

  function renderQuestion() {
    const q = data.questions[state.current];
    els.questionImage.src = data.imgBase + q.img;
    els.questionImage.alt = 'Questão ' + q.num;

    els.progressInfo.textContent = `Questão ${state.current + 1} de ${data.total}`;
    updateScorePill();

    els.feedback.hidden = true;
    els.feedback.className = 'exam-feedback';
    els.nextBtn.hidden = true;
    els.nextBtn.textContent = (state.current === data.total - 1) ? 'Ver resultado' : 'Próxima questão';

    const already = state.answers[state.current];

    els.altGrid.innerHTML = '';
    ['A', 'B', 'C', 'D', 'E'].forEach((letter) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'exam-alt-btn';
      btn.innerHTML = `<span class="alt-marker">${letter}</span>`;
      btn.dataset.letter = letter;

      if (already) {
        applyAnswerStyles(btn, letter, already, q.correct);
        btn.disabled = true;
      } else {
        btn.addEventListener('click', () => selectAnswer(letter));
      }

      els.altGrid.appendChild(btn);
    });

    if (already) {
      showFeedback(already, q.correct);
      els.nextBtn.hidden = false;
    }
  }

  function selectAnswer(letter) {
    const q = data.questions[state.current];
    state.answers[state.current] = letter;

    if (letter === q.correct) {
      state.score++;
    }
    updateScorePill();

    const buttons = els.altGrid.querySelectorAll('.exam-alt-btn');
    buttons.forEach((btn) => {
      applyAnswerStyles(btn, btn.dataset.letter, letter, q.correct);
      btn.disabled = true;
    });

    showFeedback(letter, q.correct);
    els.nextBtn.hidden = false;
  }

  function applyAnswerStyles(btn, btnLetter, chosenLetter, correctLetter) {
    if (btnLetter === correctLetter) {
      btn.classList.add('is-correct');
    } else if (btnLetter === chosenLetter) {
      btn.classList.add('is-wrong');
    } else {
      btn.classList.add('is-dimmed');
    }
  }

  function showFeedback(chosenLetter, correctLetter) {
    const isCorrect = chosenLetter === correctLetter;
    els.feedback.hidden = false;
    els.feedback.classList.add(isCorrect ? 'is-correct' : 'is-wrong');
    els.feedback.textContent = isCorrect
      ? 'Você acertou! +1 ponto'
      : `Você errou. A resposta certa era a alternativa ${correctLetter}.`;
  }

  function updateScorePill() {
    if (els.scorePill) {
      els.scorePill.textContent = `${state.score} / ${data.total} pontos`;
    }
  }

  function goNext() {
    if (state.current < data.total - 1) {
      state.current++;
      renderQuestion();
      els.quizScreen.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      finishExam();
    }
  }

  function finishExam() {
    state.finished = true;
    stopTimer();
    els.quizScreen.hidden = true;
    els.resultScreen.hidden = false;

    els.resultScoreValue.innerHTML = `${state.score}<small> / ${data.total}</small>`;
    els.resultTime.textContent = formatDuration(state.seconds);

    let correctCount = 0, wrongCount = 0;
    state.answers.forEach((a, i) => {
      if (a === null) return;
      if (a === data.questions[i].correct) correctCount++; else wrongCount++;
    });
    els.resultCorrect.textContent = correctCount;
    els.resultWrong.textContent = (data.total - correctCount);
  }
})();
