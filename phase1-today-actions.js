"use strict";
  function lfNewId(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  function lfReorderBlocks(date, id, direction, targetId = "") {
    updateState((next) => {
      const blocks = next.calendar.timeBlocks.filter((block) => block.date === date).sort((a, b) => (a.order || 0) - (b.order || 0));
      const from = blocks.findIndex((block) => block.id === id);
      const to = targetId ? blocks.findIndex((block) => block.id === targetId) : from + direction;
      if (from < 0 || to < 0 || to >= blocks.length) return;
      const [moving] = blocks.splice(from, 1);
      blocks.splice(to, 0, moving);
      blocks.forEach((block, index) => { block.order = index; });
    }, "Time blocks reordered.", true);
  }

  function wireTodayActions() {
    const date = lfTodayISO();
    const outcome = document.getElementById("outcome-form");
    if (outcome) outcome.addEventListener("submit", (event) => {
      event.preventDefault();
      updateState((next) => {
        next.daily[date] = next.daily[date] || {};
        next.daily[date].outcome = document.getElementById("today-outcome").value.trim();
      }, "Today's outcome saved.");
    });
    const capture = document.getElementById("capture-form");
    if (capture) capture.addEventListener("submit", (event) => {
      event.preventDefault();
      const text = document.getElementById("capture-text").value.trim();
      if (!text) return;
      updateState((next) => next.captures.push({ id: lfNewId("capture"), date, text, done: false }), "Captured for today.", true);
    });
    const missionForm = document.getElementById("mission-form");
    if (missionForm) missionForm.addEventListener("submit", (event) => {
      event.preventDefault();
      updateState((next) => next.missions.push({
        id: lfNewId("mission"), title: document.getElementById("mission-title").value.trim(),
        date: document.getElementById("mission-date").value, time: document.getElementById("mission-time").value, done: false
      }), "Mission deadline saved.", true);
    });
    document.querySelectorAll("[data-mission-done]").forEach((button) => button.addEventListener("click", () => updateState((next) => {
      const mission = next.missions.find((entry) => entry.id === button.dataset.missionDone);
      if (mission) mission.done = true;
    }, "Mission marked done.", true)));
    const blockForm = document.getElementById("block-form");
    if (blockForm) blockForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const start = document.getElementById("block-start").value;
      const end = document.getElementById("block-end").value;
      if (!start || !end || start >= end) {
        setStatus("Choose an end time after the start time.", true);
        return;
      }
      updateState((next) => next.calendar.timeBlocks.push({
        id: lfNewId("block"), date, title: document.getElementById("block-title").value.trim(),
        start, end, type: "planned", order: next.calendar.timeBlocks.filter((block) => block.date === date).length, done: false
      }), "Time block added.", true);
    });
    document.querySelectorAll("[data-block-reblock]").forEach((button) => button.addEventListener("click", () => {
      const id = button.dataset.blockReblock;
      const row = button.closest("[data-block-row]");
      const start = row.querySelector("[data-block-start]").value;
      const end = row.querySelector("[data-block-end]").value;
      if (!start || !end || start >= end) {
        setStatus("Choose an end time after the start time.", true);
        return;
      }
      updateState((next) => {
        const block = next.calendar.timeBlocks.find((entry) => entry.id === id);
        if (block) Object.assign(block, { title: row.querySelector("[data-block-title]").value.trim(), start, end });
      }, "Time block updated.", true);
    }));
    document.querySelectorAll("[data-block-up],[data-block-down]").forEach((button) => button.addEventListener("click", () => {
      lfReorderBlocks(date, button.dataset.blockUp || button.dataset.blockDown, button.dataset.blockUp ? -1 : 1);
    }));
    document.querySelectorAll("[data-block-done]").forEach((input) => input.addEventListener("change", () => {
      const id = input.closest("[data-block-row]").dataset.blockRow;
      updateState((next) => { const block = next.calendar.timeBlocks.find((entry) => entry.id === id); if (block) block.done = input.checked; }, "Progress saved.", true);
    }));
    let dragged = "";
    document.querySelectorAll("[data-block-drag]").forEach((row) => {
      row.addEventListener("dragstart", () => { dragged = row.dataset.blockRow; });
      row.addEventListener("dragover", (event) => event.preventDefault());
      row.addEventListener("drop", (event) => { event.preventDefault(); if (dragged && dragged !== row.dataset.blockRow) lfReorderBlocks(date, dragged, 0, row.dataset.blockRow); });
    });
    document.querySelectorAll("[data-capture-done]").forEach((button) => button.addEventListener("click", () => {
      updateState((next) => { const item = next.captures.find((entry) => entry.id === button.dataset.captureDone); if (item) item.done = !item.done; }, "Capture list updated.", true);
    }));
    document.querySelectorAll("[data-morning-check]").forEach((input) => input.addEventListener("change", () => {
      updateState((next) => {
        const daily = next.daily[date] || (next.daily[date] = {});
        const checks = new Set(daily.morningChecks || []);
        input.checked ? checks.add(Number(input.dataset.morningCheck)) : checks.delete(Number(input.dataset.morningCheck));
        daily.morningChecks = [...checks];
      }, "Morning check saved.");
    }));
    wireTodayLogs(date);
  }

  function wireTodayLogs(date) {
    const metrics = document.getElementById("daily-metrics-form");
    if (metrics) metrics.addEventListener("submit", (event) => {
      event.preventDefault();
      updateState((next) => {
        const daily = next.daily[date] || (next.daily[date] = {});
        daily.metrics = {
          wake: document.getElementById("metric-wake").value,
          sleepH: Number(document.getElementById("metric-sleep").value) || 0,
          steps: Number(document.getElementById("metric-steps").value) || 0,
          mood: Number(document.getElementById("metric-mood").value) || null,
          protein: document.getElementById("metric-protein").checked,
          water: document.getElementById("metric-water").checked,
          caffeineCutoff: document.getElementById("metric-caffeineCutoff").checked,
          phoneOut: document.getElementById("metric-phoneOut").checked
        };
      }, "Daily strip saved.");
    });
    const sleep = document.getElementById("sleep-log-form");
    if (sleep) sleep.addEventListener("submit", (event) => {
      event.preventDefault();
      const hours = Number(document.getElementById("sleep-log-hours").value);
      updateState((next) => {
        next.health.sleepLogs.push({ id: lfNewId("sleep"), date, hours, note: document.getElementById("sleep-log-note").value.trim() });
        const daily = next.daily[date] || (next.daily[date] = {});
        daily.metrics = { ...(daily.metrics || {}), sleepH: hours };
      }, "Sleep log saved.", true);
    });
    const workout = document.getElementById("workout-log-form");
    if (workout) workout.addEventListener("submit", (event) => {
      event.preventDefault();
      updateState((next) => next.health.workouts.push({
        id: lfNewId("workout"), date, activity: document.getElementById("workout-name").value.trim(),
        minutes: Number(document.getElementById("workout-minutes").value), note: document.getElementById("workout-note").value.trim()
      }), "Workout log saved.", true);
    });
    const shutdown = document.getElementById("shutdown-form");
    if (shutdown) shutdown.addEventListener("submit", (event) => {
      event.preventDefault();
      const evidence = document.getElementById("shutdown-evidence").value.trim();
      const doneList = lfTimeBlocks(date).filter((block) => block.done).map((block) => block.title)
        .concat(state.captures.filter((item) => item.date === date && item.done).map((item) => item.text));
      updateState((next) => {
        const daily = next.daily[date] || (next.daily[date] = {});
        daily.shutdown = { completed: true, evidence, doneList, at: new Date().toISOString() };
        next.evidenceLog.push({ date, pillar: "SELF", line: evidence });
      }, "Shutdown saved. The day is complete as it was.", true);
    });
  }
