"use strict";
  function lfTimePlus(time, minutes) {
    const [hour, minute] = time.split(":").map(Number);
    const total = hour * 60 + minute + minutes;
    return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
  }

  function wireWeeklyActions() {
    const form = document.getElementById("weekly-form");
    if (!form) return;
    const step = Number(state.weeklyDraft.step) || 0;
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const notes = { ...(state.weeklyDraft.notes || {}) };
      const scorecard = { ...(state.weeklyDraft.scorecard || {}) };
      let outcomes = [...(state.weeklyDraft.outcomes || ["", "", ""])];
      let schedules = [];
      if (step < 5) notes[step] = document.getElementById("weekly-note").value.trim();
      if (step === 5) {
        LF_PILLARS.forEach((pillar) => { scorecard[pillar] = Number(document.getElementById(`score-${pillar}`).value) || 0; });
      }
      if (step === 6 || step === 7) outcomes = [1, 2, 3].map((i) => document.getElementById(`weekly-outcome-${i}`).value.trim());
      if (step === 7) {
        if (outcomes.some((value) => !value)) {
          setStatus("Choose three outcomes before saving the review.", true);
          return;
        }
        schedules = [1, 2, 3].map((i) => ({
          date: document.getElementById(`weekly-date-${i}`).value,
          start: document.getElementById(`weekly-time-${i}`).value,
          title: document.getElementById(`weekly-outcome-${i}`).value.trim()
        }));
        if (schedules.some((entry) => !entry.date || !entry.start)) {
          setStatus("Choose a date and start time for each outcome.", true);
          return;
        }
      }
      if (step < 7) {
        updateState((next) => {
          next.weeklyDraft = { ...next.weeklyDraft, step: step + 1, notes, scorecard, outcomes };
        }, "Review step saved.", true);
        return;
      }
      const kindness = document.getElementById("weekly-kindness").value.trim();
      const reviewDate = lfTodayISO();
      updateState((next) => {
        schedules.forEach((entry, index) => next.calendar.timeBlocks.push({
          id: lfNewId("weekly"), date: entry.date, title: entry.title, start: entry.start,
          end: lfTimePlus(entry.start, 60), type: "weekly-outcome",
          order: next.calendar.timeBlocks.filter((block) => block.date === entry.date).length, done: false, outcome: index + 1
        }));
        next.weeklyReviews.push({
          id: lfNewId("review"), date: reviewDate, pillarScorecard: scorecard,
          outcomes3: outcomes, notes, metrics: lfWeeklyMetrics(), selfCompassionLine: kindness,
          createdAt: new Date().toISOString()
        });
        next.weeklyDraft = { step: 0, notes: {}, outcomes: ["", "", ""], scorecard: {} };
      }, "Weekly review saved and outcomes placed on your calendar.", true);
    });
    const back = document.getElementById("weekly-back");
    if (back) back.addEventListener("click", () => updateState((next) => {
      next.weeklyDraft = { ...next.weeklyDraft, step: Math.max(0, step - 1) };
    }, "Previous review step.", true));
  }
