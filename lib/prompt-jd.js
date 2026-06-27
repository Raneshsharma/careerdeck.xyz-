export function buildJDPrompt(companyName, role, jobDescription, newsData, research) {
  const newsBlock = buildNewsBlock(newsData);
  const researchBlock = buildResearchBlock(research);

  return `Analyze the provided Job Description and create a comprehensive, student-friendly Job Description Dossier.

COMPANY: ${companyName}
ROLE: ${role}
JOB DESCRIPTION:
"""
${jobDescription}
"""

Assume the reader is an MBA student, graduate student, or early-career professional who wants to understand the role, prepare for interviews, and determine whether they are a good fit.

Treat this JD as a business problem that ${companyName} is trying to solve. Explain what the hiring manager is truly looking for.

CRITICAL: Real research data about ${companyName} is provided below — USE specific numbers (revenue, market share, growth rates, headcount) wherever relevant to contextualize the role. Numbers make answers sound informed.
${newsBlock}
${researchBlock}

Follow the structure below exactly:

# 1. Role Summary
Explain:
- What the role is
- Why ${companyName} is hiring for it
- How it contributes to the business
- The ideal candidate profile
- A simple one-paragraph explanation of the role

# 2. Why This Role Exists
Explain:
- Business objectives supported by this role
- Problems this role is expected to solve
- Impact on company performance (use company numbers if available)
- Consequences if this role performs poorly
- Importance of the role within the organization

# 3. Responsibility Breakdown
For every responsibility mentioned in the JD:
- Explain it in simple language
- Why it matters
- Typical activities involved
- Skills required
- How success is measured

# 4. Day in the Life
Describe:
- A realistic day and week in this role at ${companyName}
- Common meetings
- Daily responsibilities
- Decision-making activities
- Stakeholder interactions
- Typical challenges

# 5. Stakeholder Ecosystem
Identify:
- Internal stakeholders
- External stakeholders (if any)
- Relationship with each stakeholder
- Key expectations from each stakeholder
- Potential conflicts and challenges

# 6. Skills Required
Categorize skills into:
- Technical Skills
- Analytical Skills
- Business Skills
- Communication Skills
- Behavioral Skills

For each skill:
- Why it matters
- How it is used in this role at ${companyName}

# 7. Hidden Expectations
Infer and explain:
- Unstated expectations
- Personality traits sought
- Working style expected
- Ownership level required
- Adaptability requirements
- Leadership potential
- Mindset needed for success

# 8. Success Metrics & KPIs
Identify:
- Likely KPIs
- Performance indicators
- Business outcomes expected
- How success is measured
- What distinguishes top performers

# 9. Problems You Will Solve
Explain:
- Most common challenges faced
- Business problems solved
- Strategic decisions involved
- Operational challenges involved
- Types of situations encountered

# 10. Functional Excellence
First identify the functional domain of the role (e.g., Strategy, Consulting, Marketing, HR, Product, Operations, Finance, Sales, Analytics, Supply Chain, etc.).

Then explain:
- Specialized knowledge areas required
- Functional frameworks used
- Methodologies applied
- Industry-specific concepts
- Role-specific best practices
- What candidates should master

# 11. Tools, Technologies & Platforms
Identify:
- Commonly used tools
- Software platforms
- Reporting systems
- Analytical tools
- Collaboration tools

For each:
- Purpose
- Importance
- Recommended proficiency level

# 12. Knowledge Areas to Master
Explain:
- Business concepts required
- Industry knowledge required
- Functional concepts required
- Current trends affecting the role
- Topics candidates should study before interviews

# 13. What Top Performers Do Differently
Explain:
- Behaviors of top performers in this role at ${companyName}
- Decision-making approaches
- Communication styles
- Problem-solving habits
- Common mistakes made by average performers

# 14. Interview Preparation Guide
Predict:
- Behavioral questions
- Functional questions
- Technical questions
- Business questions
- Case-based questions
- Scenario-based questions

Also explain:
- Why each category is important
- What interviewers at ${companyName} are evaluating

# 15. Resume Mapping Guide
Explain:
- Most important keywords from the JD
- Experiences to highlight
- Projects to highlight
- Skills to highlight
- Achievements to highlight
- Common resume mistakes to avoid

# 16. First 90-Day Success Plan
Create a roadmap covering:
- First 30 days
- Days 31-60
- Days 61-90

Include:
- Learning priorities
- Relationship-building priorities
- Quick wins
- Success milestones

# 17. Hiring Manager Perspective
Act as the hiring manager at ${companyName} and explain:
- What the ideal candidate looks like
- What qualities stand out
- What creates confidence in a candidate
- Common reasons candidates are rejected
- What would make someone an exceptional hire

# 18. Real-World Role Scenarios
Generate 5 realistic workplace scenarios at ${companyName}.

For each scenario provide:
- Situation
- Challenge
- Stakeholders involved
- Data/information needed
- Recommended approach
- What an excellent solution looks like

# 19. Candidate Action Plan
Provide a final action plan covering:
- What to learn
- What to practice
- What to add to the resume
- What stories to prepare for interviews
- What should be mastered before applying

If research data provides company financials, competitors, or industry context — use those numbers to make answers specific. For example: "Given ${companyName}'s $X revenue and Y% growth in [sector], you should prepare stories about..."

The output should be practical, detailed, interview-focused, and tailored specifically to this Job Description and ${companyName} rather than generic role descriptions.
  `;
}

function buildNewsBlock(newsData) {
  if (!newsData || newsData.length === 0) return "";
  return `\nREAL NEWS (last 6 months):\n${newsData.map((item, i) => `[#${i + 1}] "${item.title}" — ${item.source} (${item.date || 'recent'})\n   ${item.snippet}\n`).join('\n')}\n`;
}

function buildResearchBlock(research) {
  if (!research) return "";
  if (typeof research === "string" && research.trim()) {
    return `\n─── VERIFIED FACTS (use ONLY these facts) ───\n${research}\n─── END ───\n`;
  }
  if (research.text) {
    return `\n─── RESEARCH DATA (verified — USE THESE FACTS) ───\n${research.text}\n─── END ───\n`;
  }
  let text = "\n─── RESEARCH DATA (USE THESE NUMBERS) ───\n";

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
