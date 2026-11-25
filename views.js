"use strict";
  function routeFromHash() {
    const match = location.hash.match(/^#\/([a-z-]+)$/);
    return match && Object.hasOwn(ROUTES, match[1]) ? match[1] : "mission";
  }

  function updateNavigation() {
    document.querySelectorAll("[data-route]").forEach((link) => {
      if (link.dataset.route === currentRoute) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  function issueBanner() {
    if (!bootIssue) {
      return "";
    }
    return `<p class="saved-note" data-state="error">Saved data needs attention: ${escapeHtml(bootIssue)} Open Help or import a known-good backup before making changes.</p>`;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[character]);
  }

  function renderMission() {
    const readText = state.onboarding.missionSeen ? "Mission noted" : "Mark mission read";
    const readPressed = state.onboarding.missionSeen ? "true" : "false";
    return `
      ${issueBanner()}
      <section aria-labelledby="route-title">
        <p class="eyebrow">A personal classroom</p>
        <h1 class="page-title" id="route-title" tabindex="-1">Build a life you choose.</h1>
        <p class="lead">${MISSION.introduction}</p>
        <blockquote class="mission-quote">${MISSION.statement}</blockquote>
      </section>
      <section class="content-section" aria-labelledby="how-title">
        <h2 id="how-title">How it works</h2>
        <ol class="loop-list">
          ${LOOP.map(([name, description]) => `<li><strong>${name}</strong><span>${description}</span></li>`).join("")}
        </ol>
      </section>
      <section class="content-section" aria-labelledby="promises-title">
        <h2 id="promises-title">What you can expect</h2>
        <ul class="promise-list">${MISSION.promises.map((promise) => `<li>${promise}</li>`).join("")}</ul>
      </section>
      <div class="page-actions">
        <button class="button button-primary" type="button" id="mission-read" aria-pressed="${readPressed}">${readText}</button>
        <a class="button button-secondary" href="#/settings">Set up preferences</a>
        <span class="saved-note" id="mission-status" aria-live="polite"></span>
      </div>
    `;
  }

  function backupDate(savedAt) {
    const date = new Date(savedAt);
    return Number.isNaN(date.getTime()) ? "Saved date unavailable" : date.toLocaleString();
  }

  function renderBackups() {
    if (!backups.length) {
      return '<p class="empty-state">Your private backup list is empty. A snapshot is saved here when you change a setting or import data.</p>';
    }
    return `<ol class="backup-list">${backups.slice().reverse().map((entry, index) => `
      <li class="backup-item">
        <p class="backup-date">Private snapshot · ${escapeHtml(backupDate(entry.savedAt))}</p>
        <button class="button button-secondary button-small" type="button" data-restore-backup="${backups.length - 1 - index}">Restore this snapshot</button>
      </li>`).join("")}</ol>`;
  }

  function renderSettings() {
    return `
      ${issueBanner()}
      <section aria-labelledby="route-title">
        <p class="eyebrow">Your device, your choices</p>
        <h1 class="page-title" id="route-title" tabindex="-1">Settings</h1>
        <p class="lead">Choose how LIFEFORGE looks and keep a portable copy of your personal data.</p>
      </section>
      <div class="settings-layout">
        <section class="settings-group" aria-labelledby="preferences-title">
          <h2 id="preferences-title">Preferences</h2>
          <p>These choices are saved locally and restored when you return.</p>
          <div class="field-row">
            <div>
              <label class="field-label" for="theme-select">Theme</label>
              <span class="field-help" id="theme-help">Dark is the default. System follows this device's appearance.</span>
            </div>
            <select class="field-control" id="theme-select" aria-describedby="theme-help">
              <option value="dark"${state.preferences.theme === "dark" ? " selected" : ""}>Dark</option>
              <option value="light"${state.preferences.theme === "light" ? " selected" : ""}>Light</option>
              <option value="system"${state.preferences.theme === "system" ? " selected" : ""}>System</option>
            </select>
          </div>
          <div class="field-row toggle-row">
            <div class="toggle-copy">
              <label class="field-label" for="reduce-motion">Reduce motion</label>
              <span class="field-help">Remove movement and shorten visual transitions.</span>
            </div>
            <input class="toggle-control" id="reduce-motion" type="checkbox"${state.preferences.reduceMotion ? " checked" : ""}>
          </div>
          <p class="saved-note" id="settings-status" aria-live="polite"></p>
        </section>

        <section class="settings-group" aria-labelledby="data-title">
          <h2 id="data-title">Your data</h2>
          <p>Export a JSON file to keep a copy or move your data. Importing a file replaces the current state after saving a private snapshot.</p>
          <div class="page-actions">
            <button class="button button-primary" type="button" id="export-data">Export JSON</button>
            <button class="button button-secondary" type="button" id="import-data">Import JSON</button>
            <input class="visually-hidden" id="import-file" type="file" accept=".json,application/json" tabindex="-1" aria-label="Choose a LIFEFORGE JSON backup">
          </div>
          <p class="privacy-copy"><strong>Private on this device.</strong> LIFEFORGE has no account, cloud sync or analytics. The app keeps the 10 most recent local snapshots for recovery.</p>
          <h3>Private backups</h3>
          <div id="backup-list">${renderBackups()}</div>
        </section>

        <section class="settings-group" aria-labelledby="about-title">
          <h2 id="about-title">About LIFEFORGE</h2>
          <p>This version includes private daily planning, generated lessons, study sessions, flow blocks, health logs and weekly reviews. Your state uses schema version ${STATE_SCHEMA_VERSION} so later versions can migrate saved data.</p>
          <a class="button button-quiet" href="#/help">Open Help</a>
        </section>
      </div>
    `;
  }

  function renderColors() {
    const mode = state.preferences.theme;
    const modes = [["dark", "Dark"], ["light", "Light"], ["system", "Match device"]];
    const cards = PALETTES.map((palette) => {
      const chosen = state.preferences.palette === palette.id;
      return `
        <button type="button" class="palette-swatch" data-palette="${palette.id}" data-palette-choice="${palette.id}" aria-pressed="${chosen}">
          <span class="swatch-preview" aria-hidden="true">
            <span class="swatch-bar"></span>
            <span class="swatch-line"></span>
            <span class="swatch-line short"></span>
            <span class="swatch-button">Start</span>
          </span>
          <span class="swatch-name">${palette.label}${chosen ? " <span class=\"swatch-check\">✓ In use</span>" : ""}</span>
          <span class="swatch-desc">${palette.description}</span>
        </button>`;
    }).join("");
    return `
      ${issueBanner()}
      <section aria-labelledby="route-title">
        <p class="eyebrow">Make it yours</p>
        <h1 class="page-title" id="route-title" tabindex="-1">Colors</h1>
        <p class="lead">Pick a color scheme. It changes right away and is saved on this device.</p>
      </section>
      <section class="settings-group colors-mode" aria-labelledby="mode-title">
        <h2 id="mode-title">Light or dark</h2>
        <div class="mode-choices" role="group" aria-labelledby="mode-title">
          ${modes.map(([value, label]) => `<button type="button" class="button ${mode === value ? "button-primary" : "button-secondary"}" data-mode-choice="${value}" aria-pressed="${mode === value}">${label}</button>`).join("")}
        </div>
      </section>
      <section class="content-section" aria-labelledby="palette-title">
        <h2 id="palette-title">Color scheme</h2>
        <div class="palette-grid">${cards}</div>
      </section>
    `;
  }

  function renderHelp() {
    return `
      ${issueBanner()}
      <section aria-labelledby="route-title">
        <p class="eyebrow">Help is always close</p>
        <h1 class="page-title" id="route-title" tabindex="-1">Help and support</h1>
        <p class="lead">LIFEFORGE is a private, offline classroom. Your work stays in this app's local storage unless you export a file yourself.</p>
      </section>
      <section class="crisis-panel" aria-labelledby="crisis-title">
        <h2 id="crisis-title">If you need support now</h2>
        <p>If you are in crisis or thinking about self-harm, call or text 988 (US). If low mood lasts 2 or more weeks, talk to a doctor or therapist.</p>
        <div class="crisis-links">
          <a class="button button-primary" href="tel:988" aria-label="Call 988 Suicide and Crisis Lifeline">Call 988</a>
          <a class="button button-secondary" href="sms:988" aria-label="Text 988 Suicide and Crisis Lifeline">Text 988</a>
        </div>
      </section>
      <section class="help-details" aria-labelledby="data-help-title">
        <h2 id="data-help-title">Your saved data</h2>
        <p>Preferences and progress are saved on this device. Settings lets you export a JSON backup, import a saved backup, and restore one of the ten most recent private snapshots. Exported files are yours to store or share.</p>
        <h2>Getting started</h2>
        <p>Use Start for the seven-step setup, then Today for one outcome, time blocks and shutdown. Study and Flow are available whenever they help; Weekly review turns the last few days into three next steps. Progress over perfection.</p>
        <div class="page-actions">
          <a class="button button-secondary" href="#/mission">Read the mission</a>
          <a class="button button-secondary" href="#/settings">Open Settings</a>
        </div>
      </section>
      <section class="help-details" aria-labelledby="copyright-title">
        <h2 id="copyright-title">Copyright</h2>
        <p>© 2026 Tory Buccella. All rights reserved. LIFEFORGE is free for personal use. Please don't copy, modify or redistribute it without permission. Ideas and research credited to their teachers and authors remain theirs.</p>
      </section>
    `;
  }

  function render() {
    currentRoute = routeFromHash();
    updateNavigation();
    const phase1Route = ["onboarding", "today", "study", "flow", "weekly"].includes(currentRoute);
    const phase2Route = ["money", "thinking", "resilience", "fire"].includes(currentRoute);
    const phase3Route = ["speak", "conversations"].includes(currentRoute);
    const phase4Route = currentRoute === "progress";
    routeView.innerHTML = phase4Route && typeof renderPhase4Progress === "function"
      ? renderPhase4Progress()
      : phase1Route && typeof renderPhase1Route === "function"
      ? renderPhase1Route(currentRoute)
      : phase2Route && typeof renderPhase2Route === "function"
        ? renderPhase2Route(currentRoute)
      : phase3Route && typeof renderPhase3Route === "function"
        ? renderPhase3Route(currentRoute)
      : currentRoute === "settings"
      ? renderSettings()
      : currentRoute === "colors"
      ? renderColors()
      : currentRoute === "help"
        ? renderHelp()
        : renderMission();
    if (currentRoute === "settings" && typeof renderPhase1Settings === "function") {
      routeView.insertAdjacentHTML("beforeend", renderPhase1Settings());
    }
    if (currentRoute === "settings" && typeof renderPhase4Settings === "function") {
      routeView.insertAdjacentHTML("beforeend", renderPhase4Settings());
    }
    wireRouteActions();
    if ((phase1Route || currentRoute === "settings") && typeof wirePhase1Actions === "function") {
      wirePhase1Actions(currentRoute);
    }
    if (typeof wirePhase2Actions === "function") wirePhase2Actions(currentRoute);
    if (typeof wirePhase3Actions === "function") wirePhase3Actions(currentRoute);
    if (typeof wirePhase4Actions === "function") wirePhase4Actions(currentRoute);
    if (lastRoute && lastRoute !== currentRoute) {
      routeView.parentElement.scrollTop = 0;
      const heading = document.getElementById("route-title");
      if (heading) {
        heading.focus({ preventScroll: true });
      }
    }
    lastRoute = currentRoute;
    if (new URLSearchParams(location.search).has("selftest")) {
      renderSelfTest(runSelfTests());
    }
  }

