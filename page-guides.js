"use strict";
  // Plain-language guidance for every tab: a "How to use this page" box at the top,
  // a short "What to do" note under each section heading, and examples.
  // Applied after each render by lfApplyPageGuides(route) (called from views.js render()).
  // Sections are matched by the start of their <h2> text; Study and Weekly steps by step name.
  // The Start tab has its own guide in phase1-onboarding-guide.js.
  const LF_PAGE_GUIDES = Object.freeze({
    today: {
      intro: "Today is your daily home base. Use the top in the morning, the middle during the day, and Evening shutdown at night. Skip anything that doesn't help you.",
      steps: [
        "Morning: tick Morning launch and write your one outcome.",
        "During the day: capture stray thoughts, and work through your time blocks.",
        "Anytime: log sleep, exercise and the daily strip.",
        "Night: write your Evening shutdown, then you're done."
      ],
      sections: {
        "Morning launch": { help: "Tick these as you start your day. They're cues to get going, not a test." },
        "Today's one outcome": {
          help: "One result that would make today worth it, even if nothing else gets done. Make it specific and finishable today.",
          examples: ["Finish my chapter 3 notes.", "Send the email to my landlord.", "Walk 30 minutes at lunch."]
        },
        "Capture": {
          help: "Any task, idea or worry that pops into your head: type it here so you stop carrying it in your memory. Deal with it later.",
          examples: ["Buy printer ink.", "Ask Sam about the Friday shift.", "Idea: start a study group."]
        },
        "Mission deadlines": {
          help: "Missions are the weekly real-world challenges in each lesson (open a lesson's \"Field missions\" on the Study tab). Type the mission you're doing and give it a due date; the app reminds you.",
          examples: ["Say one polite \"no\" to protect my study time. Due Friday, 9:00 AM."]
        },
        "Time blocks": {
          help: "Plan your day in chunks: give each important task a start and end time. When the day changes, edit or move the block instead of giving up. Tick Done when it's finished.",
          examples: ["Study chapter 3, 7:00 to 8:00.", "Email and errands, 12:00 to 12:30.", "Gym, 5:30 to 6:15 PM."]
        },
        "M08 · Daily strip": {
          help: "A quick check of the basics that drive your energy. Fill in what you know and leave the rest. Protein and water plan: tick if you planned them today. Caffeine cutoff: tick if you had no caffeine in the 8 hours before bed. Phone out of bed area: tick if your phone slept outside the bedroom.",
          examples: ["Wake time 6:45, sleep 6.5 hours, 7,000 steps, mood \"6/10, a bit tired\"."]
        },
        "Sleep and workout logs": {
          help: "Log last night's sleep and any exercise. Over time, Progress and Weekly review show your patterns.",
          examples: ["Sleep: 6.5 hours, \"woke at 3 AM\".", "Workout: brisk walk, 25 minutes."]
        },
        "Study and review": { help: "Shows how many flashcards are due for review. Open the Study tab to review them." },
        "Evening shutdown": {
          help: "At the end of the day, write one piece of evidence that you acted like the person you're becoming, plus anything you finished. Then close the day.",
          examples: ["Studied 45 minutes with my phone in the other room. Finished the budget."]
        }
      }
    },
    study: {
      intro: "Study walks you through one lesson in 9 steps, using techniques that are proven to make learning stick. Pick a module, tap Begin study session, then use Next step to move along. A full session takes 30 to 60 minutes, and you can stop and come back.",
      steps: [
        "Choose a module (start with M01, it teaches how to learn).",
        "Tap Begin study session.",
        "Follow the steps in order. Each one has a short explanation."
      ],
      wizard: "#study-step",
      stepHelp: {
        "Ungraded pretest": { help: "Answer the questions before reading the lesson. Guessing is fine and wrong answers are expected. Trying first makes the lesson stick better when you read it." },
        "Read the lesson": { help: "Read the unit text carefully, once. Don't highlight or reread over and over: you'll test yourself in the next steps, which works much better." },
        "Blank-page recall": { help: "Close the lesson and write down everything you remember, in any order. Then look back to see what you missed. Those gaps are what to review." },
        "Feynman teach-back": {
          help: "Explain one idea in simple words, as if teaching a 12-year-old, in about 90 seconds. Wherever you get stuck is what you don't fully understand yet.",
          examples: ["Spacing: studying a little over several days beats cramming, because recalling something you've half-forgotten makes the memory stronger."]
        },
        "Wall cards": { help: "Flashcards. Read the front, answer in your head, then open it to check the back. Mark a card as a wall card to keep important ones in view." },
        "Mixed quiz": { help: "Questions from different lessons, mixed together. Before checking your answer, rate how sure you are. This trains you to know what you really know." },
        "Review confident errors": { help: "Answers you were sure about but got wrong. These are the most valuable mistakes to fix, so review them carefully." },
        "Spaced repetition": { help: "Rate each card honestly by how easily you remembered it. The app schedules it again: soon if it was hard, later if it was easy." },
        "Close the session": {
          help: "Write one thing from this lesson you'll actually use in real life this week.",
          examples: ["Test myself before rereading my notes.", "Study in three short sessions instead of one long one."]
        }
      }
    },
    flow: {
      intro: "Flow is a timer for one focused block of work on a single task. Prepare, focus, then recover.",
      steps: [
        "Before: tick the preflight items and choose a block length (25 minutes if you're new).",
        "During: work on one task only. If something interrupts you, count it, without guilt.",
        "After: rate the block and take a short recovery break."
      ],
      sections: {
        "Preflight": { help: "Tick what you've done to make focusing easier. One clear next action means you know exactly what to do first. A stopping point means you know where you'll stop. Start with 25 minutes and work up to 60 to 90." },
        "Recovery": { help: "After a block, rest 5 to 15 minutes away from screens: walk, stretch, drink water. Then you're ready for the next block." },
        "Recent blocks": { help: "Your last five blocks, so you can watch your focus improve over time." }
      }
    },
    weekly: {
      intro: "Once a week (Sunday works well), spend 20 to 45 minutes looking back at your week and choosing next week's three most important outcomes. Write short, honest notes. There are no wrong answers.",
      steps: [
        "Go through the 8 steps in order.",
        "At the end, your three outcomes become time blocks on Today."
      ],
      wizard: "#weekly-step",
      stepHelp: {
        "Review the week": { help: "Look at your calendar and Today notes for the past 7 days. What actually happened?", examples: ["Studied 4 days, missed Thursday. Long week at work."] },
        "Notice what worked": { help: "What went well, and why did it work?", examples: ["Leaving my phone in the kitchen made morning study easy."] },
        "Name friction without blame": { help: "What got in the way? Describe it like a scientist, not a judge.", examples: ["Late nights on Tuesday and Wednesday made the mornings hard."] },
        "Check energy and rest": { help: "How were your sleep, exercise and energy this week? The numbers shown come from your logs." },
        "Check learning and relationships": { help: "What did you learn this week, and how are things with the people who matter to you?" },
        "Score the six pillars": { help: "Rate each area of life from 0 to 10 for this week. Gut feel is fine. SYSTEM = planning and time. MIND = learning. BODY = sleep, food and exercise. MONEY = money habits. VOICE = speaking and conversations. SELF = habits, mood and growth." },
        "Choose three outcomes": { help: "Pick the three results that would make next week a success. Make them specific and doable.", examples: ["Finish the M02 study session.", "Three 30-minute walks.", "Set up an automatic transfer to savings."] },
        "Place the outcomes and close": { help: "Give each outcome a day and time so it actually happens. Saving adds them to your Today time blocks." }
      }
    },
    progress: {
      intro: "Progress shows what you've practiced, using what you saved elsewhere in the app. Look at it once a week. On day 30 and day 90 (counted from your Start chapter date), save a checkpoint to compare with day one.",
      sections: {
        "Practice rhythm": { help: "How many days you practiced recently. Missing one day is fine. Try never to miss two in a row." },
        "Six-pillar score trends": { help: "Your weekly 0 to 10 scores from Weekly review, over time." },
        "Practice evidence": { help: "Counts of everything you've logged in each area." },
        "Confidence calibration": { help: "Compares how sure you said you were on Study quizzes with how often you were right. The goal: when you feel 80% sure, you're right about 80% of the time." },
        "Day 1 / 30 / 90 comparisons": { help: "Your starting point from Start, next to your later checkpoints." },
        "Save a checkpoint": {
          help: "On day 30 and day 90, redo the same quick checks as day one and record them here.",
          examples: ["Retention: 65%.", "Body: 20 push-ups, a mile in 16 minutes.", "Self-ratings: focus 6, energy 7, stress 5."]
        },
        "Seven-day accountability summary": { help: "A ready-made summary of your week. If you want someone to hold you accountable, copy it and send it to a friend or mentor." }
      }
    },
    money: {
      intro: "Money tools are calculators and checklists for the Money lesson (M04). Use the ones that fit your situation. You don't need all of them. Your numbers stay on this device.",
      steps: [
        "New to this? Start with Emergency fund, then Paycheck split.",
        "Have debt? Use Debt payoff comparison.",
        "Save a Money benchmark on day 1, 30 and 90 to see progress."
      ],
      sections: {
        "Yearly contribution limits": { help: "The most you're allowed to put into US retirement accounts each year. Only needed if you invest for retirement. Check irs.gov for the current numbers." },
        "Order of operations": { help: "The order to handle money in, from basics to investing. Find the first step you haven't finished: that's your focus right now." },
        "Paycheck split": { help: "Enter your take-home pay (what actually lands in your bank account) to see a suggested split.", examples: ["Take-home pay: 2400"] },
        "Debt payoff comparison": {
          help: "Add each debt (name, balance, interest rate, minimum payment), then enter any extra you can pay each month. It compares avalanche (highest interest first, saves the most money) with snowball (smallest balance first, quicker wins).",
          examples: ["Visa · balance 1500 · rate 24 · minimum 45", "Car loan · balance 8000 · rate 7 · minimum 250"]
        },
        "Emergency fund and months of freedom": {
          help: "Core expenses are what you must pay each month (rent, food, bills, minimum debt payments). Emergency savings is money you can reach quickly. The result is how many months you could get by if your income stopped.",
          examples: ["Expenses 2000, savings 3000 → 1.5 months of freedom."]
        },
        "Compound growth": { help: "See how saving regularly grows over time.", examples: ["Start 0 · monthly 200 · return 7 · years 30"] },
        "Anchor and range calculator": {
          help: "For negotiating a number like a salary or price. The anchor is the number you open with, based on research. The range shows a reasonable band around it.",
          examples: ["Anchor 55000 · lower 5 · upper 10"]
        },
        "Purchase gate": {
          help: "Fill this in before buying something you don't need. If it's an impulse, wait 7 days. Cost per use = cost ÷ how many times you'll use it.",
          examples: ["Headphones · 150 · 300 uses = $0.50 per use."]
        },
        "Student money checklist": { help: "If you're a student in the US, tick each one off as you check it. Together they can be worth thousands of dollars a year." },
        "Investment journal": { help: "Before buying any investment, write down why, and what you'll do if it drops. It protects you from panic and hype." },
        "Decision journal": { help: "Record a big money decision and how sure you are. Review it later to see how good your judgment was." },
        "Money benchmark": { help: "Net worth = everything you own (cash, savings, investments) minus everything you owe. Record it on day 1, 30 and 90, with your money stress from 1 (calm) to 10 (very stressed)." }
      }
    },
    thinking: {
      intro: "Thinking tools are worksheets for clearer thinking (lesson M02). Use one when you face a real problem, a decision, or a claim you're not sure about. Each one saves privately.",
      steps: [
        "Stuck on a problem? Try DARE or System map.",
        "Big decision? Use the Pre-mortem.",
        "Not sure something you read is true? Use SIFT."
      ],
      sections: {
        "Cynefin": { help: "Practice sorting problems by type, because each type needs a different approach. Clear: the answer is obvious; follow best practice. Complicated: an expert can work it out. Complex: no one can predict it; try small experiments. Chaotic: act first to stop the harm. Confusion: you don't know the type yet. Read the scenario, pick a domain, then check." },
        "System map": {
          help: "For a problem that keeps coming back. Stocks are things that build up (savings, stress, unread email). Flows add to or drain them. Loops are cycles that grow or settle. Delays are the time between action and result. The leverage point is the one change that would help most.",
          examples: ["Situation: always broke before payday. Stock: checking balance. Flows: paycheck in, spending out. Loop: stress → takeout → less money. Leverage: automatic transfer to savings on payday."]
        },
        "DARE workbook": {
          help: "For a stuck problem. Break it into parts. Label each belief as a fact, an assumption or an unknown. Combine the parts into a fresh solution. Then run a small test, deciding in advance what result means keep going and what means stop.",
          examples: ["Problem: I never have time to study. Assumption: \"I need 2-hour blocks.\" Test: three 25-minute sessions this week; keep going if I finish a module."]
        },
        "Pre-mortem and decision journal": { help: "Before a big decision, imagine it's a year later and it failed. Write why. This reveals risks you'd otherwise miss. Outside view means asking how this usually turns out for most people in the same spot." },
        "SIFT claim check": { help: "Before believing or sharing something you read: Stop. Investigate who published it. Find better coverage from other sources. Trace the claim back to the original." },
        "AI hygiene": { help: "When you use an AI tool, write your own answer first, then check the AI's answer against a real source and note any error. This app never sends anything to an AI." },
        "Scout mindset tests": { help: "Test a belief you hold strongly by running it through five fairness questions.", examples: ["Belief: \"I'm just bad at math.\""] }
      }
    },
    resilience: {
      intro: "Reset is for hard days and for building resilience over time. In a tough moment, start with the five-minute guide. Use the other worksheets to practice when you're calmer. Nothing here replaces professional help.",
      sections: {
        "Life on Fire": { help: "When you're overwhelmed: start the timer and take three slow breaths. Name the feeling. Check the 3 Ps: is it permanent? Does it affect everything? Is it really about me? Then choose one small step you control, and one person to reach out to." },
        "ABCDE worksheet": {
          help: "After a setback, write what happened, what you told yourself, and how you reacted. Then argue with that belief using evidence, and note what changed.",
          examples: ["A: Failed a quiz. B: \"I'm too old for school.\" C: Skipped studying for two days. D: I studied 1 hour; people who passed studied 5. It's my method, not my age. E: Calmer. 30-minute session tonight."]
        },
        "Self-compassion break": { help: "Three steps when you're being hard on yourself: notice \"this is hard\", remember that everyone struggles, then say something kind, the way you would to a friend." },
        "Private expressive writing": { help: "Write freely for 15 minutes about something that's bothering you. No one reads it; it just helps you process. You can erase it anytime." },
        "Discomfort ladder": {
          help: "List things you avoid, easiest first, one per line. Each week, do one rung to build courage.",
          examples: ["Ask a question in class", "Call instead of texting", "Speak up in a meeting", "Give a short presentation"]
        },
        "People I can reach": { help: "Two or three people you can contact on a bad day. Saved only on this device." },
        "VIBE and hobby log": {
          help: "Log time spent on things that make you feel alive. Vitality = physical energy. Inquiry = curiosity and learning. Belonging = connection with people. Expression = creating something.",
          examples: ["Guitar · Expression · 30 minutes · more alive"]
        },
        "Erase private journals": { help: "Deletes the private journals and contacts saved on this page. It can't be undone, so export a backup in Settings first if you want to keep them." }
      }
    },
    fire: {
      intro: "Use this when you're overwhelmed. Go slowly, one box at a time. Only the smallest next step matters right now.",
      sections: {
        "Life on Fire": { help: "Start the timer and take three slow breaths. Name the feeling. Check the 3 Ps: is it permanent? Does it affect everything? Is it really about me? Then choose one small step you control, and one person to reach out to." }
      }
    },
    speak: {
      intro: "Speak is private speaking practice. Record yourself, play it back, count habits like \"um\", score the rep, and try again. Recordings stay on this device.",
      steps: [
        "Pick a drill at the bottom, or use your own topic.",
        "Record your answer, then play it back.",
        "Count hedges and fillers, score the rubric, and aim to improve one thing next time."
      ],
      sections: {
        "Record a speaking rep": {
          help: "Name the recording, choose audio or video, and tap Start recording. If it's your day 1, 30 or 90 benchmark, choose that day so it shows in the comparison below.",
          examples: ["Title: \"Tell me about yourself, try 1\""]
        },
        "Review and count": { help: "Play back a recording. Tap Hedge each time you soften your point (\"kind of\", \"I guess\", \"maybe\") and Filler for \"um\", \"uh\", \"like\". Then score the rubric. Pick one thing to improve on the next rep." },
        "Day 1 / 30 / 90 comparison": { help: "Record the same prompt on day 1, 30 and 90 so you can hear your progress." },
        "M05 speaking drills": { help: "Pick a drill, tap Next prompt, and answer out loud. Record it if you like, then score it." }
      }
    },
    conversations: {
      intro: "Talk helps you prepare for important conversations: asking for a raise, negotiating a bill, or a hard talk with someone close. Fill in the prep sheet before the conversation. You don't need every box.",
      sections: {
        "One-page conversation prep": {
          help: "Interests are what each side really cares about underneath. Facts without labels are what a camera would record. Accusation audit: list what they might worry you'll do, and say it first. Calibrated questions are open \"how\" or \"what\" questions. Labels start with \"It sounds like…\". Anchor is your opening number. Reservation point is your walk-away line. BATNA is what you'll do if you can't agree.",
          examples: ["Conversation: asking for a raise. Want: fair pay and a good relationship. Their interests: budget, keeping reliable staff. Question: \"How can we get my pay in line with the market?\""]
        },
        "Ethical negotiation practice": { help: "Pick a scenario and practice the conversation as a role-play, out loud if you can." },
        "Script library": { help: "Word-for-word scripts for common situations. Open one and fill in the [brackets] with your own details." },
        "M10 practice map": { help: "The lesson's goals and practice drills, for when you want to go deeper." }
      }
    },
    colors: {
      intro: "Pick a color scheme and light or dark mode. Changes apply right away and are saved on this device."
    },
    settings: {
      intro: "Settings controls light or dark mode, reminders, text size and your backups. Tip: tap Export JSON every week or two to keep a backup file somewhere safe.",
      sections: {
        "Your data": { help: "Export JSON saves a backup file of all your progress. Import JSON restores one (on this or another device). Private backups are automatic snapshots of your last 10 changes." },
        "Local reminders": { help: "Turn each reminder on or off and set its time." },
        "Text size": { help: "Make all text bigger or smaller." }
      }
    },
    help: {
      intro: "How to use LIFEFORGE, in short.",
      steps: [
        "Day one: go through the Start tab (about 20 minutes).",
        "Every day: open Today in the morning and at night. Do one Study session or one Flow block when you can.",
        "Once a week: do the Weekly review (Sunday works well) and glance at Progress.",
        "When you need them: Money, Thinking, Reset, Speak and Talk have tools for those parts of life.",
        "Day 30 and day 90: save a checkpoint on Progress to see how far you've come.",
        "Every tab has a \"How to use this page\" box like this one at the top."
      ]
    }
  });

  const LF_GUIDES_SEEN_KEY = "lifeforge.guidesSeen";

  function lfGuideSeen(route) {
    try {
      const seen = JSON.parse(localStorage.getItem(LF_GUIDES_SEEN_KEY) || "[]");
      if (seen.includes(route)) return true;
      localStorage.setItem(LF_GUIDES_SEEN_KEY, JSON.stringify(seen.concat(route)));
    } catch (_error) { /* storage unavailable: show the guide open */ }
    return false;
  }

  function lfGuideExamples(examples) {
    if (!examples || !examples.length) return "";
    const body = examples.length === 1
      ? `<p>${escapeHtml(examples[0])}</p>`
      : `<ul>${examples.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
    return `<details class="guide-examples"><summary>${examples.length === 1 ? "Example" : "Examples"}</summary>${body}</details>`;
  }

  function lfGuideNote(entry) {
    const note = document.createElement("div");
    note.className = "section-help";
    note.innerHTML = `<p><strong>What to do:</strong> ${escapeHtml(entry.help)}</p>${lfGuideExamples(entry.examples)}`;
    return note;
  }

  function lfApplyPageGuides(route) {
    const guide = LF_PAGE_GUIDES[route];
    const view = document.getElementById("route-view");
    if (!guide || !view) return;

    const title = view.querySelector("h1");
    const head = title && title.closest("section");
    if (head && !view.querySelector(".page-guide")) {
      const box = document.createElement("details");
      box.className = "page-guide";
      if (!lfGuideSeen(route) || route === "help") box.open = true;
      const steps = guide.steps ? `<ol>${guide.steps.map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ol>` : "";
      box.innerHTML = `<summary>How to use this page</summary><p>${escapeHtml(guide.intro)}</p>${steps}`;
      head.appendChild(box);
    }

    if (guide.sections) {
      view.querySelectorAll("h2").forEach((heading) => {
        if (heading.dataset.guided) return;
        const text = heading.textContent.trim();
        const key = Object.keys(guide.sections).find((name) => text.startsWith(name));
        if (!key) return;
        heading.dataset.guided = "1";
        let anchor = heading;
        const next = heading.nextElementSibling;
        if (next && next.tagName === "P" && !next.closest("form")) anchor = next;
        anchor.insertAdjacentElement("afterend", lfGuideNote(guide.sections[key]));
      });
    }

    if (guide.wizard && guide.stepHelp) {
      const indicator = view.querySelector(guide.wizard);
      if (indicator && !indicator.dataset.guided) {
        const name = indicator.textContent.split("·").pop().trim();
        const entry = guide.stepHelp[name];
        if (entry) {
          indicator.dataset.guided = "1";
          const panel = indicator.closest("section");
          const target = guide.wizard === "#study-step" && panel && panel.nextElementSibling
            ? panel.nextElementSibling.querySelector(".phase1-actions") : indicator;
          (target || indicator).insertAdjacentElement("afterend", lfGuideNote(entry));
        }
      }
    }
  }
