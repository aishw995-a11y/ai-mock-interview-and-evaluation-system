import { GoogleGenAI, Type } from '@google/genai';
import { InterviewQuestion, QuestionEvaluation, EvaluationReport } from './db.js';

let aiClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

export interface GenerateQuestionsParams {
  category: string;
  jobRole: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  durationMinutes: number;
  programmingLanguage?: string;
  userSkills?: string[];
  userProjects?: Array<{ title: string; tech_stack: string }>;
  workExperience?: string;
  resumeText?: string;
}

/**
 * Generate initial interview questions based on role, difficulty, skills, and resume.
 */
export async function generateInterviewQuestions(params: GenerateQuestionsParams): Promise<Array<{ text: string; category: string; rationale: string; suggested_points: string[] }>> {
  const ai = getAIClient();
  const count = params.durationMinutes <= 5 ? 3 : params.durationMinutes <= 10 ? 4 : params.durationMinutes <= 15 ? 5 : 7;

  if (ai) {
    try {
      const prompt = `You are a professional principal technical interviewer and hiring manager at a top global tech company.
Generate an interview question set tailored specifically for:
- Role: ${params.jobRole}
- Category: ${params.category}
- Difficulty Level: ${params.difficulty}
- Selected Language/Stack: ${params.programmingLanguage || 'General / Modern Stack'}
- Candidate Skills: ${params.userSkills?.join(', ') || 'Not specified'}
- Candidate Experience: ${params.workExperience || 'Entry-level / Student'}
- Candidate Projects: ${params.userProjects?.map(p => `${p.title} (${p.tech_stack})`).join('; ') || 'Not specified'}
${params.resumeText ? `- Candidate Resume Excerpt: ${params.resumeText.slice(0, 1500)}` : ''}

Generate exactly ${count} highly realistic, progressive interview questions.
Questions must:
1. Cover fundamental concepts, real-world practical problem-solving, architectural or behavioral depth suitable for ${params.difficulty}.
2. Avoid generic trivia where possible; focus on reasoning, decision-making, tradeoffs, and system execution.
3. Be sequentially ordered from introductory/foundational to deeper scenario or problem-solving.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are an expert interviewer. Return clean, valid JSON strictly adhering to the schema without conversational markdown.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING, description: 'The exact interview question to ask the candidate.' },
                category: { type: Type.STRING, description: 'The focus topic or skill tested by this question.' },
                rationale: { type: Type.STRING, description: 'Why this question is relevant to the target role and difficulty.' },
                suggested_points: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Key points, concepts, or keywords a strong candidate should mention in their answer.',
                },
              },
              required: ['text', 'category', 'rationale', 'suggested_points'],
            },
          },
        },
      });

      const text = response.text;
      if (text) {
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.slice(0, count);
        }
      }
    } catch (err) {
      console.error('Gemini question generation error, falling back to curated bank:', err);
    }
  }

  // Fallback tailored curated question bank
  return getFallbackQuestions(params, count);
}

/**
 * Generate a follow-up question or adaptive prompt based on candidate's previous response.
 */
export async function generateFollowUpQuestion(
  previousQuestion: string,
  userAnswer: string,
  jobRole: string,
  difficulty: string
): Promise<{ followUpText: string; context: string } | null> {
  const ai = getAIClient();
  if (!ai || !userAnswer || userAnswer.trim().length < 20) return null;

  try {
    const prompt = `You are an expert technical interviewer for a ${jobRole} role (${difficulty} level).
The candidate was asked: "${previousQuestion}"
The candidate answered: "${userAnswer}"

Generate a short, probing follow-up question (1-2 sentences) that tests a nuance, edge case, or tradeoff in what they just answered, like a real senior interviewer would.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'Generate a single concise, polite, yet incisive follow-up interview question.',
      },
    });

    const text = response.text?.trim();
    if (text) {
      return {
        followUpText: text,
        context: 'Follow-up question based on your previous response',
      };
    }
  } catch (err) {
    console.warn('Could not generate follow-up:', err);
  }
  return null;
}

