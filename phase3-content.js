"use strict";
  const LF_P3_BENCHMARK_PROMPT = "Tell me about yourself and what you're working toward.";
  const LF_P3_STORY_AUDIENCES = Object.freeze([
    ["class", "Instructor or classmate"], ["employer", "Employer or recruiter"], ["team", "Team or family"]
  ]);
  const LF_P3_RUBRIC = Object.freeze([
    ["answerFirst", "Clear point in the first sentence"],
    ["structure", "Reasons or examples in a useful order"],
    ["pace", "Pace and deliberate pauses"],
    ["coherence", "Coherence and easy-to-follow language"],
    ["eyeContact", "Eye contact or camera presence"],
    ["confidence", "Confidence and a steady finish"]
  ]);

  function lfP3Roleplay(id, title, opening, preparedPrompt, directPrompt, preparedLine, directLine) {
    return {
      id, title,
      nodes: {
        start: {
          prompt: opening,
          choices: [
            { id: "prepared", label: "Name the shared goal, use accurate facts, and ask what options fit.", next: "prepared", feedback: "This keeps the conversation honest and focused on real interests." },
            { id: "direct", label: "Make a direct request and invite a clear response.", next: "direct", feedback: "A concise request is fair; add evidence or questions if the first answer is unclear." }
          ]
        },
        prepared: {
          prompt: preparedPrompt,
          choices: [
            { id: "confirm", label: "Summarize what you heard and agree on a next step.", next: "finish", feedback: "A shared summary checks understanding and makes follow-through concrete." },
            { id: "criteria", label: "Ask what objective information could help decide.", next: "finish", feedback: "Objective criteria make the next discussion easier to review." }
          ]
        },
        direct: {
          prompt: directPrompt,
          choices: [
            { id: "confirm", label: "Confirm the terms, owner, and date in writing.", next: "finish", feedback: "A written next step protects both sides from confusion." },
            { id: "pause", label: "Take time to review and set a follow-up time.", next: "finish", feedback: "A respectful pause leaves room for a considered decision." }
          ]
        },
        finish: { terminal: true, outcome: "Debrief: note what you learned, what you would keep, and one small change for the next practice." }
      }
    };
  }

  const LF_P3_ROLEPLAYS = Object.freeze([
    lfP3Roleplay("job-offer", "Help-desk job offer", "The manager offers $18 per hour and asks whether you can accept today.",
      "You share verified skills and a researched local range, then ask which parts of pay or training are flexible.",
      "You ask whether $20.50 per hour is possible and offer to send your certification and experience details.",
      "The manager says the posted range is $19–$21 and asks for your evidence.",
      "The manager says they will review $20.50 with the hiring team and reply tomorrow."),
    lfP3Roleplay("raise", "Raise after six months", "Your manager asks what change you want after six months in the role.",
      "You describe three specific results, cite a reliable market range, and ask what would support a pay review.",
      "You request a meeting about pay and ask what results would make a review possible.",
      "Your manager asks which results matter most to the team.",
      "Your manager offers to set a review date and define the evidence to bring."),
    lfP3Roleplay("apr-call", "Credit-card annual percentage rate call", "A card representative says your current annual percentage rate is 24%.",
      "You mention your payment history and a real competing offer, then ask what rate options are available.",
      "You ask which lower-rate or hardship options you may qualify for.",
      "The representative asks what verified offer you received and when it expires.",
      "The representative explains the available rate review and when it could take effect."),
    lfP3Roleplay("internet-bill", "Internet bill retention call", "A provider says your promotional rate ended and the monthly bill increased.",
      "You name a real competitor price and ask which current plans match your needs.",
      "You ask what lower-cost plans or discounts are available without changing service today.",
      "The representative asks what speed and features you actually use.",
      "The representative offers a plan comparison and explains any contract terms."),
    lfP3Roleplay("rent-renewal", "Rent renewal", "A landlord proposes a higher rent for the next lease.",
      "You share recent comparable listings and offer a longer lease in return for a smaller increase.",
      "You ask whether a smaller increase or a longer fixed term is available.",
      "The landlord asks which nearby listings you used for comparison.",
      "The landlord agrees to review the listings and send a written renewal option."),
    lfP3Roleplay("lab-partner", "Lab partner workload", "A partner's lab section has arrived after the agreed deadline more than once.",
      "You state the dates and project impact without labels, then ask what is getting in the way.",
      "You suggest splitting the next tasks with named owners and an earlier check-in.",
      "Your partner says their work schedule changed and asks for a clearer task list.",
      "Your partner agrees to confirm task owners and a check-in time."),
    lfP3Roleplay("grade-review", "Disagreeing with an instructor's grade", "You believe a lab grade may not match the published rubric.",
      "You point to the rubric and your submitted work, then ask how the score was determined.",
      "You ask for a short meeting to understand the feedback and what to improve.",
      "The instructor asks which rubric item you want to review.",
      "The instructor agrees to compare the submission with that rubric item."),
    lfP3Roleplay("family-conflict", "Family disagreement", "A family member says a recent plan left them feeling ignored.",
      "You use a gentle opening: name your feeling, the specific event, and one clear need.",
      "You ask when they would have time for a calm conversation and listen to their view.",
      "They explain what felt dismissive and ask what you meant.",
      "You acknowledge the impact and agree on one practical next step."),
    lfP3Roleplay("extra-work", "Saying no to extra work", "A coworker asks you to take on another task before Friday.",
      "You name your current commitments and ask which priority should move if this task is added.",
      "You decline the Friday deadline and offer the earliest date you can do it well.",
      "Your coworker asks which current task would need to pause.",
      "Your coworker agrees to confirm the priority change with the manager.")
  ]);

  const LF_P3_SCRIPTS = Object.freeze([
    { id: "raise", title: "Raise request", text: "Over the last [period], I [three specific results]. The market range for this role is [verified data]. I would like to discuss moving my pay to [specific amount]. What would it take to get there?" },
    { id: "offer", title: "Job offer", text: "I'm excited about the role. Based on [verified range] and my experience with [specific skills], could we discuss [specific compensation or training request]? I'm glad to look at the full package." },
    { id: "apr", title: "Credit-card rate", text: "I've been a customer since [date] and [accurate payment history]. I found an offer at [real rate]. Are there lower-rate options on my account?" },
    { id: "retention", title: "Service bill", text: "My current bill is [amount], and a comparable plan is [real price]. What options can bring my bill closer to that while keeping the service I use?" },
    { id: "rent", title: "Rent renewal", text: "I value being a reliable tenant. Comparable homes nearby are listed at [verified range]. Would you consider [specific renewal] in exchange for [reasonable term]?" },
    { id: "hard-talk", title: "Hard conversation", text: "I want us to work well together, and I am not trying to blame you. I observed [specific facts]. I'm wondering whether [tentative concern]. How do you see it?" },
    { id: "soft-start", title: "Close-relationship request", text: "I feel [feeling] about [specific event], and I need [clear need]. Could we [small, specific request]?" }
  ]);
