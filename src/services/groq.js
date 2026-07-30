// ── Mock fallbacks (used when API quota is exhausted or errors occur) ──────────────────────

const MOCK_BRIEFS = {
  INVESTOR_PITCH: {
    title: 'FinFlow AI — Seed Round Scenario',
    content: `### Company Overview
FinFlow AI is an early-stage B2B SaaS startup building predictive cash flow management software for seed and Series A companies. The company was founded 18 months ago by two ex-Stripe engineers who experienced the cash crisis problem firsthand at their previous startup.

### The Problem
Cash flow failure is the number one killer of startups — responsible for 82% of early-stage company deaths. The core issue is a timing gap: most founders only discover a critical cash problem approximately 30 days before it becomes terminal. At that point, it is too late to raise capital, too late to cut costs gracefully, and too late to pivot. Existing tools are backward-looking. They show where money went, not where it is heading.

### The Solution
FinFlow AI integrates in real time with Stripe, QuickBooks, and corporate bank accounts. It applies machine learning models trained on 50,000 startup financial histories to forecast burn rate, revenue volatility, and runway trajectory. The system sends automated alerts 60 to 90 days in advance when the runway drops below a configurable safety threshold.

### Traction
The company currently has 140 paying customers across the US and UK, generating $18,000 in Monthly Recurring Revenue. Growth has been 22% month-over-month for the past six months, achieved with zero paid marketing. Average contract value is $129 per month. Churn is under 2%.

### Market Opportunity
There are approximately 3.5 million active SaaS startups globally. The total addressable market for financial operations tooling in this segment is estimated at $4.2 billion annually.

### The Ask
FinFlow AI is raising a $1.2M seed round to expand the engineering team from 3 to 7, launch an enterprise tier, and fund six months of paid acquisition.`,
    keyPoints: [
      'Problem: 82% of startups fail due to cash flow issues detected too late',
      'Solution: ML-powered runway forecasting with 60-90 day advance alerts',
      'Traction: 140 customers, $18K MRR, 22% MoM growth, <2% churn',
    ],
  },
  CONFERENCE_TALK: {
    title: 'Talk Brief — The Attention Economy Reckoning',
    content: `### Session Context
This is a 20-minute keynote at a product and technology leadership conference. The audience consists primarily of senior product managers, engineering leaders, and startup founders.

### Core Thesis
The engagement-maximization model that underpins modern consumer technology is now actively harming the productivity and mental health of the users it depends on. The next competitive era will belong to products built around "cognitive respect" — systems that protect user attention rather than exploit it.

### Supporting Arguments
**Argument 1 — Context Switching:** Research from UC Irvine found that after a digital interruption, it takes an average of 23 minutes to return to full cognitive focus. Enterprise tools that maximize notification frequency are costing companies an estimated $450 billion in lost output annually.

**Argument 2 — Outrage Optimization:** Engagement algorithms systematically amplify emotionally negative content because anger and anxiety generate 3x more interaction than neutral content. This is not a bug — it is the intended output of the reward function.

**Argument 3 — Regulatory Correction:** The EU Digital Services Act and UK Online Safety Act represent the leading edge of a global regulatory wave. Companies optimizing for raw engagement face increasing legal and reputational headwinds.

### Proposed Framework
The "Cognitive Respect Index" — a product design framework scored on five dimensions: interruption frequency, reversibility of actions, clarity of value exchange, emotional neutrality of design patterns, and respect for user-defined session limits.`,
    keyPoints: [
      'Context switching costs 23 min of focus recovery per interruption',
      'Engagement algorithms are structurally optimized for outrage',
      'Regulatory pressure will force product redesign industry-wide',
    ],
  },
  TEDX_TALK: {
    title: 'Talk Brief — Why Failure Is the Wrong Metric',
    content: `### Talk Overview
A 12-minute TEDx slot challenging the "fail fast" dogma that has dominated startup culture for two decades. Intended emotional arc: provocation → discomfort → reframe → resolution.

### The Central Claim
The most impactful founders are not the ones who fail the most — they are the ones who learn the fastest. These are not the same thing. Failure glorification culture conflates speed with carelessness, producing founders comfortable with mediocrity as long as it is dressed up as "experimentation."

### Research Foundation
The speaker spent three years conducting in-depth interviews with 200 founders across the US, Israel, and South Korea. Finding: the most resilient founders share a deep aversion to failure combined with obsessive, systematic learning processes. They treat every setback like a scientist treats a disproven hypothesis — as data, not a narrative.

### Key Case Study
A founder who pivoted her company three times in 18 months — not because she "embraced failure" but because she had built a weekly learning review process that surfaced signals from customer data 6 weeks before the market gave her an unmistakable verdict.

### The Proposed Reframe
Shift from measuring "failure frequency" to measuring "learning velocity" — defined as the average time between a signal appearing in data and a corresponding strategic decision being made.`,
    keyPoints: [
      'Fail fast culture conflates speed with carelessness',
      'The real differentiator is learning velocity, not failure tolerance',
      'Resilient founders build systems to extract signal — not romanticize the crash',
    ],
  },
  PRODUCT_DEMO: {
    title: 'Product Demo Brief — Loom Enterprise',
    content: `### Demo Context
A 5-minute live product demonstration to a procurement committee at a 600-person B2B SaaS company. The committee includes the Head of Engineering, Head of People Operations, and the CFO. They are evaluating three async video tools to reduce meeting load.

### The Problem Being Solved
Employees spend an average of 31% of working hours in synchronous meetings. An internal survey found 58% of those could have been an async video update. Previous async video adoption failed: no analytics, poor search, no workflow integration.

### Product — Loom Enterprise
Three features most relevant to this audience:

**Feature 1 — AI Transcripts and Smart Chapters:** Every video is automatically transcribed and segmented into labeled chapters. A viewer can scan a 10-minute video in under 90 seconds.

**Feature 2 — Engagement Analytics:** Admins can see exactly who watched a video, at what timestamp they stopped, and whether they opened it at all.

**Feature 3 — Salesforce and Slack Integration:** Customer-facing Looms are automatically logged in Salesforce with an AI-generated summary. Internal Looms share directly into Slack.

### Objection to Anticipate
The CFO will likely ask about per-seat cost versus their current Zoom license. Reference the ROI case study: a 400-person beta customer reduced meeting time by 40% in month one — calculated as $280,000 in recovered productivity annually.`,
    keyPoints: [
      'AI chapters: 10-min video scannable in 90 seconds',
      'Engagement analytics: accountability without micromanagement',
      'Salesforce + Slack: zero manual logging',
    ],
  },
  ACADEMIC: {
    title: 'Research Brief — Cognitive Load in Remote Learning',
    content: `### Research Context
A Master's thesis defense in Educational Technology. Committee: cognitive psychologist, instructional designer, statistician. Slot: 15 minutes plus 10 minutes Q&A.

### Research Question
Does the visual complexity of a digital Learning Management System (LMS) independently affect undergraduate academic performance, controlling for course content difficulty, prior performance, and study time?

### Methodology
312 undergraduate students across two universities. Randomly assigned to two conditions:
- **Condition A (High Complexity):** Standard LMS with full feature set — discussion boards, grade widgets, file repository, calendar, notification panels.
- **Condition B (Low Complexity):** Stripped-down version with only three functions: content access, assignment submission, messaging.

Cognitive load measured via validated dual-task methodology at four points in the semester.

### Key Findings
- Condition A demonstrated 23% higher extraneous cognitive load than Condition B
- Condition A scored 18% lower on complex, multi-step topic assessments
- No significant difference on simple recall tasks
- Condition A students spent an average of 4.3 minutes per session navigating the interface before beginning work

### Implications
Interface design in educational software is not pedagogically neutral. In high-stakes learning contexts, the UI itself is a measurable variable that can impair comprehension independently of content difficulty.`,
    keyPoints: [
      'High-complexity LMS increases extraneous cognitive load by 23%',
      'Complex-topic performance drops 18% — simple recall unaffected',
      'Interface design is a measurable, independent pedagogical variable',
    ],
  },
  CUSTOM: {
    title: 'Custom Presentation',
    content: 'Your custom brief will appear here. Please enter your scenario details in the previous step.',
    keyPoints: ['Define your key argument', 'Support with evidence or data', 'Close with a clear call to action'],
  },
};




