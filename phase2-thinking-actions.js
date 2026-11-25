"use strict";
  function wireThinkingActions() {
    const scenarioField = document.getElementById("cynefin-scenario");
    scenarioField.addEventListener("change", () => {
      const scenario = LF_P2_SCENARIOS.find((item) => item.id === scenarioField.value);
      document.getElementById("cynefin-scenario-prompt").textContent = scenario.prompt;
    });
    lfP2OnSubmit("cynefin-form", () => {
      const scenario = LF_P2_SCENARIOS.find((item) => item.id === lfP2Value("cynefin-scenario"));
      const domain = LF_P2_DOMAINS.find((item) => item.id === scenario.answer);
      const correct = lfP2Value("cynefin-domain") === scenario.answer;
      document.getElementById("cynefin-result").textContent = `${correct ? "That matches." : `The matching domain is ${domain.label}.`} ${domain.response}`;
    });
    lfP2OnSubmit("system-map-form", () => lfP2SaveJournal("systemMaps", {
      title: lfP2Value("system-topic"), topic: lfP2Value("system-topic"), stocks: lfP2Value("system-stocks"),
      flows: lfP2Value("system-flows"), loops: lfP2Value("system-loops"),
      delays: lfP2Value("system-delays"), leverage: lfP2Value("system-leverage")
    }, "System map saved locally."));
    lfP2OnSubmit("dare-form", () => lfP2SaveJournal("dare", {
      title: lfP2Value("dare-problem"), problem: lfP2Value("dare-problem"), parts: lfP2Value("dare-parts"),
      audit: lfP2Value("dare-audit"), solution: lfP2Value("dare-solution"),
      keep: lfP2Value("dare-keep"), stop: lfP2Value("dare-stop")
    }, "DARE workbook saved locally."));
    lfP2OnSubmit("thinking-decision-form", () => lfP2SaveJournal("decisions", {
      title: "Decision", decision: lfP2Value("thinking-decision"), premortem: lfP2Value("thinking-premortem"),
      outsideView: lfP2Value("thinking-outside-view"), secondOrder: lfP2Value("thinking-second-order"),
      disconfirmingEvidence: lfP2Value("thinking-disconfirm"), confidence: Number(lfP2Value("thinking-confidence")),
      reviewDate: lfP2Value("thinking-review"), context: "thinking"
    }, "Decision and review date saved locally."));
    lfP2OnSubmit("sift-form", () => lfP2SaveJournal("sift", {
      title: "Claim check", claim: lfP2Value("sift-claim"), source: lfP2Value("sift-source"),
      coverage: lfP2Value("sift-coverage"), original: lfP2Value("sift-original"),
      conclusion: lfP2Value("sift-conclusion")
    }, "SIFT claim check saved locally."));
    lfP2OnSubmit("ai-hygiene-form", () => lfP2SaveJournal("aiHygiene", {
      title: "Verification notes", firstAnswer: lfP2Value("ai-first-answer"),
      sourceCheck: lfP2Value("ai-source-check"), finding: lfP2Value("ai-finding")
    }, "AI hygiene notes saved locally. No service was called."));
    lfP2OnSubmit("scout-form", () => {
      const checks = [...document.querySelectorAll('input[name="scout-test"]:checked')].map((input) => {
        const item = LF_P2_SCOUT_TESTS.find((test) => test.id === input.value);
        return item.label;
      });
      lfP2SaveJournal("scout", { title: "Scout mindset check", belief: lfP2Value("scout-belief"), checks }, "Scout mindset check saved locally.");
    });
  }
