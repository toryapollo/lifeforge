"use strict";
  const LF_P3_MEDIA_DB = "lifeforge-private-media";
  let lfP3MediaDbPromise = null;
  let lfP3Recorder = null;
  let lfP3Stream = null;
  let lfP3Chunks = [];
  let lfP3RecordingContext = null;
  let lfP3ObjectUrl = "";
  let lfP3ActiveMediaId = "";

  function lfP3OpenMediaDb() {
    if (lfP3MediaDbPromise) return lfP3MediaDbPromise;
    lfP3MediaDbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(LF_P3_MEDIA_DB, 1);
      request.onupgradeneeded = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains("clips")) database.createObjectStore("clips", { keyPath: "id" });
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error("Private recording storage could not open."));
    });
    return lfP3MediaDbPromise;
  }

  function lfP3StoreClip(id, blob) {
    return lfP3OpenMediaDb().then((database) => new Promise((resolve, reject) => {
      const transaction = database.transaction("clips", "readwrite");
      transaction.objectStore("clips").put({ id, blob, savedAt: new Date().toISOString() });
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error || new Error("Recording could not be saved locally."));
      transaction.onabort = () => reject(transaction.error || new Error("Recording save was cancelled."));
    }));
  }

  function lfP3GetClip(id) {
    return lfP3OpenMediaDb().then((database) => new Promise((resolve, reject) => {
      const request = database.transaction("clips", "readonly").objectStore("clips").get(id);
      request.onsuccess = () => request.result && request.result.blob
        ? resolve(request.result.blob) : reject(new Error("The local recording file is missing."));
      request.onerror = () => reject(request.error || new Error("The local recording could not be opened."));
    }));
  }

  function lfP3DeleteClip(id) {
    return lfP3OpenMediaDb().then((database) => new Promise((resolve, reject) => {
      const transaction = database.transaction("clips", "readwrite");
      transaction.objectStore("clips").delete(id);
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error || new Error("Recording could not be deleted."));
      transaction.onabort = () => reject(transaction.error || new Error("Recording deletion was cancelled."));
    }));
  }
