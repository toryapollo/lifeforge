"use strict";

function renderPhase3ConversationView() {
  const module = LF_CONTENT.modules.find((item) => item.id === "M10");
  const sheets = state.journals.conversationPrepSheets || [];
  const active = sheets.find((sheet) => sheet.id === state.phase3.activePrepSheetId);
  const session = (state.journals.rolePlaySessions || []).find((item) => item.id === state.phase3.activeRolePlayId);
  const roleplay = LF_P3_ROLEPLAYS.find((item) => item.id === (session && session.roleplayId));
  const node = roleplay && session && roleplay.nodes[session.nodeId];
  const prepFields = [
    ["heart", "What do I want for me, them, and the relationship?"],
    ["theirInterests", "Their interests (what might matter to them?)"],
    ["myInterests", "My interests (what matters to me?)"],
    ["facts", "Observable facts, without labels"],
    ["story", "My interpretation, stated tentatively"],
    ["accusationAudit", "Accusation audit: what might they worry I will do?"],
    ["opening", "Contrasting opening and first question"],
    ["questions", "Three calibrated questions and two labels"],
    ["objectiveCriteria", "Objective criteria or verified evidence"],
    ["anchor", "Anchor or bolstering range, with justification"],
    ["reservation", "Reservation point: the least acceptable terms"],
    ["batna", "BATNA (Best Alternative To a Negotiated Agreement): my best alternative and one way to improve it"],
    ["trades", "Possible trades that are honest and useful to both sides"],
    ["nextStep", "Who will do what by when?"]
  ];
  const roleplays = LF_P3_ROLEPLAYS.map((item) => `<option value="${item.id}" ${session && session.roleplayId === item.id ? "selected" : ""}>${escapeHtml(item.title)}</option>`).join("");
  const stage = node ? `<div class="p3-roleplay-stage" data-node="${escapeHtml(session.nodeId)}">
    <h3>${escapeHtml(roleplay.title)}</h3>
    <p>${escapeHtml(node.prompt || node.outcome)}</p>
    ${session.feedback ? `<p class="p3-feedback">${escapeHtml(session.feedback)}</p>` : ""}
    ${node.choices ? `<div class="p3-roleplay-choices">${node.choices.map((choice) => `<button class="button button-secondary" type="button" data-roleplay-choice="${choice.id}">${escapeHtml(choice.label)}</button>`).join("")}</div>` : ""}
  </div>` : '<p id="roleplay-stage" class="empty-state">Start a local scripted practice to choose a response.</p>';
  return `
    <div class="phase3-screen">
      <section aria-labelledby="route-title">
        <p class="eyebrow">M10 · Influence &amp; Hard Conversations</p>
        <h1 class="page-title" id="route-title" tabindex="-1">Prepare for the conversation.</h1>
        <p class="lead">Practice honest, respectful conversations with evidence, clear questions, and a next step. This screen uses local scripts only; it does not call an AI service.</p>
        <div class="page-actions">
          <a class="button button-secondary" href="#/speak">Go to Speak</a>
        </div>
      </section>
      <section class="p3-group" aria-labelledby="p3-prep-title">
        <h2 id="p3-prep-title">One-page conversation prep</h2>
        <p>Separate facts from your story. Use real numbers and objective criteria; never invent a competing offer or result.</p>
        ${sheets.length ? `<label class="p3-review-select">Saved prep sheets
          <select id="prep-select">${sheets.map((sheet) => `<option value="${escapeHtml(sheet.id)}" ${active && active.id === sheet.id ? "selected" : ""}>${escapeHtml(sheet.title || "Untitled conversation")}</option>`).join("")}</select>
        </label>` : ""}
        <form id="prep-form" class="p3-prep-form" data-prep-id="${escapeHtml(active && active.id || "")}">
          <label>Conversation name<input id="prep-title" data-prep-field="title" maxlength="80" value="${escapeHtml(active && active.title || "")}" placeholder="For example, lab partner check-in"></label>
          <div class="p3-fields">${prepFields.map(([key, label]) => `<label>${escapeHtml(label)}
            <textarea id="prep-${key}" data-prep-field="${key}" rows="3">${escapeHtml(active && active[key] || "")}</textarea>
          </label>`).join("")}</div>
          <div class="p3-actions">
            <button class="button button-primary" id="prep-save" type="submit">Save prep sheet</button>
            <button class="button button-secondary" id="prep-new" type="button">New prep sheet</button>
          </div>
        </form>
      </section>
      <section class="p3-group" aria-labelledby="p3-roleplay-title">
        <h2 id="p3-roleplay-title">Ethical negotiation practice</h2>
        <p>Use accurate information, respect the other person's choice, and look for options that address real interests.</p>
        <div class="p3-fields">
          <label>Scenario<select id="roleplay-select">${roleplays}</select></label>
          <button class="button button-primary" id="roleplay-start" type="button">Start a new role-play</button>
        </div>
        <div id="roleplay-stage">${stage}</div>
      </section>
      <section class="p3-group" aria-labelledby="p3-scripts-title">
        <h2 id="p3-scripts-title">Script library</h2>
        <div class="p3-scripts">${LF_P3_SCRIPTS.map((script) => `<details><summary>${escapeHtml(script.title)}</summary><p>${escapeHtml(script.text)}</p></details>`).join("")}</div>
      </section>
      <section class="p3-group" aria-labelledby="p3-map-title">
        <h2 id="p3-map-title">M10 practice map</h2>
        <details><summary>Learning objectives</summary><ul class="p3-objectives">${module.objectives.map((objective) => `<li>${escapeHtml(objective.text)}</li>`).join("")}</ul></details>
        <details><summary>Practice drills</summary><ul class="p3-objectives">${module.drills.map((drill) => `<li>${escapeHtml(drill.text)}</li>`).join("")}</ul></details>
      </section>
    </div>`;
}
