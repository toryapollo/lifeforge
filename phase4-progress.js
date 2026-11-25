"use strict";

function lfP4RenderScoreTrends() {
  return `<section aria-labelledby="p4-trends-title">
    <h2 id="p4-trends-title">Six-pillar score trends</h2>
    <div class="phase1-grid p4-pillar-grid">${LF_PILLARS.map((pillar) => {
      const history = lfP4ScoreHistory(pillar);
      const latest = history[history.length - 1];
      return `<article class="phase1-panel">
        <h3>${escapeHtml(pillar)}</h3>
        ${history.length ? `<p>Latest score: <strong>${latest.score} / 10</strong> · ${escapeHtml(latest.date)}</p>
          <ol class="p4-score-list">${history.map((entry) => `<li class="p4-score-row">
            <span>${escapeHtml(entry.date)}</span>
            <progress max="10" value="${entry.score}" aria-label="${escapeHtml(pillar)} score on ${escapeHtml(entry.date)}"></progress>
            <span>${entry.score} / 10</span>
          </li>`).join("")}</ol>` : '<p class="empty-state">No score saved. Complete a weekly review to start this trend.</p>'}
      </article>`;
    }).join("")}</div>
  </section>`;
}

function lfP4RenderEvidence() {
  return `<section class="phase1-panel" aria-labelledby="p4-evidence-title">
    <h2 id="p4-evidence-title">Practice evidence</h2>
    <p>Counts come from saved work on this device.</p>
    <ul class="p4-evidence-list">${lfP4EvidenceRows().map(([pillar, count, source]) => `
      <li><strong>${escapeHtml(pillar)}</strong><span>${count} entries</span><span>${escapeHtml(source)}</span></li>`).join("")}
    </ul>
  </section>`;
}

function lfP4RenderCalibration() {
  const calibration = lfP4Calibration();
  if (!calibration) {
    return `<section class="phase1-panel" aria-labelledby="p4-calibration-title">
      <h2 id="p4-calibration-title">Confidence calibration</h2>
      <p class="empty-state">No graded predictions yet. Rate your confidence before checking a mixed quiz answer.</p>
    </section>`;
  }
  return `<section class="phase1-panel" aria-labelledby="p4-calibration-title">
    <h2 id="p4-calibration-title">Confidence calibration</h2>
    <p>${calibration.attempts} quiz ${calibration.attempts === 1 ? "attempt" : "attempts"} · ${escapeHtml(calibration.reading)}</p>
    <div class="p4-calibration-list">
      <label>Predicted confidence <progress max="100" value="${calibration.predicted}">${calibration.predicted}%</progress><span>${calibration.predicted}%</span></label>
      <label>Actual accuracy <progress max="100" value="${calibration.actual}">${calibration.actual}%</progress><span>${calibration.actual}%</span></label>
    </div>
    <p class="field-help">This comparison describes your recorded answers; it is not a grade.</p>
  </section>`;
}

function lfP4RenderBenchmarks() {
  return `<section aria-labelledby="p4-benchmarks-title">
    <h2 id="p4-benchmarks-title">Day 1 / 30 / 90 comparisons</h2>
    <div class="phase1-grid p4-benchmark-grid">${[1, 30, 90].map((day) => {
      const values = lfP4BenchmarkValues(day);
      return `<article class="phase1-panel">
        <h3>Day ${day}</h3>
        <dl class="p4-benchmark-values">${values.map(([label, value]) => `
          <div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value || "No entry saved")}</dd></div>`).join("")}</dl>
        ${day === 1 && !state.profile.baseline.speaking ? '<p class="field-help">Record the Day 1 baseline in Start.</p>' : ""}
      </article>`;
    }).join("")}</div>
  </section>`;
}

function renderPhase4Progress() {
  const days = lfP4PracticeDays();
  return `<div class="phase4-screen">
    ${issueBanner()}
    <section aria-labelledby="route-title"><h1 class="page-title" id="route-title" tabindex="-1">Progress</h1><p class="lead">Review what you have practiced and choose the next checkpoint.</p></section>
    <section class="phase1-panel" aria-labelledby="p4-rhythm-title">
      <h2 id="p4-rhythm-title">Practice rhythm</h2>
      <p>${days ? `${days} practice ${days === 1 ? "day" : "days"} in the current rhythm.` : "No practice logged yet. Record a Study, Flow, or Today activity to start the count."}</p>
      <p class="field-help">One missed day is allowed; two missed days in a row restart the count. Start again without blame.</p>
    </section>
    ${lfP4RenderScoreTrends()}
    ${lfP4RenderEvidence()}
    ${lfP4RenderCalibration()}
    ${lfP4RenderBenchmarks()}
    <section class="phase1-panel" aria-labelledby="p4-checkpoint-title">
      <h2 id="p4-checkpoint-title">Save a checkpoint</h2>
      <p>Record what changed. Money snapshots are saved in Money, and speaking scores come from rated benchmark recordings.</p>
      <form id="p4-checkpoint-form" class="phase1-fields">
        <label for="p4-benchmark-day">Checkpoint day<select id="p4-benchmark-day"><option value="30">Day 30</option><option value="90">Day 90</option></select></label>
        <label for="p4-retention">Retention quiz result<textarea id="p4-retention" maxlength="800"></textarea></label>
        <label for="p4-body-retest">Body retest result<textarea id="p4-body-retest" maxlength="800"></textarea></label>
        <label for="p4-self-ratings">Self-ratings and notes<textarea id="p4-self-ratings" maxlength="800"></textarea></label>
        <button class="button button-primary" type="submit">Save checkpoint</button>
      </form>
    </section>
    <section class="phase1-panel" aria-labelledby="p4-summary-title">
      <h2 id="p4-summary-title">Seven-day accountability summary</h2>
      <p>Select and copy this text only if you choose to share it. Nothing is sent from this screen.</p>
      <label for="p4-accountability-summary">Summary text</label>
      <textarea id="p4-accountability-summary" rows="8" readonly>${escapeHtml(lfP4AccountabilitySummary())}</textarea>
      <button class="button button-secondary" id="p4-select-summary" type="button">Select summary text</button>
    </section>
  </div>`;
}
