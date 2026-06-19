export function buildCompanyPrompt(companyName, newsData, research) {
  const newsSection = buildNewsBlock(newsData);
  const researchBlock = buildResearchBlock(research);

  return `Create a comprehensive Company Dossier for ${companyName}.

Assume the reader is an MBA student, graduate student, or early-career professional preparing for placements, interviews, internships, or career exploration.

Use simple, practical language. Avoid excessive corporate jargon. Never behave like an encyclopedia. Always behave like a business analyst.

CRITICAL: Real research data is provided below. You MUST use specific numbers (revenue amounts, market share percentages, growth rates, employee counts, etc.) wherever available. Cite the numbers. Numbers make the candidate sound informed — generic descriptions do not.

Follow the structure below exactly. Do not skip sections unless information is genuinely unavailable.
${newsSection}
${researchBlock}

# 1. Company in One Minute
Explain:
- What the company does
- What products or services it offers
- Who its customers are
- Where it operates
- Why it is known in the market

Include any key numbers from the research data (revenue, market cap, employees, etc.).

# 2. Why This Company Exists
Explain:
- The problem the company was created to solve
- Customer pain points addressed
- The value provided to customers
- How the company improves customers' lives or businesses
- The long-term purpose of the organization

# 3. Business Model
Explain:
- How the company makes money
- Major revenue streams
- Primary customers
- Pricing or monetization approach
- Cost structure
- Key growth drivers

Include:
- Revenue sources ranked by importance (with specific numbers if available)
- Business model strengths
- Business model risks

# 4. Products & Services
Explain:
- Major products and services
- Purpose of each offering
- Target customers
- Contribution to overall business (revenue share % if known)
- Recent innovations or launches

Identify:
- Flagship offerings
- Fastest-growing offerings
- Strategic offerings

# 5. Company Journey
Explain:
- Founding story (use founding year/date from research)
- Important milestones
- Major growth phases
- Acquisitions and expansions
- Key turning points

Include a timeline of major events.

# 6. Industry Overview
Explain:
- Industry in which the company operates
- Market size (USE REAL NUMBERS from research data)
- Industry growth trends (CITE SPECIFIC GROWTH RATES)
- Major drivers of growth
- Major risks and disruptions

# 7. Competitor Analysis
Identify:
- Direct competitors
- Indirect competitors
- Emerging competitors

CRITICAL: If competitor or market share data is available in the research, CITE SPECIFIC MARKET SHARE PERCENTAGES. List competitors with their share percentages.

For each competitor explain:
- Strengths
- Weaknesses
- Competitive position

Also explain:
- Why customers choose this company
- Why customers may choose competitors

# 8. Competitive Advantage (Moat)
Explain:
- What makes the company difficult to compete against
- Unique assets
- Brand advantages
- Technology advantages
- Distribution advantages
- Customer advantages
- Network effects (if applicable)

Explain how sustainable these advantages are. Use numbers where possible.

# 9. Financial Health
CRITICAL: This section MUST use real numbers from the research data.
Provide analysis covering:
- Revenue: cite exact revenue figures, YoY growth %
- Profitability: cite profit margins, net income, EBITDA if available
- Market position: cite market cap, valuation
- Investment priorities
- Funding history (if relevant)
- Public market performance (if listed)

Focus on:
- What candidates should know
- Key financial strengths (with numbers)
- Key financial risks (with numbers)

Avoid excessive financial jargon but INCLUDE the numbers.

# 10. Strategic Priorities
Explain:
- Current company priorities
- Growth initiatives
- Expansion plans
- Technology investments
- Innovation focus
- Major business challenges

Identify:
- Top 3-5 priorities leadership is focused on today.

# 11. Leadership & Organizational Structure
Explain:
- Leadership team (use names from research if available)
- Key decision makers
- Organizational structure
- Business units
- How leadership influences company direction

Highlight leaders whose decisions significantly impact company strategy.

# 12. Culture & Work Style
Explain:
- Working environment
- Decision-making style
- Ownership expectations
- Collaboration style
- Performance expectations
- Pace of work

Describe:
- What daily work feels like
- Who thrives in this environment
- Who may struggle

# 13. Employee Insights
Summarize:
- Common employee praises
- Common employee complaints
- Reasons employees stay
- Reasons employees leave
- Growth opportunities
- Learning opportunities

If employee count or Glassdoor rating data is available, cite it.

# 14. MBA & Graduate Opportunities
Explain:
- Functions that hire MBA students
- Functions that hire graduates
- Common entry roles
- Internship opportunities
- Leadership programs
- Growth opportunities

Explain:
- Which skills are valued most

# 15. Skills the Company Values
Identify:
- Technical skills
- Business skills
- Leadership skills
- Communication skills
- Behavioral traits

Explain:
- Why each skill matters
- How employees demonstrate these skills

# 16. Company Challenges
Explain:
- Current business challenges
- Competitive threats
- Operational challenges
- Industry challenges
- Future risks

Explain:
- How leadership is addressing these challenges

# 17. Future Outlook
Explain:
- Growth opportunities
- Emerging trends
- Strategic bets
- Industry changes
- Future opportunities and risks

Discuss:
- Where the company may be in the next 3-5 years
- Revenue growth projections if available

# 18. Interview Intelligence
Explain:
- What candidates should know before interviews
- Common topics interviewers may discuss
- Business trends candidates should understand
- Smart insights candidates can mention

Provide:
- 10 interview-ready talking points (include numbers where possible — e.g., "I know ${companyName} grew revenue by X% last year...")

# 19. Why Someone Should Join This Company
Explain:
- Career growth opportunities
- Learning opportunities
- Brand value
- Industry exposure
- Compensation and benefits considerations
- Long-term career impact

Provide a balanced view.

# 20. Company Cheat Sheet
Create a one-page summary covering:
- What the company does
- Business model
- Key products
- Competitors
- Competitive advantage
- Strategic priorities
- Culture
- Skills valued
- Major challenges
- Future outlook

Include key numbers: revenue, market share, employees, growth rate.

# 21. Sound Smart in Interviews
Generate:
- 10 thoughtful observations about the company (back each with a specific number or fact from the research data)
- 10 intelligent questions a candidate can ask interviewers
- 10 industry-related insights that demonstrate business awareness (use numbers from research)

The output should be practical, interview-focused, student-friendly, and tailored specifically to ${companyName} rather than generic corporate information. Every section where numbers are relevant should cite specific data from the research provided.
  `;
}

