"use strict";
  let lfFlowTicker = null;

  function lfClockText(end) {
    const seconds = Math.max(0, Math.ceil((end - Date.now()) / 1000));
    return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  }

  function lfUpdateTimers() {
    const clock = document.getElementById("flow-clock");
    if (clock) {
      const end = Number(clock.dataset.ends);
      clock.textContent = lfClockText(end);
      if (end <= Date.now() && state.flow.active && state.flow.active.status === "running") {
        updateState((next) => { next.flow.active.status = "closing"; }, "Block time is up. Close it when ready.", true);
      }
    }
    const recovery = document.getElementById("recovery-clock");
    if (recovery) {
      const end = Number(recovery.dataset.ends);
      recovery.textContent = lfClockText(end);
      if (end <= Date.now() && state.flow.recovery) {
        updateState((next) => { next.flow.recovery = null; }, "Recovery timer complete.", true);
      }
    }
    if (!clock && !recovery && lfFlowTicker) {
      clearInterval(lfFlowTicker);
      lfFlowTicker = null;
    }
  }

  function wireFlowActions() {
    clearInterval(lfFlowTicker);
    lfFlowTicker = null;
    const start = document.getElementById("flow-start");
    if (start) start.addEventListener("click", () => {
      const checks = [...document.querySelectorAll("[data-preflight]")];
      const minutes = Number(document.getElementById("flow-duration").value);
      if (!Number.isFinite(minutes) || minutes < 1 || minutes > 180) {
        setStatus("Choose a block length from 1 to 180 minutes.", true);
        return;
      }
      const now = Date.now();
      updateState((next) => {
        next.flow.active = {
          id: lfNewId("flow"), status: "running", startedAt: now,
          endsAt: now + minutes * 60000, minutes, interruptions: 0,
          preflight: checks.filter((input) => input.checked).map((input) => input.parentElement.textContent.trim())
        };
      }, "Flow block started.", true);
    });
    const interrupt = document.getElementById("flow-interruption");
    if (interrupt) interrupt.addEventListener("click", () => updateState((next) => { next.flow.active.interruptions += 1; }, "Interruption counted. Return when ready.", true));
    const stop = document.getElementById("flow-stop");
    if (stop) stop.addEventListener("click", () => updateState((next) => { next.flow.active.status = "closing"; }, "Close the block with a short note.", true));
    const close = document.getElementById("flow-close-form");
    if (close) close.addEventListener("submit", (event) => {
      event.preventDefault();
      const end = Date.now();
      updateState((next) => {
        const session = next.flow.active;
        const minutes = Math.max(1, Math.round((end - session.startedAt) / 60000));
        next.flow.sessions.push({
          id: session.id, date: lfTodayISO(new Date(session.startedAt)),
          start: new Date(session.startedAt).toISOString(), end: new Date(end).toISOString(),
          minutes, interruptions: session.interruptions,
          preflight: session.preflight,
          resumeNote: document.getElementById("flow-resume").value.trim(),
          ratings: {
            focus: Number(document.getElementById("flow-rating-focus").value),
            energy: Number(document.getElementById("flow-rating-energy").value),
            satisfaction: Number(document.getElementById("flow-rating-satisfaction").value)
          }
        });
        next.flow.active = null;
      }, "Flow block closed. Choose recovery or another step.", true);
    });
    const recoveryEnd = document.getElementById("recovery-end");
    if (recoveryEnd) recoveryEnd.addEventListener("click", () => updateState((next) => { next.flow.recovery = null; }, "Recovery complete.", true));
    const recoveryStart = document.getElementById("flow-recovery-start");
    if (recoveryStart) recoveryStart.addEventListener("click", () => {
      const minutes = Number(document.getElementById("recovery-minutes").value) || 5;
      updateState((next) => { next.flow.recovery = { startedAt: Date.now(), until: Date.now() + minutes * 60000 }; }, "Recovery timer started.", true);
    });
    if (document.getElementById("flow-clock") || document.getElementById("recovery-clock")) {
      lfUpdateTimers();
      lfFlowTicker = setInterval(lfUpdateTimers, 1000);
    }
  }
