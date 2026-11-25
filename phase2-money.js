"use strict";
  function renderMoney() {
    const limits = state.money.limitsTable;
    const checklist = [
      ["aotc", "Check American Opportunity Tax Credit (AOTC) eligibility. It applies to the first four years of college."],
      ["llc", "Check Lifetime Learning Credit (LLC) eligibility. It has no year limit."],
      ["fafsa", "Complete the Free Application for Federal Student Aid (FAFSA) and check Pell Grant eligibility."],
      ["employer", "Ask whether your employer offers tuition assistance."],
      ["wioa", "Ask a local American Job Center about Workforce Innovation and Opportunity Act (WIOA) training funds."]
    ];
    const debts = state.money.debts;
    return `
      <div class="phase2-screen">
        <section aria-labelledby="route-title">
          <h1 class="page-title" id="route-title" tabindex="-1">Money tools</h1>
          <p class="lead">Use the lesson tools to organize your next money decision.</p>
          <p class="phase2-disclaimer" role="note">Educational only. This is not financial or tax advice. Limits change yearly. Verify them at irs.gov each January.</p>
        </section>
        <section class="phase2-group" aria-labelledby="limits-title">
          <h2 id="limits-title">Yearly contribution limits</h2>
          <p>2026 lesson defaults are editable. Confirm the current figures at irs.gov before using them.</p>
          <div class="phase2-table-wrap"><table class="phase2-table">
            <caption>Annual account contribution limits</caption>
            <thead><tr><th scope="col">Year</th><th scope="col">Individual retirement account</th><th scope="col">401(k) employee contribution</th></tr></thead>
            <tbody>${Object.entries(limits).sort(([a], [b]) => a.localeCompare(b)).map(([year, values]) => `
              <tr><th scope="row">${escapeHtml(year)}</th>
                <td><label class="visually-hidden" for="limit-${escapeHtml(year)}-ira">IRA limit for ${escapeHtml(year)}</label><input id="limit-${escapeHtml(year)}-ira" type="number" min="0" step="1" data-limit-year="${escapeHtml(year)}" data-limit-kind="ira" value="${escapeHtml(values.ira)}"></td>
                <td><label class="visually-hidden" for="limit-${escapeHtml(year)}-k401">401(k) limit for ${escapeHtml(year)}</label><input id="limit-${escapeHtml(year)}-k401" type="number" min="0" step="1" data-limit-year="${escapeHtml(year)}" data-limit-kind="k401" value="${escapeHtml(values.k401)}"></td>
              </tr>`).join("")}</tbody>
          </table></div>
          <form id="limit-year-form" class="phase2-form">
            <label>Year<input id="limit-new-year" type="number" min="2026" step="1" required></label>
            <label>IRA limit<input id="limit-new-ira" type="number" min="0" step="1" required></label>
            <label>401(k) limit<input id="limit-new-k401" type="number" min="0" step="1" required></label>
            <button class="button button-secondary" type="submit">Add or update year</button>
          </form>
          <p id="limits-status" class="saved-note" aria-live="polite"></p>
        </section>
        <section class="phase2-group" aria-labelledby="order-title">
          <h2 id="order-title">Order of operations</h2>
          <ol class="phase2-ladder">
            <li>Write a budget and find your monthly baseline.</li><li>Build a starter emergency fund of about $1,000-$2,000.</li>
            <li>Capture the full employer retirement match.</li><li>Pay high-interest debt, starting with credit cards.</li>
            <li>Build an accessible emergency fund of 3-6 months of core expenses.</li><li>Consider a Roth individual retirement account (IRA) or health savings account (HSA) if eligible.</li>
            <li>Increase workplace retirement contributions, then fund other goals.</li>
          </ol>
          <p>Rate cutoffs vary by source. Compare your interest rate, cash needs, and employer plan before choosing.</p>
        </section>
        <section class="phase2-group" aria-labelledby="split-title">
          <h2 id="split-title">Paycheck split</h2>
          <p>Starting target: 25% growth, 15% stability, 50% essentials, and 10% joy. Adjust the target to fit your current life.</p>
          <form id="paycheck-form" class="phase2-form">
            <label>Take-home pay<input id="paycheck-amount" type="number" min="0" step="0.01" required></label>
            <button class="button button-primary" type="submit">Split paycheck</button>
          </form>
          <output id="paycheck-result" class="phase2-result" aria-live="polite">Enter an amount to calculate the four buckets.</output>
        </section>
        <section class="phase2-group" aria-labelledby="debt-title">
          <h2 id="debt-title">Debt payoff comparison</h2>
          <form id="debt-form" class="phase2-form">
            <label>Debt name<input id="debt-name" maxlength="80" required></label>
            <label>Balance<input id="debt-balance" type="number" min="0.01" step="0.01" required></label>
            <label>Annual percentage rate<input id="debt-apr" type="number" min="0" step="0.01" required></label>
            <label>Monthly minimum<input id="debt-minimum" type="number" min="0" step="0.01" required></label>
            <button class="button button-secondary" type="submit">Add debt</button>
          </form>
          ${debts.length ? `<ul class="phase2-records">${debts.map((debt) => `<li><span><strong>${escapeHtml(debt.name)}</strong> | $${escapeHtml(debt.balance)} at ${escapeHtml(debt.apr)}% APR, $${escapeHtml(debt.minimum)} minimum</span><button class="button button-small" type="button" data-debt-remove="${escapeHtml(debt.id)}">Remove</button></li>`).join("")}</ul>` : "<p class=\"quiet-copy\">Add debts to compare payoff plans.</p>"}
          <form id="debt-sim-form" class="phase2-form">
            <label>Extra monthly payment<input id="debt-extra" type="number" min="0" step="0.01" value="0"></label>
            <button class="button button-primary" type="submit">Compare avalanche and snowball</button>
          </form>
          <output id="debt-result" class="phase2-result" aria-live="polite">Avalanche targets the highest rate first. Snowball targets the smallest balance first.</output>
        </section>
        <section class="phase2-group" aria-labelledby="freedom-title">
          <h2 id="freedom-title">Emergency fund and months of freedom</h2>
          <form id="freedom-form" class="phase2-form">
            <label>Monthly core expenses<input id="freedom-expenses" type="number" min="0.01" step="0.01" value="${escapeHtml(state.money.baseline)}" required></label>
            <label>Accessible emergency savings<input id="freedom-reserve" type="number" min="0" step="0.01" value="${escapeHtml(state.money.stabilityBalance || 0)}" required></label>
            <button class="button button-primary" type="submit">Calculate months of freedom</button>
          </form>
          <output id="freedom-result" class="phase2-result" aria-live="polite">Enter monthly expenses and accessible savings.</output>
        </section>
        <section class="phase2-group" aria-labelledby="compound-title">
          <h2 id="compound-title">Compound growth</h2>
          <form id="compound-form" class="phase2-form">
            <label>Starting amount<input id="compound-start" type="number" min="0" step="0.01" value="1000" required></label>
            <label>Monthly contribution<input id="compound-monthly" type="number" min="0" step="0.01" value="1000" required></label>
            <label>Annual return assumption (%)<input id="compound-rate" type="number" min="0" step="0.01" value="7" required></label>
            <label>Years<input id="compound-years" type="number" min="0" step="1" value="25" required></label>
            <button class="button button-primary" type="submit">Estimate future value</button>
          </form>
          <output id="compound-result" class="phase2-result" aria-live="polite">This estimate is not a promise or a forecast.</output>
        </section>
        <section class="phase2-group" aria-labelledby="range-title">
          <h2 id="range-title">Anchor and range calculator</h2>
          <form id="range-form" class="phase2-form">
            <label>Starting anchor<input id="range-anchor" type="number" min="0" step="0.01" required></label>
            <label>Lower range (%)<input id="range-low" type="number" min="0" step="0.1" value="10" required></label>
            <label>Upper range (%)<input id="range-high" type="number" min="0" step="0.1" value="15" required></label>
            <button class="button button-primary" type="submit">Calculate range</button>
          </form>
          <output id="range-result" class="phase2-result" aria-live="polite">Compare a starting anchor with a range you can justify.</output>
        </section>
        <section class="phase2-group" aria-labelledby="purchase-title">
          <h2 id="purchase-title">Purchase gate</h2>
          <p>Pause impulse purchases for seven days and compare the cost per use with the value to your life.</p>
          <form id="purchase-form" class="phase2-form">
            <label>Purchase<input id="purchase-name" maxlength="100" required></label>
            <label>Cost<input id="purchase-cost" type="number" min="0" step="0.01" required></label>
            <label>Expected uses<input id="purchase-uses" type="number" min="1" step="1" required></label>
            <label>Is this an impulse?<select id="purchase-impulse"><option value="yes">Yes</option><option value="no">No</option></select></label>
            <label>Is it in this month's budget?<select id="purchase-budgeted"><option value="no">No</option><option value="yes">Yes</option></select></label>
            <label>Will it improve your life?<select id="purchase-value"><option value="unsure">Not sure</option><option value="yes">Yes</option><option value="no">No</option></select></label>
            <button class="button button-primary" type="submit">Save purchase check</button>
          </form>
          <output id="purchase-result" class="phase2-result" aria-live="polite"></output>
        </section>
        <section class="phase2-group" aria-labelledby="student-title">
          <h2 id="student-title">Student money checklist</h2>
          <p>Eligibility depends on your situation. The two education credits cannot be claimed for the same student in the same year.</p>
          <div class="phase2-checklist">${checklist.map(([key, text]) => `<label><input type="checkbox" data-student-check="${key}"${state.money.studentChecklist[key] ? " checked" : ""}><span>${text}</span></label>`).join("")}</div>
        </section>
        <section class="phase2-group" aria-labelledby="investment-title">
          <h2 id="investment-title">Investment journal</h2>
          <form id="investment-form" class="phase2-form">
            <label>Why am I considering this investment?<textarea id="investment-why" required></textarea></label>
            <label>What would I do if it fell by 50%?<textarea id="investment-premortem" required></textarea></label>
            <label>What evidence would make me sell?<textarea id="investment-sell" required></textarea></label>
            <label>Review date<input id="investment-review" type="date"></label>
            <button class="button button-primary" type="submit">Save investment journal</button>
          </form>
          ${lfP2RecordList(state.journals.investment, ["why", "premortem", "sell"])}
        </section>
        <section class="phase2-group" aria-labelledby="decision-title">
          <h2 id="decision-title">Decision journal</h2>
          <form id="money-decision-form" class="phase2-form">
            <label>Decision<input id="money-decision" required></label>
            <label>Why am I choosing it?<textarea id="money-decision-why" required></textarea></label>
            <label>What do I expect to happen?<textarea id="money-decision-expect" required></textarea></label>
            <label>Confidence (%)<input id="money-decision-confidence" type="number" min="0" max="100" value="50"></label>
            <label>Review date<input id="money-decision-review" type="date"></label>
            <button class="button button-primary" type="submit">Save decision</button>
          </form>
          ${lfP2RecordList(state.journals.decisions, ["why", "expect"])}
        </section>
        <section class="phase2-group" aria-labelledby="benchmark-title">
          <h2 id="benchmark-title">Money benchmark</h2>
          <form id="money-benchmark-form" class="phase2-form">
            <label>Checkpoint<select id="money-benchmark-day"><option value="1">Day 1</option><option value="30">Day 30</option><option value="90">Day 90</option></select></label>
            <label>Net worth<input id="money-benchmark-worth" type="number" step="0.01" required></label>
            <label>Money stress (1-10)<input id="money-benchmark-stress" type="number" min="1" max="10" step="1" required></label>
            <button class="button button-secondary" type="submit">Save money benchmark</button>
          </form>
          <p id="money-benchmark-status" class="saved-note" aria-live="polite"></p>
        </section>
        ${lfModuleReference("M04")}
      </div>`;
  }
