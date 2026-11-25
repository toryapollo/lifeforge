"use strict";
  function lfP2FireSection() {
    return `
      <section class="phase2-group" aria-labelledby="fire-title">
        <h2 id="fire-title">Life on Fire: a five-minute guide</h2>
        <p>LIFEFORGE is a practice tool. It does not provide therapy or emergency services. If you may be in immediate danger, call or text 988.</p>
        <ol class="phase2-ladder">
          <li><strong>Sigh:</strong> take three gentle double inhales through the nose, each followed by a long exhale.</li>
          <li><strong>Name it:</strong> write the feeling in a few direct words.</li>
          <li><strong>Check the 3 Ps:</strong> is this permanent, pervasive, or personal?</li>
          <li><strong>Smallest move:</strong> choose one controllable action you can do now.</li>
          <li><strong>Reach out:</strong> contact one trusted person. If in danger, use the 988 call or text links above.</li>
        </ol>
        <div class="phase2-timer"><output id="fire-clock" aria-live="polite">05:00</output><button class="button button-primary" type="button" id="fire-start">Start five-minute guide</button></div>
        <form id="panic-form" class="phase2-form">
          <label>Name the feeling<input id="panic-feeling" maxlength="120" required></label>
          <label>Could this be permanent?<select id="panic-permanent"><option value="unsure">Not sure</option><option value="yes">Yes</option><option value="no">No</option></select></label>
          <label>Could it be pervasive, affecting every part of life?<select id="panic-pervasive"><option value="unsure">Not sure</option><option value="yes">Yes</option><option value="no">No</option></select></label>
          <label>Am I taking this personally?<select id="panic-personal"><option value="unsure">Not sure</option><option value="yes">Yes</option><option value="no">No</option></select></label>
          <label>Smallest controllable move<input id="panic-move" maxlength="200" required></label>
          <label>Person to reach out to<select id="panic-contact">${state.journals.contacts.map((person) => `<option value="${escapeHtml(person.id)}">${escapeHtml(person.name)}</option>`).join("")}<option value="trusted-person">A trusted person not listed here</option></select></label>
          <p>Message idea: “Rough week. Got 10 minutes to talk?”</p>
          <button class="button button-secondary" type="submit">Save this private check-in</button>
        </form>
        ${lfP2RecordList(state.journals.panic, ["feeling", "move"])}
      </section>`;
  }

  function renderFire() {
    return `<div class="phase2-screen"><section aria-labelledby="route-title"><h1 class="page-title" id="route-title" tabindex="-1">Life on Fire</h1><p class="lead">Start with the next small, controllable step.</p></section>${lfP2FireSection()}</div>`;
  }

  function renderResilience() {
    const contacts = state.journals.contacts;
    const writings = state.journals.expressiveWriting;
    const ladders = state.journals.discomfortLadder;
    const hobbies = state.journals.hobby;
    return `
      <div class="phase2-screen">
        <section aria-labelledby="route-title">
          <h1 class="page-title" id="route-title" tabindex="-1">Resilience and recovery</h1>
          <p class="lead">Practice recovery and keep the next step manageable. This app does not provide therapy.</p>
        </section>
        ${lfP2FireSection()}
        <section class="phase2-group" aria-labelledby="abcde-title">
          <h2 id="abcde-title">ABCDE worksheet</h2>
          <p>Adversity, Belief, Consequence, Disputation, Energization.</p>
          <form id="abcde-form" class="phase2-form">
            <label>Adversity: what happened?<textarea id="abcde-adversity" required></textarea></label>
            <label>Belief: what did I tell myself?<textarea id="abcde-belief" required></textarea></label>
            <label>Consequence: what did I feel or do?<textarea id="abcde-consequence" required></textarea></label>
            <label>Disputation: what evidence or other explanation matters?<textarea id="abcde-disputation" required></textarea></label>
            <label>Energization: what changed, and what is one next step?<textarea id="abcde-energy" required></textarea></label>
            <button class="button button-primary" type="submit">Save ABCDE worksheet</button>
          </form>
          ${lfP2RecordList(state.journals.abcde, ["adversity", "disputation", "energy"])}
        </section>
        <section class="phase2-group" aria-labelledby="compassion-title">
          <h2 id="compassion-title">Self-compassion break</h2>
          <ol class="phase2-ladder">
            <li>Mindfulness: “This is a moment of suffering.”</li>
            <li>Common humanity: “Struggle is part of being human. Others feel this too.”</li>
            <li>Self-kindness: “May I be kind to myself. What do I need?”</li>
          </ol>
          <p>Try the friend test: say what you would say to a good friend.</p>
        </section>
        <section class="phase2-group" aria-labelledby="writing-title">
          <h2 id="writing-title">Private expressive writing</h2>
          <p>Write only if it feels useful. The timer is 15 minutes. Notes stay in local app state and can be erased below.</p>
          <div class="phase2-timer"><output id="writing-clock" aria-live="polite">15:00</output><button class="button button-secondary" type="button" id="writing-start">Start writing timer</button></div>
          <form id="writing-form" class="phase2-form">
            <label>Private writing<textarea id="writing-text" rows="8" required></textarea></label>
            <button class="button button-primary" type="submit">Save private writing</button>
          </form>
          ${writings.length ? `<details class="phase2-private"><summary>Saved private entries (${writings.length})</summary><ol>${writings.slice().reverse().map((entry) => `<li><time>${escapeHtml(new Date(entry.createdAt).toLocaleString())}</time><p>${escapeHtml(entry.text)}</p></li>`).join("")}</ol></details>` : "<p class=\"quiet-copy\">No private writing saved.</p>"}
        </section>
        <section class="phase2-group" aria-labelledby="ladder-title">
          <h2 id="ladder-title">Discomfort ladder</h2>
          <p>Rank up to 10 avoided actions from easiest to hardest. Choose a manageable rung to practice this week.</p>
          <form id="discomfort-form" class="phase2-form">
            <label>Activities, one per line<textarea id="discomfort-items" rows="6" required></textarea></label>
            <label>This week's rung<input id="discomfort-pick" type="number" min="1" max="10" step="1" required></label>
            <button class="button button-primary" type="submit">Save ladder and weekly pick</button>
          </form>
          ${lfP2RecordList(ladders, ["items", "weeklyPick"])}
        </section>
        <section class="phase2-group" aria-labelledby="contacts-title">
          <h2 id="contacts-title">People I can reach</h2>
          <p>Keep two or three people you can contact. Saved contact details stay on this device.</p>
          ${contacts.length ? `<ul class="phase2-records">${contacts.map((person) => `<li><span><strong>${escapeHtml(person.name)}</strong> | ${escapeHtml(person.method)}</span><button class="button button-small" type="button" data-contact-remove="${escapeHtml(person.id)}">Remove</button></li>`).join("")}</ul>` : "<p class=\"quiet-copy\">Add someone you trust.</p>"}
          ${contacts.length < 3 ? `<form id="contact-form" class="phase2-form"><label>Name<input id="contact-name" maxlength="80" required></label><label>How to reach them<input id="contact-method" maxlength="120" required></label><button class="button button-secondary" type="submit">Add trusted person</button></form>` : "<p>You have three contacts saved. Remove one to add another.</p>"}
        </section>
        <section class="phase2-group" aria-labelledby="vibe-title">
          <h2 id="vibe-title">VIBE and hobby log</h2>
          <p>VIBE means Vitality, Inquiry, Belonging, and Expression. Track minutes and whether you felt more alive or more judged.</p>
          <form id="hobby-form" class="phase2-form">
            <label>Activity<input id="hobby-name" maxlength="100" required></label>
            <label>VIBE area<select id="hobby-vibe"><option>Vitality</option><option>Inquiry</option><option>Belonging</option><option>Expression</option></select></label>
            <label>Minutes<input id="hobby-minutes" type="number" min="1" max="1440" step="1" required></label>
            <label>Afterward<select id="hobby-feeling"><option value="alive">More alive</option><option value="judged">More judged</option></select></label>
            <button class="button button-primary" type="submit">Save hobby session</button>
          </form>
          ${lfP2RecordList(hobbies, ["vibe", "minutes", "feeling"])}
        </section>
        <section class="phase2-group" aria-labelledby="erase-title">
          <h2 id="erase-title">Erase private journals</h2>
          <p>This clears saved Phase 2 journals and contact details from local app state. Exported backups are separate files.</p>
          <button class="button button-danger" type="button" id="erase-journals">Erase all local journals</button>
        </section>
        ${lfModuleReference("M07")}
      </div>`;
  }