const MOCK_FEEDBACK = {
  promptVersion: 'v1.1-evidence-based-standard',
  confidenceScore: 85,
  missingDataFlags: ['No Visuals'],
  executiveSummary: 'A solid foundational delivery with clear enthusiasm for the subject matter. The opening established context effectively, though the argument lost structural clarity in the middle section. With focused work on pacing and a stronger close, this presentation has the bones of something genuinely persuasive.',
  competencies: {
    voiceDelivery:           { score: 7, label: 'Voice & Delivery',           detailedFeedback: 'Consistent volume and a natural conversational tone were present throughout. However, pace accelerated noticeably under pressure in the final third.', evidence: ['WPM spiked to 175 during the middle section.'] },
    bodyLanguage:            { score: 5, label: 'Body Language & Presence',    detailedFeedback: 'Camera orientation was maintained throughout, showing basic awareness of presence. The available frames suggest posture was stable without notable authority signals.', evidence: ['Maintained consistent center-frame positioning.'] },
    structureLogic:          { score: 6, label: 'Structure & Logic',           detailedFeedback: 'The opening established clear context and the first half followed a logical progression. The middle section lost its thread noticeably.', evidence: ['"I think maybe we could..." shows hedging in core value prop.'] },
    clarityConciseness:      { score: 7, label: 'Clarity & Conciseness',       detailedFeedback: 'The key message was identifiable and excessive jargon was avoided. Two supporting points overlapped unnecessarily.', evidence: ['Repeated the phrase "essentially what it does" three times.'] },
    persuasiveness:          { score: 5, label: 'Persuasiveness & Impact',     detailedFeedback: 'Genuine conviction was visible and one concrete example was used effectively. However, there was no strong call to action.', evidence: ['Ended on "So yeah, that is about it." instead of a firm CTA.'] },
    timeManagement:          { score: 9, label: 'Time Management',             detailedFeedback: 'Available time was used fully with appropriate pacing between sections.', evidence: ['Finished within 5 seconds of target time.'] },
    openingImpression:       { score: 7, label: 'Opening & First Impression',  detailedFeedback: 'The start was confident with no hesitation and clear context established within the first 20 seconds.', evidence: ['"The number one killer of startups is..." - strong cold open.'] },
    adaptabilityAuthenticity:{ score: 5, label: 'Adaptability & Authenticity', detailedFeedback: 'Recovery from one stumble was handled reasonably and personality came through in moments.', evidence: ['Paused for 2 seconds after losing train of thought, instead of panicking.'] },
  },
  priorityActions: [
    { 
      title: 'Regulate Speaking Pace', 
      description: 'Practice the 140 WPM target. Record yourself and stop when you exceed 160 WPM.',
      whyItMatters: 'Speaking too fast under pressure signals anxiety and makes complex concepts impossible for the audience to absorb.',
      howToPractice: 'Read your pitch out loud to a metronome set to 140 BPM, aligning one word to each beat to internalize the rhythm.'
    },
    { 
      title: 'Engineer Your Close', 
      description: 'Write a single closing sentence before every session.',
      whyItMatters: 'The final sentence is the most memorable part of any pitch. Fading out with "so yeah" destroys previously built authority.',
      howToPractice: 'Memorize your final 15 seconds. Practice delivering just the close while maintaining unbroken eye contact with the lens.'
    },
    { 
      title: 'Establish a Visual Anchor', 
      description: 'Pick one point on your camera and return to it at key moments.',
      whyItMatters: 'Wandering eyes during critical statements break the parasocial connection with the audience.',
      howToPractice: 'Place a bright sticky note right next to your webcam lens. Look directly at it when delivering your core thesis.'
    },
    { 
      title: 'Reduce Filler Clusters', 
      description: 'Replace "um" and "uh" with intentional silence.',
      whyItMatters: 'Clusters of filler words act as speed bumps for your narrative and diminish perceived expertise.',
      howToPractice: 'Record yourself pitching. Every time you say a filler word, you must stop, wait 3 full seconds, and restart the sentence.'
    },
  ],
  transcript: '[Mock transcript — connect a valid API key to receive real analysis]',
};

