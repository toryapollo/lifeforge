"use strict";
  const LF_STUDY_STEPS = [
    "Ungraded pretest", "Read the lesson", "Blank-page recall", "Feynman teach-back",
    "Wall cards", "Mixed quiz", "Review confident errors", "Spaced repetition", "Close the session"
  ];

  function lfMixedQuizzes() {
    const rows = lfModules().map((module) => ({
      moduleId: module.id,
      quizzes: lfQuizzes(module)
    }));
    const mixed = [];
    for (let index = 0; rows.some((row) => row.quizzes[index]); index++) {
      rows.forEach((row) => { if (row.quizzes[index]) mixed.push({ ...row.quizzes[index], moduleId: row.moduleId }); });
    }
    return mixed;
  }

  function lfCalculateSrs(previous = {}, quality, reviewedAt = Date.now()) {
    const q = Math.max(0, Math.min(5, Number(quality) || 0));
    const ease = Number(previous.easeFactor) || 2.5;
    const repetitions = Number(previous.repetitions) || 0;
    const oldInterval = Number(previous.intervalDays) || 0;
    const nextEase = Math.max(1.3, ease + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));
    const nextRepetitions = q < 3 ? 0 : repetitions + 1;
    const intervalDays = q < 3 ? 1 : nextRepetitions === 1 ? 1 : nextRepetitions === 2 ? 6 : Math.max(1, Math.round(oldInterval * nextEase));
    return {
      repetitions: nextRepetitions,
      intervalDays,
      easeFactor: Number(nextEase.toFixed(2)),
      lapses: (Number(previous.lapses) || 0) + (q < 3 ? 1 : 0),
      dueAt: reviewedAt + intervalDays * 86400000
    };
  }
  window.LF_SRS_CALCULATE = lfCalculateSrs;

  function renderStudyStep(module, step) {
    const progress = state.study.progress[module.id] || {};
    if (step === 0) {
      const questions = lfPretestItems(module);
      return `<p>Pretest is explicitly ungraded. Write what you think before opening the lesson.</p><form id="pretest-form" class="phase1-fields">${questions.map((item, index) => `<label>${escapeHtml(item.question || item.prompt || item.text || `Prompt ${index + 1}`)}<textarea data-pretest-answer="${index}">${escapeHtml((progress.pretestResponses || [])[index] || "")}</textarea></label>`).join("")}<button class="button button-secondary" type="submit">Save ungraded pretest</button></form>`;
    }
    if (step === 1) return `<p>Read the unit text before using answer keys. The complete module record is available below.</p>${lfRenderValue(module.units)}`;
    if (step === 2) return `<label>Close the lesson and recall what you can. No grade is attached.<textarea id="blank-page" maxlength="5000">${escapeHtml(progress.blankPage || "")}</textarea></label><button class="button button-secondary" type="button" id="save-blank-page">Save recall</button>`;
    if (step === 3) return `<p>Explain one idea in plain language for 90 seconds. This private note stays on this device.</p><label>Teach-back note<textarea id="feynman-note" maxlength="3000">${escapeHtml(progress.feynman || "")}</textarea></label><button class="button button-secondary" type="button" id="feynman-start">Start 90 seconds</button><span id="feynman-clock" role="status"></span><button class="button button-quiet" type="button" id="save-feynman">Save note</button>`;
    if (step === 4) return `<p>Try to recall the front before opening each back. Use a wall card when you want to keep one visible.</p>${lfCards(module).map((card, index) => `<details class="phase1-card" data-wall-card="${escapeHtml(card.id || index)}"><summary>${lfRenderValue(card.front || card.question || card)}</summary><div>${lfRenderValue(card.back || card.answer || "")}</div><button type="button" class="button button-quiet" data-wall-mark="${escapeHtml(card.id || index)}">Mark for review</button></details>`).join("") || "<p>No cards in this module.</p>"}`;
    if (step === 5) {
      const quizzes = lfMixedQuizzes();
      const index = quizzes.length ? (Number(state.study.quizIndex) || 0) % quizzes.length : 0;
      const quiz = quizzes[index];
      return quiz ? `<form id="mixed-quiz-form" class="phase1-fields" data-quiz-id="${escapeHtml(quiz.id)}" data-quiz-module="${escapeHtml(quiz.moduleId)}"><p>Mixed question ${index + 1} of ${quizzes.length} · ${escapeHtml(quiz.moduleId)}</p><h3>${lfRenderValue(quiz.question)}</h3><label>Your answer, from memory<textarea id="quiz-answer" required></textarea></label><label>Before checking, how sure are you?<select id="quiz-confidence"><option value="20">20% · guessing</option><option value="40">40% · leaning no</option><option value="50" selected>50% · unsure</option><option value="60">60% · leaning yes</option><option value="80">80% · very sure</option><option value="100">100% · certain</option></select></label><label><input id="confident-error" type="checkbox"> I felt confident but may have missed it</label><button class="button button-primary" type="submit">Check against the source unit</button><p id="quiz-result" role="status"></p><button class="button button-secondary" id="quiz-next" type="button" disabled>Next mixed question</button></form>` : "<p>No graded quiz items are available in generated lesson content.</p>";
    }
    if (step === 6) return `<h3>Confident errors</h3>${Object.entries(state.study.cards).filter(([, card]) => card.confidentError).map(([id, card]) => `<p>${escapeHtml(id)} · review due ${new Date(card.dueAt).toLocaleDateString()}</p>`).join("") || "<p>No confident errors recorded. Treat misses as information for the next attempt.</p>"}`;
    if (step === 7) return `<p>Rate recall honestly. An error can be marked confident; the schedule still gives it another chance soon.</p>${lfCards(module).map((card, index) => {
      const id = `${module.id}|${card.id || index}`;
      const due = state.study.cards[id];
      return `<article class="phase1-card" data-srs-card="${escapeHtml(id)}"><h3>Card ${index + 1}</h3>${lfRenderValue(card)}<p>${due ? `Next due ${new Date(due.dueAt).toLocaleDateString()} · ${due.intervalDays} day interval` : "New card · due after your first review"}</p><div class="phase1-actions"><button class="button button-secondary" data-srs-quality="2" type="button">Again</button><button class="button button-secondary" data-srs-quality="3" type="button">Hard</button><button class="button button-secondary" data-srs-quality="4" type="button">Good</button><button class="button button-secondary" data-srs-quality="5" type="button">Easy</button></div></article>`;
    }).join("") || "<p>No cards are available in this module.</p>"}`;
    return `<form id="study-close-form" class="phase1-fields"><label>One thing to carry into practice<textarea id="study-reflection" maxlength="500">${escapeHtml(progress.reflection || "")}</textarea></label><button class="button button-primary" type="submit">Close study session</button></form>`;
  }

  function renderStudy() {
    const modules = lfModules();
    const module = lfModule(state.study.activeModuleId) || modules[0];
    const step = Math.min(8, Math.max(0, Number(state.study.step) || 0));
    const active = Boolean(state.study.currentSession);
    const progress = module ? state.study.progress[module.id] || {} : {};
    return `<div class="phase1-screen study-screen">${issueBanner()}
      <section aria-labelledby="route-title"><p class="eyebrow">M01 · Learn by retrieval</p><h1 class="page-title" id="route-title" tabindex="-1">Study session</h1><p class="lead">Pretest first, retrieve with the lesson closed, then check the source.</p></section>
      <section class="phase1-panel"><label>Module<select id="study-module">${modules.map((item) => `<option value="${escapeHtml(item.id)}"${module && item.id === module.id ? " selected" : ""}>${escapeHtml(item.id)} · ${escapeHtml(item.title)}</option>`).join("")}</select></label><div class="study-steps"><p id="study-step">Step ${step + 1} of 9 · ${LF_STUDY_STEPS[step]}</p>${active ? `<span>Session in progress</span>` : `<button class="button button-primary" type="button" id="study-begin">Begin study session</button>`}</div></section>
      ${module ? `<section class="phase1-panel"><h2>${escapeHtml(module.id)} · ${escapeHtml(module.title)}</h2><div class="phase1-actions"><button class="button button-secondary" type="button" id="study-back"${step === 0 ? " disabled" : ""}>Previous</button><button class="button button-secondary" type="button" id="study-next"${step === 8 ? " disabled" : ""}>Next step</button></div>${renderStudyStep(module, step)}</section>${step > 0 || Array.isArray(progress.pretestResponses) ? lfModuleReference(module.id) : ""}` : `<section class="phase1-panel"><p>Generated lesson modules are required to start a study session.</p></section>`}
    </div>`;
  }
