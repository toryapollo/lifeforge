"use strict";
  function initialize() {
    applyPreferences();
    const initialSave = saveLocalMirror();
    if (initialSave.length && !bootIssue) {
      bootIssue = initialSave.join(" ");
    }
    render();
    if (typeof lfSyncReminders === "function") {
      lfSyncReminders();
    }
    window.addEventListener("hashchange", render);
    if (location.hash && routeFromHash() !== location.hash.slice(2)) {
      location.hash = "#/mission";
    }
  }

  if (!location.hash) {
    history.replaceState(null, "", `${location.pathname}${location.search}#/mission`);
  }
  initialize();
