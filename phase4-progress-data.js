"use strict";

function lfP4LocalDate(value) {
  if (!value) return "";
  const text = String(value);
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const time = Date.parse(text);
  return Number.isFinite(time) ? lfTodayISO(new Date(time)) : "";
}

function lfP4DisplayDate(value) {
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? "Date unavailable"
    : date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function lfP4PracticeDays() {
  const dates = new Set();
  const add = (value) => {
    const date = lfP4LocalDate(value);
    if (date) dates.add(date);
  };
  state.calendar.timeBlocks.filter((block) => block.done).forEach((block) => add(block.date));
  state.study.sessions.forEach((session) => add(session.start));
  state.study.quizAttempts.forEach((attempt) => add(attempt.at));
  state.flow.sessions.forEach((session) => add(session.date || session.start));
  state.evidenceLog.forEach((entry) => add(entry.date));
  state.recordings.forEach((recording) => add(recording.date));
  state.journals.rolePlaySessions.forEach((session) => add(session.startedAt));
  let activeDays = 0;
  let missedDays = 0;
  for (let offset = 0; offset < 365; offset += 1) {
    if (dates.has(lfDateAfter(-offset))) {
      activeDays += 1;
      missedDays = 0;
    } else {
      missedDays += 1;
      if (missedDays === 2) break;
    }
  }
  return activeDays;
}

function lfP4EvidenceRows() {
  return [
    ["SYSTEM", state.calendar.timeBlocks.filter((block) => block.done).length, "completed time blocks"],
    ["MIND", state.study.sessions.length + state.study.quizAttempts.length, "study sessions and quiz attempts"],
    ["BODY", state.health.workouts.length + state.health.sleepLogs.length, "workout and sleep logs"],
    ["MONEY", state.money.purchaseGateLog.length + state.money.netWorth.length + state.journals.investment.length, "purchase checks, snapshots and investment notes"],
    ["VOICE", state.recordings.length + state.journals.rolePlaySessions.length, "recordings and role-plays"],
    ["SELF", state.evidenceLog.length + state.flow.sessions.length, "evidence notes and flow blocks"]
  ];
}

function lfP4ScoreHistory(pillar) {
  return state.weeklyReviews.slice(-6).map((review) => {
    const raw = review.pillarScorecard && review.pillarScorecard[pillar];
    return { date: lfP4DisplayDate(review.date), score: raw === "" || raw === null || raw === undefined ? null : Number(raw) };
  }).filter((entry) => Number.isFinite(entry.score) && entry.score >= 0 && entry.score <= 10);
}

function lfP4Calibration() {
  const attempts = state.study.quizAttempts.filter((attempt) =>
    typeof attempt.correct === "boolean"
    && Number.isFinite(Number(attempt.confidence))
    && Number(attempt.confidence) >= 0
    && Number(attempt.confidence) <= 100
  );
  if (!attempts.length) return null;
  const predicted = Math.round(attempts.reduce((sum, item) => sum + Number(item.confidence), 0) / attempts.length);
  const actual = Math.round(100 * attempts.filter((item) => item.correct).length / attempts.length);
  const gap = predicted - actual;
  const reading = gap > 0 ? "Average confidence is above answer accuracy."
    : gap < 0 ? "Answer accuracy is above average confidence."
      : "Average confidence matches answer accuracy.";
  return { attempts: attempts.length, predicted, actual, reading };
}

function lfP4LatestBenchmark(day) {
  return state.benchmarks.slice().reverse().find((item) => Number(item.day) === day) || null;
}

function lfP4SpeakingScore(day) {
  const recording = state.recordings.find((item) => Number(item.benchmarkDay) === day);
  if (!recording || !recording.rubric) return "";
  const scores = LF_P3_RUBRIC.map(([key]) => Number(recording.rubric[key])).filter((score) => Number.isFinite(score) && score > 0);
  return scores.length ? `${(scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(1)} / 5` : "";
}

function lfP4MoneyText(snapshot) {
  if (!snapshot || typeof snapshot !== "object" || Array.isArray(snapshot)) return "";
  const values = [];
  if (snapshot.netWorth !== null && snapshot.netWorth !== undefined && Number.isFinite(Number(snapshot.netWorth))) {
    values.push(`Net worth ${new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(Number(snapshot.netWorth))}`);
  }
  if (snapshot.monthsOfFreedom !== null && snapshot.monthsOfFreedom !== undefined && Number.isFinite(Number(snapshot.monthsOfFreedom))) {
    values.push(`${snapshot.monthsOfFreedom} months of freedom`);
  }
  if (snapshot.moneyStress !== null && snapshot.moneyStress !== undefined && Number.isFinite(Number(snapshot.moneyStress))) {
    values.push(`Money stress ${snapshot.moneyStress} / 10`);
  }
  return values.join("; ");
}

function lfP4BenchmarkValues(day) {
  const baseline = state.profile.baseline || {};
  const benchmark = day === 1 ? null : lfP4LatestBenchmark(day);
  const moneyBenchmark = day === 1 ? lfP4LatestBenchmark(1) : benchmark;
  return [
    ["Retention", day === 1 ? baseline.retention : benchmark && benchmark.retentionQuiz],
    ["Body retest", day === 1 ? baseline.body : benchmark && benchmark.bodyRetests],
    ["Money", day === 1 ? baseline.money || lfP4MoneyText(moneyBenchmark && moneyBenchmark.moneySnapshot) : lfP4MoneyText(moneyBenchmark && moneyBenchmark.moneySnapshot)],
    ["Self-ratings", day === 1 ? baseline.selfRatings : benchmark && benchmark.selfRatings],
    ["Speaking rubric", lfP4SpeakingScore(day)]
  ];
}

function lfP4AccountabilitySummary() {
  const dates = new Set(Array.from({ length: 7 }, (_, index) => lfDateAfter(-index)));
  const blocks = state.calendar.timeBlocks.filter((item) => dates.has(item.date) && item.done).length;
  const studies = state.study.sessions.filter((item) => dates.has(lfP4LocalDate(item.start))).length;
  const flowMinutes = state.flow.sessions.filter((item) => dates.has(lfP4LocalDate(item.date || item.start)))
    .reduce((sum, item) => sum + Number(item.minutes || 0), 0);
  const workouts = state.health.workouts.filter((item) => dates.has(item.date)).length;
  const evidence = state.evidenceLog.filter((item) => dates.has(item.date)).length;
  const outcomes = (state.weeklyReviews[state.weeklyReviews.length - 1]?.outcomes3 || []).filter(Boolean);
  return [
    `LIFEFORGE check-in: ${lfP4DisplayDate(lfDateAfter(-6))} to ${lfP4DisplayDate(lfTodayISO())}`,
    `Practice rhythm: ${lfP4PracticeDays()} practice days, allowing one missed day before a reset.`,
    `Completed time blocks: ${blocks}`,
    `Study sessions: ${studies}`,
    `Flow minutes: ${flowMinutes}`,
    `Workout logs: ${workouts}`,
    `Evidence notes: ${evidence}`,
    outcomes.length ? `Next outcomes: ${outcomes.join("; ")}` : "Next outcomes: none saved yet"
  ].join("\n");
}
