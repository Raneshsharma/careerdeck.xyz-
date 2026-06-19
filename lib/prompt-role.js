export function buildRolePrompt(role, companyName, roleResearch) {
  const companyContext = companyName
    ? `\nCONTEXT: Treat this role as it exists at ${companyName}. Anchor all insights to ${companyName}'s actual business model, industry, and culture. Use any company-specific data provided.`
    : "\nCONTEXT: No specific company provided. Provide role insights that are practical and industry-aware.";

  const salaryBlock = buildSalaryBlock(roleResearch?.salary);

  return `Create a comprehensive Role Dossier for the role: ${role}.

Assume the reader is an MBA student, graduate student, or early-career professional exploring this career path, preparing for interviews, and evaluating whether the role matches their interests and strengths.

Use simple, practical language. Focus on real-world responsibilities, business impact, required skills, career progression, and interview preparation.

CRITICAL: Real salary/compensation data may be provided below. If present, CITE specific salary ranges, demand metrics, and compensation figures. Numbers make the candidate sound informed.
${companyContext}
${salaryBlock}

Follow the structure below exactly:

# 1. Role in One Minute
Explain:
- What this role is
- Why companies hire people for this role
- The value this role creates
- How this role contributes to business success
- A simple explanation anyone can understand

# 2. Why This Role Exists
Explain:
- The business problems this role solves
- Why organizations need this role
- What would happen if this role did not exist
- How the role contributes to organizational goals
- How the role creates value for customers, employees, or the business

# 3. Business Context
Explain:
- Where this role sits within an organization
- Which departments it interacts with
- How it contributes to company strategy
- How leadership views this role
- The role's influence on business outcomes

# 4. Evolution of the Role
Explain:
- How this role has evolved over time
- How technology has changed the role
- Emerging trends impacting the role
- Future opportunities and challenges
- How the role may change in the next 5 years

# 5. Day in the Life
Describe:
- A realistic day
- A realistic week
- Typical meetings
- Daily activities
- Key decisions made
- Stakeholder interactions
- Common challenges

# 6. Core Responsibilities
Explain:
- The primary responsibilities of the role
- Why each responsibility matters
- Typical activities involved
- Expected outputs and outcomes
- Areas of ownership

# 7. Stakeholder Ecosystem
Identify:
- Internal stakeholders
- External stakeholders
- Relationship with each stakeholder
- Common challenges when working with stakeholders
- Influence and communication requirements

# 8. Success Metrics & KPIs
Explain:
- How performance is measured
- Key KPIs
- Business outcomes expected
- What defines success
- What distinguishes top performers

# 9. Problems This Role Solves
Explain:
- Strategic problems solved
- Operational problems solved
- Customer-related problems solved
- People-related problems solved
- Business decisions commonly made

# 10. Skills Required
Categorize into:

## Technical Skills
## Analytical Skills
## Business Skills
## Communication Skills
## Leadership Skills
## Behavioral Skills

For each:
- Why it matters
- How it is applied

# 11. Functional Excellence
Explain:
- Core frameworks used
- Methodologies used
- Models used
- Industry-standard practices
- Specialized expertise required

Include examples where possible.

# 12. Tools & Technologies
Identify:
- Software commonly used
- Analytical tools
- Collaboration tools
- Reporting tools
- Emerging technologies impacting the role

For each:
- Purpose
- Typical use cases
- Recommended proficiency level

# 13. Knowledge Areas to Master
Explain:
- Business concepts
- Functional concepts
- Industry knowledge
- Financial knowledge
- Customer knowledge
- Current trends

Rank them by importance.

# 14. What Top Performers Do Differently
Explain:
- Habits
- Mindset
- Communication style
- Decision-making style
- Leadership behaviors
- Common mistakes made by average performers

# 15. Interview Preparation Guide
Provide:
- Common behavioral questions
- Functional questions
- Technical questions
- Business questions
- Case interview questions
- Scenario-based questions

Explain:
- What interviewers are evaluating
- How strong candidates answer

# 16. Resume Preparation Guide
Explain:
- Experiences to highlight
- Projects to highlight
- Keywords recruiters look for
- Certifications that add value
- Common resume mistakes

# 17. Career Progression
Explain:
- Entry-level positions
- Typical progression path
- Mid-career opportunities
- Leadership opportunities
- Adjacent career transitions

Include:
- Typical timelines
- Skills needed for promotion

# 18. Compensation & Market Demand
Explain:
- Typical compensation ranges (CITE specific numbers if salary data is provided below)
- Factors affecting compensation
- Demand for this role
- Industry-wise opportunities
- Future outlook

If real salary data is available in the prompt, USE THOSE EXACT NUMBERS.

# 19. First 90-Day Success Blueprint
Explain:
- What new hires should learn first
- Key relationships to build
- Early wins to achieve
- Common onboarding mistakes
- How to build credibility quickly

# 20. Think Like This Role
Generate 10 realistic business scenarios.

For each scenario provide:
- Situation
- Challenge
- Stakeholders involved
- Data required
- Decision-making process
- Recommended solution

# 21. Who Should Pursue This Role?
Explain:
- Ideal personality traits
- Interests that align with the role
- Strengths that help
- Weaknesses that may create challenges
- Types of people who thrive
- Types of people who may struggle

# 22. Learning Roadmap
Create a structured roadmap covering:

- Beginner Level
- Intermediate Level
- Advanced Level

Include:
- Skills to learn
- Concepts to master
- Tools to learn
- Projects to build
- Resources to explore

# 23. Final Role Cheat Sheet
Create a one-page summary covering:
- What the role does
- Why it matters
- Key responsibilities
- Essential skills
- Top tools
- Top KPIs
- Interview tips
- Career path
- Key success factors

Include salary range numbers if data is available.

The output should be practical, actionable, interview-focused, and written specifically for ${role} rather than generic career advice.
  `;
}

function buildSalaryBlock(salaryData) {
  if (!salaryData || !salaryData.data || salaryData.data.length === 0) return "";
  return `\n─── REAL SALARY & COMPENSATION DATA (SerpAPI-verified — CITE THESE NUMBERS) ───\n${salaryData.data.map((d) => `  - ${d.snippet} [source: ${d.source}]`).join("\n")}\n─── END SALARY DATA ───\n`;
}
