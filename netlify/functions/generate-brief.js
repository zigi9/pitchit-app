import https from 'https';

const MOCK_BRIEFS = {
  INVESTOR_PITCH: {
    title: 'FinFlow AI — Seed Round Scenario',
    content: `### Company Overview
FinFlow AI is an early-stage B2B SaaS startup building predictive cash flow management software for seed and Series A companies. The company was founded 18 months ago by two ex-Stripe engineers who experienced the cash crisis problem firsthand at their previous startup.

### The Problem
Cash flow failure is the number one killer of startups — responsible for 82% of early-stage company deaths. The core issue is a timing gap: most founders only discover a critical cash problem approximately 30 days before it becomes terminal. At that point, it is too late to raise capital, too late to cut costs gracefully, and too late to pivot. Existing tools (spreadsheets, traditional accounting software) are backward-looking. They show where money went, not where it is heading.

### The Solution
FinFlow AI integrates in real time with Stripe, QuickBooks, and corporate bank accounts. It applies machine learning models trained on 50,000 startup financial histories to forecast burn rate, revenue volatility, and runway trajectory. The system sends automated alerts 60 to 90 days in advance when the runway drops below a configurable safety threshold — giving founders the time window they actually need to act.

### Traction
The company currently has 140 paying customers across the US and UK, generating $18,000 in Monthly Recurring Revenue. Growth has been 22% month-over-month for the past six months, achieved with zero paid marketing — entirely through word-of-mouth referrals within Y Combinator and Techstars alumni networks. Average contract value is $129 per month. Churn is under 2%.

### Market Opportunity
There are approximately 3.5 million active SaaS startups globally. The total addressable market for financial operations tooling in this segment is estimated at $4.2 billion annually. FinFlow AI is currently targeting the 250,000 seed and Series A companies in North America and Western Europe as its initial wedge.

### The Ask
FinFlow AI is raising a $1.2M seed round. The capital will be used to expand the engineering team from 3 to 7, launch an enterprise tier targeting companies with over 50 employees, and fund six months of paid acquisition to test scalable growth channels. The company is seeking a lead investor with SaaS and fintech portfolio experience.`,
    keyPoints: [
      'Problem: 82% of startups fail due to cash flow issues detected too late',
      'Solution: ML-powered runway forecasting with 60-90 day advance alerts',
      'Traction: 140 customers, $18K MRR, 22% MoM growth, <2% churn',
    ],
  },
  CONFERENCE_TALK: {
    title: 'Talk Brief — The Attention Economy Reckoning',
    content: `### Session Context
This is a 20-minute keynote slot at a product and technology leadership conference. The audience consists primarily of senior product managers, engineering leaders, and startup founders. The organizers have asked for a talk that challenges conventional wisdom and offers a concrete, actionable framework.

### Core Thesis
The engagement-maximization model that underpins modern consumer technology — the model that drove billions in value for a generation of companies — is now actively destroying the productivity and mental health of the users it depends on. The next competitive era will belong to products designed around "cognitive respect": systems that protect user attention rather than exploit it.

### Supporting Arguments
**Argument 1 — The Hidden Cost of Context Switching:** Research from the University of California Irvine found that after a digital interruption, it takes an average of 23 minutes to return to full cognitive focus. Enterprise productivity tools that maximize notification frequency are costing companies an estimated $450 billion in lost output annually.

**Argument 2 — The Outrage Optimization Problem:** Internal documents from major social platforms show that engagement algorithms systematically amplify emotionally negative content because anger and anxiety generate 3x more interaction than neutral or positive content. This is not a bug — it is the intended output of the reward function.

**Argument 3 — The Coming Regulatory and Market Correction:** The EU Digital Services Act and the UK Online Safety Act represent the leading edge of a global regulatory wave. Companies that continue optimizing for raw engagement will face increasing legal, reputational, and talent acquisition headwinds over the next five years.

### Proposed Framework
The talk should conclude by introducing the "Cognitive Respect Index" — a product design evaluation framework the speaker developed — which scores product decisions on five dimensions: interruption frequency, reversibility of actions, clarity of value exchange, emotional neutrality of design patterns, and respect for user-defined session limits.`,
    keyPoints: [
      'Context switching costs 23 min of focus recovery per interruption',
      'Engagement algorithms are structurally optimized for outrage',
      'Regulatory pressure + talent expectations will force product redesign',
    ],
  },
  TEDX_TALK: {
    title: 'Talk Brief — Why Failure Is the Wrong Metric',
    content: `### Talk Overview
This is a 12-minute TEDx slot. The talk challenges the "fail fast" dogma that has dominated startup and innovation culture for the past two decades. The intended emotional arc is: provocation → discomfort → reframe → resolution. The audience should leave feeling that they have been given a more honest and more useful mental model for dealing with setbacks.

### The Central Counterintuitive Claim
The most impactful founders and innovators are not the ones who fail the most — they are the ones who learn the fastest. These are not the same thing. The failure glorification culture that Silicon Valley exported to the rest of the world conflates speed with carelessness, and produces founders who are comfortable with mediocrity as long as it is dressed up as "experimentation."

### Research Foundation
The speaker spent three years conducting in-depth interviews with 200 founders across the US, Israel, and South Korea — three of the most active startup ecosystems globally. The consistent finding: the most resilient and highest-performing founders share a deep aversion to failure combined with obsessive, systematic learning processes. They treat every setback like a scientist treats a disproven hypothesis: as a data point to be analyzed, not a story to be told at dinner parties.

### Key Story
The talk should be anchored around a concrete case study: a founder who pivoted her company three times in 18 months, not because she "embraced failure" but because she had built a disciplined weekly learning review process that surfaced the signal from customer data 6 weeks before the market gave her an unmistakable verdict.

### The Proposed Reframe
Shift from measuring "failure frequency" to measuring "learning velocity" — defined as the average time between a signal appearing in data and a corresponding strategic decision being made. This is a metric that can actually be tracked, improved, and used to build organizational resilience.`,
    keyPoints: [
      'Fail fast culture conflates speed with carelessness',
      'The real differentiator is learning velocity, not failure tolerance',
      'Resilient founders build systems to extract signal — they do not romanticize the crash',
    ],
  },
  PRODUCT_DEMO: {
    title: 'Product Demo Brief — Loom Enterprise',
    content: `### Demo Context
This is a 5-minute live product demonstration to a procurement committee at a 600-person B2B SaaS company. The committee includes the Head of Engineering, Head of People Operations, and the CFO. They are currently evaluating three asynchronous video tools as part of a broader initiative to reduce meeting load across the organization. The company runs on a hybrid model with employees in 4 time zones.

### The Problem Being Solved
The company's internal data shows that employees spend an average of 31% of their working hours in synchronous meetings. A recent internal survey found that 58% of those meetings could have been an async video update. However, their previous attempt to adopt async video failed because the tool they used had no analytics, poor search functionality, and no integration with their existing workflow stack.

### Product to Demo — Loom Enterprise
Loom Enterprise is an asynchronous video communication platform designed for distributed teams at scale. The three features that are most relevant to this audience and should be demonstrated:

**Feature 1 — AI Transcripts and Smart Chapters:** Every video is automatically transcribed and segmented into labeled chapters. A viewer can scan a 10-minute video in under 90 seconds by reading the chapter index.

**Feature 2 — Engagement Analytics Dashboard:** Admins can see exactly who watched a video, at what timestamp they stopped watching, and whether they opened it at all. This creates accountability without micromanagement.

**Feature 3 — Salesforce and Slack Integration:** Customer-facing Looms are automatically logged in the relevant Salesforce deal record with an AI-generated summary. Internal Looms can be shared directly into Slack channels with a one-click embed.

### Objection to Anticipate
The CFO is likely to ask about the per-seat cost versus their current Zoom license. Be prepared to reference the ROI case study: a 400-person beta customer reduced synchronous meeting time by 40% in the first month, which they calculated as $280,000 in recovered productivity annually.`,
    keyPoints: [
      'AI chapters: a 10-min video scannable in 90 seconds',
      'Engagement analytics: accountability without surveillance',
      'Salesforce + Slack integration: zero manual logging',
    ],
  },
  ACADEMIC: {
    title: 'Research Brief — Cognitive Load in Remote Learning',
    content: `### Research Context
This is a thesis defense presentation for a Master's degree in Educational Technology. The committee consists of three faculty members: a cognitive psychologist, an instructional designer, and a statistician. The presentation slot is 15 minutes plus 10 minutes of Q&A. The research was conducted over one full academic semester.

### Research Question
Does the visual complexity of a digital Learning Management System (LMS) independently affect undergraduate student academic performance, controlling for course content difficulty, prior academic performance, and study time?

### Methodology
312 undergraduate students across two universities participated in the study. Students were randomly assigned to one of two conditions:
- **Condition A (High Complexity):** Standard university LMS with full feature set enabled — discussion boards, grade breakdown widgets, file repository, calendar integration, and notification panels visible simultaneously.
- **Condition B (Low Complexity):** Stripped-down version of the same LMS with only the three core functions enabled: content access, assignment submission, and messaging.

Cognitive load was measured using a validated dual-task methodology at four points during the semester. Academic performance was assessed using identical assessments administered to both groups.

### Key Findings
- Students in Condition A (high complexity) demonstrated 23% higher extraneous cognitive load scores compared to Condition B
- Students in Condition A scored 18% lower on assessments covering complex, multi-step topics
- No statistically significant performance difference was observed on simple recall tasks
- Qualitative interviews revealed that students in Condition A spent an average of 4.3 minutes per session navigating the interface before beginning substantive work

### Implications
Interface design in educational software is not pedagogically neutral. In high-stakes learning contexts involving complex content, the UI itself functions as a measurable variable that can impair comprehension independently of the content difficulty. Universities should evaluate LMS design with the same rigor they apply to curriculum selection.`,
    keyPoints: [
      'High-complexity LMS increases extraneous cognitive load by 23%',
      'Complex-topic performance drops 18% — simple recall is unaffected',
      'Interface design is a measurable, independent pedagogical variable',
    ],
  },
  CUSTOM: {
    title: 'Custom Presentation',
    content: 'Your custom brief will appear here. Please enter your scenario details in the previous step.',
    keyPoints: ['Define your key argument', 'Support with evidence or data', 'Close with a clear call to action'],
  },
};