/**
 * Analyze presentation using Groq text-only (using live transcript)
 */
export async function analyzePresentation({ blob, brief, mode, prepTime, duration, transcript, telemetry, feedbackDepth, analysisRigor }) {
  const wordCount = (transcript || '').split(/\s+/).filter(w => w.length > 0).length;
  
  if (wordCount < 15) {
     return {
        executiveSummary: `EVALUATION FAILED: The presentation was too short to evaluate. You only spoke ${wordCount} word${wordCount === 1 ? '' : 's'} — no meaningful analysis is possible.`,
        competencies: {
          voiceDelivery:           { score: 0, label: "Voice & Delivery",          detailedFeedback: "No audio data recorded to evaluate pacing, tone, or delivery." },
          bodyLanguage:            { score: 0, label: "Body Language & Presence",   detailedFeedback: "Session ended before any presence or posture data could be captured." },
          structureLogic:          { score: 0, label: "Structure & Logic",          detailedFeedback: "No structure detected — no content was delivered." },
          clarityConciseness:      { score: 0, label: "Clarity & Conciseness",      detailedFeedback: "Cannot evaluate clarity without a full argument." },
          persuasiveness:          { score: 0, label: "Persuasiveness & Impact",    detailedFeedback: "No pitch was delivered." },
          timeManagement:          { score: 0, label: "Time Management",            detailedFeedback: "Session ended prematurely before any meaningful time was used." },
          openingImpression:       { score: 0, label: "Opening & First Impression", detailedFeedback: "No hook or opening was established." },
          adaptabilityAuthenticity:{ score: 0, label: "Adaptability & Authenticity", detailedFeedback: "Insufficient data to evaluate presence or authenticity." }
        },
        priorityActions: [
          { title: "Complete the Pitch", description: "You must speak for at least 30 seconds to receive a meaningful evaluation. Try again and deliver your full presentation." }
        ],
        transcript: transcript || '(Silence)'
     };
  }

  try {
    const res = await fetch('/.netlify/functions/analyze-pitch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transcript,
        brief,
        mode,
        telemetry,
        analysisRigor,
        feedbackDepth
      }),
    });

    if (!res.ok) {
      throw new Error(`Function API error: ${res.statusText}`);
    }

    return await res.json();
  } catch (err) {
    console.warn('Analysis function failed, using mock feedback:', err.message);
    return { ...MOCK_FEEDBACK, transcript: transcript || MOCK_FEEDBACK.transcript };
  }
}

/**
 * Generate a presentation brief for the selected mode using Groq
 */
export async function generateBrief(mode) {
  try {
    const res = await fetch('/.netlify/functions/generate-brief', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ mode }),
    });

    if (!res.ok) {
      throw new Error(`Function API error: ${res.statusText}`);
    }

    return await res.json();
  } catch (err) {
    console.warn('Brief generation function failed, using mock brief:', err.message);
    const fallback = MOCK_BRIEFS[mode] || MOCK_BRIEFS.INVESTOR_PITCH;
    return { ...fallback };
  }
}
