"use strict";
  function renderSelfTest(report) {
    const panel = document.createElement("section");
    panel.className = "selftest-panel";
    panel.dataset.result = report.failed.length ? "fail" : "pass";
    panel.setAttribute("aria-labelledby", "selftest-title");
    panel.innerHTML = `
      <h2 id="selftest-title">Local self-test: ${report.failed.length ? "FAIL" : "PASS"}</h2>
      <p>${report.passed.length} of ${report.passed.length + report.failed.length} checks passed.</p>
      <ol>${report.passed.map((name) => `<li>PASS: ${escapeHtml(name)}</li>`).join("")}${report.failed.map((entry) => `<li>FAIL: ${escapeHtml(entry.name)}: ${escapeHtml(entry.error)}</li>`).join("")}</ol>
      <p>Quiz and lesson-content checks are not part of this offline shell.</p>
    `;
    routeView.append(panel);
    window.__LF_SELFTEST__ = report;
    setStatus(report.failed.length ? "Self-test failed. See the report below." : "Self-test passed.");
  }

  function runSelfTests() {
    const report = { passed: [], failed: [] };
    const check = (name, action) => {
      try {
        action();
        report.passed.push(name);
      } catch (error) {
        report.failed.push({ name, error: error.message || String(error) });
      }
    };
    const assert = (condition, message) => {
      if (!condition) {
        throw new Error(message);
      }
    };

    check("version-zero and version-one states migrate without losing data", () => {
      const migrated = migrateState({
        profile: { name: "Learner" },
        preferences: { theme: "light", reduceMotion: true }
      });
      assert(migrated.schemaVersion === STATE_SCHEMA_VERSION, "schema version was not upgraded");
      assert(migrated.profile.name === "Learner", "profile data was lost");
      assert(migrated.preferences.theme === "light" && migrated.preferences.reduceMotion, "preferences were lost");
      const versionOne = migrateState({
        schemaVersion: 1,
        profile: { name: "Version one" },
        preferences: { theme: "system", reduceMotion: true },
        onboarding: { missionSeen: true }
      });
      assert(versionOne.schemaVersion === STATE_SCHEMA_VERSION, "v1 state was not upgraded to the current schema");
      assert(versionOne.profile.name === "Version one" && versionOne.onboarding.missionSeen, "v1 data was lost");
      assert(Array.isArray(versionOne.calendar.timeBlocks) && versionOne.study.cards, "Phase 1 fields were not initialized");
    });

    check("current state survives JSON export and import", () => {
      const envelope = JSON.parse(JSON.stringify({
        app: "LIFEFORGE",
        formatVersion: 1,
        state: migrateState({
          schemaVersion: 1,
          preferences: { theme: "system", reduceMotion: true },
          onboarding: { missionSeen: true }
        })
      }));
      const imported = migrateState(envelope.state);
      assert(imported.preferences.theme === "system", "theme did not round-trip");
      assert(imported.onboarding.missionSeen, "onboarding state did not round-trip");
    });

    check("private backup history keeps only the latest ten snapshots", () => {
      let history = [];
      for (let index = 0; index < 12; index++) {
        const savedAt = `2026-01-${String(index + 1).padStart(2, "0")}T00:00:00.000Z`;
        history = appendBackup(history, DEFAULT_STATE, savedAt);
      }
      assert(history.length === 10, "history did not cap at ten");
      assert(history[0].savedAt === "2026-01-03T00:00:00.000Z", "oldest snapshot was not removed");
    });

    check("navigation routes have visible labels and valid destinations", () => {
      for (const [route, label] of Object.entries(ROUTES)) {
        assert(route && label, "route has no label");
        if (route === "fire") continue; // Life on Fire is built into the Reset page; no separate link
        assert(document.querySelector(`[data-route="${route}"]`), `navigation link missing for ${route}`);
      }
    });

    check("Help contains the required 988 and low-mood guidance", () => {
      const help = renderHelp();
      assert(help.includes("call or text 988 (US)"), "988 guidance is missing");
      assert(help.includes("If low mood lasts 2 or more weeks, talk to a doctor or therapist."), "low-mood guidance is missing");
    });

    check("Mission contains the purpose and private-data promise", () => {
      assert(MISSION.statement.includes("builds the life they choose"), "mission statement is incomplete");
      assert(MISSION.promises.some((promise) => promise.includes("your data stays on your device")), "privacy promise is missing");
    });

    check("version-two state migrates to the current schema without losing prior data", () => {
      const versionTwo = migrateState({
        schemaVersion: 2,
        profile: { name: "Version two", wakeTime: "07:10", seasons: ["Season 1"] },
        preferences: { theme: "light", reduceMotion: true },
        onboarding: { completed: true, missionSeen: true, step: 6 },
        reminders: { morning: { enabled: false, time: "08:10" }, weekly: { enabled: true, time: "19:00", weekday: "7" } },
        calendar: { timeBlocks: [{ id: "block-v2", title: "Study", date: "2026-11-18" }] },
        health: { sleepLogs: [{ id: "sleep-v2" }], workouts: [{ id: "workout-v2" }] },
        study: { cards: { "card-v2": { dueAt: 1200 } }, sessions: [{ id: "study-v2" }] },
        flow: { active: { startedAt: 1700 }, recovery: { until: 2300 }, sessions: [{ id: "flow-v2" }] }
      });
      assert(versionTwo.schemaVersion === STATE_SCHEMA_VERSION, "v2 state was not upgraded to the current schema");
      assert(versionTwo.profile.name === "Version two" && versionTwo.profile.wakeTime === "07:10", "profile data was lost");
      assert(versionTwo.preferences.theme === "light" && versionTwo.preferences.reduceMotion, "preferences were lost");
      assert(versionTwo.onboarding.completed && versionTwo.onboarding.missionSeen, "onboarding state was lost");
      assert(versionTwo.calendar.timeBlocks[0].id === "block-v2", "time blocks were lost");
      assert(versionTwo.health.sleepLogs[0].id === "sleep-v2" && versionTwo.health.workouts[0].id === "workout-v2", "health logs were lost");
      assert(versionTwo.study.cards["card-v2"].dueAt === 1200 && versionTwo.study.sessions[0].id === "study-v2", "study state was lost");
      assert(versionTwo.flow.sessions[0].id === "flow-v2", "flow sessions were lost");
      assert(versionTwo.flow.active.startedAt === 1700 && versionTwo.flow.recovery.until === 2300, "active flow state was lost");
      assert(!versionTwo.reminders.morning.enabled && versionTwo.reminders.morning.time === "08:10", "morning reminder was lost");
      assert(versionTwo.reminders.weekly.time === "19:00", "weekly reminder was lost");
      assert(versionTwo.money.limitsTable["2026"].ira === 7500 && versionTwo.money.limitsTable["2026"].k401 === 24500, "money defaults were not added");
      assert(Array.isArray(versionTwo.journals.decisions) && Array.isArray(versionTwo.benchmarks), "journal or benchmark fields were not added");
    });

    check("Phase 2 calculators match hand-worked results", () => {
      const split = LF_P2_CALCULATORS.paycheckSplit(4000);
      assert(split.growth === 1000 && split.stability === 600 && split.essentials === 2000 && split.joy === 400, "paycheck split is incorrect");
      assert(LF_P2_CALCULATORS.monthsOfFreedom(15000, 3000) === 5, "months of freedom is incorrect");
      assert(LF_P2_CALCULATORS.compoundGrowth(1000, 100, 12, 1) === 2395.08, "compound growth is incorrect");
      const debts = [{ id: "card", balance: 1000, apr: 24, minimum: 100 }, { id: "loan", balance: 300, apr: 0, minimum: 50 }];
      const avalanche = LF_P2_CALCULATORS.debtPayoff(debts, 100, "avalanche");
      const snowball = LF_P2_CALCULATORS.debtPayoff(debts, 100, "snowball");
      assert(avalanche.months === 6 && avalanche.interest === 64.54, "avalanche estimate is incorrect");
      assert(snowball.months === 6 && snowball.interest === 77.11, "snowball estimate is incorrect");
    });

    check("generated lesson and Phase 2 drill IDs are unique", () => {
      const ids = [];
      lfModules().forEach((module) => {
        ids.push(module.id);
        ["objectives", "units", "recallCards", "drills", "missions", "metrics"].forEach((key) => {
          ids.push(...lfItems(module[key]).map((item) => item.id));
        });
        ids.push(...lfPretestItems(module).map((item) => item.id), ...lfQuizzes(module).map((item) => item.id));
      });
      [...LF_P2_DOMAINS, ...LF_P2_SCENARIOS, ...LF_P2_SCOUT_TESTS].forEach((item) => ids.push(item.id));
      assert(ids.every(Boolean) && ids.length === new Set(ids).size, "generated or drill IDs are missing or duplicated");
    });

    return report;
  }

