"use strict";
  function readLocalState() {
    try {
      const raw = localStorage.getItem(STATE_KEY);
      return raw ? migrateState(JSON.parse(raw)) : null;
    } catch (error) {
      bootIssue = error.message || "Saved browser data could not be read.";
      return null;
    }
  }

  const LFNative = Object.freeze({
    call(operation, data) {
      const response = window.prompt(`LFNative.${operation}`, data === undefined ? "" : data);
      if (response === null) {
        throw new Error("The local Android storage bridge did not respond.");
      }
      if (response.startsWith("error:")) {
        throw new Error(response.slice(6));
      }
      return response;
    },
    load() {
      return this.call("load");
    },
    save(json) {
      return this.call("save", json);
    },
    exportFile(name, data) {
      return this.call("exportFile", `${name}\n${data}`);
    },
    importFile() {
      return this.call("importFile");
    },
    notify(message) {
      return this.call("notify", message);
    },
    reminder(schedule) {
      return this.call("reminder", schedule);
    },
    cancelReminder(schedule) {
      return this.call("cancelReminder", schedule);
    },
    _receiveImport(encoded) {
      try {
        const bytes = Uint8Array.from(atob(encoded), (character) => character.charCodeAt(0));
        const text = new TextDecoder("utf-8").decode(bytes);
        importJsonText(text);
      } catch (error) {
        setStatus(`Import failed: ${error.message}`, true);
      }
    }
  });
  window.LFNative = LFNative;

  function readInitialState() {
    if (isAndroidNative) {
      try {
        const raw = LFNative.load();
        if (raw) {
          const fromDevice = migrateState(JSON.parse(raw));
          try {
            localStorage.setItem(STATE_KEY, JSON.stringify(fromDevice));
          } catch (_error) {
            // Android's private state file remains authoritative if the mirror is unavailable.
          }
          return fromDevice;
        }
      } catch (error) {
        bootIssue = error.message || "Saved device data could not be read.";
      }
    }
    return readLocalState() || clone(DEFAULT_STATE);
  }

  let state = readInitialState();

  function readBackups() {
    try {
      const parsed = JSON.parse(localStorage.getItem(BACKUPS_KEY) || "[]");
      if (!Array.isArray(parsed)) {
        return [];
      }
      return parsed
        .filter((entry) => entry && typeof entry.savedAt === "string" && entry.state)
        .map((entry) => ({ savedAt: entry.savedAt, state: migrateState(entry.state) }))
        .slice(-MAX_BACKUPS);
    } catch (_error) {
      return [];
    }
  }

  let backups = readBackups();

  function applyPreferences() {
    document.documentElement.dataset.theme = state.preferences.theme;
    document.documentElement.dataset.reduceMotion = String(state.preferences.reduceMotion);
    document.documentElement.style.fontSize = `${17 * state.preferences.fontScale}px`;
  }

  function saveLocalMirror() {
    const errors = [];
    const json = JSON.stringify(state);
    try {
      localStorage.setItem(STATE_KEY, json);
      localStorage.setItem(BACKUPS_KEY, JSON.stringify(backups.slice(-MAX_BACKUPS)));
    } catch (error) {
      errors.push(error.message || "Browser storage is unavailable.");
    }
    if (isAndroidNative) {
      try {
        LFNative.save(json);
      } catch (error) {
        errors.push(error.message || "Device storage is unavailable.");
      }
    }
    return errors;
  }

  function appendBackup(history, previous, savedAt) {
    const next = history.concat([{ savedAt, state: clone(previous) }]);
    return next.slice(-MAX_BACKUPS);
  }

  function updateState(change, message, rerender = false) {
    const previous = clone(state);
    const next = clone(state);
    change(next);
    next.schemaVersion = STATE_SCHEMA_VERSION;
    next.updatedAt = new Date().toISOString();
    state = migrateState(next);
    if (JSON.stringify(previous) !== JSON.stringify(state)) {
      backups = appendBackup(backups, previous, state.updatedAt);
      const errors = saveLocalMirror();
      applyPreferences();
      const backupRegion = document.getElementById("backup-list");
      if (backupRegion) {
        backupRegion.innerHTML = renderBackups();
        wireBackupActions();
      }
      const scheduleChanged = JSON.stringify(previous.reminders) !== JSON.stringify(state.reminders)
        || JSON.stringify(previous.calendar.timeBlocks) !== JSON.stringify(state.calendar.timeBlocks)
        || JSON.stringify(previous.missions) !== JSON.stringify(state.missions)
        || JSON.stringify(previous.study.cards) !== JSON.stringify(state.study.cards);
      setStatus(errors.length ? `Saved with a storage issue: ${errors.join(" ")}` : message || "Changes saved on this device.", errors.length > 0);
      if (scheduleChanged && typeof lfSyncReminders === "function") lfSyncReminders();
      if (rerender) {
        render();
      }
    }
    return state;
  }

  function setStatus(message, isError = false) {
    liveStatus.textContent = message;
    liveStatus.dataset.state = isError ? "error" : "success";
  }

