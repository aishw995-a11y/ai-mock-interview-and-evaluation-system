export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  created_at?: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  tech_stack: string;
  link?: string;
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  year: string;
  url?: string;
}

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  college: string;
  degree: string;
  department: string;
  academic_year: string;
  technical_skills: string[];
  programming_languages: string[];
  certifications: CertificationItem[];
  projects: ProjectItem[];
  work_experience: string;
  career_objective: string;
  preferred_job_role: string;
  avatar_url?: string;
  updated_at: string;
}

export interface InterviewQuestion {
  id: string;
  interview_id: string;
  question_index: number;
  question_text: string;
  category: string;
  rationale?: string;
  suggested_points?: string[];
  created_at: string;
}

export interface InterviewAnswer {
  id: string;
  interview_id: string;
  question_id: string;
  user_answer_text: string;
  audio_duration_seconds?: number;
  time_taken_seconds?: number;
  created_at: string;
}

export interface QuestionEvaluation {
  question_id: string;
  question_text: string;
  user_answer: string;
  score: number;
  feedback: string;
  strengths: string[];
  missing_points: string[];
  suggested_answer: string;
}

export interface EvaluationReport {
  id: string;
  interview_id: string;
  user_id: string;
  overall_score: number;
  technical_score: number;
  relevance_score: number;
  communication_score: number;
  problem_solving_score: number;
  language_score: number;
  confidence_score: number;
  strengths: string[];
  weaknesses: string[];
  missing_points: string[];
  suggestions: string[];
  question_evaluations: QuestionEvaluation[];
  recommended_topics: string[];
  summary: string;
  created_at: string;
}

export interface Interview {
  id: string;
  user_id: string;
  title: string;
  category: 'Technical Interview' | 'HR Interview' | 'Behavioral Interview' | 'Communication Skills' | 'Programming Interview';
  job_role: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration_minutes: number;
  answer_mode: 'voice' | 'text';
  programming_language?: string;
  resume_text?: string;
  status: 'created' | 'in_progress' | 'completed' | 'cancelled';
  current_question_index: number;
  created_at: string;
  completed_at?: string;
  report?: {
    id: string;
    overall_score: number;
    technical_score: number;
    communication_score: number;
  };
}

export interface AnalyticsData {
  totalInterviews: number;
  completedCount: number;
  avgScore: number;
  highestScore: number;
  scoreProgression: Array<{
    session: string;
    date: string;
    role: string;
    score: number;
    technical: number;
    communication: number;
    problemSolving: number;
  }>;
  categoryBreakdown: Array<{
    category: string;
    averageScore: number;
    interviewsCount: number;
  }>;
  radarMetrics: Array<{
    subject: string;
    value: number;
    fullMark: number;
  }>;
  strengths: string[];
  weaknesses: string[];
  recommendedTopics: string[];
  improvementPercentage: number;
}
