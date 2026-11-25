"use strict";
  function renderOnboarding() {
    const step = Math.min(6, Math.max(0, Number(state.onboarding.step) || 0));
    const profile = state.profile;
    const steps = [
      ["Mission", "Choose the direction you want this season to serve."],
      ["Identity", "Write a few ways of being you want to practice."],
      ["Future-self page", "Describe an ordinary day in the life you are building."],
      ["Chapter break", "Choose a date that marks the start of this chapter."],
      ["Environment", "Name three small changes that make the next action easier."],
      ["Season 1 habits", "Choose up to three habits to practice without streak pressure."],
      ["Day-one baseline", "Record a starting point. Estimates and private notes are welcome."]
    ];
    let fields = "";
    if (step === 0) fields = `<p class="lead">${escapeHtml(MISSION.statement)}</p><label><input id="onboarding-mission" type="checkbox"${state.onboarding.missionSeen ? " checked" : ""}> I have read the mission and want to continue.</label>`;
    if (step === 1) fields = `<label>Your name<input name="name" value="${escapeHtml(profile.name)}"></label>${[0, 1, 2].map((i) => `<label>Identity statement ${i + 1}<input name="identity-${i}" value="${escapeHtml(profile.identityStatements[i] || "")}" placeholder="${["I am someone who studies a little every day.", "I am someone who pays my future self first.", "I don't skip twice in a row."][i]}"></label>`).join("")}`;
    if (step === 2) fields = `<label>Future-self page<textarea name="future" rows="10" placeholder="It's 6:30 on a Tuesday. I wake up and…">${escapeHtml(profile.futureSelfPage)}</textarea></label><button class="button button-secondary" type="button" id="future-starter">Add starter questions</button>`;
    if (step === 3) fields = `<label>Chapter-break date<input name="chapterDate" type="date" value="${escapeHtml(profile.chapterBreakDate || profile.startDate)}"></label>`;
    if (step === 4) fields = [0, 1, 2].map((i) => `<label>Environment change ${i + 1}<input name="environment-${i}" value="${escapeHtml(profile.environmentChanges[i] || "")}" placeholder="${["e.g., My phone charges in the kitchen, not by my bed.", "e.g., My workout clothes are laid out the night before.", "e.g., My study book stays open on my desk."][i]}"></label>`).join("");
    if (step === 5) {
      const habits = ["Closed-book study", "Start one focused block", "Move for a few minutes", "Prepare for sleep", "Review the week"];
      fields = `<div class="phase1-checks">${habits.map((habit) => `<label><input type="checkbox" name="habit" value="${escapeHtml(habit)}"${profile.habits.includes(habit) ? " checked" : ""}>${escapeHtml(habit)}</label>`).join("")}</div><p class="quiet-copy">Choose no more than three. You can change them any time from the Start tab.</p>`;
    }
    if (step === 6) {
      const base = profile.baseline || {};
      fields = `<label>Speaking day-one note${lfOnboardingFieldHelp("speaking")}<textarea name="speaking" placeholder="I ramble and say um a lot…">${escapeHtml(base.speaking || "")}</textarea></label><label>Retention quiz starting score${lfOnboardingFieldHelp("retention")}<input name="retention" placeholder="e.g., 40%" value="${escapeHtml(base.retention || "")}"></label><label>Money snapshot${lfOnboardingFieldHelp("money")}<textarea name="money" placeholder="Checking $…, savings $…, debts $…">${escapeHtml(base.money || "")}</textarea></label><label>Body retests or measurements${lfOnboardingFieldHelp("body")}<textarea name="body" placeholder="Weight, push-ups, a timed walk, hours of sleep…">${escapeHtml(base.body || "")}</textarea></label><label>Self-ratings (1 to 10)${lfOnboardingFieldHelp("selfRatings")}<textarea name="selfRatings" placeholder="Focus 4, energy 5, money confidence 3…">${escapeHtml(base.selfRatings || "")}</textarea></label>`;
    }
    return `<div class="phase1-screen onboarding-screen">
      ${issueBanner()}
      <section aria-labelledby="route-title"><p class="eyebrow">M06 · Start with intention</p><h1 class="page-title" id="route-title" tabindex="-1">Set up your season</h1><p class="lead">A private starting point, revisable whenever life changes.</p></section>
      <section class="phase1-panel" aria-labelledby="onboarding-stage"><p class="phase1-step-indicator" id="onboarding-stage">Step ${step + 1} of 7</p><h2>${steps[step][0]}</h2><p>${steps[step][1]}</p>${lfOnboardingGuide(step)}<form id="onboarding-form" class="phase1-fields">${fields}<div class="phase1-actions"><button class="button button-secondary" type="button" id="onboarding-back"${step === 0 ? " disabled" : ""}>Previous</button><button class="button button-primary" type="submit" id="onboarding-next">${step === 6 ? "Finish setup" : "Save and continue"}</button></div></form></section>
      ${lfModuleReference("M06")}
    </div>`;
  }
