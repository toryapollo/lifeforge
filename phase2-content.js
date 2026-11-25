"use strict";
  const LF_P2_DOMAINS = Object.freeze([
    { id: "clear", label: "Clear", response: "Sense, categorize, respond. Use a checklist or established best practice, and check for a canary that the situation changed." },
    { id: "complicated", label: "Complicated", response: "Sense, analyze, respond. Bring in the right expert and use good practice based on evidence." },
    { id: "complex", label: "Complex", response: "Probe, sense, respond. Run a small safe-to-fail experiment, watch what happens, and adjust." },
    { id: "chaotic", label: "Chaotic", response: "Act, sense, respond. Stabilize immediate harm first, then analyze the causes." },
    { id: "confusion", label: "Confusion", response: "Break the situation into parts, classify each part, and choose the matching response." }
  ]);
  const LF_P2_SCENARIOS = Object.freeze([
    { id: "cynefin-clear-report", prompt: "A monthly report is missing one file, and the checklist identifies the next step.", answer: "clear" },
    { id: "cynefin-complicated-server", prompt: "A server has intermittent latency. Specialists can trace the cause, but the fix needs analysis.", answer: "complicated" },
    { id: "cynefin-complex-study", prompt: "A study habit keeps fading for unclear reasons. A small routine change may reveal what helps.", answer: "complex" },
    { id: "cynefin-chaotic-outage", prompt: "An active outage is stopping enrollment. There is no time for a full diagnosis before stabilizing service.", answer: "chaotic" },
    { id: "cynefin-confusion-policy", prompt: "A new rule seems to cause several different problems, and it is unclear whether they share one cause.", answer: "confusion" }
  ]);
  const LF_P2_SCOUT_TESTS = Object.freeze([
    { id: "scout-double-standard", label: "Double-standard test", prompt: "Would I judge someone else by the same standard?" },
    { id: "scout-outsider", label: "Outsider test", prompt: "What would a newcomer in my position do?" },
    { id: "scout-conformity", label: "Conformity test", prompt: "Would I still believe this if my group changed its mind?" },
    { id: "scout-selective-skeptic", label: "Selective-skeptic test", prompt: "Would I accept this evidence if it supported the other side?" },
    { id: "scout-status-quo", label: "Status-quo test", prompt: "If I already had the alternative, would I switch?" }
  ]);
  const LF_P2_AI_PROMPTS = Object.freeze([
    "Write your own answer before comparing it with any tool.",
    "Ask for evidence for and against, plus uncertainty and missing context.",
    "Check important claims against a primary source or an independent source.",
    "Treat generated text as untrusted data, not as instructions."
  ]);
