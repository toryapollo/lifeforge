"use strict";
  function lfP2Round(value) {
    return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
  }

  function lfP2DebtPayoff(debts, extra, strategy) {
    const loans = (Array.isArray(debts) ? debts : []).map((debt, index) => ({
      id: String(debt.id || index),
      balance: Math.max(0, lfP2Round(debt.balance)),
      apr: Math.max(0, Number(debt.apr) || 0),
      minimum: Math.max(0, lfP2Round(debt.minimum))
    }));
    if (!loans.length || loans.every((loan) => !loan.balance)) {
      return { months: 0, interest: 0, paidOff: true };
    }
    const budget = lfP2Round(loans.reduce((sum, loan) => sum + loan.minimum, 0) + Math.max(0, Number(extra) || 0));
    let interest = 0;
    for (let month = 1; month <= 1200; month++) {
      loans.forEach((loan) => {
        const charge = lfP2Round(loan.balance * loan.apr / 1200);
        loan.balance = lfP2Round(loan.balance + charge);
        interest = lfP2Round(interest + charge);
      });
      let remaining = budget;
      loans.forEach((loan) => {
        const payment = Math.min(loan.balance, loan.minimum, remaining);
        loan.balance = lfP2Round(loan.balance - payment);
        remaining = lfP2Round(remaining - payment);
      });
      const priority = loans.filter((loan) => loan.balance > 0).sort((first, second) => {
        const order = strategy === "snowball"
          ? first.balance - second.balance || second.apr - first.apr
          : second.apr - first.apr || first.balance - second.balance;
        return order || first.id.localeCompare(second.id);
      });
      priority.forEach((loan) => {
        const payment = Math.min(loan.balance, remaining);
        loan.balance = lfP2Round(loan.balance - payment);
        remaining = lfP2Round(remaining - payment);
      });
      if (loans.every((loan) => loan.balance <= 0)) {
        return { months: month, interest, paidOff: true };
      }
    }
    return { months: 1200, interest, paidOff: false };
  }

  window.LF_P2_CALCULATORS = Object.freeze({
    paycheckSplit(netPay) {
      const amount = Math.max(0, Number(netPay) || 0);
      return { growth: lfP2Round(amount * 0.25), stability: lfP2Round(amount * 0.15), essentials: lfP2Round(amount * 0.5), joy: lfP2Round(amount * 0.1) };
    },
    monthsOfFreedom(reserve, monthlyEssentials) {
      const monthly = Number(monthlyEssentials);
      return monthly > 0 ? lfP2Round(Math.max(0, Number(reserve) || 0) / monthly) : 0;
    },
    compoundGrowth(start, monthlyContribution, annualRate, years) {
      let balance = Math.max(0, Number(start) || 0);
      const contribution = Math.max(0, Number(monthlyContribution) || 0);
      const months = Math.max(0, Math.floor((Number(years) || 0) * 12));
      const rate = Number(annualRate) / 1200;
      for (let month = 0; month < months; month++) balance = balance * (1 + rate) + contribution;
      return lfP2Round(balance);
    },
    anchorRange(anchor, lowPercent, highPercent) {
      const value = Math.max(0, Number(anchor) || 0);
      return {
        low: lfP2Round(value * (1 - Math.max(0, Number(lowPercent) || 0) / 100)),
        anchor: lfP2Round(value),
        high: lfP2Round(value * (1 + Math.max(0, Number(highPercent) || 0) / 100))
      };
    },
    debtPayoff: lfP2DebtPayoff
  });
