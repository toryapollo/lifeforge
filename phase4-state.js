"use strict";

function migrateStatePhase4(migrated) {
  const fontScale = Number(migrated.preferences.fontScale ?? 1);
  if (![1, 1.15, 1.3].includes(fontScale)) {
    throw new Error("Saved data contains an invalid text-size preference.");
  }
  migrated.preferences.fontScale = fontScale;
  migrated.study.quizAttempts = Array.isArray(migrated.study.quizAttempts) ? migrated.study.quizAttempts : [];
  if (typeof lfNormalizeCompanion === "function") {
    const hadStart = migrated.companion && typeof migrated.companion.startedAt === "string";
    migrated.companion = lfNormalizeCompanion(migrated.companion);
    const start = migrated.profile && (migrated.profile.chapterBreakDate || migrated.profile.startDate);
    if (!hadStart && start && !Number.isNaN(new Date(start).getTime())) migrated.companion.startedAt = new Date(`${start}T00:00:00`).toISOString();
  }
  migrated.schemaVersion = 5;
  return migrated;
}
