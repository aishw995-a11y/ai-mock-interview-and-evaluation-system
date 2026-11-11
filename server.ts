import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { db } from './server/db.js';
import {
  generateInterviewQuestions,
  generateFollowUpQuestion,
  evaluateInterview,
  parseResumeText,
} from './server/ai.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Body parser for JSON and URL-encoded, allowing base64 images and resumes
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Auth Middleware: extracts user from Bearer JWT
interface AuthenticatedRequest extends Request {
  userId?: string;
}

const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' });
  }

  const token = authHeader.split(' ')[1];
  const userId = db.verifyToken(token);
  if (!userId) {
    return res.status(401).json({ error: 'Session expired or invalid token. Please log in again.' });
  }

  req.userId = userId;
  next();
};

// ==========================================
// AUTH ROUTES
// ==========================================

app.post('/api/auth/register', (req: Request, res: Response) => {
  try {
    const { email, password, fullName, phone } = req.body;
    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'Full name, email, and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const { user, token } = db.createUser(email, password, fullName, phone);
    const profile = db.getProfile(user.id);

    return res.status(201).json({
      message: 'Registration successful!',
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
      },
      profile,
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Registration failed.' });
  }
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const { user, token } = db.loginUser(email, password);
    const profile = db.getProfile(user.id);

    return res.json({
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
      },
      profile,
    });
  } catch (err: any) {
    return res.status(401).json({ error: err.message || 'Invalid credentials.' });
  }
});

app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = db.getUserById(req.userId!);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }
  const profile = db.getProfile(user.id);
  return res.json({
    user: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      phone: user.phone,
      created_at: user.created_at,
    },
    profile,
  });
});

app.post('/api/auth/forgot-password', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required.' });

  // Simulate password reset token/link generation
  return res.json({
    message: `Password reset instructions have been dispatched to ${email}. Check your inbox or use the instant reset feature below.`,
    resetAvailable: true,
  });
});

app.post('/api/auth/update-password', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Both current and new passwords are required.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters.' });
    }
    db.updatePassword(req.userId!, currentPassword, newPassword);
    return res.json({ message: 'Password updated successfully!' });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Failed to update password.' });
  }
});

// ==========================================
// PROFILE ROUTES
// ==========================================

app.get('/api/profile', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const profile = db.getProfile(req.userId!);
  return res.json({ profile });
});

app.put('/api/profile', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const updates = req.body;
    const profile = db.updateProfile(req.userId!, updates);
    return res.json({ message: 'Profile updated successfully!', profile });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Failed to update profile.' });
  }
});

app.post('/api/profile/avatar', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { avatar_url } = req.body;
    const profile = db.updateProfile(req.userId!, { avatar_url });
    return res.json({ message: 'Avatar updated successfully!', avatar_url: profile.avatar_url });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Failed to update avatar.' });
  }
});

// ==========================================
// RESUME ROUTES
// ==========================================

app.post('/api/resume/parse', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { resumeText } = req.body;
    if (!resumeText || resumeText.trim().length < 15) {
      return res.status(400).json({ error: 'Please provide valid resume text or PDF content.' });
    }

    const parsedData = await parseResumeText(resumeText);
    return res.json({ message: 'Resume analyzed successfully!', data: parsedData });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to process resume.' });
  }
});

// ==========================================
// INTERVIEWS ROUTES
// ==========================================

// Create a new interview session and generate AI questions
app.post('/api/interviews/create', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      category,
      job_role,
      difficulty,
      duration_minutes,
      answer_mode,
      programming_language,
      resume_text,
      use_saved_profile,
    } = req.body;

    if (!job_role || !category) {
      return res.status(400).json({ error: 'Job role and interview category are required.' });
    }

    const profile = db.getProfile(req.userId!);

    // Prepare parameters for AI question generator
    const userSkills = use_saved_profile ? profile.technical_skills : undefined;
    const userProjects = use_saved_profile ? profile.projects : undefined;
    const workExperience = use_saved_profile ? profile.work_experience : undefined;

    const interview = db.createInterview(req.userId!, {
      category: category || 'Technical Interview',
      job_role: job_role || 'Software Developer',
      difficulty: difficulty || 'Intermediate',
      duration_minutes: duration_minutes ? parseInt(duration_minutes, 10) : 15,
      answer_mode: answer_mode || 'voice',
      programming_language,
      resume_text,
    });

    const generatedQuestions = await generateInterviewQuestions({
      category: interview.category,
      jobRole: interview.job_role,
      difficulty: interview.difficulty,
      durationMinutes: interview.duration_minutes,
      programmingLanguage: interview.programming_language,
      userSkills,
      userProjects,
      workExperience,
      resumeText: resume_text,
    });

    const savedQuestions = db.addQuestions(interview.id, generatedQuestions);

    return res.status(201).json({
      message: 'Interview session created successfully!',
      interview,
      questions: savedQuestions,
    });
  } catch (err: any) {
    console.error('Failed to create interview:', err);
    return res.status(500).json({ error: err.message || 'Failed to initialize interview.' });
  }
});

