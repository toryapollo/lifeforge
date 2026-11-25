"use strict";
  let LF_P2_ID_SEQUENCE = 0;

  function lfP2Id(prefix) {
    LF_P2_ID_SEQUENCE += 1;
    return `${prefix}-${Date.now().toString(36)}-${LF_P2_ID_SEQUENCE.toString(36)}`;
  }

  function lfP2Value(id) {
    return document.getElementById(id).value.trim();
  }

  function lfP2Money(value) {
    return Number(value).toLocaleString("en-US", { style: "currency", currency: "USD" });
  }

  function lfP2OnSubmit(id, action) {
    const form = document.getElementById(id);
    if (form) form.addEventListener("submit", (event) => { event.preventDefault(); action(); });
  }

  function lfP2SaveJournal(key, record, message) {
    updateState((next) => {
      next.journals[key].push({ id: lfP2Id(key), createdAt: new Date().toISOString(), ...record });
    }, message, true);
  }

  function lfP2RecordList(items, fields) {
    if (!items.length) return '<p class="quiet-copy">Nothing saved yet.</p>';
    const rows = items.slice(-5).reverse().map((entry) => {
      const title = entry.title || entry.name || entry.activity || entry.decision || entry.adversity || entry.problem || entry.claim || "Saved entry";
      const detail = fields.map((key) => {
        const value = entry[key];
        if (value === undefined || value === null || value === "") return "";
        const label = key.replace(/([A-Z])/g, " $1");
        const text = Array.isArray(value) ? value.join(", ") : typeof value === "object" ? JSON.stringify(value) : value;
        return `${label}: ${text}`;
      }).filter(Boolean).join(" | ");
      return `<li><strong>${escapeHtml(title)}</strong><p>${escapeHtml(detail)}</p></li>`;
    });
    return `<ol class="phase2-records">${rows.join("")}</ol>`;
  }
