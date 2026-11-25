"use strict";
  function renderFlow() {
    const active = state.flow.active;
    const recovery = state.flow.recovery;
    let panel = "";
    if (active && active.status === "closing") {
      panel = `<section class="phase1-panel"><h2>Close the block</h2><p>Record what happened so the next block can start cleanly.</p><form id="flow-close-form" class="phase1-fields"><label>Resume note<textarea id="flow-resume" maxlength="400">${escapeHtml(active.resumeNote || "")}</textarea></label><div class="scorecard-grid">${[["focus", "Focus"], ["energy", "Energy"], ["satisfaction", "Satisfaction"]].map(([key, label]) => `<label>${label} · 1 to 5<select id="flow-rating-${key}">${[1, 2, 3, 4, 5].map((n) => `<option value="${n}"${n === 3 ? " selected" : ""}>${n}</option>`).join("")}</select></label>`).join("")}</div><p>Interruptions counted: ${Number(active.interruptions) || 0}</p><button class="button button-primary" type="submit">Save close ratings</button></form></section>`;
    } else if (active && active.status === "running") {
      panel = `<section class="phase1-panel"><h2>Focused block</h2><p class="timer-display" id="flow-clock" data-ends="${Number(active.endsAt)}">--:--</p><p>Interruptions: <strong id="flow-interruptions">${Number(active.interruptions) || 0}</strong></p><div class="phase1-actions"><button class="button button-secondary" type="button" id="flow-interruption">Count an interruption</button><button class="button button-primary" type="button" id="flow-stop">Close this block</button></div><p class="quiet-copy">The timer is a support. You can close the block whenever you need.</p></section>`;
    } else if (recovery && recovery.until > Date.now()) {
      panel = `<section class="phase1-panel"><h2>Recovery</h2><p class="timer-display" id="recovery-clock" data-ends="${Number(recovery.until)}">--:--</p><button class="button button-secondary" type="button" id="recovery-end">Finish recovery</button></section>`;
    } else {
      panel = `<section class="phase1-panel"><h2>Preflight</h2><p>Make the next block easier to enter. Check what is useful; skip a step that does not fit.</p><div class="phase1-checks">${["Phone set aside", "Water nearby", "One clear next action", "Known stopping point"].map((item, index) => `<label><input type="checkbox" data-preflight="${index}">${item}</label>`).join("")}</div><label>Block length in minutes<input id="flow-duration" type="number" min="1" max="180" value="25"></label><button class="button button-primary" type="button" id="flow-start">Start flow block</button></section>`;
    }
    const recoveryControls = !active && !(recovery && recovery.until > Date.now())
      ? `<section class="phase1-panel"><h2>Recovery</h2><p>Take a short pause before the next block if that would help.</p><label>Minutes<input id="recovery-minutes" type="number" min="1" max="30" value="5"></label><button class="button button-secondary" type="button" id="flow-recovery-start">Start recovery timer</button></section>`
      : "";
    const history = state.flow.sessions.slice(-5).reverse().map((session) => `<li class="log-row">${escapeHtml(session.date)} · ${escapeHtml(session.minutes)} minutes · ${escapeHtml(session.ratings.focus || "")}/5 focus · ${escapeHtml(session.interruptions)} interruptions</li>`).join("");
    return `<div class="phase1-screen flow-screen">${issueBanner()}
      <section aria-labelledby="route-title"><p class="eyebrow">M03 · Protect a little attention</p><h1 class="page-title" id="route-title" tabindex="-1">Flow launcher</h1><p class="lead">Set up, begin, count interruptions without judgment, and close with a recovery note.</p></section>
      ${panel}${recoveryControls}<section class="phase1-panel"><h2>Recent blocks</h2><ul class="block-list">${history || "<li class=\"quiet-copy\">No flow blocks recorded yet.</li>"}</ul></section>
      ${lfModuleReference("M03")}
    </div>`;
  }