// Get user interviews with filtering and search
app.get('/api/interviews', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { category, difficulty, search } = req.query;
    let interviews = db.getUserInterviews(req.userId!);

    if (category && typeof category === 'string' && category !== 'All') {
      interviews = interviews.filter(i => i.category.toLowerCase() === category.toLowerCase());
    }

    if (difficulty && typeof difficulty === 'string' && difficulty !== 'All') {
      interviews = interviews.filter(i => i.difficulty.toLowerCase() === difficulty.toLowerCase());
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      interviews = interviews.filter(
        i => i.title.toLowerCase().includes(q) || i.job_role.toLowerCase().includes(q) || i.category.toLowerCase().includes(q)
      );
    }

    const reports = db.getUserReports(req.userId!);
    const interviewsWithReports = interviews.map(i => {
      const rep = reports.find(r => r.interview_id === i.id);
      return {
        ...i,
        report: rep
          ? {
              id: rep.id,
              overall_score: rep.overall_score,
              technical_score: rep.technical_score,
              communication_score: rep.communication_score,
            }
          : undefined,
      };
    });

    return res.json({ interviews: interviewsWithReports });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to load interviews.' });
  }
});

// Get specific interview details + questions + answers + report
app.get('/api/interviews/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const interview = db.getInterview(req.params.id, req.userId!);
    if (!interview) {
      return res.status(404).json({ error: 'Interview not found or unauthorized.' });
    }

    const questions = db.getInterviewQuestions(interview.id);
    const answers = db.getInterviewAnswers(interview.id);
    const report = db.getReport(interview.id);

    return res.json({
      interview,
      questions,
      answers,
      report,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to load interview details.' });
  }
});

// Save an answer for a specific question
app.post('/api/interviews/:id/answer', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const interview = db.getInterview(req.params.id, req.userId!);
    if (!interview) {
      return res.status(404).json({ error: 'Interview not found.' });
    }

    const { question_id, user_answer_text, time_taken_seconds, audio_duration_seconds } = req.body;
    if (!question_id) {
      return res.status(400).json({ error: 'Question ID is required.' });
    }

    const answer = db.saveAnswer(
      interview.id,
      question_id,
      user_answer_text || '',
      time_taken_seconds,
      audio_duration_seconds
    );

    // Optional dynamic follow-up generation if answer has substance
    let followUp = null;
    if (user_answer_text && user_answer_text.length > 50 && req.body.request_follow_up) {
      const questions = db.getInterviewQuestions(interview.id);
      const curQ = questions.find(q => q.id === question_id);
      if (curQ) {
        followUp = await generateFollowUpQuestion(curQ.question_text, user_answer_text, interview.job_role, interview.difficulty);
      }
    }

    return res.json({
      message: 'Answer recorded successfully!',
      answer,
      followUp,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to submit answer.' });
  }
});

// Complete interview and trigger AI Answer Evaluation
app.post('/api/interviews/:id/complete', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const interview = db.getInterview(req.params.id, req.userId!);
    if (!interview) {
      return res.status(404).json({ error: 'Interview not found.' });
    }

    // Check if report already generated
    const existingReport = db.getReport(interview.id);
    if (existingReport) {
      return res.json({
        message: 'Evaluation report already completed.',
        report: existingReport,
      });
    }

    const questions = db.getInterviewQuestions(interview.id);
    const answers = db.getInterviewAnswers(interview.id);
    const profile = db.getProfile(req.userId!);

    const profileSummary = `${profile.degree} in ${profile.department}, skills: ${profile.technical_skills.join(', ')}`;

    // Call comprehensive evaluation engine
    const evaluationData = await evaluateInterview({
      interviewId: interview.id,
      userId: req.userId!,
      jobRole: interview.job_role,
      category: interview.category,
      difficulty: interview.difficulty,
      questions,
      answers,
      profileSummary,
    });

    const report = db.saveReport(evaluationData);

    return res.json({
      message: 'Interview evaluated successfully!',
      report,
    });
  } catch (err: any) {
    console.error('Interview evaluation error:', err);
    return res.status(500).json({ error: err.message || 'Failed to evaluate interview.' });
  }
});

// Delete an interview
app.delete('/api/interviews/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const success = db.deleteInterview(req.params.id, req.userId!);
  if (!success) {
    return res.status(404).json({ error: 'Interview not found or not authorized.' });
  }
  return res.json({ message: 'Interview deleted successfully.' });
});

// ==========================================
// ANALYTICS ROUTE
// ==========================================

app.get('/api/analytics', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const analytics = db.getUserAnalytics(req.userId!);
    return res.json({ analytics });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to generate analytics.' });
  }
});

// ==========================================
// SYSTEM / DATABASE EXPORT ROUTE
// ==========================================

app.get('/api/system/schema-sql', (req: Request, res: Response) => {
  const sql = db.getSupabaseSchemaSQL();
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Content-Disposition', 'attachment; filename="supabase_interview_schema.sql"');
  return res.send(sql);
});

// ==========================================
// VITE DEV SERVER / STATIC PRODUCTION SERVING
// ==========================================

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 AI Mock Interview Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Fatal server start error:', err);
});
