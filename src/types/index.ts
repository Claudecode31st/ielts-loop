export type TaskType = "task1" | "task2";
export type ErrorCategory =
  | "grammar"
  | "vocabulary"
  | "structure"
  | "coherence";

export interface BandScores {
  overallBand: number;
  taskAchievement: number;
  coherenceCohesion: number;
  lexicalResource: number;
  grammaticalRange: number;
}

export interface ErrorItem {
  text: string;
  correction: string;
  explanation: string;
  category: ErrorCategory;
}

export interface VocabularyFeedback {
  overusedWords: string[];
  sophisticatedUsage: string[];
  suggestions: string[];
  lexicalDiversity: string;
}

export interface StructureFeedback {
  paragraphOrganization: string;
  cohesiveDevices: string[];
  missingElements: string[];
  suggestions: string[];
}

export interface DetailedFeedback {
  errors: ErrorItem[];
  vocabulary: VocabularyFeedback;
  structure: StructureFeedback;
}

export interface AnalysisResult {
  scores: BandScores;
  examinerComments: string;
  detailedFeedback: DetailedFeedback;
  memorableInsight: string;
}

export interface Essay {
  id: string;
  userId: string;
  taskType: TaskType;
  prompt: string;
  content: string;
  wordCount: number;
  submittedAt: Date;
  overallBand: number;
  taskAchievement: number;
  coherenceCohesion: number;
  lexicalResource: number;
  grammaticalRange: number;
  feedbackSummary: string;
  detailedFeedback: DetailedFeedback;
  examinerComments: string;
}

export interface ErrorPatternExample {
  essayId: string;
  text: string;
  correction: string;
}

export interface ErrorPattern {
  id: string;
  userId: string;
  errorType: string;
  errorCategory: ErrorCategory;
  description: string;
  frequency: number;
  lastSeenAt: Date;
  firstSeenAt: Date;
  examples: ErrorPatternExample[];
}

export interface VocabularyStat {
  id: string;
  userId: string;
  word: string;
  frequency: number;
  isOverused: boolean;
  context: string;
  lastSeenAt: Date;
}

export interface StudentMemory {
  id: string;
  userId: string;
  grammarProfile: Record<string, unknown>;
  vocabularyProfile: Record<string, unknown>;
  structureProfile: Record<string, unknown>;
  scoringTrends: Record<string, unknown>;
  strengthAreas: string[];
  weaknessAreas: string[];
  updatedAt: Date;
}

export interface Exercise {
  id: string;
  userId: string;
  exerciseType: string;
  targetError: string;
  content: ExerciseContent;
  isCompleted: boolean;
  score: number | null;
  generatedAt: Date;
  completedAt: Date | null;
}

export interface ExerciseContent {
  title: string;
  instructions: string;
  questions?: ExerciseQuestion[];
  passage?: string;
  targetSkill: string;
}

export interface ExerciseQuestion {
  id: number;
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
}

export interface StudentMemoryContext {
  recentScores: Array<{
    essayId: string;
    submittedAt: Date;
    overallBand: number;
    taskAchievement: number;
    coherenceCohesion: number;
    lexicalResource: number;
    grammaticalRange: number;
  }>;
  topErrorPatterns: ErrorPattern[];
  vocabularyStats: VocabularyStat[];
  memoryProfile: StudentMemory | null;
}

export interface ProgressDataPoint {
  date: string;
  overallBand: number;
  taskAchievement: number;
  coherenceCohesion: number;
  lexicalResource: number;
  grammaticalRange: number;
}
