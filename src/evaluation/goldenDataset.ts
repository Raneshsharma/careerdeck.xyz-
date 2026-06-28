export interface GoldenCompany {
  id: string;
  name: string;
  category: string;
  type: string;
  country: string;
  ticker?: string;
  expectedSections: Record<string, GoldenSection>;
}

export interface GoldenSection {
  sectionId: string;
  expectedFacts: string[];
  expectedTopics: string[];
  minScore: {
    accuracy: number;
    completeness: number;
    businessInsight: number;
    interviewReadiness: number;
  };
}

export const GOLDEN_DATASET: GoldenCompany[] = [
  {
    id: "apple",
    name: "Apple",
    category: "Technology",
    type: "Large Public",
    country: "US",
    ticker: "AAPL",
    expectedSections: {
      companyOverview: {
        sectionId: "companyOverview",
        expectedFacts: ["technology company", "iPhone", "Mac", "Tim Cook", "Cupertino"],
        expectedTopics: ["revenue sources", "market position", "innovation"],
        minScore: { accuracy: 9, completeness: 8.5, businessInsight: 8.5, interviewReadiness: 9 },
      },
      financials: {
        sectionId: "financials",
        expectedFacts: ["revenue", "market cap", "profit margin"],
        expectedTopics: ["financial strength", "growth", "key metrics"],
        minScore: { accuracy: 9, completeness: 8.5, businessInsight: 8.5, interviewReadiness: 9 },
      },
    },
  },
  {
    id: "microsoft",
    name: "Microsoft",
    category: "Technology",
    type: "Large Public",
    country: "US",
    ticker: "MSFT",
    expectedSections: {
      companyOverview: {
        sectionId: "companyOverview",
        expectedFacts: ["technology company", "Windows", "Azure", "Satya Nadella", "Redmond"],
        expectedTopics: ["cloud computing", "enterprise software", "AI"],
        minScore: { accuracy: 9, completeness: 8.5, businessInsight: 8.5, interviewReadiness: 9 },
      },
    },
  },
  {
    id: "google",
    name: "Alphabet (Google)",
    category: "Technology",
    type: "Large Public",
    country: "US",
    ticker: "GOOGL",
    expectedSections: {
      companyOverview: {
        sectionId: "companyOverview",
        expectedFacts: ["search engine", "advertising", "Sundar Pichai", "Mountain View"],
        expectedTopics: ["advertising revenue", "AI", "cloud"],
        minScore: { accuracy: 9, completeness: 8.5, businessInsight: 8.5, interviewReadiness: 9 },
      },
    },
  },
  {
    id: "amazon",
    name: "Amazon",
    category: "E-commerce",
    type: "Large Public",
    country: "US",
    ticker: "AMZN",
    expectedSections: {
      companyOverview: {
        sectionId: "companyOverview",
        expectedFacts: ["e-commerce", "AWS", "Andy Jassy", "Seattle"],
        expectedTopics: ["retail dominance", "cloud computing", "logistics"],
        minScore: { accuracy: 9, completeness: 8.5, businessInsight: 8.5, interviewReadiness: 9 },
      },
    },
  },
  {
    id: "tesla",
    name: "Tesla",
    category: "Automotive",
    type: "Large Public",
    country: "US",
    ticker: "TSLA",
    expectedSections: {
      companyOverview: {
        sectionId: "companyOverview",
        expectedFacts: ["electric vehicles", "Elon Musk", "Austin"],
        expectedTopics: ["EV market", "energy", "autonomous driving"],
        minScore: { accuracy: 9, completeness: 8.5, businessInsight: 8.5, interviewReadiness: 9 },
      },
    },
  },
  {
    id: "infosys",
    name: "Infosys",
    category: "IT Services",
    type: "Large Public",
    country: "India",
    ticker: "INFY",
    expectedSections: {
      companyOverview: {
        sectionId: "companyOverview",
        expectedFacts: ["IT services", "Bangalore", "Narayana Murthy"],
        expectedTopics: ["outsourcing", "digital transformation", "global delivery"],
        minScore: { accuracy: 9, completeness: 8.5, businessInsight: 8.5, interviewReadiness: 9 },
      },
    },
  },
  {
    id: "tcs",
    name: "Tata Consultancy Services",
    category: "IT Services",
    type: "Large Public",
    country: "India",
    ticker: "TCS",
    expectedSections: {
      companyOverview: {
        sectionId: "companyOverview",
        expectedFacts: ["IT services", "Tata Group", "Mumbai"],
        expectedTopics: ["consulting", "digital services", "global presence"],
        minScore: { accuracy: 9, completeness: 8.5, businessInsight: 8.5, interviewReadiness: 9 },
      },
    },
  },
  {
    id: "reliance",
    name: "Reliance Industries",
    category: "Conglomerate",
    type: "Large Public",
    country: "India",
    ticker: "RELIANCE",
    expectedSections: {
      companyOverview: {
        sectionId: "companyOverview",
        expectedFacts: ["Mukesh Ambani", "Mumbai", "petrochemicals", "telecom", "retail"],
        expectedTopics: ["Jio", "diversification", "market dominance"],
        minScore: { accuracy: 9, completeness: 8.5, businessInsight: 8.5, interviewReadiness: 9 },
      },
    },
  },
  {
    id: "zomato",
    name: "Zomato",
    category: "Food Tech",
    type: "Large Public",
    country: "India",
    ticker: "ZOMATO",
    expectedSections: {
      companyOverview: {
        sectionId: "companyOverview",
        expectedFacts: ["food delivery", "Deepinder Goyal", "Gurgaon"],
        expectedTopics: ["delivery market", "quick commerce", "profitability"],
        minScore: { accuracy: 9, completeness: 8.5, businessInsight: 8.5, interviewReadiness: 9 },
      },
    },
  },
  {
    id: "freshworks",
    name: "Freshworks",
    category: "SaaS",
    type: "Large Public",
    country: "India",
    ticker: "FRSH",
    expectedSections: {
      companyOverview: {
        sectionId: "companyOverview",
        expectedFacts: ["SaaS", "customer engagement", "Chennai", "Girish Mathrubootham"],
        expectedTopics: ["SaaS market", "product suite", "global expansion"],
        minScore: { accuracy: 9, completeness: 8.5, businessInsight: 8.5, interviewReadiness: 9 },
      },
    },
  },
  {
    id: "stripe",
    name: "Stripe",
    category: "Fintech",
    type: "Private",
    country: "US",
    expectedSections: {
      companyOverview: {
        sectionId: "companyOverview",
        expectedFacts: ["payments", "Patrick Collison", "San Francisco"],
        expectedTopics: ["online payments", "API-first", "developer tools"],
        minScore: { accuracy: 8, completeness: 8, businessInsight: 8, interviewReadiness: 8 },
      },
    },
  },
  {
    id: "swiggy",
    name: "Swiggy",
    category: "Food Tech",
    type: "Private",
    country: "India",
    expectedSections: {
      companyOverview: {
        sectionId: "companyOverview",
        expectedFacts: ["food delivery", "Bangalore", "Sriharsha Majety"],
        expectedTopics: ["delivery market", "Instamart", "competition with Zomato"],
        minScore: { accuracy: 8, completeness: 8, businessInsight: 8, interviewReadiness: 8 },
      },
    },
  },
  {
    id: "nykaa",
    name: "Nykaa",
    category: "E-commerce",
    type: "Large Public",
    country: "India",
    ticker: "NYKAA",
    expectedSections: {
      companyOverview: {
        sectionId: "companyOverview",
        expectedFacts: ["beauty e-commerce", "Falguni Nayar", "Mumbai"],
        expectedTopics: ["beauty retail", "omnichannel", "brand portfolio"],
        minScore: { accuracy: 9, completeness: 8.5, businessInsight: 8.5, interviewReadiness: 9 },
      },
    },
  },
  {
    id: "slack",
    name: "Slack",
    category: "SaaS",
    type: "Acquired (Salesforce)",
    country: "US",
    expectedSections: {
      companyOverview: {
        sectionId: "companyOverview",
        expectedFacts: ["workplace messaging", "Salesforce", "Stewart Butterfield"],
        expectedTopics: ["collaboration", "enterprise software", "integration"],
        minScore: { accuracy: 8, completeness: 8, businessInsight: 8, interviewReadiness: 8 },
      },
    },
  },
  {
    id: "hul",
    name: "Hindustan Unilever",
    category: "FMCG",
    type: "Large Public",
    country: "India",
    ticker: "HINDUNILVR",
    expectedSections: {
      companyOverview: {
        sectionId: "companyOverview",
        expectedFacts: ["FMCG", "Unilever", "Mumbai", "consumer goods"],
        expectedTopics: ["brand portfolio", "rural distribution", "market leadership"],
        minScore: { accuracy: 9, completeness: 8.5, businessInsight: 8.5, interviewReadiness: 9 },
      },
    },
  },
];

export function getGoldenCompany(name: string): GoldenCompany | undefined {
  return GOLDEN_DATASET.find((c) => c.id === name);
}

export function getGoldenCompaniesByCategory(category: string): GoldenCompany[] {
  return GOLDEN_DATASET.filter((c) => c.category === category);
}

export function getAllGoldenCompanies(): GoldenCompany[] {
  return GOLDEN_DATASET;
}
