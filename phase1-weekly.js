"use strict";
  const LF_WEEKLY_STEPS = [
    "Review the week",
    "Notice what worked",
    "Name friction without blame",
    "Check energy and rest",
    "Check learning and relationships",
    "Score the six pillars",
    "Choose three outcomes",
    "Place the outcomes and close"
  ];
  const LF_PILLARS = ["SYSTEM", "MIND", "BODY", "MONEY", "VOICE", "SELF"];

  function lfWeeklyMetrics() {
    const dates = Array.from({ length: 7 }, (_, i) => lfDateAfter(-i));
    const days = dates.map((date) => state.daily[date] || {});
    const sleep = days.map((day) => Number(day.metrics && day.metrics.sleepH)).filter(Number.isFinite);
    const blocks = state.calendar.timeBlocks.filter((block) => dates.includes(block.date) && block.done).length;
    const flow = state.flow.sessions.filter((session) => dates.includes(session.date));
    const studies = state.study.sessions.filter((session) => session.start && dates.includes(lfTodayISO(new Date(session.start)))).length;
    const evidence = state.evidenceLog.filter((entry) => dates.includes(entry.date)).length;
    const workouts = state.health.workouts.filter((entry) => dates.includes(entry.date)).length;
    return {
      sleep: sleep.length ? (sleep.reduce((sum, value) => sum + value, 0) / sleep.length).toFixed(1) : "No sleep logs",
      blocks, flow: flow.reduce((sum, entry) => sum + Number(entry.minutes || 0), 0), studies, evidence, workouts,
      moneyBaseline: Boolean(state.profile.baseline && state.profile.baseline.money),
      voiceBaseline: Boolean(state.profile.baseline && state.profile.baseline.speaking)
    };
  }

  function lfPillarEvidence(metrics, pillar) {
    const evidence = {
      SYSTEM: `${metrics.blocks} completed blocks`,
      MIND: `${metrics.studies} study sessions`,
      BODY: `${metrics.sleep} average logged sleep hours; ${metrics.workouts} workout logs`,
      MONEY: metrics.moneyBaseline ? "Day-one money note saved" : "No money baseline saved",
      VOICE: metrics.voiceBaseline ? "Day-one speaking note saved" : "No speaking baseline saved",
      SELF: `${metrics.evidence} evidence notes; ${metrics.flow} flow minutes`
    };
    return evidence[pillar];
  }

  function renderWeekly() {
    const draft = state.weeklyDraft || { step: 0, notes: {}, outcomes: ["", "", ""], scorecard: {} };
    const step = Math.min(7, Math.max(0, Number(draft.step) || 0));
    const metrics = lfWeeklyMetrics();
    let content = "";
    if (step < 5) content = `<label>${["What did the calendar show?", "What worked, even in a small way?", "Where did friction show up?", "How did energy and rest feel?", "What did you learn or practice with people?"][step]}<textarea id="weekly-note" maxlength="800">${escapeHtml((draft.notes || {})[step] || "")}</textarea></label>`;
    if (step === 5) content = `<div class="scorecard-grid">${LF_PILLARS.map((pillar) => `<label>${pillar} · 0 to 10<small class="field-help">${escapeHtml(lfPillarEvidence(metrics, pillar))}</small><input type="number" min="0" max="10" id="score-${pillar}" value="${escapeHtml(draft.scorecard[pillar] ?? "")}"></label>`).join("")}</div>`;
    if (step === 6 || step === 7) content = `<div class="phase1-fields">${[0, 1, 2].map((i) => `<label>Outcome ${i + 1}<input id="weekly-outcome-${i + 1}" value="${escapeHtml(draft.outcomes[i] || "")}" maxlength="160" required></label>${step === 7 ? `<div class="block-editor"><label>Date<input id="weekly-date-${i + 1}" type="date" value="${lfDateAfter(i + 1)}"></label><label>Start time<input id="weekly-time-${i + 1}" type="time" value="${["09:00", "13:00", "16:00"][i]}"></label></div>` : ""}`).join("")}${step === 7 ? `<label>Self-compassion line<input id="weekly-kindness" value="${escapeHtml(draft.selfCompassionLine || "")}" maxlength="240" placeholder="A kind, practical sentence for next week"></label>` : ""}</div>`;
    const reviews = state.weeklyReviews.slice(-3).reverse().map((review) => `<li class="review-row">${escapeHtml(review.date)} · ${escapeHtml((review.outcomes3 || []).filter(Boolean).join("; "))}</li>`).join("");
    return `<div class="phase1-screen weekly-screen">
      ${issueBanner()}
      <section aria-labelledby="route-title"><p class="eyebrow">M09 · Sunday review</p><h1 class="page-title" id="route-title" tabindex="-1">Weekly review</h1><p class="lead">Look back with curiosity, then choose three workable outcomes.</p></section>
      <section class="phase1-panel"><h2>Last seven days</h2><div class="phase1-grid"><p>Average logged sleep: ${escapeHtml(metrics.sleep)} hours</p><p>Completed time blocks: ${metrics.blocks}</p><p>Flow minutes: ${metrics.flow}</p><p>Evidence notes: ${metrics.evidence}</p><p>Workout logs: ${metrics.workouts}</p></div></section>
      <section class="phase1-panel"><p class="phase1-step-indicator" id="weekly-step">Step ${step + 1} of 8 · ${LF_WEEKLY_STEPS[step]}</p><form id="weekly-form" class="phase1-fields">${content}<div class="phase1-actions"><button class="button button-secondary" type="button" id="weekly-back"${step === 0 ? " disabled" : ""}>Previous</button><button class="button button-primary" type="submit" id="weekly-next">${step === 7 ? "Save review and blocks" : "Save and continue"}</button></div></form></section>
      <section class="phase1-panel"><h2>Recent reviews</h2><ul class="block-list">${reviews || "<li class=\"quiet-copy\">Your first review will appear here.</li>"}</ul></section>
      ${lfModuleReference("M09")}
    </div>`;
  }
