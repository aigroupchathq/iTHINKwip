export type ActiveTab = 
  | 'training' 
  | 'flow'
  | 'soundscape' 
  | 'tracker' 
  | 'education' 
  | 'rehab' 
  | 'library' 
  | 'community' 
  | 'blueprint';

export type CognitiveChallengeType = 'stroop' | 'nback' | 'gonogo' | 'trailmaking';

export interface ChallengeResult {
  id: string;
  challengeType: CognitiveChallengeType;
  date: string;
  accuracy: number; // percentage
  meanReactionTimeMs: number;
  score: number;
  interferenceScoreMs?: number; // for Stroop
  commissionErrors?: number; // for Go/No-Go
  omissionErrors?: number;
  nBackLevel?: number; // for N-Back
  prefrontalIndex: number; // calculated 0-100
}

export interface BrainRegion {
  id: string;
  name: string;
  scientificName: string;
  keyFunctions: string[];
  cognitiveRole: string;
  relevantChallenge: string;
  neuroplasticityMechanism: string;
  coordinates: { x: number; y: number };
}

export interface Specialist {
  id: string;
  name: string;
  title: string;
  institution: string;
  location: string;
  rating: number;
  reviewCount: number;
  specialties: string[];
  bio: string;
  yearsExperience: number;
  verified: boolean;
  acceptingPatients: boolean;
  consultationFee: string;
}

export interface RehabProtocol {
  id: string;
  condition: string;
  badge: string;
  description: string;
  targetAreas: string[];
  durationWeeks: number;
  evidenceTier: 'Grade A (RCT Proven)' | 'Grade B (Peer Reviewed)' | 'Clinical Consensus';
  phases: {
    phase: number;
    title: string;
    focus: string;
    exercises: string[];
  }[];
}

export interface EducationalArticle {
  id: string;
  title: string;
  slug: string;
  category: 'Neuroplasticity' | 'Focus & Attention' | 'Recovery & Rehab' | 'Sleep & Synapses';
  readTime: string;
  author: string;
  authorRole: string;
  publishDate: string;
  summary: string;
  keyTakeaways: string[];
  contentSections: {
    heading: string;
    body: string;
  }[];
}

export interface ForumPost {
  id: string;
  author: string;
  authorBadge?: string;
  timeAgo: string;
  title: string;
  content: string;
  category: 'Stroke Recovery' | 'ADHD & Focus' | 'Brain Fog / Long Covid' | 'N-Back Strategies' | 'Habit Rewiring';
  upvotes: number;
  repliesCount: number;
  userUpvoted?: boolean;
  replies: {
    id: string;
    author: string;
    timeAgo: string;
    content: string;
  }[];
}

export interface ResourceProtocol {
  id: string;
  title: string;
  category: 'Focus Protocol' | 'Sleep & Recovery' | 'Habit Architecture' | 'Neuro-Nutrition' | 'Recovery & Rehab';
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Clinical';
  citation: string;
  description: string;
  steps: string[];
  downloadFileName: string;
}

export interface SubscriptionTier {
  id: string;
  name: string;
  priceMonthly: number;
  priceAnnual: number;
  description: string;
  popular?: boolean;
  badge?: string;
  features: string[];
  limitations?: string[];
  ctaText: string;
}
