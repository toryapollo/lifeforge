"use strict";
  function wireReminderSettings() {
    document.querySelectorAll("[data-reminder-toggle]").forEach((input) => input.addEventListener("change", () => {
      const kind = input.dataset.reminderToggle;
      updateState((next) => { next.reminders[kind].enabled = input.checked; }, `${LF_REMINDER_LABELS[kind]} reminder saved.`);
    }));
    document.querySelectorAll("[data-reminder-time]").forEach((input) => input.addEventListener("change", () => {
      const kind = input.dataset.reminderTime;
      if (!/^\d{2}:\d{2}$/.test(input.value)) {
        setStatus("Choose a local reminder time.", true);
        return;
      }
      updateState((next) => { next.reminders[kind].time = input.value; }, `${LF_REMINDER_LABELS[kind]} time saved.`);
    }));
  }
