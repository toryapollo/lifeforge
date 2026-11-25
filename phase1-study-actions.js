"use strict";
  let lfFeynmanTimer = null;

  function lfStudyProgress(next, moduleId) {
    next.study.progress[moduleId] = next.study.progress[moduleId] || {};
    return next.study.progress[moduleId];
  }

  function wireStudyActions() {
    const select = document.getElementById("study-module");
    if (!select) return;
    select.addEventListener("change", () => updateState((next) => {
      next.study.activeModuleId = select.value;
      next.study.step = 0;
      next.study.quizIndex = 0;
      next.study.currentSession = null;
    }, "Study module changed.", true));
    const begin = document.getElementById("study-begin");
    if (begin) begin.addEventListener("click", () => updateState((next) => {
      next.study.activeModuleId = select.value;
      next.study.currentSession = { moduleId: select.value, startedAt: new Date().toISOString() };
      next.study.step = 0;
    }, "Study session started.", true));
    const nextStep = document.getElementById("study-next");
    if (nextStep) nextStep.addEventListener("click", () => {
      if (!state.study.currentSession) {
        setStatus("Begin the study session at the ungraded pretest first.", true);
        return;
      }
      if (Number(state.study.step) === 0 && !Array.isArray((state.study.progress[state.study.activeModuleId] || {}).pretestResponses)) {
        setStatus("Save the ungraded pretest before opening the lesson.", true);
        return;
      }
      updateState((next) => { next.study.step = Math.min(8, (Number(next.study.step) || 0) + 1); }, "Next study step.", true);
    });
    const back = document.getElementById("study-back");
    if (back) back.addEventListener("click", () => updateState((next) => { next.study.step = Math.max(0, (Number(next.study.step) || 0) - 1); }, "Previous study step.", true));
    const pretest = document.getElementById("pretest-form");
    if (pretest) pretest.addEventListener("submit", (event) => {
      event.preventDefault();
      const answers = [...pretest.querySelectorAll("[data-pretest-answer]")].map((input) => input.value);
      updateState((next) => { lfStudyProgress(next, next.study.activeModuleId).pretestResponses = answers; }, "Ungraded pretest saved.", true);
    });
    const blank = document.getElementById("save-blank-page");
    if (blank) blank.addEventListener("click", () => updateState((next) => { lfStudyProgress(next, next.study.activeModuleId).blankPage = document.getElementById("blank-page").value; }, "Recall note saved."));
    const feynman = document.getElementById("save-feynman");
    if (feynman) feynman.addEventListener("click", () => updateState((next) => { lfStudyProgress(next, next.study.activeModuleId).feynman = document.getElementById("feynman-note").value; }, "Teach-back saved."));
    const timer = document.getElementById("feynman-start");
    if (timer) timer.addEventListener("click", () => {
      clearInterval(lfFeynmanTimer);
      let seconds = 90;
      document.getElementById("feynman-clock").textContent = " 01:30";
      lfFeynmanTimer = setInterval(() => {
        seconds -= 1;
        const clock = document.getElementById("feynman-clock");
        if (!clock) return clearInterval(lfFeynmanTimer);
        clock.textContent = ` ${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
        if (seconds <= 0) {
          clearInterval(lfFeynmanTimer);
          setStatus("90 seconds complete. Save the teach-back if useful.");
        }
      }, 1000);
    });
    document.querySelectorAll("[data-wall-mark]").forEach((button) => button.addEventListener("click", () => {
      const moduleId = state.study.activeModuleId;
      const id = `${moduleId}|${button.dataset.wallMark}`;
      updateState((next) => { next.study.cards[id] = { ...(next.study.cards[id] || {}), wall: true }; }, "Card marked for review.");
    }));
    wireMixedQuiz();
    wireSrsRatings();
    const close = document.getElementById("study-close-form");
    if (close) close.addEventListener("submit", (event) => {
      event.preventDefault();
      const session = state.study.currentSession;
      updateState((next) => {
        const current = next.study.currentSession;
        const started = current ? new Date(current.startedAt).getTime() : Date.now();
        next.study.sessions.push({
          id: lfNewId("study"), moduleId: current ? current.moduleId : next.study.activeModuleId,
          start: current ? current.startedAt : new Date().toISOString(), end: new Date().toISOString(),
          minutes: Math.max(1, Math.round((Date.now() - started) / 60000)),
          reflection: document.getElementById("study-reflection").value.trim()
        });
        lfStudyProgress(next, next.study.activeModuleId).reflection = document.getElementById("study-reflection").value;
        next.study.currentSession = null;
      }, "Study session closed.", true);
    });
  }

  function wireMixedQuiz() {
    const form = document.getElementById("mixed-quiz-form");
    if (!form) return;
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const module = lfModule(form.dataset.quizModule);
      const quiz = lfQuizzes(module).find((item) => String(item.id) === form.dataset.quizId);
      const source = lfUnitText(module, quiz && quiz.unitId);
      if (!quiz || !quiz.answer || !source.includes(quiz.answer)) {
        setStatus("This quiz item does not match its source unit; it was not graded.", true);
        return;
      }
      const answer = document.getElementById("quiz-answer").value.trim();
      const confidence = Number(document.getElementById("quiz-confidence").value);
      const correct = answer === quiz.answer;
      const confident = document.getElementById("confident-error").checked && !correct;
      const cardId = `quiz|${module.id}|${quiz.id}`;
      updateState((next) => {
        const at = new Date().toISOString();
        next.study.lastQuiz = { id: quiz.id, moduleId: module.id, correct, confidence, confidentError: confident, at };
        next.study.quizAttempts.push({ id: lfNewId("quiz-attempt"), quizId: quiz.id, moduleId: module.id, confidence, correct, at });
        next.study.cards[cardId] = {
          ...lfCalculateSrs(next.study.cards[cardId] || {}, correct ? 4 : confident ? 1 : 2),
          confidentError: confident
        };
      }, correct ? "Answer matched the source-unit answer." : "Answer recorded for another retrieval.", false);
      const result = document.getElementById("quiz-result");
      result.textContent = correct ? "Correct. The answer is traceable to its source unit." : confident ? "Recorded as a confident error; the next review is scheduled soon." : "Not matched. Revisit the unit and retrieve it again.";
      document.getElementById("quiz-next").disabled = false;
    });
    const next = document.getElementById("quiz-next");
    if (next) next.addEventListener("click", () => updateState((nextState) => { nextState.study.quizIndex = (Number(nextState.study.quizIndex) || 0) + 1; }, "Next mixed question.", true));
  }

  function wireSrsRatings() {
    document.querySelectorAll("[data-srs-quality]").forEach((button) => button.addEventListener("click", () => {
      const id = button.closest("[data-srs-card]").dataset.srsCard;
      const quality = Number(button.dataset.srsQuality);
      updateState((next) => {
        const previous = next.study.cards[id] || {};
        next.study.cards[id] = { ...lfCalculateSrs(previous, quality), wall: Boolean(previous.wall), confidentError: quality < 3 && Boolean(previous.confidentError) };
      }, `Review saved. Next interval: ${lfCalculateSrs(state.study.cards[id] || {}, quality).intervalDays} day(s).`, true);
    }));
  }
