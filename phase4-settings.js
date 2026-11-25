"use strict";

function renderPhase4Settings() {
  return `<section class="settings-group" aria-labelledby="text-size-title">
    <h2 id="text-size-title">Text size</h2>
    <p>Increase text throughout LIFEFORGE. Browser zoom remains available.</p>
    <div class="field-row">
      <div>
        <label class="field-label" for="text-size-select">Text size</label>
        <span class="field-help" id="text-size-help">Saved on this device.</span>
      </div>
      <select class="field-control" id="text-size-select" aria-describedby="text-size-help">
        <option value="1"${state.preferences.fontScale === 1 ? " selected" : ""}>Default · 100%</option>
        <option value="1.15"${state.preferences.fontScale === 1.15 ? " selected" : ""}>Large · 115%</option>
        <option value="1.3"${state.preferences.fontScale === 1.3 ? " selected" : ""}>Largest · 130%</option>
      </select>
    </div>
  </section>`;
}
