"use strict";
  function wirePhase1Actions(route) {
    if (route === "onboarding") wireOnboardingActions();
    if (route === "today") wireTodayActions();
    if (route === "weekly") wireWeeklyActions();
    if (route === "study") wireStudyActions();
    if (route === "flow") wireFlowActions();
    if (route === "settings") wireReminderSettings();
  }
