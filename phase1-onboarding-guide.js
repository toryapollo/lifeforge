"use strict";
  // Plain-language help for each Start step: what to write, why it matters, and examples.
  // Rendered by renderOnboarding() in phase1-onboarding.js. Edit the wording here.
  const LF_ONBOARDING_GUIDE = Object.freeze([
    {
      what: "Read the mission below. Checking the box just means you want to work toward it. You're not signing up for anything else.",
      why: "Everything in LIFEFORGE serves this one direction, so it helps to agree with it before you start.",
      examples: []
    },
    {
      what: "Write up to three short sentences about the person you are becoming, written as if they are already true. Start each with \"I am someone who…\" or \"I don't…\".",
      why: "Every time you act like that person, it counts as a vote for who you are. Small actions add up to a new identity, and a clear sentence tells you which action to take.",
      tips: "Pick one sentence for each area you care about most right now (study, health, money, work, people). Keep them small enough to prove this week.",
      examples: [
        "I am someone who studies a little every day.",
        "I am someone who shows up on time and prepared.",
        "I am someone who pays my future self first.",
        "I am someone who moves my body every day, even for five minutes.",
        "I don't skip twice in a row."
      ]
    },
    {
      what: "Describe one ordinary weekday in the life you are building, about one to three years from now. Write in the present tense (\"I wake up…\", not \"I will…\"). A few short paragraphs is plenty.",
      why: "Your future self can feel like a stranger, which makes it easy to put things off. A vivid, ordinary day makes that person real, and gives you something specific to move toward.",
      tips: "Be concrete: times, places, what you see and do. Use the questions below, or tap \"Add starter questions\" to drop them into the box and answer them one by one.",
      questions: [
        "What time do I wake up, and what do I do first?",
        "How do I study or work, and for how long?",
        "How do I handle money this week?",
        "How do I walk into a room and talk with people?",
        "How do I take care of my body and energy?",
        "How do I relax and recover at the end of the day?",
        "Who is around me, and how do I treat them?"
      ],
      exampleText: "It's 6:30 on a Tuesday. I wake up without snoozing, drink a glass of water and look at today's plan. By 7:00 I'm at my desk for one focused hour of study with my phone in the other room.\n\nAt work I speak up in the morning meeting, calm and to the point. My bills are on autopay, and every payday a set amount moves to savings before I can spend it.\n\nAfter dinner I take a 20-minute walk, then shut down for the day: I write tomorrow's top task and put the laptop away. I'm in bed by 10:30, tired in a good way."
    },
    {
      what: "Pick a date that marks the start of this new chapter. Today is fine. So is the next Monday, the 1st of the month, a birthday, or the first day of a semester or new job.",
      why: "Fresh starts give a real boost in motivation. A named start date also lets LIFEFORGE measure your progress from day one.",
      examples: ["Today", "Next Monday", "The 1st of next month", "The first day of class"]
    },
    {
      what: "Name three small changes to your surroundings that make good habits easier or bad habits harder. Each should be something you can set up today, in under ten minutes.",
      why: "Willpower runs out; your surroundings don't. Make the good action obvious and easy, and the unwanted one hidden and a little harder (even 20 seconds of extra effort helps).",
      tips: "Think about your bedroom, desk, kitchen and phone. Ask: what would make tomorrow's first good action take zero thought?",
      examples: [
        "My phone charges in the kitchen, not next to my bed.",
        "My study book stays open on my desk with a pen on top.",
        "My workout clothes are laid out the night before.",
        "LIFEFORGE is on the first page of my home screen.",
        "A full water bottle sits on my desk every morning.",
        "Social media is logged out on my laptop.",
        "Snacks I want to eat less of go on a high shelf, out of sight."
      ]
    },
    {
      what: "Choose up to three habits to practice this season. Start with fewer if you're unsure. One habit done every day beats three done once.",
      why: "Most people quit by starting too much at once. Three is the most you should build at the same time. You can change them any time by coming back to the Start tab.",
      habits: [
        ["Closed-book study", "After reading, close the book and write or say what you remember. This builds memory far better than rereading."],
        ["Start one focused block", "One stretch of 25 to 90 minutes on a single task, phone away."],
        ["Move for a few minutes", "A walk, stretching or a short workout. Even five minutes counts."],
        ["Prepare for sleep", "A short wind-down at the same time each night: screens off, lights low."],
        ["Review the week", "Once a week, look back at what worked and pick next week's three outcomes (the Weekly tab walks you through it)."]
      ],
      examples: []
    },
    {
      what: "Record where you are starting from, so you can see real progress at day 30 and day 90. Rough guesses are fine, and any box can be left blank. This stays private on your device.",
      why: "Progress is hard to feel day to day. A baseline lets you compare against your own starting point instead of against other people.",
      fields: {
        speaking: "How speaking up feels right now. Example: \"I ramble and say 'um' a lot. I get nervous talking in groups.\" (You can also record a one-minute intro later on the Speak tab.)",
        retention: "Guess what share of last week's reading or class you could explain from memory, from 0 to 100%. Example: 40%. Or take a Study quiz and enter that score.",
        money: "A rough picture of your money today. Example: \"Checking $800, savings $200, credit card $1,500 at 24%, no retirement savings yet.\"",
        body: "A few simple numbers you can retest. Example: \"Weight 190 lb, 15 push-ups, walked a mile in 18 minutes, sleeping about 6 hours.\"",
        selfRatings: "Rate yourself from 1 to 10. Example: \"Focus 4, energy 5, money confidence 3, speaking 4, stress 7.\""
      },
      examples: []
    }
  ]);

  function lfOnboardingGuide(step) {
    const guide = LF_ONBOARDING_GUIDE[step];
    if (!guide) return "";
    const list = (items) => `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
    let more = "";
    if (guide.questions) more += `<p class="guide-label">Questions to answer</p>${list(guide.questions)}`;
    if (guide.habits) more += `<dl class="guide-habits">${guide.habits.map(([name, text]) => `<dt>${escapeHtml(name)}</dt><dd>${escapeHtml(text)}</dd>`).join("")}</dl>`;
    let examples = "";
    if ((guide.examples || []).length) examples = `<details class="guide-examples"><summary>Show examples</summary>${list(guide.examples)}</details>`;
    if (guide.exampleText) examples = `<details class="guide-examples"><summary>Show an example page</summary>${guide.exampleText.split("\n\n").map((p) => `<p>${escapeHtml(p)}</p>`).join("")}</details>`;
    return `<div class="step-guide">
      <p><strong>What to write:</strong> ${escapeHtml(guide.what)}</p>
      <p><strong>Why it matters:</strong> ${escapeHtml(guide.why)}</p>
      ${guide.tips ? `<p><strong>Tip:</strong> ${escapeHtml(guide.tips)}</p>` : ""}
      ${more}${examples}
    </div>`;
  }

  function lfOnboardingFieldHelp(name) {
    const fields = LF_ONBOARDING_GUIDE[6].fields;
    return fields[name] ? `<span class="field-help">${escapeHtml(fields[name])}</span>` : "";
  }

  function wireOnboardingGuide() {
    const starter = document.getElementById("future-starter");
    const box = document.querySelector('#onboarding-form textarea[name="future"]');
    if (!starter || !box) return;
    starter.addEventListener("click", () => {
      const outline = LF_ONBOARDING_GUIDE[2].questions.map((q) => `${q}\n`).join("\n");
      box.value = box.value.trim() ? `${box.value.trimEnd()}\n\n${outline}` : outline;
      box.focus();
      setStatus("Starter questions added. Replace each one with your answer.");
    });
  }
