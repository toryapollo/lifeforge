"use strict";
  function wireMoneyActions() {
    document.querySelectorAll("[data-limit-year]").forEach((input) => input.addEventListener("change", () => {
      const year = input.dataset.limitYear;
      const kind = input.dataset.limitKind;
      updateState((next) => { next.money.limitsTable[year][kind] = Number(input.value); }, `${year} contribution limit saved.`);
    }));
    lfP2OnSubmit("limit-year-form", () => {
      const year = lfP2Value("limit-new-year");
      updateState((next) => {
        next.money.limitsTable[year] = { ira: Number(lfP2Value("limit-new-ira")), k401: Number(lfP2Value("limit-new-k401")) };
      }, `${year} limits saved.`, true);
    });
    lfP2OnSubmit("paycheck-form", () => {
      const split = LF_P2_CALCULATORS.paycheckSplit(lfP2Value("paycheck-amount"));
      document.getElementById("paycheck-result").textContent = `Growth ${lfP2Money(split.growth)} | Stability ${lfP2Money(split.stability)} | Essentials ${lfP2Money(split.essentials)} | Joy ${lfP2Money(split.joy)}`;
      updateState((next) => { next.money.buckets = split; }, "Paycheck split saved.");
    });
    lfP2OnSubmit("debt-form", () => {
      const debt = {
        id: lfP2Id("debt"), name: lfP2Value("debt-name"), balance: Number(lfP2Value("debt-balance")),
        apr: Number(lfP2Value("debt-apr")), minimum: Number(lfP2Value("debt-minimum"))
      };
      updateState((next) => { next.money.debts.push(debt); }, "Debt saved locally.", true);
    });
    document.querySelectorAll("[data-debt-remove]").forEach((button) => button.addEventListener("click", () => {
      updateState((next) => { next.money.debts = next.money.debts.filter((debt) => debt.id !== button.dataset.debtRemove); }, "Debt removed.", true);
    }));
    lfP2OnSubmit("debt-sim-form", () => {
      const extra = Number(lfP2Value("debt-extra"));
      const avalanche = LF_P2_CALCULATORS.debtPayoff(state.money.debts, extra, "avalanche");
      const snowball = LF_P2_CALCULATORS.debtPayoff(state.money.debts, extra, "snowball");
      const status = (result) => result.paidOff ? `${result.months} months, ${lfP2Money(result.interest)} interest` : `not paid within 100 years, ${lfP2Money(result.interest)} interest`;
      const difference = Math.abs(snowball.interest - avalanche.interest);
      const lowerCost = avalanche.interest <= snowball.interest ? "Avalanche" : "Snowball";
      const saved = avalanche.paidOff && snowball.paidOff ? ` ${lowerCost} costs ${lfP2Money(difference)} less interest.` : "";
      document.getElementById("debt-result").textContent = `Avalanche: ${status(avalanche)}. Snowball: ${status(snowball)}.${saved}`;
    });
    lfP2OnSubmit("freedom-form", () => {
      const expenses = Number(lfP2Value("freedom-expenses"));
      const reserve = Number(lfP2Value("freedom-reserve"));
      const months = LF_P2_CALCULATORS.monthsOfFreedom(reserve, expenses);
      document.getElementById("freedom-result").textContent = `${months} months of freedom at these monthly expenses.`;
      updateState((next) => { next.money.baseline = expenses; next.money.stabilityBalance = reserve; next.money.monthsOfFreedom = months; }, "Emergency-fund snapshot saved.");
    });
    lfP2OnSubmit("compound-form", () => {
      const total = LF_P2_CALCULATORS.compoundGrowth(lfP2Value("compound-start"), lfP2Value("compound-monthly"), lfP2Value("compound-rate"), lfP2Value("compound-years"));
      document.getElementById("compound-result").textContent = `Estimated future value: ${lfP2Money(total)}. Contributions are added at each month's end.`;
    });
    lfP2OnSubmit("range-form", () => {
      const range = LF_P2_CALCULATORS.anchorRange(lfP2Value("range-anchor"), lfP2Value("range-low"), lfP2Value("range-high"));
      document.getElementById("range-result").textContent = `Lower estimate ${lfP2Money(range.low)} | Anchor ${lfP2Money(range.anchor)} | Upper estimate ${lfP2Money(range.high)}`;
    });
    lfP2OnSubmit("purchase-form", () => {
      const entry = {
        id: lfP2Id("purchase"), name: lfP2Value("purchase-name"), cost: Number(lfP2Value("purchase-cost")),
        uses: Number(lfP2Value("purchase-uses")),
        impulse: lfP2Value("purchase-impulse") === "yes", budgeted: lfP2Value("purchase-budgeted") === "yes",
        improvesLife: lfP2Value("purchase-value") === "yes", createdAt: new Date().toISOString()
      };
      const message = entry.impulse ? "Pause for seven days before buying. Recheck the cost per use and the budget."
        : !entry.budgeted ? "Wait until the purchase fits this month's budget."
          : !entry.improvesLife ? "Keep it on the wishlist and review whether it is worth the cost."
            : "It passes your current gate. The choice is still yours.";
      document.getElementById("purchase-result").textContent = `${message} Cost per use: ${lfP2Money(entry.cost / entry.uses)}. Saved on this device.`;
      updateState((next) => { next.money.purchaseGateLog.push(entry); }, "Purchase check saved.");
    });
    document.querySelectorAll("[data-student-check]").forEach((input) => input.addEventListener("change", () => {
      updateState((next) => { next.money.studentChecklist[input.dataset.studentCheck] = input.checked; }, "Student checklist saved.");
    }));
    lfP2OnSubmit("investment-form", () => lfP2SaveJournal("investment", {
      why: lfP2Value("investment-why"), premortem: lfP2Value("investment-premortem"),
      sell: lfP2Value("investment-sell"), reviewDate: lfP2Value("investment-review")
    }, "Investment journal saved locally."));
    lfP2OnSubmit("money-decision-form", () => lfP2SaveJournal("decisions", {
      title: "Money decision", decision: lfP2Value("money-decision"), why: lfP2Value("money-decision-why"),
      expect: lfP2Value("money-decision-expect"), confidence: Number(lfP2Value("money-decision-confidence")),
      reviewDate: lfP2Value("money-decision-review"), context: "money"
    }, "Decision saved locally."));
    lfP2OnSubmit("money-benchmark-form", () => {
      const day = Number(lfP2Value("money-benchmark-day"));
      const snapshot = { day, moneySnapshot: { netWorth: Number(lfP2Value("money-benchmark-worth")), monthsOfFreedom: state.money.monthsOfFreedom, moneyStress: Number(lfP2Value("money-benchmark-stress")) } };
      updateState((next) => {
        const prior = next.benchmarks.find((item) => item.day === day);
        if (prior) Object.assign(prior, snapshot, { savedAt: new Date().toISOString() });
        else next.benchmarks.push({ id: lfP2Id("benchmark"), savedAt: new Date().toISOString(), ...snapshot });
        next.money.netWorth.push({ date: lfTodayISO(), value: snapshot.moneySnapshot.netWorth });
      }, `Day ${day} money benchmark saved.`);
      document.getElementById("money-benchmark-status").textContent = `Day ${day} snapshot saved locally.`;
    });
  }
