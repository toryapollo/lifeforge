"use strict";

function renderPhase3SpeakingView() {
  const module = LF_CONTENT.modules.find((item) => item.id === "M05");
  const recordings = state.recordings || [];
  const activeId = state.phase3.activeRecordingId || (recordings[0] && recordings[0].id) || "";
  const active = recordings.find((recording) => recording.id === activeId);
  const options = recordings.map((recording) => `
    <option value="${escapeHtml(recording.id)}" ${recording.id === activeId ? "selected" : ""}>
      ${escapeHtml(recording.title)} · ${escapeHtml(recording.mode)}
    </option>`).join("");
  const scores = active && active.rubric || {};
  const baseline = recordings.find((recording) => recording.benchmarkDay === "1");
  const average = (recording) => {
    const values = LF_P3_RUBRIC.map(([key]) => Number(recording && recording.rubric && recording.rubric[key])).filter(Boolean);
    return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
  };
  const benchmarkCards = ["1", "30", "90"].map((day) => {
    const recording = recordings.find((item) => item.benchmarkDay === day);
    const score = average(recording);
    const start = average(baseline);
    const change = score !== null && day !== "1" && start !== null
      ? ` (${score - start >= 0 ? "+" : ""}${(score - start).toFixed(1)} vs Day 1)` : "";
    return `<article class="p3-benchmark-card">
      <h3>Day ${day}</h3>
      <p>${recording ? escapeHtml(recording.title) : "No recording saved yet."}</p>
      <p>${score === null ? "Rate this recording to compare it." : `Average rubric: ${score.toFixed(1)} / 5${change}`}</p>
      ${recording ? `<button class="button button-secondary button-small" type="button" data-play-recording="${escapeHtml(recording.id)}">Load benchmark playback</button>` : ""}
    </article>`;
  }).join("");
  return `
    <div class="phase3-screen">
      <section aria-labelledby="route-title">
        <p class="eyebrow">M05 · Speak &amp; Connect</p>
        <h1 class="page-title" id="route-title" tabindex="-1">Practice your voice.</h1>
        <p class="lead">Record privately on this device, review one useful change, and repeat. Audio and video stay in local browser storage.</p>
        <div class="page-actions">
          <a class="button button-secondary" href="#/conversations">Go to Conversations</a>
        </div>
      </section>
      <section class="p3-group" aria-labelledby="p3-record-title">
        <h2 id="p3-record-title">Record a speaking rep</h2>
        <p>Use audio for a quick answer or video for camera presence. Your device asks for microphone or camera access when recording starts.</p>
        <div class="p3-fields">
          <label>Recording title<input id="recording-title" maxlength="80" value="Speaking practice"></label>
          <label>Capture type<select id="recording-mode"><option value="audio">Audio</option><option value="video">Video and audio</option></select></label>
          <label>Benchmark day<select id="recording-benchmark-day"><option value="">Practice rep</option><option value="1">Day 1</option><option value="30">Day 30</option><option value="90">Day 90</option></select></label>
        </div>
        <div class="p3-actions">
          <button class="button button-primary" id="record-start" type="button">Start recording</button>
          <button class="button button-secondary" id="record-stop" type="button" disabled>Stop and save</button>
          <span class="p3-status" id="recording-status" role="status" aria-live="polite">Ready to record locally.</span>
        </div>
        <video id="live-preview" class="p3-video" autoplay muted playsinline hidden></video>
        <div id="recording-playback" class="p3-playback" hidden>
          <p>Playback is loaded locally. Use the player controls to listen or watch.</p>
          <audio id="audio-player" controls hidden></audio>
          <video id="video-player" class="p3-video" controls playsinline hidden></video>
        </div>
        <h3>Saved recordings</h3>
        ${recordings.length ? `<ul class="p3-recordings">${recordings.map((recording) => `
          <li>
            <div><strong>${escapeHtml(recording.title)}</strong><span>${escapeHtml(recording.mode)} · ${recording.benchmarkDay ? `Day ${recording.benchmarkDay}` : "Practice"} · ${Math.ceil(recording.size / 1024)} KB</span></div>
            <div class="p3-actions">
              <button class="button button-secondary button-small" type="button" data-play-recording="${escapeHtml(recording.id)}">Load playback</button>
              <button class="button button-secondary button-small" type="button" data-delete-recording="${escapeHtml(recording.id)}">Delete</button>
            </div>
          </li>`).join("")}</ul>` : '<p class="empty-state">No recordings yet. Start a short audio or video rep.</p>'}
      </section>
      <section class="p3-group" aria-labelledby="p3-review-title">
        <h2 id="p3-review-title">Review and count</h2>
        <label class="p3-review-select">Recording to review
          <select id="review-recording" ${recordings.length ? "" : "disabled"}>
            ${recordings.length ? options : '<option value="">Record a rep first</option>'}
          </select>
        </label>
        <div class="p3-actions p3-counters">
          <span>Tap once for each word you hear:</span>
          <button class="button button-secondary" id="hedge-tap" type="button" ${active ? "" : "disabled"}>Hedge <output id="hedge-count">${active && active.counts ? active.counts.hedges || 0 : 0}</output></button>
          <button class="button button-secondary" id="filler-tap" type="button" ${active ? "" : "disabled"}>Filler <output id="filler-count">${active && active.counts ? active.counts.fillers || 0 : 0}</output></button>
        </div>
        <h3>Speaking rubric</h3>
        <div class="p3-rubric">${LF_P3_RUBRIC.map(([key, label]) => `
          <label>${escapeHtml(label)}
            <select data-rubric-key="${key}" aria-label="${escapeHtml(label)} score" ${active ? "" : "disabled"}>
              <option value="">Not rated</option>${[1, 2, 3, 4, 5].map((value) => `<option value="${value}" ${Number(scores[key]) === value ? "selected" : ""}>${value} / 5</option>`).join("")}
            </select>
          </label>`).join("")}
        </div>
      </section>
      <section class="p3-group" aria-labelledby="p3-benchmark-title">
        <h2 id="p3-benchmark-title">Day 1 / 30 / 90 comparison</h2>
        <p>Use the same prompt each time: “${escapeHtml(LF_P3_BENCHMARK_PROMPT)}”</p>
        <div class="p3-benchmarks" id="benchmark-comparison">${benchmarkCards}</div>
      </section>
      <section class="p3-group" aria-labelledby="p3-drills-title">
        <h2 id="p3-drills-title">M05 speaking drills</h2>
        <p>Choose a drill, answer out loud, then score the rep above. One deliberate pause is better than chasing zero fillers.</p>
        <label class="p3-review-select">Drill
          <select id="drill-select">${module.drills.map((drill) => `<option value="${escapeHtml(drill.id)}">${escapeHtml(drill.id)} · ${escapeHtml(drill.text)}</option>`).join("")}</select>
        </label>
        <p>3A, or Bottom Line Up Front (BLUF), means answer first, give two or three reasons, add detail only when asked, then stop.</p>
        <p class="p3-prompt" id="drill-prompt">What is one skill you are building, and why does it matter to you?</p>
        <button class="button button-secondary" id="drill-next-prompt" type="button">Next prompt</button>
        <ul class="p3-objectives">${module.objectives.map((objective) => `<li>${escapeHtml(objective.text)}</li>`).join("")}</ul>
      </section>
    </div>`;
}
