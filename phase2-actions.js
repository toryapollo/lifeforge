"use strict";
  function renderPhase2Route(route) {
    const screens = { money: renderMoney, thinking: renderThinking, resilience: renderResilience, fire: renderFire };
    return screens[route] ? screens[route]() : "";
  }

  function wirePhase2Actions(route) {
    if (route === "money") wireMoneyActions();
    if (route === "thinking") wireThinkingActions();
    if (route === "resilience" || route === "fire") wireResilienceActions();
    else lfP2StopTimer();
  }
