"use strict";
  function wireRouteActions() {
    const readButton = document.getElementById("mission-read");
    if (readButton) {
      readButton.addEventListener("click", () => {
        updateState((next) => {
          next.onboarding.missionSeen = true;
        }, "Mission noted.");
        readButton.textContent = "Mission noted";
        readButton.setAttribute("aria-pressed", "true");
        document.getElementById("mission-status").textContent = "Saved on this device.";
      });
    }

    document.querySelectorAll("[data-palette-choice]").forEach((button) => {
      button.addEventListener("click", () => {
        const label = button.querySelector(".swatch-name").textContent.replace("✓ In use", "").trim();
        updateState((next) => {
          next.preferences.palette = button.dataset.paletteChoice;
        }, `${label} color scheme saved.`, true);
      });
    });
    document.querySelectorAll("[data-mode-choice]").forEach((button) => {
      button.addEventListener("click", () => {
        updateState((next) => {
          next.preferences.theme = button.dataset.modeChoice;
        }, `${button.textContent} mode saved.`, true);
      });
    });

    const themeSelect = document.getElementById("theme-select");
    if (themeSelect) {
      themeSelect.addEventListener("change", () => {
        updateState((next) => {
          next.preferences.theme = themeSelect.value;
        }, "Theme preference saved.");
      });
    }

    const reduceMotion = document.getElementById("reduce-motion");
    if (reduceMotion) {
      reduceMotion.addEventListener("change", () => {
        updateState((next) => {
          next.preferences.reduceMotion = reduceMotion.checked;
        }, "Reduced-motion preference saved.");
      });
    }

    const exportButton = document.getElementById("export-data");
    if (exportButton) {
      exportButton.addEventListener("click", exportData);
    }

    const importButton = document.getElementById("import-data");
    if (importButton) {
      importButton.addEventListener("click", () => {
        if (isAndroidNative) {
          try {
            LFNative.importFile();
            setStatus("Choose a LIFEFORGE JSON backup to import.");
          } catch (error) {
            setStatus(`Import could not start: ${error.message}`, true);
          }
        } else {
          document.getElementById("import-file").click();
        }
      });
    }

    const importFile = document.getElementById("import-file");
    if (importFile) {
      importFile.addEventListener("change", () => {
        const file = importFile.files && importFile.files[0];
        if (!file) {
          return;
        }
        const reader = new FileReader();
        reader.addEventListener("load", () => {
          try {
            importJsonText(String(reader.result));
            importFile.value = "";
          } catch (error) {
            setStatus(`Import failed: ${error.message}`, true);
          }
        });
        reader.addEventListener("error", () => setStatus("The selected backup could not be read.", true));
        reader.readAsText(file);
      });
    }

    wireBackupActions();
  }

  function wireBackupActions() {
    routeView.querySelectorAll("[data-restore-backup]").forEach((button) => {
      button.addEventListener("click", () => {
        const index = Number(button.dataset.restoreBackup);
        const backup = backups[index];
        if (!backup) {
          setStatus("That private snapshot is no longer available.", true);
          return;
        }
        replaceState(backup.state, "Private snapshot restored.");
      });
    });
  }

  function exportEnvelope() {
    return JSON.stringify({
      app: "LIFEFORGE",
      formatVersion: 1,
      exportedAt: new Date().toISOString(),
      state
    }, null, 2);
  }

  function exportData() {
    const name = `lifeforge-backup-${new Date().toISOString().slice(0, 10)}.json`;
    const data = exportEnvelope();
    try {
      if (isAndroidNative) {
        LFNative.exportFile(name, data);
        LFNative.notify("Choose a location for your LIFEFORGE backup.");
      } else {
        const file = new Blob([data], { type: "application/json" });
        const url = URL.createObjectURL(file);
        const link = document.createElement("a");
        link.href = url;
        link.download = name;
        document.body.append(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
      }
      setStatus("JSON backup is ready to save.");
    } catch (error) {
      setStatus(`Export failed: ${error.message}`, true);
    }
  }

  function importJsonText(text) {
    const parsed = JSON.parse(text);
    if (parsed.app && parsed.app !== "LIFEFORGE") {
      throw new Error("This JSON file is not a LIFEFORGE backup.");
    }
    if (parsed.formatVersion && parsed.formatVersion > 1) {
      throw new Error("This backup uses an unsupported export format.");
    }
    const candidate = migrateState(parsed.state || parsed);
    replaceState(candidate, "JSON backup imported.");
  }

  function replaceState(candidate, message) {
    const previous = clone(state);
    const next = migrateState(candidate);
    next.updatedAt = new Date().toISOString();
    if (JSON.stringify(previous) !== JSON.stringify(next)) {
      backups = appendBackup(backups, previous, next.updatedAt);
      state = next;
      const errors = saveLocalMirror();
      applyPreferences();
      setStatus(errors.length ? `Imported, with a storage issue: ${errors.join(" ")}` : message, errors.length > 0);
      if (typeof lfSyncReminders === "function") lfSyncReminders();
      render();
    }
  }

