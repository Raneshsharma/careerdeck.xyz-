export function buildNewsPrompt(companyName, role, newsData, research) {
  const hasRole = role && role.trim().length > 0;
  const hasNews = newsData && newsData.length > 0;

  const roleClause = hasRole
    ? `\nROLE: ${role}\nAdditionally evaluate the relevance of each news item for the ${role} role. Explain what each development means specifically for someone in this position.`
    : "\nNo specific role provided. Focus on general business and strategic implications.";

  const newsBlock = hasNews
    ? `\nREAL NEWS DATA (last 30 days — verified facts, cite dates and sources):\n${newsData.map((item, i) => `${i + 1}. "${item.title}" — ${item.source} (${item.date || 'recent'})\n   ${item.snippet}\n   Link: ${item.link}`).join('\n\n')}\n\nUse these as the foundation for your analysis. Do not hallucinate additional news items.`
    : `\nNo verified news data is available. DO NOT hallucinate news items.\nInstead, analyze the major macroeconomic headwinds, competitive pressures, and operational roadblocks ${companyName} faces in its sector over the last 30 days.`;

  const researchBlock = buildResearchBlock(research);

  return `Analyze all available news, announcements, press releases, earnings updates, regulatory developments, partnerships, investments, acquisitions, leadership changes, product launches, hiring trends, and industry developments related to ${companyName} from the last 30 days.
${roleClause}

Your objective is NOT to summarize every article.

Instead, identify and analyze only the most important developments that could impact ${companyName}'s strategy, growth, operations, workforce, customers, competitive position, or future outlook.

CRITICAL: Real research data (financials, competitor data, industry data) is provided below. USE specific numbers wherever they add depth to your analysis. Numbers make analysis sound informed.
${researchBlock}

Use simple, practical language suitable for MBA students, graduate students, job seekers, and interview candidates.
${newsBlock}

Follow the structure below exactly.

# 1. Executive Summary
Provide:
- Top 5 most important developments from the last 30 days
- Why these developments matter
- Overall company momentum assessment

Classify company momentum as:
- Strong Positive Momentum
- Positive Momentum
- Neutral
- Mixed Signals
- Negative Momentum

Explain your reasoning. Use specific numbers from the research where applicable.

# 2. Major Strategic Developments
Identify:
- New business initiatives
- Product launches
- Service launches
- Market expansion
- Geographic expansion
- Strategic shifts
- Technology initiatives

For each development explain:
- What happened
- Why it matters
- Expected business impact
- Potential opportunities
- Potential risks

Assign an Importance Score: 1-10

# 3. Funding, Investments & Capital Activity
Identify:
- Funding rounds (cite amounts if available)
- IPO-related developments
- Investments
- Debt financing
- Share buybacks
- Capital allocation decisions

For each event explain:
- What happened
- Financial significance
- Strategic significance
- Long-term implications

Assign an Importance Score: 1-10

# 4. Mergers, Acquisitions & Partnerships
Identify:
- Acquisitions
- Mergers
- Strategic investments
- Joint ventures
- Key partnerships

For each event explain:
- What happened
- Strategic rationale
- Expected synergies
- Risks involved
- Long-term implications

Assign an Importance Score: 1-10

# 5. Leadership & Organizational Changes
Identify:
- CEO changes
- CXO appointments
- Board changes
- Organizational restructuring
- Leadership announcements

For each development explain:
- What changed
- Why it matters
- Strategic implications
- Potential impact on employees

Assign an Importance Score: 1-10

# 6. Financial Performance & Business Health
Identify:
- Earnings announcements
- Revenue updates (CITE EXACT NUMBERS if in research data)
- Profitability developments (CITE MARGINS/FIGURES)
- Guidance changes
- Business performance indicators

For each development explain:
- Key numbers (use real data)
- Positive signals
- Negative signals
- What investors care about
- What candidates should understand

Assign an Importance Score: 1-10

# 7. Talent, Hiring & Workplace Developments
Identify:
- Hiring initiatives
- Layoffs
- Workforce restructuring
- Employer branding initiatives
- Return-to-office policies
- Employee-related developments

Explain:
- What happened
- Why it matters
- Impact on employees
- Impact on future hiring

Assign an Importance Score: 1-10

# 8. Industry & Competitive Intelligence
Identify:
- Major competitor actions
- Industry shifts
- Market trends
- Emerging threats
- Emerging opportunities

For each development explain:
- What happened
- Why it matters for ${companyName}
- Competitive implications
- Strategic implications

Assign an Importance Score: 1-10

# 9. Regulatory, Legal & Policy Developments
Identify:
- Regulatory changes
- Legal developments
- Compliance updates
- Government policy changes

Explain:
- What changed
- Impact on ${companyName}
- Impact on the industry
- Future implications

Assign an Importance Score: 1-10

# 10. What This Means for the Company
Provide an integrated analysis covering:
- Biggest opportunities
- Biggest risks
- Strategic priorities likely to emerge
- Potential future developments
- Areas leadership is likely focusing on

Include specific revenue/growth numbers from research where they add context.

${hasRole ? `# 11. Role Relevance Analysis
Rank all major developments based on relevance to the ${role} role.

For each relevant development explain:
- What happened
- Why it matters for this role
- How it may impact day-to-day responsibilities
- New challenges it may create
- New opportunities it may create
- Skills that become more important because of this development

Classify each news item as:
- Highly Relevant
- Moderately Relevant
- Good to Know` : `# 11. Role Relevance Analysis
No specific role provided — skip detailed role-based analysis.`}

# 12. Interview Intelligence
Generate:

## Top 10 Interview Talking Points
Provide 10 intelligent observations candidates can mention during interviews.

Each observation should:
- Demonstrate business awareness
- Show understanding of ${companyName}
- Reflect strategic thinking
- Include a specific number or data point where possible

## Possible Interview Questions
Generate likely interview questions that could arise because of recent developments.

For each question explain:
- Why an interviewer may ask it
- What a strong answer should include

# 13. Smart Questions Candidates Can Ask
Generate 10 thoughtful questions candidates can ask interviewers based on recent company developments.

Questions should demonstrate:
- Curiosity
- Strategic thinking
- Industry awareness

Avoid generic questions.

# 14. News Cheat Sheet
Create a one-page summary including:

### Must Know
The 5 most important developments.

### Good to Mention
Developments that demonstrate strong company awareness.

${hasRole ? `### Role-Relevant News
News directly relevant to the ${role} role.` : ""}

### Watchlist
Developments candidates should continue monitoring over the next few months.

### Final Takeaway
A concise explanation of what the last 30 days reveal about ${companyName}'s direction, priorities, challenges, and opportunities. Include key numbers.

Focus on analysis, implications, and interview relevance rather than simply summarizing articles.
  `;
}

