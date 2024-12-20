// Base types and enums
export type Category =
  | "core"
  | "syntax"
  | "architecture"
  | "patterns"
  | "structure"
  | "data"
  | "state"
  | "storage"
  | "network"
  | "deployment"
  | "security"
  | "performance"
  | "runtime"
  | "testing"
  | "quality"
  | "ui"
  | "interaction"
  | "tooling"
  | "utility";

export type DifficultyLevel =
  | "beginner"
  | "intermediate"
  | "advanced"
  | "expert";
export type Relevance = "critical" | "high" | "medium" | "low";
export type ValidationType =
  | "code_challenge"
  | "quiz"
  | "project"
  | "reading_comprehension";
export type RelationshipType =
  | "prerequisite"
  | "enhances"
  | "similar"
  | "uses"
  | "implements";

// Metadata types
export type Metadata = {
  difficulty_level: DifficultyLevel;
  estimated_time: string;
  tags: string[];
  ecosystem: string;
};

// Learning objective and exercise types
export type LearningObjective = {
  objective: string;
  validation_type: ValidationType;
};

export type PracticeExercise = {
  title: string;
  difficulty: DifficultyLevel;
  url: string;
};

// Enhanced primary documentation type
export type PrimaryDoc = {
  source: string;
  section: string;
  url: string;
  relevance: Relevance;
  category: Category;
  related_concepts: string[];
  learning_objectives: LearningObjective[];
  practice_exercises?: PracticeExercise[];
};

// Enhanced learning path types
export type Milestone = {
  description: string;
  validation_criteria: string;
  points: number;
};

export type LearningPathItem = {
  concept: string;
  url: string;
  description: string;
  prerequisites: string[];
  order: number;
  milestones: Milestone[];
  estimated_completion_time: string;
};

// Enhanced connection and concept types
export type Connection = {
  target: string;
  strength: number;
  relationship_type: RelationshipType;
};

export type MasteryLevel = {
  description: string;
  requirements: string[];
};

export type MasteryLevels = {
  beginner: MasteryLevel;
  intermediate: MasteryLevel;
  advanced: MasteryLevel;
  expert: MasteryLevel;
};

export type KeyConcept = {
  id: string;
  name: string;
  category: Category;
  docs: string[];
  connections: Connection[];
  mastery_levels: MasteryLevels;
};

// Skill tree types
export type SkillTreeNode = {
  id: string;
  concept_id: string;
  position: {
    x: number;
    y: number;
  };
  dependencies: string[];
};

export type SkillTreeEdge = {
  source: string;
  target: string;
  type: RelationshipType;
};

export type SkillTree = {
  nodes: SkillTreeNode[];
  edges: SkillTreeEdge[];
};

// Progress tracking types
export type Achievement = {
  name: string;
  description: string;
  criteria: string;
  points: number;
  icon: string;
};

export type SkillLevel = {
  current_level: DifficultyLevel;
  points: number;
  next_milestone: string;
};

export type ProgressTracking = {
  total_points: number;
  completion_percentage: number;
  achievements: Achievement[];
  skill_levels: Record<string, SkillLevel>;
};

// Main response type
export type ResponseType = {
  topic: string;
  metadata: Metadata;
  primary_docs: PrimaryDoc[];
  learning_path: LearningPathItem[];
  key_concepts: KeyConcept[];
  skill_tree: SkillTree;
  progress_tracking: ProgressTracking;
};

// User types (maintained from original)
export type User = {
  id: string;
  email: string;
  name: string;
  created_at: string;
  updated_at: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  status: "active" | "inactive";
  role: "admin" | "user";
};

// Additional user-related types for enhanced functionality
export type UserProgress = {
  user_id: string;
  concept_id: string;
  current_level: DifficultyLevel;
  points_earned: number;
  completed_milestones: string[];
  last_activity: string;
  next_recommended_concepts: string[];
};

export type UserAchievement = {
  user_id: string;
  achievement_id: string;
  earned_at: string;
  points_awarded: number;
};

export type UserSession = {
  user_id: string;
  session_id: string;
  start_time: string;
  end_time?: string;
  concepts_explored: string[];
  points_earned: number;
  milestones_completed: string[];
};
