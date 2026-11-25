"use strict";
  // Three helpers for new users (added 2026-11-24):
  //  1. A guided first two weeks: one "Your next step" card at a time (Mission and Today).
  //  2. A buddy check-in on Progress: send your week through the phone's share menu, log their replies.
  //  3. Progress protection: ask the browser to keep data, monthly backup reminder, one-tap backup.
  // State lives in state.companion (normalized in migrateStatePhase4). Applied after each render
  // by lfApplyCompanion(route), called from views.js render().

  const LF_COMPANION_DEFAULTS = Object.freeze({
    startedAt: null,
    guide: { hidden: false, done: [] },
    buddy: { name: "", contact: "", checkins: [] },
    backup: { lastExportAt: null, lastReminderAt: null }
  });

  function lfNormalizeCompanion(value) {
    const source = value && typeof value === "object" && !Array.isArray(value) ? value : {};
    const part = (key) => ({ ...LF_COMPANION_DEFAULTS[key], ...(source[key] && typeof source[key] === "object" ? source[key] : {}) });
    const companion = {
      startedAt: typeof source.startedAt === "string" ? source.startedAt : new Date().toISOString(),
      guide: part("guide"), buddy: part("buddy"), backup: part("backup")
    };
    companion.guide.done = Array.isArray(companion.guide.done) ? companion.guide.done.filter((id) => typeof id === "string") : [];
    companion.guide.hidden = companion.guide.hidden === true;
    companion.buddy.checkins = Array.isArray(companion.buddy.checkins) ? companion.buddy.checkins.slice(-50) : [];
    return companion;
  }

  // ---------- 1. Guided first two weeks ----------
  const lfAny = (list) => Array.isArray(list) && list.length > 0;
  const LF_START_PATH = Object.freeze([
    { id: "setup", day: 1, title: "Finish the Start setup", why: "About 20 minutes. It gives the rest of the app your goals and starting point.", route: "onboarding",
      done: (s) => s.onboarding.completed === true },
    { id: "outcome", day: 2, title: "Plan today: write your one outcome", why: "One result that would make today worth it. That's the whole habit.", route: "today",
      done: (s) => Object.values(s.daily || {}).some((d) => d && d.outcome) },
    { id: "study", day: 3, title: "Do your first Study session", why: "Start with M01. It teaches how to learn everything else faster.", route: "study",
      done: (s) => lfAny(s.study.sessions) || Boolean(s.study.currentSession) },
    { id: "flow", day: 4, title: "Run your first 25-minute Flow block", why: "One task, phone in another room. Short is fine; finishing is the point.", route: "flow",
      done: (s) => lfAny(s.flow.sessions) },
    { id: "shutdown", day: 5, title: "Close a day with Evening shutdown", why: "Write one piece of evidence that you acted like the person you're becoming.", route: "today",
      done: (s) => lfAny(s.evidenceLog) },
    { id: "speak", day: 6, title: "Record your day-1 speaking benchmark", why: "One minute: \"Tell me about yourself.\" You'll compare it on day 30 and 90.", route: "speak",
      done: (s) => (s.recordings || []).some((r) => String(r.benchmarkDay) === "1") },
    { id: "weekly", day: 7, title: "Do your first Weekly review", why: "20 to 45 minutes. Look back, then pick next week's three outcomes.", route: "weekly",
      done: (s) => lfAny(s.weeklyReviews) },
    { id: "buddy", day: 8, title: "Send your week to a buddy", why: "Having someone check in on you makes you more likely to follow through.", route: "progress",
      done: (s) => (s.companion.buddy.checkins || []).some((c) => c.type === "sent") },
    { id: "money", day: 9, title: "Work out your months of freedom", why: "How long you could cover your bills if income stopped. A 2-minute calculation on Money.", route: "money",
      done: (s) => Number(s.money && s.money.monthsOfFreedom) > 0 || lfAny(s.money && s.money.netWorth) },
    { id: "backup", day: 10, title: "Back up your progress", why: "Your progress lives only on this device. Save a copy somewhere safe.", action: "backup",
      done: (s) => Boolean(s.companion.backup.lastExportAt) },
    { id: "think", day: 11, title: "Use one Thinking tool on a real decision", why: "Try the Pre-mortem or DARE on something you're actually deciding.", route: "thinking",
      done: (s) => ["decisions", "dare", "sift", "scout", "systemMaps", "aiHygiene"].some((k) => lfAny(s.journals && s.journals[k])) },
    { id: "reset", day: 12, title: "Try one Reset worksheet", why: "The ABCDE worksheet or a discomfort ladder. Practice on a calm day so it's ready for a hard one.", route: "resilience",
      done: (s) => ["abcde", "discomfortLadder", "expressiveWriting", "panic", "hobby"].some((k) => lfAny(s.journals && s.journals[k])) },
    { id: "talk", day: 13, title: "Prepare one conversation on Talk", why: "A raise, a bill, or a hard talk. Fill in the boxes that help.", route: "conversations",
      done: (s) => lfAny(s.journals && s.journals.conversationPrepSheets) },
    { id: "weekly2", day: 14, title: "Do your second Weekly review", why: "Two weeks in. This is the rhythm that keeps everything else going.", route: "weekly",
      done: (s) => (s.weeklyReviews || []).length >= 2 }
  ]);

  function lfDayNumber() {
    const start = new Date(state.companion.startedAt);
    start.setHours(0, 0, 0, 0);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return Math.max(1, Math.round((today - start) / 86400000) + 1);
  }

  function lfStepDone(step) {
    try { return state.companion.guide.done.includes(step.id) || step.done(state); } catch (_error) { return false; }
  }

  function lfNextStepCard() {
    if (state.companion.guide.hidden) return "";
    const done = LF_START_PATH.filter(lfStepDone).length;
    const next = LF_START_PATH.find((step) => !lfStepDone(step));
    const day = lfDayNumber();
    const list = `<details class="path-list"><summary>See all 14 steps (${done} done)</summary><ol>${LF_START_PATH.map((step) =>
      `<li class="${lfStepDone(step) ? "is-done" : ""}">${lfStepDone(step) ? "✓ " : ""}${escapeHtml(step.title)} <span class="quiet-copy">· day ${step.day}</span></li>`).join("")}</ol></details>`;
    if (!next) {
      return `<section class="next-step-card" aria-labelledby="next-step-title">
        <p class="eyebrow">Your first two weeks</p>
        <h2 id="next-step-title">All 14 steps done. Well done.</h2>
        <p>You've tried every part of LIFEFORGE. From here, keep the rhythm: Today morning and night, one Study or Flow block when you can, and a Weekly review every week.</p>
        <div class="page-actions"><button class="button button-secondary" type="button" data-guide-hide>Hide this card</button></div>
      </section>`;
    }
    const ahead = next.day > day ? `<p class="quiet-copy">You're ahead of schedule. This one is suggested for day ${next.day}.</p>` : "";
    const go = next.action === "backup"
      ? `<button class="button button-primary" type="button" data-backup-now>Back up now</button>`
      : `<a class="button button-primary" href="#/${next.route}">Go to ${escapeHtml(ROUTES[next.route] || next.route)}</a>`;
    return `<section class="next-step-card" aria-labelledby="next-step-title">
      <p class="eyebrow">Your next step · day ${Math.min(day, 99)} · ${done} of 14 done</p>
      <h2 id="next-step-title">${escapeHtml(next.title)}</h2>
      <p>${escapeHtml(next.why)}</p>${ahead}
      <progress class="path-bar" max="14" value="${done}" aria-label="${done} of 14 steps done">${done} of 14</progress>
      <div class="page-actions">${go}<button class="button button-secondary" type="button" data-guide-done="${next.id}">Mark done</button></div>
      ${list}
      <p class="quiet-copy"><button class="link-button" type="button" data-guide-hide>Hide this guide</button> (you can bring it back in Settings)</p>
    </section>`;
  }

  // ---------- 2. Buddy check-in ----------
  async function lfShareText(text, title) {
    try {
      if (navigator.share) { await navigator.share({ title, text }); return "shared"; }
    } catch (error) {
      if (error && error.name === "AbortError") return "cancelled";
    }
    try { await navigator.clipboard.writeText(text); return "copied"; } catch (_error) { return "failed"; }
  }

  function lfBuddyMessage() {
    const name = state.companion.buddy.name.trim();
    const summary = typeof lfP4AccountabilitySummary === "function" ? lfP4AccountabilitySummary() : "";
    return `${name ? `Hey ${name}! ` : ""}Here's my LIFEFORGE week. Ask me about it, and hold me to next week's goals.\n\n${summary}`;
  }

  function lfBuddySection() {
    const buddy = state.companion.buddy;
    const recent = buddy.checkins.slice(-5).reverse().map((c) =>
      `<li class="log-row">${escapeHtml(c.date)} · ${c.type === "sent" ? "You sent your week" : `${escapeHtml(buddy.name || "Buddy")}: ${escapeHtml(c.note || "")}`}</li>`).join("");
    return `<section class="phase1-panel buddy-panel" aria-labelledby="buddy-title">
      <h2 id="buddy-title">Buddy check-in</h2>
      <div class="section-help"><p><strong>What to do:</strong> Pick one person who will ask how your week went: a friend, partner or classmate. Once a week, send them your summary. When they reply or check in, log it here. Checking in with someone regularly makes you more likely to stick with your goals than going it alone.</p></div>
      <form id="buddy-form" class="phase1-fields">
        <label>Buddy's name<input id="buddy-name" value="${escapeHtml(buddy.name)}" placeholder="e.g., Marcus" autocomplete="off"></label>
        <label>How you reach them (optional)<input id="buddy-contact" value="${escapeHtml(buddy.contact)}" placeholder="e.g., text, WhatsApp, Sunday call" autocomplete="off"></label>
        <button class="button button-secondary" type="submit">Save buddy</button>
      </form>
      <div class="page-actions"><button class="button button-primary" type="button" id="buddy-send">Send my week${buddy.name ? ` to ${escapeHtml(buddy.name)}` : " to my buddy"}</button></div>
      <p class="quiet-copy">Opens your phone's share menu (Messages, WhatsApp, email). Nothing is sent unless you choose to send it.</p>
      <form id="buddy-log-form" class="phase1-fields">
        <label>Log their check-in<input id="buddy-note" placeholder="e.g., Asked about my study goal. Proud of the 3 flow blocks." autocomplete="off"></label>
        <button class="button button-secondary" type="submit">Log check-in</button>
      </form>
      ${recent ? `<ul class="block-list">${recent}</ul>` : `<p class="quiet-copy">No check-ins yet.</p>`}
    </section>`;
  }

  // ---------- 3. Progress protection ----------
  function lfHasRealProgress() {
    return state.onboarding.completed || lfAny(state.evidenceLog) || lfAny(state.study.sessions) || lfAny(state.flow.sessions) || lfAny(state.weeklyReviews);
  }

  function lfBackupDue() {
    if (!lfHasRealProgress()) return false;
    const now = Date.now();
    const { lastExportAt, lastReminderAt } = state.companion.backup;
    if (lastReminderAt && now - new Date(lastReminderAt).getTime() < 7 * 86400000) return false;
    if (!lastExportAt) return now - new Date(state.companion.startedAt).getTime() > 3 * 86400000;
    return now - new Date(lastExportAt).getTime() > 30 * 86400000;
  }

  function lfBackupBanner() {
    if (!lfBackupDue()) return "";
    const last = state.companion.backup.lastExportAt;
    return `<section class="backup-banner" role="region" aria-label="Backup reminder">
      <p><strong>Time to back up.</strong> ${last ? `Your last backup was ${escapeHtml(new Date(last).toLocaleDateString())}.` : "You haven't backed up yet."} Your progress lives only on this device. If the app is deleted or the browser's data is cleared, it's gone.</p>
      <div class="page-actions"><button class="button button-primary" type="button" data-backup-now>Back up now</button><button class="button button-secondary" type="button" data-backup-later>Remind me in a week</button></div>
    </section>`;
  }

  function lfMarkBackedUp() {
    updateState((next) => { next.companion.backup.lastExportAt = new Date().toISOString(); next.companion.backup.lastReminderAt = null; }, "Backup saved. Keep the file somewhere safe, like iCloud Drive or Google Drive.", true);
  }

  async function lfBackupNow() {
    const name = `lifeforge-backup-${typeof lfTodayISO === "function" ? lfTodayISO() : new Date().toISOString().slice(0, 10)}.json`;
    const data = exportEnvelope();
    try {
      if (!isAndroidNative && navigator.canShare && typeof File === "function") {
        const file = new File([data], name, { type: "application/json" });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: "LIFEFORGE backup" });
          lfMarkBackedUp();
          return;
        }
      }
    } catch (error) {
      if (error && error.name === "AbortError") { setStatus("Backup cancelled. Nothing was saved."); return; }
    }
    exportData();
    lfMarkBackedUp();
  }

  let lfPersistAsked = false;
  function lfRequestPersistentStorage() {
    if (lfPersistAsked || !navigator.storage || !navigator.storage.persist) return;
    lfPersistAsked = true;
    navigator.storage.persisted().then((already) => already || navigator.storage.persist()).catch(() => {});
  }

  function lfDataSafetyNote() {
    return `<div class="section-help data-safety"><p><strong>Keep your progress safe:</strong> everything is saved only on this device. Deleting the app's home-screen icon, uninstalling it, or clearing the browser's website data erases it. Back up once a month and keep the file in iCloud Drive, Google Drive or email.</p>
      <div class="page-actions"><button class="button button-primary" type="button" data-backup-now>Back up now</button></div>
      <p class="quiet-copy" id="backup-last">${state.companion.backup.lastExportAt ? `Last backup: ${escapeHtml(new Date(state.companion.backup.lastExportAt).toLocaleString())}` : "No backup yet."}</p>
      ${state.companion.guide.hidden ? `<p><button class="button button-secondary" type="button" data-guide-show>Show the first-two-weeks guide again</button></p>` : ""}
    </div>`;
  }

  // ---------- Wiring ----------
  function lfApplyCompanion(route) {
    lfRequestPersistentStorage();
    const view = document.getElementById("route-view");
    if (!view) return;
    const head = view.querySelector("h1") && view.querySelector("h1").closest("section");
    if (route === "mission" && head) head.insertAdjacentHTML("beforebegin", lfBackupBanner() + lfNextStepCard());
    if (route === "today" && head) head.insertAdjacentHTML("afterend", lfBackupBanner() + lfNextStepCard());
    if (route === "progress") {
      const summary = document.getElementById("p4-summary-title");
      const panel = summary && summary.closest("section");
      if (panel) panel.insertAdjacentHTML("afterend", lfBuddySection());
      if (head) head.insertAdjacentHTML("afterend", lfBackupBanner());
    }
    if (route === "settings") {
      const dataTitle = [...view.querySelectorAll("h2")].find((h) => h.textContent.trim() === "Your data");
      if (dataTitle) dataTitle.insertAdjacentHTML("afterend", lfDataSafetyNote());
    }

    view.querySelectorAll("[data-backup-now]").forEach((b) => b.addEventListener("click", lfBackupNow));
    view.querySelectorAll("[data-backup-later]").forEach((b) => b.addEventListener("click", () =>
      updateState((next) => { next.companion.backup.lastReminderAt = new Date().toISOString(); }, "OK. We'll remind you in a week.", true)));
    view.querySelectorAll("[data-guide-done]").forEach((b) => b.addEventListener("click", () =>
      updateState((next) => { if (!next.companion.guide.done.includes(b.dataset.guideDone)) next.companion.guide.done.push(b.dataset.guideDone); }, "Step marked done.", true)));
    view.querySelectorAll("[data-guide-hide]").forEach((b) => b.addEventListener("click", () =>
      updateState((next) => { next.companion.guide.hidden = true; }, "Guide hidden. You can bring it back in Settings.", true)));
    view.querySelectorAll("[data-guide-show]").forEach((b) => b.addEventListener("click", () =>
      updateState((next) => { next.companion.guide.hidden = false; }, "The first-two-weeks guide is back on Mission and Today.", true)));

    const buddyForm = document.getElementById("buddy-form");
    if (buddyForm) buddyForm.addEventListener("submit", (event) => {
      event.preventDefault();
      updateState((next) => {
        next.companion.buddy.name = document.getElementById("buddy-name").value.trim().slice(0, 60);
        next.companion.buddy.contact = document.getElementById("buddy-contact").value.trim().slice(0, 120);
      }, "Buddy saved.", true);
    });
    const send = document.getElementById("buddy-send");
    if (send) send.addEventListener("click", async () => {
      const result = await lfShareText(lfBuddyMessage(), "My LIFEFORGE week");
      if (result === "cancelled") { setStatus("Not sent."); return; }
      if (result === "failed") { setStatus("Couldn't open sharing. Select the summary text above and copy it instead.", true); return; }
      updateState((next) => { next.companion.buddy.checkins.push({ date: lfTodayISO(), type: "sent" }); },
        result === "copied" ? "Your week is copied. Paste it into a message to your buddy." : "Shared. Nice work.", true);
    });
    const log = document.getElementById("buddy-log-form");
    if (log) log.addEventListener("submit", (event) => {
      event.preventDefault();
      const note = document.getElementById("buddy-note").value.trim().slice(0, 300);
      if (!note) { setStatus("Write a short note about the check-in first.", true); return; }
      updateState((next) => { next.companion.buddy.checkins.push({ date: lfTodayISO(), type: "received", note }); }, "Check-in logged.", true);
    });
  }