function buildResearchBlock(research) {
  if (!research) return "";
  if (typeof research === "string" && research.trim()) {
    return `\n─── VERIFIED FACTS (use ONLY these facts) ───\n${research}\n─── END ───\n`;
  }
  if (research.extract) {
    return `\n─── RESEARCH DATA (verified by Wikipedia — USE SPECIFIC FACTS) ───\n${research.extract}\n[Source: ${research.pageUrl}]\n─── END ───\n`;
  }
  let text = "\n─── RESEARCH DATA (USE SPECIFIC NUMBERS) ───\n";

  if (research.financials?.data?.length) {
    text += "\nFINANCIAL:\n";
    text += research.financials.data.slice(0, 2).map((d) => `  - ${d.snippet}`).join("\n") + "\n";
  }

  if (research.competitors?.data?.length) {
    text += "\nCOMPETITORS:\n";
    text += research.competitors.data.slice(0, 2).map((d) => `  - ${d.snippet}`).join("\n") + "\n";
  }

  if (research.industry?.data?.length) {
    text += "\nINDUSTRY:\n";
    text += research.industry.data.slice(0, 2).map((d) => `  - ${d.snippet}`).join("\n") + "\n";
  }

  if (research.profile?.data?.length) {
    text += "\nPROFILE:\n";
    text += research.profile.data.slice(0, 2).map((d) => `  - ${d.snippet}`).join("\n") + "\n";
  }

  text += "─── END ───\n";
  return text;
}
