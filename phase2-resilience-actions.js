"use strict";
  let LF_P2_TIMER = null;
  let LF_P2_TIMER_END = 0;

  function lfP2StopTimer() {
    if (LF_P2_TIMER) window.clearInterval(LF_P2_TIMER);
    LF_P2_TIMER = null;
  }

  function lfP2StartTimer(clockId, minutes) {
    lfP2StopTimer();
    LF_P2_TIMER_END = Date.now() + minutes * 60000;
    const draw = () => {
      const left = Math.max(0, Math.ceil((LF_P2_TIMER_END - Date.now()) / 1000));
      const clock = document.getElementById(clockId);
      if (clock) clock.textContent = `${String(Math.floor(left / 60)).padStart(2, "0")}:${String(left % 60).padStart(2, "0")}`;
      if (!left) lfP2StopTimer();
    };
    draw();
    LF_P2_TIMER = window.setInterval(draw, 1000);
  }

  function wireResilienceActions() {
    const fireStart = document.getElementById("fire-start");
    if (fireStart) fireStart.addEventListener("click", () => lfP2StartTimer("fire-clock", 5));
    const writingStart = document.getElementById("writing-start");
    if (writingStart) writingStart.addEventListener("click", () => lfP2StartTimer("writing-clock", 15));
    lfP2OnSubmit("panic-form", () => lfP2SaveJournal("panic", {
      feeling: lfP2Value("panic-feeling"),
      threePs: {
        permanent: lfP2Value("panic-permanent"),
        pervasive: lfP2Value("panic-pervasive"),
        personal: lfP2Value("panic-personal")
      },
      move: lfP2Value("panic-move"),
      contact: lfP2Value("panic-contact")
    }, "Private check-in saved locally."));
    lfP2OnSubmit("abcde-form", () => lfP2SaveJournal("abcde", {
      adversity: lfP2Value("abcde-adversity"), belief: lfP2Value("abcde-belief"),
      consequence: lfP2Value("abcde-consequence"), disputation: lfP2Value("abcde-disputation"),
      energy: lfP2Value("abcde-energy")
    }, "ABCDE worksheet saved locally."));
    lfP2OnSubmit("writing-form", () => lfP2SaveJournal("expressiveWriting", {
      title: "Private writing", text: lfP2Value("writing-text")
    }, "Private writing saved locally."));
    lfP2OnSubmit("discomfort-form", () => {
      const items = lfP2Value("discomfort-items").split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
      lfP2SaveJournal("discomfortLadder", { title: "Discomfort ladder", items, weeklyPick: Number(lfP2Value("discomfort-pick")) }, "Discomfort ladder saved locally.");
    });
    lfP2OnSubmit("contact-form", () => {
      if (state.journals.contacts.length >= 3) {
        setStatus("Keep up to three trusted contacts.", true);
        return;
      }
      updateState((next) => {
        next.journals.contacts.push({ id: lfP2Id("contact"), name: lfP2Value("contact-name"), method: lfP2Value("contact-method") });
      }, "Trusted person saved locally.", true);
    });
    document.querySelectorAll("[data-contact-remove]").forEach((button) => button.addEventListener("click", () => {
      updateState((next) => { next.journals.contacts = next.journals.contacts.filter((person) => person.id !== button.dataset.contactRemove); }, "Contact removed.", true);
    }));
    lfP2OnSubmit("hobby-form", () => lfP2SaveJournal("hobby", {
      title: lfP2Value("hobby-name"), activity: lfP2Value("hobby-name"),
      vibe: lfP2Value("hobby-vibe"), minutes: Number(lfP2Value("hobby-minutes")),
      feeling: lfP2Value("hobby-feeling")
    }, "Hobby session saved locally."));
    const erase = document.getElementById("erase-journals");
    if (erase) erase.addEventListener("click", () => {
      if (!window.confirm("Erase all local journals and contact details? Exported backup files will not be changed.")) return;
      updateState((next) => {
        Object.keys(next.journals).forEach((key) => { next.journals[key] = []; });
      }, "All local journals and contact details were erased.", true);
    });
  }
