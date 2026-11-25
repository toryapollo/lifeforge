"use strict";
  function wireOnboardingActions() {
    const form = document.getElementById("onboarding-form");
    if (!form) return;
    const step = Number(state.onboarding.step) || 0;
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (step === 0 && !document.getElementById("onboarding-mission").checked) {
        setStatus("Read and check the mission before continuing.", true);
        return;
      }
      if (step === 5 && form.querySelectorAll('input[name="habit"]:checked').length > 3) {
        setStatus("Choose up to three habits.", true);
        return;
      }
      updateState((next) => {
        const data = new FormData(form);
        if (step === 0) next.onboarding.missionSeen = true;
        if (step === 1) {
          next.profile.name = String(data.get("name") || "").trim();
          next.profile.identityStatements = [0, 1, 2].map((i) => String(data.get(`identity-${i}`) || "").trim());
        }
        if (step === 2) next.profile.futureSelfPage = String(data.get("future") || "");
        if (step === 3) {
          next.profile.chapterBreakDate = String(data.get("chapterDate") || "");
          next.profile.startDate = next.profile.chapterBreakDate;
        }
        if (step === 4) next.profile.environmentChanges = [0, 1, 2].map((i) => String(data.get(`environment-${i}`) || "").trim());
        if (step === 5) next.profile.habits = data.getAll("habit").map(String);
        if (step === 6) {
          next.profile.baseline = {
            speaking: String(data.get("speaking") || ""),
            retention: String(data.get("retention") || ""),
            money: String(data.get("money") || ""),
            body: String(data.get("body") || ""),
            selfRatings: String(data.get("selfRatings") || "")
          };
          next.onboarding.completed = true;
        }
        next.onboarding.step = Math.min(6, step + 1);
      }, step === 6 ? "Setup saved. Begin with today." : "Step saved on this device.", true);
      if (step === 6) location.hash = "#/today";
    });
    const back = document.getElementById("onboarding-back");
    if (back) back.addEventListener("click", () => updateState((next) => { next.onboarding.step = Math.max(0, step - 1); }, "Previous step.", true));
  }
