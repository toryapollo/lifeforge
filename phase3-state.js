"use strict";
  const LF_P3_STATE_DEFAULTS = Object.freeze({
    recordings: [],
    journals: {
      ...LF_P2_STATE_DEFAULTS.journals,
      speakingStories: [],
      speakingIntro: null,
      conversationPrepSheets: [],
      rolePlaySessions: []
    },
    phase3: { activePrepSheetId: "" }
  });

  let lfP3IdCounter = 0;
  function lfP3Id(prefix) {
    const bytes = new Uint32Array(2);
    if (window.crypto && window.crypto.getRandomValues) window.crypto.getRandomValues(bytes);
    else bytes.set([Math.floor(Math.random() * 4294967296), Math.floor(Math.random() * 4294967296)]);
    lfP3IdCounter += 1;
    return `${prefix}-${Date.now().toString(36)}-${lfP3IdCounter.toString(36)}-${bytes[0].toString(36)}${bytes[1].toString(36)}`;
  }

  function lfP3CreateRecordingId() {
    const used = new Set((typeof state === "undefined" ? [] : state.recordings || []).map((recording) => recording.id));
    let id = lfP3Id("recording");
    while (used.has(id)) id = lfP3Id("recording");
    return id;
  }

  function migrateStatePhase3(migrated) {
    const journals = migrated.journals && typeof migrated.journals === "object" && !Array.isArray(migrated.journals)
      ? migrated.journals : {};
    migrated.journals = { ...clone(LF_P3_STATE_DEFAULTS.journals), ...journals };
    ["speakingStories", "conversationPrepSheets", "rolePlaySessions"].forEach((key) => {
      migrated.journals[key] = Array.isArray(migrated.journals[key]) ? migrated.journals[key] : [];
    });
    migrated.recordings = Array.isArray(migrated.recordings) ? migrated.recordings : [];
    migrated.phase3 = {
      ...clone(LF_P3_STATE_DEFAULTS.phase3),
      ...(migrated.phase3 && typeof migrated.phase3 === "object" && !Array.isArray(migrated.phase3) ? migrated.phase3 : {})
    };
    migrated.schemaVersion = 4;
    return migrated;
  }
