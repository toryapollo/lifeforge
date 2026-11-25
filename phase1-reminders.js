"use strict";
  function lfNextMissionReminder(reminder) {
    const next = state.missions.filter((mission) => !mission.done && mission.date)
      .sort((a, b) => a.date.localeCompare(b.date))[0];
    if (!next) return null;
    const time = reminder.time || next.time || "09:00";
    const epoch = new Date(`${next.date}T${time}:00`).getTime();
    return Number.isFinite(epoch) ? Math.max(Date.now() + 60000, epoch) : null;
  }

  function lfNextSrsReminder(reminder) {
    const due = Object.values(state.study.cards).map((card) => Number(card.dueAt)).filter((time) => Number.isFinite(time));
    if (!due.length) return null;
    const date = lfTodayISO(new Date(Math.min(...due)));
    const epoch = new Date(`${date}T${reminder.time || "07:30"}:00`).getTime();
    return Number.isFinite(epoch) ? Math.max(Date.now() + 60000, epoch) : null;
  }

  function lfSyncReminders() {
    if (!isAndroidNative || !window.LFNative || typeof window.LFNative.reminder !== "function") return;
    const settings = state.reminders;
    const errors = [];
    const send = (value) => {
      try {
        window.LFNative.reminder(value);
      } catch (error) {
        errors.push(error.message || "Reminder bridge unavailable.");
      }
    };
    const cancel = (value) => {
      try {
        window.LFNative.cancelReminder(value);
      } catch (error) {
        errors.push(error.message || "Reminder cancellation bridge unavailable.");
      }
    };
    ["morning", "flow", "evening", "weekly"].forEach((kind) => {
      const reminder = settings[kind];
      const weekday = kind === "weekly" ? reminder.weekday || "7" : "*";
      const payload = `recurring|${kind}|${reminder.enabled}|${reminder.time}|${weekday}`;
      if (reminder.enabled) send(payload);
      else cancel(payload);
    });
    const targets = { mission: lfNextMissionReminder(settings.mission), srs: lfNextSrsReminder(settings.srs) };
    ["mission", "srs"].forEach((kind) => {
      const reminder = settings[kind];
      const previous = state.reminderSchedule[kind];
      const target = reminder.enabled ? targets[kind] : null;
      if (previous && previous !== target) cancel(`once|${kind}|${previous}`);
      if (target) send(`once|${kind}|${target}`);
    });
    const changed = Object.keys(targets).some((kind) => state.reminderSchedule[kind] !== (settings[kind].enabled ? targets[kind] : null));
    if (changed) {
      state.reminderSchedule = {
        mission: settings.mission.enabled ? targets.mission : null,
        srs: settings.srs.enabled ? targets.srs : null
      };
      const errorsSavingSchedule = saveLocalMirror();
      if (errorsSavingSchedule.length) errors.push(...errorsSavingSchedule);
    }
    if (errors.length) setStatus(`Local data saved, but a reminder could not be set: ${errors.join(" ")}`, true);
  }
