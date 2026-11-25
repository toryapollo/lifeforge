"use strict";

function wirePhase3TalkActions() {
  const form = document.getElementById("prep-form");
  if (form) form.addEventListener("submit", (event) => {
    event.preventDefault();
    const sheet = { id: form.dataset.prepId || lfP3Id("prep") };
    form.querySelectorAll("[data-prep-field]").forEach((field) => {
      sheet[field.dataset.prepField] = field.value.trim();
    });
    updateState((next) => {
      const index = next.journals.conversationPrepSheets.findIndex((item) => item.id === sheet.id);
      if (index < 0) next.journals.conversationPrepSheets.unshift(sheet);
      else next.journals.conversationPrepSheets[index] = sheet;
      next.phase3.activePrepSheetId = sheet.id;
    }, "Conversation prep sheet saved on this device.");
    render();
  });
  const prepSelect = document.getElementById("prep-select");
  if (prepSelect) prepSelect.addEventListener("change", () => {
    updateState((next) => { next.phase3.activePrepSheetId = prepSelect.value; }, "Prep sheet selected.");
    render();
  });
  const newPrep = document.getElementById("prep-new");
  if (newPrep) newPrep.addEventListener("click", () => {
    const id = lfP3Id("prep");
    updateState((next) => {
      next.journals.conversationPrepSheets.unshift({ id, title: "New conversation" });
      next.phase3.activePrepSheetId = id;
    }, "New prep sheet ready.");
    render();
  });
  const start = document.getElementById("roleplay-start");
  if (start) start.addEventListener("click", () => {
    const roleplayId = document.getElementById("roleplay-select").value;
    const id = lfP3Id("roleplay");
    updateState((next) => {
      next.journals.rolePlaySessions.unshift({
        id, roleplayId, branch: "", nodeId: "start", choices: [],
        startedAt: new Date().toISOString()
      });
      next.phase3.activeRolePlayId = id;
    }, "Local scripted role-play started.");
    render();
  });
  const stage = document.getElementById("roleplay-stage");
  if (stage) stage.addEventListener("click", (event) => {
    const button = event.target.closest("[data-roleplay-choice]");
    if (!button) return;
    const sessionId = state.phase3.activeRolePlayId;
    const session = state.journals.rolePlaySessions.find((item) => item.id === sessionId);
    const roleplay = LF_P3_ROLEPLAYS.find((item) => item.id === session.roleplayId);
    const node = roleplay.nodes[session.nodeId];
    const choice = node.choices.find((item) => item.id === button.dataset.roleplayChoice);
    updateState((next) => {
      const current = next.journals.rolePlaySessions.find((item) => item.id === sessionId);
      if (current.nodeId === "start") current.branch = choice.id;
      current.choices.push(choice.id);
      current.nodeId = choice.next;
      current.feedback = choice.feedback;
    }, "Role-play choice saved.");
    render();
  });
}
