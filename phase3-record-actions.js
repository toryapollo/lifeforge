"use strict";

let lfP3PromptIndex = 0;
const LF_P3_DRILL_PROMPTS = [
  "What is one skill you are building, and why does it matter to you?",
  "Give an answer-first response to: What is a project you are proud of?",
  "Use What, So What, Now What to explain one goal for this month.",
  "Tell a short story about a challenge, a turning point, and what changed."
];

function wirePhase3RecordActions() {
  const start = document.getElementById("record-start");
  const stop = document.getElementById("record-stop");
  const mode = document.getElementById("recording-mode");
  if (start) {
    start.addEventListener("click", async () => {
      try {
        lfP3Stream = await navigator.mediaDevices.getUserMedia({
          audio: true, video: mode.value === "video"
        });
        const title = document.getElementById("recording-title").value.trim() || "Speaking practice";
        const preview = document.getElementById("live-preview");
        preview.hidden = mode.value !== "video";
        if (mode.value === "video") preview.srcObject = lfP3Stream;
        lfP3RecordingContext = {
          id: lfP3CreateRecordingId(), title, mode: mode.value,
          benchmarkDay: document.getElementById("recording-benchmark-day").value,
          date: new Date().toISOString()
        };
        lfP3Chunks = [];
        lfP3Recorder = new MediaRecorder(lfP3Stream);
        lfP3Recorder.addEventListener("dataavailable", (event) => {
          if (event.data && event.data.size) lfP3Chunks.push(event.data);
        });
        lfP3Recorder.addEventListener("stop", async () => {
          const context = lfP3RecordingContext;
          const blob = new Blob(lfP3Chunks, { type: lfP3Recorder.mimeType || "application/octet-stream" });
          lfP3Stream.getTracks().forEach((track) => track.stop());
          lfP3Stream = null;
          lfP3Recorder = null;
          lfP3RecordingContext = null;
          preview.srcObject = null;
          preview.hidden = true;
          if (!blob.size) {
            const startButton = document.getElementById("record-start");
            if (startButton) startButton.disabled = false;
            setStatus("No audio or video data was captured. Try recording again.", true);
            return;
          }
          try {
            await lfP3StoreClip(context.id, blob);
            updateState((next) => {
              next.recordings.unshift({
                ...context, mimeType: blob.type, size: blob.size,
                counts: { hedges: 0, fillers: 0 }, rubric: {}
              });
              next.phase3.activeRecordingId = context.id;
            }, "Recording saved privately on this device.");
            render();
          } catch (error) {
            const startButton = document.getElementById("record-start");
            if (startButton) startButton.disabled = false;
            setStatus(`Recording could not be saved: ${error.message}`, true);
          }
        });
        lfP3Recorder.start(250);
        start.disabled = true;
        stop.disabled = false;
        document.getElementById("recording-status").textContent = "Recording locally. Select Stop and save when ready.";
      } catch (error) {
        if (lfP3Stream) lfP3Stream.getTracks().forEach((track) => track.stop());
        lfP3Stream = null;
        setStatus(`Recording could not start: ${error.message}`, true);
      }
    });
  }
  if (stop) stop.addEventListener("click", () => {
    if (lfP3Recorder && lfP3Recorder.state !== "inactive") {
      lfP3Recorder.stop();
      stop.disabled = true;
    }
  });
  const review = document.getElementById("review-recording");
  if (review) review.addEventListener("change", () => {
    updateState((next) => { next.phase3.activeRecordingId = review.value; }, "Recording selected for review.");
    render();
  });
  ["hedge", "filler"].forEach((kind) => {
    const button = document.getElementById(`${kind}-tap`);
    if (!button) return;
    button.addEventListener("click", () => {
      const id = document.getElementById("review-recording").value;
      updateState((next) => {
        const recording = next.recordings.find((item) => item.id === id);
        recording.counts = recording.counts || { hedges: 0, fillers: 0 };
        recording.counts[`${kind}s`] = (recording.counts[`${kind}s`] || 0) + 1;
      }, `${kind === "hedge" ? "Hedge" : "Filler"} counted.`);
      document.getElementById(`${kind}-count`).textContent = state.recordings.find((item) => item.id === id).counts[`${kind}s`];
    });
  });
  document.querySelectorAll("[data-rubric-key]").forEach((select) => {
    select.addEventListener("change", () => {
      const id = document.getElementById("review-recording").value;
      updateState((next) => {
        const recording = next.recordings.find((item) => item.id === id);
        recording.rubric = recording.rubric || {};
        if (select.value) recording.rubric[select.dataset.rubricKey] = Number(select.value);
        else delete recording.rubric[select.dataset.rubricKey];
      }, "Speaking rubric saved.");
      render();
    });
  });
  document.querySelectorAll("[data-play-recording]").forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        const id = button.dataset.playRecording;
        const recording = state.recordings.find((item) => item.id === id);
        const blob = await lfP3GetClip(id);
        if (lfP3ObjectUrl) URL.revokeObjectURL(lfP3ObjectUrl);
        lfP3ObjectUrl = URL.createObjectURL(blob);
        lfP3ActiveMediaId = id;
        const audio = document.getElementById("audio-player");
        const video = document.getElementById("video-player");
        audio.hidden = recording.mode !== "audio";
        video.hidden = recording.mode !== "video";
        const player = recording.mode === "video" ? video : audio;
        player.src = lfP3ObjectUrl;
        player.load();
        document.getElementById("recording-playback").hidden = false;
      } catch (error) {
        setStatus(`Playback could not open: ${error.message}`, true);
      }
    });
  });
  document.querySelectorAll("[data-delete-recording]").forEach((button) => {
    button.addEventListener("click", async () => {
      const id = button.dataset.deleteRecording;
      try {
        await lfP3DeleteClip(id);
        if (lfP3ActiveMediaId === id) {
          URL.revokeObjectURL(lfP3ObjectUrl);
          lfP3ObjectUrl = "";
          lfP3ActiveMediaId = "";
        }
        updateState((next) => {
          next.recordings = next.recordings.filter((item) => item.id !== id);
          if (next.phase3.activeRecordingId === id) next.phase3.activeRecordingId = next.recordings[0]?.id || "";
        }, "Recording deleted from this device.");
        render();
      } catch (error) {
        setStatus(`Recording could not be deleted: ${error.message}`, true);
      }
    });
  });
  const nextPrompt = document.getElementById("drill-next-prompt");
  if (nextPrompt) nextPrompt.addEventListener("click", () => {
    lfP3PromptIndex = (lfP3PromptIndex + 1) % LF_P3_DRILL_PROMPTS.length;
    document.getElementById("drill-prompt").textContent = LF_P3_DRILL_PROMPTS[lfP3PromptIndex];
  });
}
