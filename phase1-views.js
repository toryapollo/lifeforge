"use strict";
  const LF_REMINDER_LABELS = Object.freeze({
    morning: "Morning launch",
    flow: "Flow start",
    evening: "Evening shutdown",
    weekly: "Sunday review",
    mission: "Mission due",
    srs: "Spaced repetition"
  });

  function renderPhase1Route(route) {
    const screens = {
      onboarding: renderOnboarding,
      today: renderToday,
      study: renderStudy,
      flow: renderFlow,
      weekly: renderWeekly
    };
    return screens[route] ? screens[route]() : "";
  }

  function renderPhase1Settings() {
    return `
      <section class="settings-group phase1-settings" aria-labelledby="reminders-title">
        <h2 id="reminders-title">Local reminders</h2>
        <p>Times use this device's local clock. Reminder choices stay on this device.</p>
        ${Object.entries(LF_REMINDER_LABELS).map(([kind, label]) => {
          const reminder = state.reminders[kind];
          return `<div class="field-row reminder-row">
            <div><label class="field-label" for="reminder-${kind}">${label}</label>
              <span class="field-help">${kind === "weekly" ? "Sunday" : kind === "srs" ? "Next due review" : kind === "mission" ? "Next mission deadline" : "Daily"}</span></div>
            <div class="reminder-controls">
              <input id="reminder-${kind}" type="checkbox" data-reminder-toggle="${kind}"${reminder.enabled ? " checked" : ""} aria-label="Enable ${label} reminder">
              <input id="reminder-time-${kind}" type="time" data-reminder-time="${kind}" value="${escapeHtml(reminder.time)}" aria-label="${label} reminder time">
            </div>
          </div>`;
        }).join("")}
        <p class="saved-note">Morning defaults to 07:00, Sunday review to 18:00, and evening shutdown to 20:30.</p>
      </section>`;
  }
