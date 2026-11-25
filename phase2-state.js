"use strict";
  const LF_P2_STATE_DEFAULTS = Object.freeze({
    money: {
      baseline: 0, stabilityBalance: 0, buckets: { growth: 0, stability: 0, essentials: 0, joy: 0 },
      netWorth: [], monthsOfFreedom: 0, debts: [], purchaseGateLog: [], moneyFromAsking: 0,
      limitsTable: { "2026": { ira: 7500, k401: 24500 } },
      studentChecklist: { aotc: false, llc: false, fafsa: false, employer: false, wioa: false }
    },
    journals: {
      decisions: [], investment: [], systemMaps: [], dare: [], sift: [], scout: [], aiHygiene: [],
      abcde: [], expressiveWriting: [], discomfortLadder: [], contacts: [], hobby: [], stockdale: [], panic: []
    },
    benchmarks: []
  });

  function migrateState(input) {
    const migrated = migrateStateBase(input);
    const money = migrated.money && typeof migrated.money === "object" && !Array.isArray(migrated.money) ? migrated.money : {};
    migrated.money = { ...clone(LF_P2_STATE_DEFAULTS.money), ...money };
    migrated.money.buckets = { ...LF_P2_STATE_DEFAULTS.money.buckets, ...(migrated.money.buckets || {}) };
    migrated.money.limitsTable = { ...clone(LF_P2_STATE_DEFAULTS.money.limitsTable), ...(migrated.money.limitsTable || {}) };
    migrated.money.studentChecklist = { ...LF_P2_STATE_DEFAULTS.money.studentChecklist, ...(migrated.money.studentChecklist || {}) };
    ["netWorth", "debts", "purchaseGateLog"].forEach((key) => {
      migrated.money[key] = Array.isArray(migrated.money[key]) ? migrated.money[key] : [];
    });
    const journals = migrated.journals && typeof migrated.journals === "object" && !Array.isArray(migrated.journals) ? migrated.journals : {};
    migrated.journals = { ...clone(LF_P2_STATE_DEFAULTS.journals), ...journals };
    Object.keys(LF_P2_STATE_DEFAULTS.journals).forEach((key) => {
      migrated.journals[key] = Array.isArray(migrated.journals[key]) ? migrated.journals[key] : [];
    });
    migrated.benchmarks = Array.isArray(migrated.benchmarks) ? migrated.benchmarks : [];
    return migrateStatePhase4(migrated);
  }
