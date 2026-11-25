"use strict";

function migrateStatePhase4(migrated) {
  const fontScale = Number(migrated.preferences.fontScale ?? 1);
  if (![1, 1.15, 1.3].includes(fontScale)) {
    throw new Error("Saved data contains an invalid text-size preference.");
  }
  migrated.preferences.fontScale = fontScale;
  migrated.study.quizAttempts = Array.isArray(migrated.study.quizAttempts) ? migrated.study.quizAttempts : [];
  migrated.schemaVersion = 5;
  return migrated;
}
