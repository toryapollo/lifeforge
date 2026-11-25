"use strict";
  function renderThinking() {
    return `
      <div class="phase2-screen">
        <section aria-labelledby="route-title">
          <h1 class="page-title" id="route-title" tabindex="-1">Thinking tools</h1>
          <p class="lead">Classify the problem, test your assumptions, then record how you reached a decision.</p>
        </section>
        <section class="phase2-group" aria-labelledby="cynefin-title">
          <h2 id="cynefin-title">Cynefin five-domain drill</h2>
          <form id="cynefin-form" class="phase2-form">
            <label>Scenario<select id="cynefin-scenario">${LF_P2_SCENARIOS.map((item) => `<option value="${item.id}">${item.prompt}</option>`).join("")}</select></label>
            <p id="cynefin-scenario-prompt" class="phase2-scenario-prompt" aria-live="polite">${LF_P2_SCENARIOS[0].prompt}</p>
            <label>Your domain<select id="cynefin-domain">${LF_P2_DOMAINS.map((item) => `<option value="${item.id}">${item.label}</option>`).join("")}</select></label>
            <button class="button button-primary" type="submit">Check response</button>
          </form>
          <output id="cynefin-result" class="phase2-result" aria-live="polite">Choose the domain, then check the response that fits it.</output>
        </section>
        <section class="phase2-group" aria-labelledby="system-title">
          <h2 id="system-title">System map</h2>
          <p>Describe what accumulates, what moves it, the loops, the delays, and one place to intervene.</p>
          <form id="system-map-form" class="phase2-form">
            <label>Situation<input id="system-topic" required></label>
            <label>Stocks, what accumulates<textarea id="system-stocks" required></textarea></label>
            <label>Flows, what enters or leaves<textarea id="system-flows" required></textarea></label>
            <label>Reinforcing or balancing loops<textarea id="system-loops" required></textarea></label>
            <label>Delays and incentives<textarea id="system-delays"></textarea></label>
            <label>Possible leverage point<textarea id="system-leverage" required></textarea></label>
            <button class="button button-primary" type="submit">Save system map</button>
          </form>
          ${lfP2RecordList(state.journals.systemMaps, ["stocks", "flows", "loops", "leverage"])}
        </section>
        <section class="phase2-group" aria-labelledby="dare-title">
          <h2 id="dare-title">DARE workbook</h2>
          <p>Decompose the problem. Audit each assumption as fact, assumption, or unknown. Recombine a solution. Experiment with a stop and keep-going test.</p>
          <form id="dare-form" class="phase2-form">
            <label>Problem<input id="dare-problem" required></label>
            <label>Decompose into parts<textarea id="dare-parts" required></textarea></label>
            <label>Assumption audit: fact, assumption, unknown<textarea id="dare-audit" required></textarea></label>
            <label>Recombine into a solution<textarea id="dare-solution" required></textarea></label>
            <label>Experiment and evidence to keep going<textarea id="dare-keep" required></textarea></label>
            <label>Evidence that would make me stop<textarea id="dare-stop" required></textarea></label>
            <button class="button button-primary" type="submit">Save DARE workbook</button>
          </form>
          ${lfP2RecordList(state.journals.dare, ["parts", "audit", "solution"])}
        </section>
        <section class="phase2-group" aria-labelledby="premortem-title">
          <h2 id="premortem-title">Pre-mortem and decision journal</h2>
          <form id="thinking-decision-form" class="phase2-form">
            <label>Decision<input id="thinking-decision" required></label>
            <label>It is one year later and this failed. Why?<textarea id="thinking-premortem" required></textarea></label>
            <label>Outside view: how does this usually go?<textarea id="thinking-outside-view" required></textarea></label>
            <label>What happens next if this works or fails?<textarea id="thinking-second-order"></textarea></label>
            <label>Evidence that could change my mind<textarea id="thinking-disconfirm" required></textarea></label>
            <label>Confidence (%)<input id="thinking-confidence" type="number" min="0" max="100" value="50"></label>
            <label>Review date<input id="thinking-review" type="date"></label>
            <button class="button button-primary" type="submit">Save decision and review date</button>
          </form>
          ${lfP2RecordList(state.journals.decisions, ["premortem", "outsideView", "disconfirmingEvidence"])}
        </section>
        <section class="phase2-group" aria-labelledby="sift-title">
          <h2 id="sift-title">SIFT claim check</h2>
          <p>Stop. Investigate the source. Find better coverage. Trace the claim to its original source.</p>
          <form id="sift-form" class="phase2-form">
            <label>Claim to check<textarea id="sift-claim" required></textarea></label>
            <label>Who published it, and what do I know about the source?<textarea id="sift-source" required></textarea></label>
            <label>Better coverage from another source<textarea id="sift-coverage"></textarea></label>
            <label>Original source or evidence<textarea id="sift-original"></textarea></label>
            <label>What can I conclude, and what remains uncertain?<textarea id="sift-conclusion" required></textarea></label>
            <button class="button button-primary" type="submit">Save claim check</button>
          </form>
          ${lfP2RecordList(state.journals.sift, ["claim", "conclusion"])}
        </section>
        <section class="phase2-group" aria-labelledby="ai-title">
          <h2 id="ai-title">AI hygiene, without an AI call</h2>
          <p>This worksheet never sends data or calls an AI service. Write first, then verify any generated answer yourself.</p>
          <ol class="phase2-ladder">${LF_P2_AI_PROMPTS.map((prompt) => `<li>${prompt}</li>`).join("")}</ol>
          <form id="ai-hygiene-form" class="phase2-form">
            <label>My answer before comparison<textarea id="ai-first-answer" required></textarea></label>
            <label>Primary or independent source I checked<textarea id="ai-source-check" required></textarea></label>
            <label>One error, omission, or uncertainty I found<textarea id="ai-finding" required></textarea></label>
            <button class="button button-primary" type="submit">Save verification notes</button>
          </form>
          ${lfP2RecordList(state.journals.aiHygiene, ["firstAnswer", "sourceCheck", "finding"])}
        </section>
        <section class="phase2-group" aria-labelledby="scout-title">
          <h2 id="scout-title">Scout mindset tests</h2>
          <form id="scout-form" class="phase2-form">
            <label>Belief or plan to test<input id="scout-belief" required></label>
            <div class="phase2-checklist">${LF_P2_SCOUT_TESTS.map((item) => `<label><input type="checkbox" name="scout-test" value="${item.id}"><span><strong>${item.label}:</strong> ${item.prompt}</span></label>`).join("")}</div>
            <button class="button button-primary" type="submit">Save Scout test</button>
          </form>
          ${lfP2RecordList(state.journals.scout, ["belief", "checks"])}
        </section>
        ${lfModuleReference("M02")}
      </div>`;
  }