function buildNewsBlock(newsData) {
  if (!newsData || newsData.length === 0) return "";
  return `\nREAL NEWS DATA (last 6 months — cite dates and sources):\n${newsData.map((item, i) => `[#${i + 1}] "${item.title}" — ${item.source} (${item.date || 'recent'})\n   ${item.snippet}\n`).join('\n')}\n`;
}

function buildResearchBlock(research) {
  if (!research) return "";
  let text = "\n─── REAL RESEARCH DATA (USE THESE EXACT NUMBERS) ───\n";

  if (research.financials?.data?.length) {
    const top = research.financials.data.slice(0, 2);
    text += "\nFINANCIAL (revenue, profit, growth %, market cap):\n";
    text += top.map((d) => `  - ${d.snippet}`).join("\n") + "\n";
  }

  if (research.competitors?.data?.length) {
    const top = research.competitors.data.slice(0, 2);
    text += "\nCOMPETITORS & MARKET SHARE:\n";
    text += top.map((d) => `  - ${d.snippet}`).join("\n") + "\n";
  }

  if (research.industry?.data?.length) {
    const top = research.industry.data.slice(0, 2);
    text += "\nINDUSTRY (market size, growth rates):\n";
    text += top.map((d) => `  - ${d.snippet}`).join("\n") + "\n";
  }

  if (research.profile?.data?.length) {
    const top = research.profile.data.slice(0, 2);
    text += "\nCOMPANY PROFILE (founded, CEO, employees):\n";
    text += top.map((d) => `  - ${d.snippet}`).join("\n") + "\n";
  }

  text += "─── END ───\n";
  return text;
}