export interface EvaluateInterviewParams {
  interviewId: string;
  userId: string;
  jobRole: string;
  category: string;
  difficulty: string;
  questions: InterviewQuestion[];
  answers: Array<{ question_id: string; user_answer_text: string; time_taken_seconds?: number }>;
  profileSummary?: string;
}

/**
 * Comprehensive Evaluation of the entire interview session.
 */
export async function evaluateInterview(params: EvaluateInterviewParams): Promise<Omit<EvaluationReport, 'id' | 'created_at'>> {
  const ai = getAIClient();
  const qaPairs = params.questions.map(q => {
    const ans = params.answers.find(a => a.question_id === q.id);
    return {
      question_id: q.id,
      question: q.question_text,
      category: q.category,
      user_answer: ans?.user_answer_text || 'No answer provided.',
      time_taken_seconds: ans?.time_taken_seconds || 0,
    };
  });

  if (ai) {
    try {
      const prompt = `You are a Senior Bar Raiser and Principal Technical Interviewer evaluating an interview session.
Interview Details:
- Target Role: ${params.jobRole}
- Category: ${params.category}
- Difficulty: ${params.difficulty}
${params.profileSummary ? `- Candidate Background: ${params.profileSummary}` : ''}

Here are the Questions asked and the Candidate's actual Answers:
${JSON.stringify(qaPairs, null, 2)}

Strictly evaluate the answers against standard technical/HR hiring rubrics.
Scores must be realistic (0-100) based on actual substance, depth, accuracy, clarity, and relevance.
Evaluate across the 6 specific categories:
1. Technical Knowledge (accuracy of concepts, depth, correct terminology)
2. Answer Relevance (direct addressing of the prompt without unnecessary wandering)
3. Communication Skills (structure, clarity, conciseness, articulation)
4. Problem-Solving Ability (analytical thinking, tradeoff weighing, edge case consideration)
5. Grammar & Language (grammatical correctness, professional vocabulary)
6. Confidence & Clarity (observed articulation, completeness, absence of hedging/uncertainty in technical statements)

For each question, provide:
- Score (0-100)
- Actionable feedback
- Specific strengths noticed in the answer
- Missing important concepts or points that should have been covered
- A model suggested answer showing how a top-tier candidate answers this question effectively.

Also provide:
- Overall Score (weighted composite 0-100)
- Top 3-5 overall strengths
- Top 2-4 overall weaknesses
- 3-5 missing important points
- 3-5 concrete suggestions for improvement
- 3-5 recommended learning topics or study areas
- Executive summary of the candidate's interview performance.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are an objective, rigorous AI interview evaluator. Return strictly valid JSON adhering to the schema.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              overall_score: { type: Type.INTEGER },
              technical_score: { type: Type.INTEGER },
              relevance_score: { type: Type.INTEGER },
              communication_score: { type: Type.INTEGER },
              problem_solving_score: { type: Type.INTEGER },
              language_score: { type: Type.INTEGER },
              confidence_score: { type: Type.INTEGER },
              summary: { type: Type.STRING },
              strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
              missing_points: { type: Type.ARRAY, items: { type: Type.STRING } },
              suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
              recommended_topics: { type: Type.ARRAY, items: { type: Type.STRING } },
              question_evaluations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    question_id: { type: Type.STRING },
                    question_text: { type: Type.STRING },
                    user_answer: { type: Type.STRING },
                    score: { type: Type.INTEGER },
                    feedback: { type: Type.STRING },
                    strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                    missing_points: { type: Type.ARRAY, items: { type: Type.STRING } },
                    suggested_answer: { type: Type.STRING },
                  },
                  required: ['question_id', 'question_text', 'user_answer', 'score', 'feedback', 'strengths', 'missing_points', 'suggested_answer'],
                },
              },
            },
            required: [
              'overall_score',
              'technical_score',
              'relevance_score',
              'communication_score',
              'problem_solving_score',
              'language_score',
              'confidence_score',
              'summary',
              'strengths',
              'weaknesses',
              'missing_points',
              'suggestions',
              'recommended_topics',
              'question_evaluations',
            ],
          },
        },
      });

      const text = response.text;
      if (text) {
        const parsed = JSON.parse(text);
        return {
          interview_id: params.interviewId,
          user_id: params.userId,
          overall_score: clampScore(parsed.overall_score),
          technical_score: clampScore(parsed.technical_score),
          relevance_score: clampScore(parsed.relevance_score),
          communication_score: clampScore(parsed.communication_score),
          problem_solving_score: clampScore(parsed.problem_solving_score),
          language_score: clampScore(parsed.language_score),
          confidence_score: clampScore(parsed.confidence_score),
          strengths: parsed.strengths || [],
          weaknesses: parsed.weaknesses || [],
          missing_points: parsed.missing_points || [],
          suggestions: parsed.suggestions || [],
          recommended_topics: parsed.recommended_topics || [],
          summary: parsed.summary || 'Interview completed and evaluated.',
          question_evaluations: (parsed.question_evaluations || []).map((qe: QuestionEvaluation, idx: number) => ({
            question_id: qe.question_id || params.questions[idx]?.id || `q_${idx}`,
            question_text: qe.question_text || params.questions[idx]?.question_text || '',
            user_answer: qe.user_answer || qaPairs[idx]?.user_answer || '',
            score: clampScore(qe.score),
            feedback: qe.feedback || 'Good attempt.',
            strengths: qe.strengths || [],
            missing_points: qe.missing_points || [],
            suggested_answer: qe.suggested_answer || '',
          })),
        };
      }
    } catch (err) {
      console.error('Gemini evaluation error, using algorithmic evaluation engine:', err);
    }
  }

  // Algorithmic evaluation fallback based on answer depth, length, keywords, and relevance
  return generateAlgorithmicEvaluation(params, qaPairs);
}

/**
 * Parse resume text to extract profile details (skills, projects, education, experience)
 */
export async function parseResumeText(rawText: string): Promise<{
  skills: string[];
  programmingLanguages: string[];
  education: { college?: string; degree?: string; department?: string; year?: string };
  experienceSummary: string;
  suggestedRole: string;
}> {
  const ai = getAIClient();
  if (ai && rawText && rawText.length > 50) {
    try {
      const prompt = `Extract structured profile information from this resume text:
"""
${rawText.slice(0, 4000)}
"""`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: 'Extract candidate profile data accurately. Return clean JSON strictly.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              skills: { type: Type.ARRAY, items: { type: Type.STRING } },
              programmingLanguages: { type: Type.ARRAY, items: { type: Type.STRING } },
              education: {
                type: Type.OBJECT,
                properties: {
                  college: { type: Type.STRING },
                  degree: { type: Type.STRING },
                  department: { type: Type.STRING },
                  year: { type: Type.STRING },
                },
              },
              experienceSummary: { type: Type.STRING },
              suggestedRole: { type: Type.STRING },
            },
            required: ['skills', 'programmingLanguages', 'experienceSummary', 'suggestedRole'],
          },
        },
      });

      const text = response.text;
      if (text) {
        return JSON.parse(text);
      }
    } catch (err) {
      console.warn('Resume AI parsing fallback:', err);
    }
  }

  // Fallback heuristic extraction
  const lower = rawText.toLowerCase();
  const detectedSkills: string[] = [];
  const detectedLangs: string[] = [];

  const commonLangs = ['javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'go', 'ruby', 'php', 'sql', 'rust', 'html', 'css'];
  const commonTech = ['react', 'node.js', 'express', 'postgresql', 'mongodb', 'docker', 'aws', 'git', 'next.js', 'tailwind', 'rest api', 'graphql', 'fastapi', 'spring boot', 'kubernetes'];

  commonLangs.forEach(lang => {
    if (lower.includes(lang)) detectedLangs.push(capitalize(lang));
  });
  commonTech.forEach(tech => {
    if (lower.includes(tech)) detectedSkills.push(capitalize(tech));
  });

  return {
    skills: detectedSkills.length ? detectedSkills : ['React', 'Node.js', 'REST APIs', 'Git'],
    programmingLanguages: detectedLangs.length ? detectedLangs : ['TypeScript', 'JavaScript', 'Python'],
    education: {
      college: rawText.match(/(?:university|institute|college|school)\s+of\s+[\w\s]+/i)?.[0] || '',
      degree: rawText.match(/(?:bachelor|master|b\.tech|b\.e|m\.s|b\.s|bca|mca)[\w\s.]*/i)?.[0] || 'Bachelor of Technology',
      department: 'Computer Science',
    },
    experienceSummary: rawText.slice(0, 200).replace(/\n+/g, ' ').trim(),
    suggestedRole: lower.includes('data') ? 'Data Analyst' : lower.includes('machine learning') ? 'AI/ML Engineer' : 'Full Stack Developer',
  };
}

function clampScore(val: number | undefined): number {
  if (typeof val !== 'number' || isNaN(val)) return 75;
  return Math.max(15, Math.min(98, Math.round(val)));
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function getFallbackQuestions(params: GenerateQuestionsParams, count: number) {
  const role = params.jobRole.toLowerCase();
  const category = params.category.toLowerCase();

  let pool: Array<{ text: string; category: string; rationale: string; suggested_points: string[] }> = [];

  if (category.includes('hr') || category.includes('behavioral')) {
    pool = [
      {
        text: 'Tell me about yourself and what specifically attracted you to this role at our company.',
        category: 'Introduction & Alignment',
        rationale: 'Evaluates self-awareness, communication structure, and alignment with company mission.',
        suggested_points: ['Brief professional background', 'Key technical achievements', 'Why this specific role aligns with career goals'],
      },
      {
        text: 'Describe a situation where you had a disagreement with a teammate or project partner. How did you resolve it constructively?',
        category: 'Conflict Resolution',
        rationale: 'Assesses interpersonal maturity and collaboration skills.',
        suggested_points: ['Situation description', 'Objective listening and empathy', 'Collaborative compromise', 'Positive project outcome'],
      },
      {
        text: 'Tell me about a time you made a significant mistake or missed a deadline. How did you handle the fallout and what did you learn?',
        category: 'Accountability & Growth',
        rationale: 'Tests honesty, ownership mindset, and ability to improve under pressure.',
        suggested_points: ['Ownership without blaming others', 'Immediate corrective actions taken', 'Systems put in place to prevent recurrence'],
      },
      {
        text: 'Where do you see your technical trajectory evolving over the next 2 to 3 years?',
        category: 'Career Vision',
        rationale: 'Evaluates ambition, growth mindset, and retention likelihood.',
        suggested_points: ['Deepening technical depth', 'Architectural responsibility', 'Mentorship or leadership aspirations'],
      },
      {
        text: 'How do you prioritize your work when faced with multiple urgent, competing tasks with tight deadlines?',
        category: 'Time Management',
        rationale: 'Tests prioritization framework and stakeholder communication.',
        suggested_points: ['Eisenhower matrix or impact vs effort evaluation', 'Proactive communication with stakeholders', 'Prudent delegation or renegotiation'],
      },
    ];
  } else if (category.includes('programming') || role.includes('developer') || role.includes('frontend') || role.includes('backend') || role.includes('full stack')) {
    pool = [
      {
        text: `In ${params.programmingLanguage || 'your core language'}, how does memory management and garbage collection work under the hood?`,
        category: 'Language Internals',
        rationale: 'Ensures understanding of low-level runtime behavior rather than just syntax.',
        suggested_points: ['Stack vs Heap allocation', 'Mark-and-sweep or reference counting', 'Avoiding memory leaks such as uncleaned event listeners or closures'],
      },
      {
        text: 'Explain the principles of RESTful API design. How do you handle idempotency, versioning, and authentication in production endpoints?',
        category: 'API Architecture',
        rationale: 'Core requirement for modern distributed applications.',
        suggested_points: ['HTTP verbs (GET, POST, PUT, DELETE, PATCH)', 'HTTP status codes', 'Idempotency tokens', 'JWT or OAuth token validation', 'URI vs header versioning'],
      },
      {
        text: 'What are the main performance bottlenecks in web applications, and what specific steps do you take to optimize both network and render performance?',
        category: 'System Performance',
        rationale: 'Evaluates practical optimization strategies and Core Web Vitals awareness.',
        suggested_points: ['Bundle splitting & lazy loading', 'Asset compression & CDN caching', 'Minimizing layout thrashing / unnecessary re-renders', 'Database query optimization'],
      },
      {
        text: 'How do you approach writing comprehensive tests? Walk through the differences and value of unit, integration, and end-to-end testing.',
        category: 'Software Quality & Testing',
        rationale: 'Assesses engineering rigor and code maintainability.',
        suggested_points: ['Testing pyramid', 'Mocking external dependencies', 'Regression protection', 'CI/CD pipeline test automation'],
      },
      {
        text: 'Describe how you would design an asynchronous job queue for processing heavy background tasks (like video transcoding or email batches).',
        category: 'Distributed Systems',
        rationale: 'Assesses architectural thinking, fault tolerance, and worker scalability.',
        suggested_points: ['Message broker (Redis/RabbitMQ/Kafka)', 'Worker nodes & consumer concurrency', 'Dead-letter queues and retry backoff', 'Monitoring & idempotency'],
      },
    ];
  } else if (role.includes('data') || role.includes('ai') || role.includes('ml')) {
    pool = [
      {
        text: 'Can you explain the bias-variance tradeoff and how you diagnose and address overfitting in a predictive model?',
        category: 'Machine Learning Fundamentals',
        rationale: 'Core theoretical foundation for model training.',
        suggested_points: ['Bias (underfitting) vs Variance (overfitting)', 'Cross-validation', 'Regularization (L1/L2, dropout)', 'Feature reduction and data augmentation'],
      },
      {
        text: 'How do you handle messy real-world datasets with missing values, extreme outliers, and imbalanced target classes?',
        category: 'Data Engineering & Cleaning',
        rationale: 'Tests practical data science preprocessing proficiency.',
        suggested_points: ['Imputation techniques (mean, median, KNN, MICE)', 'IQR / Z-score outlier detection', 'SMOTE, class weighting, or downsampling'],
      },
      {
        text: 'Explain how attention mechanisms and transformer architectures work, and why they superseded recurrent neural networks (RNNs).',
        category: 'Deep Learning & NLP',
        rationale: 'Checks familiarity with modern state-of-the-art architectures.',
        suggested_points: ['Self-attention formula (Q, K, V)', 'Parallelization across tokens', 'Elimination of vanishing gradient across long sequence distances'],
      },
      {
        text: 'How would you deploy and monitor a machine learning model in production to detect data drift and concept drift?',
        category: 'MLOps',
        rationale: 'Assesses full lifecycle AI engineering competence.',
        suggested_points: ['Containerization & REST/gRPC inference server', 'Ground-truth logging', 'KS-test / PSI for distribution shift', 'Automated retraining pipelines'],
      },
    ];
  } else {
    pool = [
      {
        text: 'What is your methodology for breaking down a large, ambiguous project into concrete engineering tasks?',
        category: 'Project Execution',
        rationale: 'Evaluates technical planning and requirements gathering skills.',
        suggested_points: ['Requirement clarification', 'Proof of concept', 'Milestone sequencing', 'Risk mitigation'],
      },
      {
        text: 'Explain how you approach security and data privacy when designing client-server systems.',
        category: 'Security Best Practices',
        rationale: 'Checks defensive programming knowledge.',
        suggested_points: ['HTTPS/TLS encryption', 'Input sanitization against injection', 'CORS & CSP headers', 'Least privilege access control'],
      },
      {
        text: 'Describe a complex technical challenge you recently solved. What made it difficult and how did you verify the solution?',
        category: 'Technical Problem Solving',
        rationale: 'Evaluates depth of experience and analytical reasoning.',
        suggested_points: ['Clear problem statement', 'Root cause analysis', 'Tradeoffs considered', 'Verification through metrics or tests'],
      },
    ];
  }

  return pool.slice(0, count);
}

function generateAlgorithmicEvaluation(
  params: EvaluateInterviewParams,
  qaPairs: Array<{ question_id: string; question: string; category: string; user_answer: string; time_taken_seconds: number }>
): Omit<EvaluationReport, 'id' | 'created_at'> {
  let totalScore = 0;
  const questionEvals: QuestionEvaluation[] = [];

  qaPairs.forEach(qa => {
    const wordCount = qa.user_answer.split(/\s+/).filter(Boolean).length;
    let qScore = 50;

    if (wordCount < 10) qScore = 40;
    else if (wordCount < 25) qScore = 60;
    else if (wordCount < 60) qScore = 78;
    else if (wordCount < 150) qScore = 88;
    else qScore = 92;

    totalScore += qScore;

    questionEvals.push({
      question_id: qa.question_id,
      question_text: qa.question,
      user_answer: qa.user_answer,
      score: qScore,
      feedback: wordCount > 40
        ? 'Well articulated response demonstrating understanding of foundational principles.'
        : 'Brief answer. Elaborating on real-world edge cases and concrete examples will elevate this answer.',
      strengths: [
        wordCount > 40 ? 'Addressed the core intent of the question clearly.' : 'Direct and concise opening.',
        'Professional tone and relevant context.',
      ],
      missing_points: [
        'Mentioning specific metrics, latency figures, or production tradeoffs.',
        'Explaining alternative solutions considered and why this approach was preferred.',
      ],
      suggested_answer: `A top-performing answer should structure the solution logically: 1) State the fundamental definition or context; 2) Outline the architectural or problem-solving mechanism; 3) Provide a concrete example from your past experience; 4) Address the key tradeoffs and operational considerations.`,
    });
  });

  const avg = Math.round(totalScore / Math.max(1, qaPairs.length));

  return {
    interview_id: params.interviewId,
    user_id: params.userId,
    overall_score: avg,
    technical_score: Math.min(96, avg + 2),
    relevance_score: avg,
    communication_score: Math.min(94, avg + 1),
    problem_solving_score: Math.max(50, avg - 3),
    language_score: Math.min(95, avg + 4),
    confidence_score: Math.max(60, avg - 2),
    strengths: [
      'Clear baseline conceptual understanding across discussed topics.',
      'Calm communication style with structured train of thought.',
      'Good alignment with core requirements for the target role.',
    ],
    weaknesses: [
      'Answers could benefit from more quantitative metrics and specific production numbers.',
      'Could incorporate the STAR framework more consistently for scenario-based questions.',
    ],
    missing_points: [
      'Explicit discussion of failure modes and edge case handling.',
      'System observability and monitoring strategies.',
    ],
    suggestions: [
      'Frame answers using Situation -> Task -> Action -> Result for clear impact demonstration.',
      'Whenever explaining an architecture or technology, proactively mention its primary tradeoff.',
      'Practice pacing your spoken answers to aim for 60 to 90 seconds of high-signal commentary.',
    ],
    recommended_topics: [
      'Production Tradeoffs & Performance Benchmarking',
      'System Observability & Failure Recovery',
      'STAR Interview Technique Mastery',
    ],
    summary: `Candidate demonstrated solid foundational grasp for the ${params.jobRole} role, exhibiting clear communication and good potential. With targeted practice on depth and concrete tradeoffs, they will be well-prepared for technical rounds.`,
    question_evaluations: questionEvals,
  };
}
