import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'ai-interview-system-secure-jwt-secret-key-2025';
const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

export interface User {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  phone?: string;
  created_at: string;
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
  certifications: Array<{ id: string; name: string; issuer: string; year: string; url?: string }>;
  projects: Array<{ id: string; title: string; description: string; tech_stack: string; link?: string }>;
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
}

export interface DatabaseSchema {
  users: User[];
  profiles: Profile[];
  interviews: Interview[];
  interview_questions: InterviewQuestion[];
  interview_answers: InterviewAnswer[];
  evaluation_reports: EvaluationReport[];
}

function getInitialDB(): DatabaseSchema {
  return {
    users: [],
    profiles: [],
    interviews: [],
    interview_questions: [],
    interview_answers: [],
    evaluation_reports: [],
  };
}

class Database {
  private data: DatabaseSchema;

  constructor() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } catch (err) {
        console.error('Error loading database file, initializing fresh:', err);
        this.data = getInitialDB();
        this.save();
      }
    } else {
      this.data = getInitialDB();
      this.save();
    }

    // Seed default demo account if no users exist
    this.seedDemoUserIfNeeded();
  }

  private save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  private seedDemoUserIfNeeded() {
    if (this.data.users.length === 0) {
      const demoId = 'user_demo_101';
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync('Student@123', salt);
      const now = new Date().toISOString();

      const demoUser: User = {
        id: demoId,
        email: 'student@example.com',
        password_hash: hash,
        full_name: 'Alex Johnson',
        phone: '+1 (555) 345-6789',
        created_at: now,
      };

      const demoProfile: Profile = {
        id: 'prof_' + demoId,
        user_id: demoId,
        full_name: 'Alex Johnson',
        email: 'student@example.com',
        phone: '+1 (555) 345-6789',
        college: 'State University of Technology',
        degree: 'Bachelor of Technology',
        department: 'Computer Science and Engineering',
        academic_year: 'Final Year (4th Year)',
        technical_skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Python', 'Docker', 'RESTful APIs', 'Git'],
        programming_languages: ['TypeScript', 'JavaScript', 'Python', 'SQL', 'Java'],
        certifications: [
          {
            id: 'cert_1',
            name: 'AWS Certified Cloud Practitioner',
            issuer: 'Amazon Web Services',
            year: '2025',
            url: 'https://aws.amazon.com',
          },
          {
            id: 'cert_2',
            name: 'Meta Front-End Developer Specialization',
            issuer: 'Coursera / Meta',
            year: '2024',
          },
        ],
        projects: [
          {
            id: 'proj_1',
            title: 'Real-time Collaborative Task Board',
            description: 'Full-stack Kanban board with drag-and-drop, WebSocket real-time updates, and JWT authentication.',
            tech_stack: 'React, Node.js, Express, Socket.io, PostgreSQL',
            link: 'https://github.com/example/task-board',
          },
          {
            id: 'proj_2',
            title: 'AI Code Review Assistant',
            description: 'Automated GitHub pull request analyzer providing performance suggestions and security checks.',
            tech_stack: 'Python, FastAPI, Gemini API, GitHub Actions',
          },
        ],
        work_experience: 'Software Engineering Intern at TechFlow Labs (May 2024 - Aug 2024). Built REST APIs and optimized SQL database queries reducing latency by 32%.',
        career_objective: 'Aspiring Full Stack Engineer aiming to leverage hands-on modern web development and problem-solving skills in high-impact product teams.',
        preferred_job_role: 'Full Stack Developer',
        avatar_url: '',
        updated_at: now,
      };

      // Add demo completed interview and evaluation report for immediate dashboard analytics visualization
      const interviewId = 'int_demo_01';
      const demoInterview: Interview = {
        id: interviewId,
        user_id: demoId,
        title: 'Full Stack Developer Technical Interview',
        category: 'Technical Interview',
        job_role: 'Full Stack Developer',
        difficulty: 'Intermediate',
        duration_minutes: 15,
        answer_mode: 'voice',
        programming_language: 'TypeScript',
        status: 'completed',
        current_question_index: 3,
        created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        completed_at: new Date(Date.now() - 86400000 * 2 + 900000).toISOString(),
      };

      const demoQuestions: InterviewQuestion[] = [
        {
          id: 'q_demo_1',
          interview_id: interviewId,
          question_index: 0,
          question_text: 'Can you explain the difference between client-side rendering (CSR) and server-side rendering (SSR), and when you would choose each?',
          category: 'Web Architecture',
          rationale: 'Evaluates core full-stack architectural fundamentals.',
          created_at: now,
        },
        {
          id: 'q_demo_2',
          interview_id: interviewId,
          question_index: 1,
          question_text: 'How do you design a database schema for scalability, and how would you handle high-frequency writes?',
          category: 'Database Design',
          rationale: 'Assesses backend data modelling and optimization.',
          created_at: now,
        },
        {
          id: 'q_demo_3',
          interview_id: interviewId,
          question_index: 2,
          question_text: 'Describe an instance where you faced an unexpected production bug. How did you diagnose, reproduce, and resolve it?',
          category: 'Problem Solving & Debugging',
          rationale: 'Tests practical engineering resilience and diagnostic workflow.',
          created_at: now,
        },
      ];

      const demoAnswers: InterviewAnswer[] = [
        {
          id: 'ans_demo_1',
          interview_id: interviewId,
          question_id: 'q_demo_1',
          user_answer_text: 'In client-side rendering, the browser downloads a minimal HTML shell and JavaScript bundle that renders the DOM dynamically. In server-side rendering, the server builds the full HTML on every request. I choose SSR for public content requiring strong SEO and fast First Contentful Paint, while CSR works well for authenticated dashboards and rich interactive SPAs.',
          audio_duration_seconds: 45,
          time_taken_seconds: 50,
          created_at: now,
        },
        {
          id: 'ans_demo_2',
          interview_id: interviewId,
          question_id: 'q_demo_2',
          user_answer_text: 'For scalable schemas, I normalize relational tables to eliminate redundancy, apply B-tree indexes on foreign keys and frequently queried fields, and avoid full-table scans. For high write loads, I buffer writes using an in-memory queue like Redis or Kafka, batch bulk inserts, and consider read replicas to keep write masters uncongested.',
          audio_duration_seconds: 52,
          time_taken_seconds: 58,
          created_at: now,
        },
        {
          id: 'ans_demo_3',
          interview_id: interviewId,
          question_id: 'q_demo_3',
          user_answer_text: 'During my internship, a background data sync was causing lock timeouts in PostgreSQL. I inspected our APM query logs, identified an unindexed composite join, reproduced the query execution plan using EXPLAIN ANALYZE, added the composite index, and set up connection pool limits with proper retry backoffs.',
          audio_duration_seconds: 48,
          time_taken_seconds: 54,
          created_at: now,
        },
      ];

      const demoReport: EvaluationReport = {
        id: 'rep_demo_01',
        interview_id: interviewId,
        user_id: demoId,
        overall_score: 88,
        technical_score: 92,
        relevance_score: 89,
        communication_score: 87,
        problem_solving_score: 86,
        language_score: 90,
        confidence_score: 84,
        strengths: [
          'Crisp architectural distinction between SSR and CSR tradeoffs.',
          'Concrete backend knowledge regarding connection pooling and EXPLAIN ANALYZE debugging.',
          'Structured, logical explanation flow with minimal filler words.',
        ],
        weaknesses: [
          'Could explicitly mention incremental static regeneration (ISR) or edge caching.',
          'Could elaborate further on database partitioning or sharding for multi-terabyte datasets.',
        ],
        missing_points: [
          'Hydration overhead in SSR setups.',
          'Write-Ahead Logging (WAL) considerations in extreme write loads.',
        ],
        suggestions: [
          'When discussing SSR vs CSR, highlight hydration performance implications.',
          'Practice framing answers using the STAR format (Situation, Task, Action, Result) for behavioral prompts.',
        ],
        question_evaluations: [
          {
            question_id: 'q_demo_1',
            question_text: demoQuestions[0].question_text,
            user_answer: demoAnswers[0].user_answer_text,
            score: 90,
            feedback: 'Solid, precise distinction. Mentioned SEO, FCP, and interactive SPAs correctly.',
            strengths: ['Clear definition of rendering paradigms', 'Accurate decision matrix'],
            missing_points: ['Client-side hydration costs'],
            suggested_answer: 'CSR loads an initial bundle that renders in the browser, ideal for private dashboards with heavy state. SSR compiles HTML on the server per request, boosting SEO, TTFB, and initial render speeds, though at the expense of server compute and client hydration time. Modern hybrid architectures like Next.js often combine SSR/SSG for marketing pages and CSR for app sections.',
          },
          {
            question_id: 'q_demo_2',
            question_text: demoQuestions[1].question_text,
            user_answer: demoAnswers[1].user_answer_text,
            score: 88,
            feedback: 'Great mention of indexing, message queues, and read replicas.',
            strengths: ['Database normalization and indexing awareness', 'Queue buffering strategy'],
            missing_points: ['Table partitioning or sharding'],
            suggested_answer: 'To handle high write throughput: 1) Normalize the data schema and optimize indexing (avoiding indexes on write-heavy tables); 2) Decouple writes via distributed message brokers (Kafka/RabbitMQ) for asynchronous bulk inserts; 3) Separate read/write queries via replication; 4) Implement horizontal partitioning or sharding by entity ID.',
          },
          {
            question_id: 'q_demo_3',
            question_text: demoQuestions[2].question_text,
            user_answer: demoAnswers[2].user_answer_text,
            score: 86,
            feedback: 'Impressive real-world scenario with concrete technical actions (EXPLAIN ANALYZE, connection pooling).',
            strengths: ['Practical observability approach', 'Root cause discovery'],
            missing_points: ['Quantifiable business impact or post-mortem documentation'],
            suggested_answer: 'At TechFlow Labs, we encountered PostgreSQL lock timeouts during peak sync hours. I checked APM logs and executed EXPLAIN ANALYZE on slow queries, revealing an unindexed multi-table join causing sequential scans. I added a composite B-tree index, tuned connection pooling, and established automated alerts, which reduced lock timeouts to zero and cut query latency by 85%.',
          },
        ],
        recommended_topics: [
          'Web Vitals & Hydration Internals',
          'Database Sharding & Partitioning Strategies',
          'STAR Method for Behavioral Technical Scenarios',
        ],
        summary: 'Alex demonstrated strong full-stack foundations with high technical competence, good articulation, and pragmatic debugging experience.',
        created_at: new Date(Date.now() - 86400000 * 2 + 900000).toISOString(),
      };

      this.data.users.push(demoUser);
      this.data.profiles.push(demoProfile);
      this.data.interviews.push(demoInterview);
      this.data.interview_questions.push(...demoQuestions);
      this.data.interview_answers.push(...demoAnswers);
      this.data.evaluation_reports.push(demoReport);
      this.save();
    }
  }

  // --- Auth & Users ---
  public createUser(email: string, password: string, fullName: string, phone?: string): { user: User; token: string } {
    const existing = this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      throw new Error('An account with this email address already exists.');
    }

    const salt = bcrypt.genSaltSync(10);
    const password_hash = bcrypt.hashSync(password, salt);
    const user: User = {
      id: 'usr_' + crypto.randomUUID().slice(0, 8),
      email: email.toLowerCase().trim(),
      password_hash,
      full_name: fullName.trim(),
      phone: phone?.trim(),
      created_at: new Date().toISOString(),
    };

    this.data.users.push(user);

    // Create empty profile
    const profile: Profile = {
      id: 'prof_' + user.id,
      user_id: user.id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone || '',
      college: '',
      degree: '',
      department: '',
      academic_year: '',
      technical_skills: [],
      programming_languages: [],
      certifications: [],
      projects: [],
      work_experience: '',
      career_objective: '',
      preferred_job_role: '',
      avatar_url: '',
      updated_at: new Date().toISOString(),
    };
    this.data.profiles.push(profile);
    this.save();

    const token = this.generateToken(user.id);
    return { user, token };
  }

  public loginUser(email: string, password: string): { user: User; token: string } {
    const user = this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
    if (!user) {
      throw new Error('Invalid email or password.');
    }

    const valid = bcrypt.compareSync(password, user.password_hash);
    if (!valid) {
      throw new Error('Invalid email or password.');
    }

    const token = this.generateToken(user.id);
    return { user, token };
  }

  public getUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public generateToken(userId: string): string {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
  }

  public verifyToken(token: string): string | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      return decoded.userId;
    } catch {
      return null;
    }
  }

  public updatePassword(userId: string, currentPass: string, newPass: string) {
    const user = this.data.users.find(u => u.id === userId);
    if (!user) throw new Error('User not found.');
    const valid = bcrypt.compareSync(currentPass, user.password_hash);
    if (!valid) throw new Error('Current password is incorrect.');
    user.password_hash = bcrypt.hashSync(newPass, bcrypt.genSaltSync(10));
    this.save();
  }

  // --- Profiles ---
  public getProfile(userId: string): Profile {
    let profile = this.data.profiles.find(p => p.user_id === userId);
    if (!profile) {
      const user = this.getUserById(userId);
      profile = {
        id: 'prof_' + userId,
        user_id: userId,
        full_name: user?.full_name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        college: '',
        degree: '',
        department: '',
        academic_year: '',
        technical_skills: [],
        programming_languages: [],
        certifications: [],
        projects: [],
        work_experience: '',
        career_objective: '',
        preferred_job_role: '',
        avatar_url: '',
        updated_at: new Date().toISOString(),
      };
      this.data.profiles.push(profile);
      this.save();
    }
    return profile;
  }

  public updateProfile(userId: string, updates: Partial<Profile>): Profile {
    const profile = this.getProfile(userId);
    Object.assign(profile, updates, { updated_at: new Date().toISOString() });
    // Also sync user name/phone if changed
    const user = this.getUserById(userId);
    if (user) {
      if (updates.full_name) user.full_name = updates.full_name;
      if (updates.phone) user.phone = updates.phone;
    }
    this.save();
    return profile;
  }

  // --- Interviews ---
  public createInterview(
    userId: string,
    params: {
      category: Interview['category'];
      job_role: string;
      difficulty: Interview['difficulty'];
      duration_minutes: number;
      answer_mode: Interview['answer_mode'];
      programming_language?: string;
      resume_text?: string;
      title?: string;
    }
  ): Interview {
    const interview: Interview = {
      id: 'int_' + crypto.randomUUID().slice(0, 10),
      user_id: userId,
      title: params.title || `${params.job_role} ${params.category}`,
      category: params.category,
      job_role: params.job_role,
      difficulty: params.difficulty,
      duration_minutes: params.duration_minutes,
      answer_mode: params.answer_mode,
      programming_language: params.programming_language,
      resume_text: params.resume_text,
      status: 'created',
      current_question_index: 0,
      created_at: new Date().toISOString(),
    };
    this.data.interviews.push(interview);
    this.save();
    return interview;
  }

  public getInterview(interviewId: string, userId: string): Interview | undefined {
    return this.data.interviews.find(i => i.id === interviewId && i.user_id === userId);
  }

  public getUserInterviews(userId: string): Interview[] {
    return this.data.interviews
      .filter(i => i.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public updateInterviewStatus(interviewId: string, status: Interview['status']) {
    const int = this.data.interviews.find(i => i.id === interviewId);
    if (int) {
      int.status = status;
      if (status === 'completed') {
        int.completed_at = new Date().toISOString();
      }
      this.save();
    }
  }

  public deleteInterview(interviewId: string, userId: string): boolean {
    const index = this.data.interviews.findIndex(i => i.id === interviewId && i.user_id === userId);
    if (index === -1) return false;
    this.data.interviews.splice(index, 1);
    this.data.interview_questions = this.data.interview_questions.filter(q => q.interview_id !== interviewId);
    this.data.interview_answers = this.data.interview_answers.filter(a => a.interview_id !== interviewId);
    this.data.evaluation_reports = this.data.evaluation_reports.filter(r => r.interview_id !== interviewId);
    this.save();
    return true;
  }

  // --- Questions ---
  public addQuestions(interviewId: string, questions: Array<{ text: string; category?: string; rationale?: string; suggested_points?: string[] }>): InterviewQuestion[] {
    const created: InterviewQuestion[] = questions.map((q, idx) => ({
      id: 'q_' + crypto.randomUUID().slice(0, 8),
      interview_id: interviewId,
      question_index: idx,
      question_text: q.text,
      category: q.category || 'General',
      rationale: q.rationale,
      suggested_points: q.suggested_points || [],
      created_at: new Date().toISOString(),
    }));

    this.data.interview_questions.push(...created);
    this.save();
    return created;
  }

  public getInterviewQuestions(interviewId: string): InterviewQuestion[] {
    return this.data.interview_questions
      .filter(q => q.interview_id === interviewId)
      .sort((a, b) => a.question_index - b.question_index);
  }

  // --- Answers ---
  public saveAnswer(interviewId: string, questionId: string, answerText: string, timeTaken?: number, audioDuration?: number): InterviewAnswer {
    const existingIdx = this.data.interview_answers.findIndex(a => a.interview_id === interviewId && a.question_id === questionId);
    const answer: InterviewAnswer = {
      id: 'ans_' + crypto.randomUUID().slice(0, 8),
      interview_id: interviewId,
      question_id: questionId,
      user_answer_text: answerText,
      time_taken_seconds: timeTaken,
      audio_duration_seconds: audioDuration,
      created_at: new Date().toISOString(),
    };

    if (existingIdx !== -1) {
      this.data.interview_answers[existingIdx] = answer;
    } else {
      this.data.interview_answers.push(answer);
    }

    const interview = this.data.interviews.find(i => i.id === interviewId);
    if (interview && interview.status === 'created') {
      interview.status = 'in_progress';
    }

    this.save();
    return answer;
  }

  public getInterviewAnswers(interviewId: string): InterviewAnswer[] {
    return this.data.interview_answers.filter(a => a.interview_id === interviewId);
  }

  // --- Evaluation Reports ---
  public saveReport(reportData: Omit<EvaluationReport, 'id' | 'created_at'>): EvaluationReport {
    const existingIdx = this.data.evaluation_reports.findIndex(r => r.interview_id === reportData.interview_id);
    const report: EvaluationReport = {
      id: 'rep_' + crypto.randomUUID().slice(0, 8),
      ...reportData,
      created_at: new Date().toISOString(),
    };

    if (existingIdx !== -1) {
      this.data.evaluation_reports[existingIdx] = report;
    } else {
      this.data.evaluation_reports.push(report);
    }

    this.updateInterviewStatus(reportData.interview_id, 'completed');
    this.save();
    return report;
  }

  public getReport(interviewId: string): EvaluationReport | undefined {
    return this.data.evaluation_reports.find(r => r.interview_id === interviewId);
  }

  public getUserReports(userId: string): EvaluationReport[] {
    return this.data.evaluation_reports
      .filter(r => r.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  // --- Analytics ---
  public getUserAnalytics(userId: string) {
    const userInterviews = this.getUserInterviews(userId);
    const completed = userInterviews.filter(i => i.status === 'completed');
    const reports = this.getUserReports(userId);

    const totalInterviews = userInterviews.length;
    const completedCount = completed.length;

    let avgScore = 0;
    let highestScore = 0;

    if (reports.length > 0) {
      const sum = reports.reduce((acc, r) => acc + r.overall_score, 0);
      avgScore = Math.round(sum / reports.length);
      highestScore = Math.max(...reports.map(r => r.overall_score));
    }

    // Progression over time (chronological)
    const sortedReports = [...reports].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    const scoreProgression = sortedReports.map((r, index) => {
      const interview = userInterviews.find(i => i.id === r.interview_id);
      return {
        session: `Session ${index + 1}`,
        date: new Date(r.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        role: interview?.job_role || 'Interview',
        score: r.overall_score,
        technical: r.technical_score,
        communication: r.communication_score,
        problemSolving: r.problem_solving_score,
      };
    });

    // Category breakdown average
    const categories: Record<string, { totalScore: number; count: number }> = {};
    reports.forEach(r => {
      const int = userInterviews.find(i => i.id === r.interview_id);
      const cat = int?.category || 'Technical Interview';
      if (!categories[cat]) categories[cat] = { totalScore: 0, count: 0 };
      categories[cat].totalScore += r.overall_score;
      categories[cat].count += 1;
    });

    const categoryBreakdown = Object.entries(categories).map(([name, data]) => ({
      category: name,
      averageScore: Math.round(data.totalScore / data.count),
      interviewsCount: data.count,
    }));

    // Radar metrics (averages)
    const radarMetrics = [
      { subject: 'Technical Knowledge', value: reports.length ? Math.round(reports.reduce((acc, r) => acc + r.technical_score, 0) / reports.length) : 0, fullMark: 100 },
      { subject: 'Answer Relevance', value: reports.length ? Math.round(reports.reduce((acc, r) => acc + r.relevance_score, 0) / reports.length) : 0, fullMark: 100 },
      { subject: 'Communication', value: reports.length ? Math.round(reports.reduce((acc, r) => acc + r.communication_score, 0) / reports.length) : 0, fullMark: 100 },
      { subject: 'Problem Solving', value: reports.length ? Math.round(reports.reduce((acc, r) => acc + r.problem_solving_score, 0) / reports.length) : 0, fullMark: 100 },
      { subject: 'Grammar & Clarity', value: reports.length ? Math.round(reports.reduce((acc, r) => acc + r.language_score, 0) / reports.length) : 0, fullMark: 100 },
      { subject: 'Confidence Indicators', value: reports.length ? Math.round(reports.reduce((acc, r) => acc + r.confidence_score, 0) / reports.length) : 0, fullMark: 100 },
    ];

    // Collect all strengths, weaknesses, and recommended topics across reports
    const allStrengths = Array.from(new Set(reports.flatMap(r => r.strengths))).slice(0, 5);
    const allWeaknesses = Array.from(new Set(reports.flatMap(r => r.weaknesses))).slice(0, 5);
    const allRecommendedTopics = Array.from(new Set(reports.flatMap(r => r.recommended_topics))).slice(0, 6);

    // Improvement calculation
    let improvementPercentage = 0;
    if (sortedReports.length >= 2) {
      const first = sortedReports[0].overall_score;
      const latest = sortedReports[sortedReports.length - 1].overall_score;
      if (first > 0) {
        improvementPercentage = Math.round(((latest - first) / first) * 100);
      }
    }

    return {
      totalInterviews,
      completedCount,
      avgScore,
      highestScore,
      scoreProgression,
      categoryBreakdown,
      radarMetrics,
      strengths: allStrengths,
      weaknesses: allWeaknesses,
      recommendedTopics: allRecommendedTopics,
      improvementPercentage,
    };
  }

  // Export Supabase DDL SQL script for reference or deployment
  public getSupabaseSchemaSQL(): string {
    return `-- ============================================================
-- AI Mock Interview and Evaluation System - Supabase SQL Schema
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles Table
create table if not exists public.profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade unique not null,
  full_name text not null,
  email text not null,
  phone text,
  college text,
  degree text,
  department text,
  academic_year text,
  technical_skills text[] default '{}',
  programming_languages text[] default '{}',
  certifications jsonb default '[]'::jsonb,
  projects jsonb default '[]'::jsonb,
  work_experience text,
  career_objective text,
  preferred_job_role text,
  avatar_url text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Interviews Table
create table if not exists public.interviews (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  category text not null,
  job_role text not null,
  difficulty text not null,
  duration_minutes integer not null default 15,
  answer_mode text not null default 'voice',
  programming_language text,
  resume_text text,
  status text not null default 'created',
  current_question_index integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  completed_at timestamp with time zone
);

-- 3. Interview Questions Table
create table if not exists public.interview_questions (
  id uuid primary key default uuid_generate_v4(),
  interview_id uuid references public.interviews(id) on delete cascade not null,
  question_index integer not null,
  question_text text not null,
  category text,
  rationale text,
  suggested_points text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Interview Answers Table
create table if not exists public.interview_answers (
  id uuid primary key default uuid_generate_v4(),
  interview_id uuid references public.interviews(id) on delete cascade not null,
  question_id uuid references public.interview_questions(id) on delete cascade not null,
  user_answer_text text not null,
  audio_duration_seconds numeric,
  time_taken_seconds numeric,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Evaluation Reports Table
create table if not exists public.evaluation_reports (
  id uuid primary key default uuid_generate_v4(),
  interview_id uuid references public.interviews(id) on delete cascade unique not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  overall_score integer not null,
  technical_score integer not null,
  relevance_score integer not null,
  communication_score integer not null,
  problem_solving_score integer not null,
  language_score integer not null,
  confidence_score integer not null,
  strengths text[] default '{}',
  weaknesses text[] default '{}',
  missing_points text[] default '{}',
  suggestions text[] default '{}',
  question_evaluations jsonb default '[]'::jsonb,
  recommended_topics text[] default '{}',
  summary text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security (RLS) Policies
alter table public.profiles enable row level security;
alter table public.interviews enable row level security;
alter table public.interview_questions enable row level security;
alter table public.interview_answers enable row level security;
alter table public.evaluation_reports enable row level security;

-- Profiles: user can only view & edit their own profile
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = user_id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = user_id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = user_id);

-- Interviews: user can only view & manage own interviews
create policy "Users can view own interviews" on public.interviews for select using (auth.uid() = user_id);
create policy "Users can insert own interviews" on public.interviews for insert with check (auth.uid() = user_id);
create policy "Users can update own interviews" on public.interviews for update using (auth.uid() = user_id);
create policy "Users can delete own interviews" on public.interviews for delete using (auth.uid() = user_id);

-- Evaluation Reports: user can only view own reports
create policy "Users can view own reports" on public.evaluation_reports for select using (auth.uid() = user_id);
`;
  }
}

export const db = new Database();
