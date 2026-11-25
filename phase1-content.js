"use strict";
  function lfTodayISO(date = new Date()) {
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
  }

  function lfModules() {
    return window.LF_CONTENT && Array.isArray(window.LF_CONTENT.modules) ? window.LF_CONTENT.modules : [];
  }

  function lfModule(id) {
    return lfModules().find((module) => String(module.id) === String(id));
  }

  function lfItems(value) {
    if (Array.isArray(value)) return value;
    if (value && typeof value === "object") {
      return Object.entries(value).map(([id, item]) => item && typeof item === "object" ? { ...item, id: item.id || id } : { id, text: item });
    }
    return value === null || value === undefined ? [] : [value];
  }

  function lfCards(module) {
    return lfItems(module && (module.cards || module.recallCards));
  }

  function lfQuizzes(module) {
    const value = module && (module.quizzes || module.quiz);
    return value && !Array.isArray(value) && Array.isArray(value.items) ? value.items : lfItems(value);
  }

  function lfPretestItems(module) {
    const value = module && module.pretest;
    return value && Array.isArray(value.items) ? value.items : lfItems(value);
  }

  function lfNormalizeContent() {
    lfModules().forEach((module) => {
      if (!Array.isArray(module.cards)) module.cards = lfCards(module);
      if (!Array.isArray(module.quizzes)) module.quizzes = lfQuizzes(module);
    });
  }

  function lfText(value) {
    if (value === null || value === undefined) return "";
    if (typeof value !== "object") return String(value);
    return (Array.isArray(value) ? value : Object.values(value)).map(lfText).join("\n");
  }

  function lfRenderValue(value) {
    if (Array.isArray(value)) {
      return value.length ? `<ol class="data-list">${value.map((item) => `<li>${lfRenderValue(item)}</li>`).join("")}</ol>` : "<p>None listed.</p>";
    }
    if (value && typeof value === "object") {
      return `<dl class="data-tree">${Object.entries(value).map(([key, item]) => `<div><dt>${escapeHtml(key)}</dt><dd>${lfRenderValue(item)}</dd></div>`).join("")}</dl>`;
    }
    return `<p class="data-copy">${escapeHtml(value === null || value === undefined ? "" : value)}</p>`;
  }

  function lfModuleReference(id) {
    const module = lfModule(id);
    if (!module) return `<p class="saved-note">Generated lesson data for ${escapeHtml(id)} is not available yet.</p>`;
    const content = { ...module, cards: lfCards(module), quizzes: lfQuizzes(module) };
    return `<details class="module-reference" data-module-reference="${escapeHtml(module.id)}"><summary>Complete ${escapeHtml(module.id)} lesson content</summary>${lfRenderValue(content)}</details>`;
  }

  function lfUnitText(module, unitId) {
    const list = lfItems(module && module.units);
    const unit = list.find((entry) => entry && String(entry.id) === String(unitId));
    return unit ? lfText(unit) : "";
  }

  function lfDaily(date = lfTodayISO()) {
    return state.daily[date] || {};
  }

  function lfTimeBlocks(date = lfTodayISO()) {
    return state.calendar.timeBlocks.filter((block) => block.date === date);
  }

  function lfDateAfter(days, from = new Date()) {
    const date = new Date(from);
    date.setDate(date.getDate() + days);
    return lfTodayISO(date);
  }

  lfNormalizeContent();
