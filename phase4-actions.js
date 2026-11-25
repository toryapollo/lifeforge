"use strict";

let lfP4ActiveCheckpointDay = 30;

function wirePhase4Actions(route) {
  if (route === "settings") {
    const textSize = document.getElementById("text-size-select");
    if (textSize) textSize.addEventListener("change", () => updateState((next) => {
      next.preferences.fontScale = Number(textSize.value);
    }, "Text size saved on this device."));
  }
  if (route !== "progress") return;

  const daySelect = document.getElementById("p4-benchmark-day");
  const fillCheckpoint = () => {
    const benchmark = lfP4LatestBenchmark(Number(daySelect.value));
    document.getElementById("p4-retention").value = benchmark && benchmark.retentionQuiz || "";
    document.getElementById("p4-body-retest").value = benchmark && benchmark.bodyRetests || "";
    document.getElementById("p4-self-ratings").value = benchmark && benchmark.selfRatings || "";
  };
  daySelect.value = String(lfP4ActiveCheckpointDay);
  fillCheckpoint();
  daySelect.addEventListener("change", () => {
    lfP4ActiveCheckpointDay = Number(daySelect.value);
    fillCheckpoint();
  });

  const form = document.getElementById("p4-checkpoint-form");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const day = Number(daySelect.value);
    const checkpoint = {
      retentionQuiz: document.getElementById("p4-retention").value.trim(),
      bodyRetests: document.getElementById("p4-body-retest").value.trim(),
      selfRatings: document.getElementById("p4-self-ratings").value.trim()
    };
    updateState((next) => {
      const index = next.benchmarks.findIndex((item) => Number(item.day) === day);
      const previous = index < 0 ? { day } : next.benchmarks[index];
      const saved = { ...previous, ...checkpoint, day, checkpointSavedAt: new Date().toISOString() };
      if (index < 0) next.benchmarks.push(saved);
      else next.benchmarks[index] = saved;
    }, `Day ${day} checkpoint saved.`, true);
  });

  const selectSummary = document.getElementById("p4-select-summary");
  selectSummary.addEventListener("click", () => {
    const summary = document.getElementById("p4-accountability-summary");
    summary.focus();
    summary.select();
    setStatus("Summary selected. Copy it only if you choose to share it.");
  });
}
