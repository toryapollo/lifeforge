  "use strict";

  const STATE_SCHEMA_VERSION = 5;
  const STATE_KEY = "lifeforge.state";
  const BACKUPS_KEY = "lifeforge.backups";
  const MAX_BACKUPS = 10;
  const ROUTES = Object.freeze({
    mission: "Mission",
    onboarding: "Start",
    today: "Today",
    study: "Study",
    flow: "Flow",
    weekly: "Weekly review",
    settings: "Settings",
    colors: "Colors",
    help: "Help",
    money: "Money", thinking: "Thinking", resilience: "Resilience", fire: "Life on Fire",
    speak: "Speak", conversations: "Conversations", progress: "Progress"
  });
  const PALETTES = Object.freeze([
    { id: "forest", label: "Forest", description: "Cool greens. The default." },
    { id: "ocean", label: "Ocean", description: "Calm blues and teal." },
    { id: "mint", label: "Mint", description: "Fresh green and lime." },
    { id: "aurora", label: "Aurora", description: "Green with a violet glow." },
    { id: "dusk", label: "Dusk", description: "Soft violet and pink." },
    { id: "ember", label: "Ember", description: "The original brown and orange." }
  ]);
  const DEFAULT_STATE = Object.freeze({
    schemaVersion: STATE_SCHEMA_VERSION,
    updatedAt: null,
    profile: {
      name: "",
      startDate: "",
      wakeTime: "",
      chronotype: "",
      seasons: [],
      identityStatements: [],
      futureSelfPage: "",
      chapterBreakDate: "",
      environmentChanges: [],
      habits: [],
      baseline: {}
    },
    preferences: {
      theme: "dark",
      palette: "forest",
      reduceMotion: false, fontScale: 1
    },
    reminders: {
      morning: { enabled: true, time: "07:00" },
      flow: { enabled: true, time: "09:00" },
      evening: { enabled: true, time: "20:30" },
      weekly: { enabled: true, time: "18:00", weekday: "7" },
      mission: { enabled: true, time: "09:00" },
      srs: { enabled: true, time: "07:30" }
    },
    onboarding: {
      missionSeen: false,
      completed: false,
      step: 0
    },
    calendar: { timeBlocks: [] },
    daily: {},
    captures: [],
    health: { sleepLogs: [], workouts: [] },
    missions: [],
    study: { activeModuleId: "M01", step: 0, quizIndex: 0, currentSession: null, progress: {}, cards: {}, sessions: [], quizAttempts: [] },
    flow: { active: null, recovery: null, sessions: [] },
    weeklyReviews: [],
    weeklyDraft: { step: 0, notes: {}, outcomes: ["", "", ""], scorecard: {} },
    reminderSchedule: { mission: null, srs: null },
    evidenceLog: [],
    companion: lfNormalizeCompanion(),
    ...LF_P2_STATE_DEFAULTS,
    ...LF_P3_STATE_DEFAULTS
  });
  const MISSION = Object.freeze({
    introduction: "LIFEFORGE is a personal classroom for anyone ready to rebuild how they learn, work, earn, lead and live, whether you're back in school, changing careers or just starting over. It combines the best ideas from hand-picked teachers with the research behind them, then turns those ideas into daily practice, real-world missions and honest check-ins. You don't finish a lesson by reading it. You finish it when you can do it.",
    statement: "To forge a focused, capable, steady and generous person: one who learns anything, thinks clearly, manages money wisely, speaks with conviction, leads by lifting others, and builds the life they choose instead of the one that happens to them.",
    promises: [
      "Built on evidence, and honest about what the evidence doesn't show.",
      "Progress over perfection. Never miss twice.",
      "Measured against yesterday's you, never against anyone else.",
      "It's private: your data stays on your device."
    ]
  });
  const LOOP = Object.freeze([
    ["Understand", "Guess first, recall with the book closed, teach it back."],
    ["Practice", "Use drills, recordings and role-plays just past your current skill."],
    ["Integrate", "Build a daily rhythm, a weekly review and real-world missions."],
    ["Transform", "Measure evidence of who you're becoming on days 1, 30 and 90."]
  ]);
  const isAndroidNative = location.protocol === "file:" && /Android/i.test(navigator.userAgent);
  const routeView = document.getElementById("route-view");
  const liveStatus = document.getElementById("live-status");
  let currentRoute = "mission";
  let lastRoute = "";
  let bootIssue = "";

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function migrateStateBase(input) {
    if (!input || typeof input !== "object" || Array.isArray(input)) {
      throw new Error("Saved data must be a JSON object.");
    }
    const source = clone(input);
    let version = Number(source.schemaVersion || 0);
    if (!Number.isInteger(version) || version < 0) {
      throw new Error("Saved data has an invalid schema version.");
    }
    if (version > STATE_SCHEMA_VERSION) {
      throw new Error("This backup was made by a newer version of LIFEFORGE.");
    }
    if (version < 1) {
      source.profile = source.profile && typeof source.profile === "object" ? source.profile : {};
      source.preferences = source.preferences && typeof source.preferences === "object" ? source.preferences : {};
      source.onboarding = source.onboarding && typeof source.onboarding === "object" ? source.onboarding : {};
      source.schemaVersion = 1;
      version = 1;
    }
    if (version === 1) {
      source.schemaVersion = 2;
      version = 2;
    }
    const savedPreferences = source.preferences && typeof source.preferences === "object" ? { ...source.preferences } : {};
    const legacyReminders = savedPreferences.reminders;
    delete savedPreferences.reminders;
    const preferences = { ...DEFAULT_STATE.preferences, ...savedPreferences };
    if (!["dark", "light", "system"].includes(preferences.theme)) {
      throw new Error("Saved data contains an unknown theme preference.");
    }
    if (!PALETTES.some((palette) => palette.id === preferences.palette)) {
      preferences.palette = DEFAULT_STATE.preferences.palette;
    }
    if (typeof preferences.reduceMotion !== "boolean") {
      throw new Error("Saved data contains an invalid reduced-motion preference.");
    }
    const migrated = {
      ...clone(DEFAULT_STATE),
      ...source,
      schemaVersion: STATE_SCHEMA_VERSION,
      updatedAt: typeof source.updatedAt === "string" ? source.updatedAt : null,
      profile: {
        ...DEFAULT_STATE.profile,
        ...(source.profile || {})
      },
      preferences,
      onboarding: {
        ...DEFAULT_STATE.onboarding,
        ...(source.onboarding || {}),
        missionSeen: Boolean(source.onboarding && source.onboarding.missionSeen)
      }
    };
    for (const key of ["calendar", "health", "study", "flow"]) {
      const value = source[key];
      migrated[key] = {
        ...clone(DEFAULT_STATE[key]),
        ...(value && typeof value === "object" && !Array.isArray(value) ? value : {})
      };
    }
    const savedReminders = source.reminders || legacyReminders;
    migrated.reminders = {
      ...clone(DEFAULT_STATE.reminders),
      ...(savedReminders && typeof savedReminders === "object" ? savedReminders : {})
    };
    for (const kind of Object.keys(DEFAULT_STATE.reminders)) {
      migrated.reminders[kind] = {
        ...DEFAULT_STATE.reminders[kind],
        ...(migrated.reminders[kind] || {})
      };
      const reminder = migrated.reminders[kind];
      if (typeof reminder.enabled !== "boolean" || !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(String(reminder.time))) {
        throw new Error("Saved data contains an invalid reminder preference.");
      }
    }
    if (String(migrated.reminders.weekly.weekday) === "0") {
      migrated.reminders.weekly.weekday = "7";
    }
    if (!/^[1-7]$/.test(String(migrated.reminders.weekly.weekday))) {
      throw new Error("Saved data contains an invalid weekly reminder day.");
    }
    migrated.study.progress = migrated.study.progress && typeof migrated.study.progress === "object" ? migrated.study.progress : {};
    migrated.study.cards = migrated.study.cards && typeof migrated.study.cards === "object" ? migrated.study.cards : {};
    migrated.study.sessions = Array.isArray(migrated.study.sessions) ? migrated.study.sessions : [];
    migrated.study.quizIndex = Number.isInteger(migrated.study.quizIndex) && migrated.study.quizIndex >= 0 ? migrated.study.quizIndex : 0;
    migrated.study.currentSession = migrated.study.currentSession && typeof migrated.study.currentSession === "object" ? migrated.study.currentSession : null;
    migrated.flow.recovery = migrated.flow.recovery && typeof migrated.flow.recovery === "object" ? migrated.flow.recovery : null;
    migrated.missions = Array.isArray(migrated.missions) ? migrated.missions : [];
    migrated.calendar.timeBlocks = Array.isArray(migrated.calendar.timeBlocks) ? migrated.calendar.timeBlocks : [];
    migrated.health.sleepLogs = Array.isArray(migrated.health.sleepLogs) ? migrated.health.sleepLogs : [];
    migrated.health.workouts = Array.isArray(migrated.health.workouts) ? migrated.health.workouts : [];
    migrated.flow.sessions = Array.isArray(migrated.flow.sessions) ? migrated.flow.sessions : [];
    migrated.weeklyReviews = Array.isArray(migrated.weeklyReviews) ? migrated.weeklyReviews : [];
    migrated.captures = Array.isArray(migrated.captures) ? migrated.captures : [];
    migrated.evidenceLog = Array.isArray(migrated.evidenceLog) ? migrated.evidenceLog : [];
    migrated.daily = migrated.daily && typeof migrated.daily === "object" && !Array.isArray(migrated.daily) ? migrated.daily : {};
    migrated.weeklyDraft = {
      ...clone(DEFAULT_STATE.weeklyDraft),
      ...(source.weeklyDraft && typeof source.weeklyDraft === "object" ? source.weeklyDraft : {})
    };
    migrated.weeklyDraft.notes = migrated.weeklyDraft.notes && typeof migrated.weeklyDraft.notes === "object" ? migrated.weeklyDraft.notes : {};
    migrated.weeklyDraft.outcomes = Array.isArray(migrated.weeklyDraft.outcomes) ? migrated.weeklyDraft.outcomes : ["", "", ""];
    migrated.weeklyDraft.scorecard = migrated.weeklyDraft.scorecard && typeof migrated.weeklyDraft.scorecard === "object" ? migrated.weeklyDraft.scorecard : {};
    migrated.reminderSchedule = {
      ...clone(DEFAULT_STATE.reminderSchedule),
      ...(source.reminderSchedule && typeof source.reminderSchedule === "object" ? source.reminderSchedule : {})
    };
    migrated.profile.seasons = Array.isArray(migrated.profile.seasons) ? migrated.profile.seasons : [];
    migrated.profile.identityStatements = Array.isArray(migrated.profile.identityStatements) ? migrated.profile.identityStatements : [];
    migrated.profile.environmentChanges = Array.isArray(migrated.profile.environmentChanges) ? migrated.profile.environmentChanges : [];
    migrated.profile.habits = Array.isArray(migrated.profile.habits) ? migrated.profile.habits : [];
    migrated.profile.baseline = migrated.profile.baseline && typeof migrated.profile.baseline === "object" ? migrated.profile.baseline : {};
    migrated.onboarding.completed = Boolean(migrated.onboarding.completed);
    migrated.onboarding.step = Math.max(0, Math.min(6, Number(migrated.onboarding.step) || 0));
    return migrated;
  }

