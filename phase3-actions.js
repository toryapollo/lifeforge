"use strict";

function renderPhase3Route(route) {
  if (route === "speak") return renderPhase3SpeakingView();
  if (route === "conversations") return renderPhase3ConversationView();
  return "";
}

function wirePhase3Actions(route) {
  if (route === "speak") wirePhase3RecordActions();
  else if (route === "conversations") wirePhase3TalkActions();
  else if (lfP3Recorder && lfP3Recorder.state !== "inactive") lfP3Recorder.stop();
}
