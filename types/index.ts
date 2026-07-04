export interface StoreData {
  _id: string;
  integrationId: string;
  shopDomain: string;
  niche: string;
  businessSummary: string;
  targetAudience: string;
  brandVoice: string;
  language: string;
  primaryMarket: string;
  shortTailKeywords: string[];
  longTailKeywords: string[];
  competitors: Array<{ name: string; website: string; description: string; strengths: string[]; weaknesses: string[] }>;
  blogTopics: Array<{ title: string; keyword: string; intent: string; difficulty: string; priority: number }>;
  customerPainPoints: string[];
  customerGoals: string[];
  faqIdeas: string[];
  seoSuggestions: string[];
  contentPillars: string[];
  aiRecommendations: string[];
  lastAnalyzedAt: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Topic {
  id: string;
  name: string;
  keyword: string;
  intent: string;
  difficulty: string;
  priority: number;
}

export interface Blog {
  id: string;
  topic: string;
  title: string;
  html: string;
}

export type StarKey = "topics" | "products" | "collection" | null;
export type BlogStatus = "none" | "draft" | "sched" | "pub";

export interface BlogStatusConfig {
  cls: string;
  label: string;
}