export const handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: 'Method Not Allowed' };
  }

  try {
    const { mode } = JSON.parse(event.body);

    const modePrompts = {
      INVESTOR_PITCH: 'Generate a realistic startup pitch scenario for a seed-stage company. Include company name, problem, solution, and market. Make it a comprehensive 5-minute read (600-800 words).',
      CONFERENCE_TALK: 'Generate a conference talk opening on a disruptive technology or methodology. Make it a comprehensive 5-minute read (600-800 words).',
      TEDX_TALK: 'Generate a TEDx talk opening about a counter-intuitive idea. Include a personal hook and a core thesis. Make it a comprehensive 5-minute read (600-800 words).',
      PRODUCT_DEMO: 'Generate a product demo scenario for a B2B SaaS product. Include company, product, and 3 key features to demonstrate. Make it a comprehensive 5-minute read (600-800 words).',
      ACADEMIC: 'Generate an academic research presentation introduction. Include the research question, methodology, and key finding. Make it a comprehensive 5-minute read (600-800 words).',
      CUSTOM: '',
    };

    const topics = [
      'climate tech', 'fintech', 'healthcare AI', 'education tech', 'space exploration', 
      'robotics', 'mental health', 'cybersecurity', 'agritech', 'future of work',
      'autonomous vehicles', 'quantum computing', 'sustainable fashion'
    ];
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];

    const modeStructures = {
      INVESTOR_PITCH: '### Company Overview\n### The Problem\n### The Solution\n### Traction\n### Market Opportunity\n### The Ask',
      CONFERENCE_TALK: '### Session Context\n### Core Thesis\n### Supporting Arguments\n### Proposed Framework',
      TEDX_TALK: '### Talk Overview\n### The Central Claim\n### Research Foundation\n### Key Story\n### The Proposed Reframe',
      PRODUCT_DEMO: '### Demo Context\n### The Problem Being Solved\n### Product Overview\n### Key Features to Demo\n### Objections to Anticipate',
      ACADEMIC: '### Research Context\n### Research Question\n### Methodology\n### Key Findings\n### Implications',
      CUSTOM: '### Scenario Context\n### Primary Goal\n### Key Arguments\n### Audience Considerations',
    };

    const requestedStructure = modeStructures[mode] || modeStructures.INVESTOR_PITCH;

    const prompt = `You are an elite presentation training system.
Your task is to generate a SCENARIO DOCUMENT, not a script and not a speech.

Hard rules:
- Write in third person or as a factual briefing document.
- Never use first-person language such as "I am", "my company", or "we are".
- The document is for the presenter to read before speaking.
- The presenter must deliver the pitch in their own words.
- Use clear section headings with markdown-style ### headers exactly as defined in the Structure below.
- Include realistic facts, numbers, constraints, and context.
- Keep it grounded, specific, and useful for live presentation practice.
- Length: 500–700 words.

Structure:
${requestedStructure}

Input mode:
${modePrompts[mode] || modePrompts.INVESTOR_PITCH}

Core topic / industry:
${randomTopic}

Return ONLY valid JSON:
{
  "title": "<Short clear title>",
  "content": "<The full formatted document string using ### headers>",
  "keyPoints": ["<fact 1>", "<fact 2>", "<fact 3>"]
}`;

    const payload = JSON.stringify({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.9,
      response_format: { type: 'json_object' }
    });

    const responseJSON = await new Promise((resolve, reject) => {
      const req = https.request('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY}`,
          'Content-Length': Buffer.byteLength(payload)
        }
      }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk.toString());
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(JSON.parse(body));
          } else {
            reject(new Error(`Groq API error: ${res.statusCode} ${body}`));
          }
        });
      });
      req.on('error', reject);
      req.write(payload);
      req.end();
    });

    const text = responseJSON.choices[0]?.message?.content || '{}';
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(JSON.parse(text))
    };
  } catch (err) {
    console.warn('Groq brief generation failed, using mock brief:', err.message);
    let requestedMode = 'INVESTOR_PITCH';
    try {
      const { mode } = JSON.parse(event.body);
      requestedMode = mode;
    } catch(e) {}
    const fallback = MOCK_BRIEFS[requestedMode] || MOCK_BRIEFS.INVESTOR_PITCH;
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ ...fallback })
    };
  }
};
